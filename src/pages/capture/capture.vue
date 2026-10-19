<template>
  <view class="page">
    <view class="precision-bar" v-if="precisionMode">
      <view
        class="set-tab"
        :class="{ active: currentSet === 0 }"
        @click="switchSet(0)"
      >第 1 组</view>
      <view
        class="set-tab"
        :class="{ active: currentSet === 1 }"
        @click="switchSet(1)"
      >{{ secondSetStarted ? '第 2 组' : '第 2 组（点击开始）' }}</view>
    </view>

    <view class="progress">第 {{ currentIndex + 1 }} / 4 步 · {{ viewName }}
      <text v-if="precisionMode" class="set-tag">（第{{ currentSet + 1 }}组）</text>
    </view>

    <CaptureGuide :viewType="currentView" />

    <view v-if="thumbBase64" class="thumb-wrap">
      <image class="thumb" :src="'data:image/jpeg;base64,' + thumbBase64" mode="aspectFill" />
      <text class="thumb-ok">已拍摄 ✓</text>
      <view v-if="showQualityMark" class="qc-badge" :class="qcOk ? 'ok' : 'bad'">
        {{ qcOk ? '质量合格' : '质量不佳' }}
      </view>
    </view>

    <view class="actions">
      <button class="primary-btn" @click="takePhoto">拍照 / 选择照片</button>
      <button v-if="thumbBase64" class="ghost-btn" @click="retake">重拍本张</button>
      <button v-if="currentIndex > 0" class="ghost-btn" @click="prev">上一步</button>
      <button
        v-if="currentIndex < 3 && thumbBase64"
        class="ghost-btn"
        @click="next"
      >下一步</button>

      <button
        v-if="currentIndex === 3 && precisionMode && !secondSetStarted"
        class="primary-btn second"
        @click="startSecondSet"
      >再拍一组（取平均，更准）</button>
      <button
        v-if="currentIndex === 3 && precisionMode && !secondSetStarted"
        class="ghost-btn"
        @click="analyze"
      >仅用 1 组分析</button>

      <button
        v-if="currentIndex === 3 && !(precisionMode && !secondSetStarted)"
        class="primary-btn analyze"
        :loading="loading"
        @click="analyze"
      >开始分析</button>

      <button
        v-if="currentIndex === 3 && currentSet === 0"
        class="ghost-btn"
        :loading="qcLoading"
        @click="runQualityManual"
      >检查照片质量</button>
    </view>

    <Disclaimer />

    <view v-if="loading || qcLoading" class="loading-mask">
      <view class="loading-card">
        <view class="spinner"></view>
        <text class="loading-title">{{ loading ? loadingText : qcText }}</text>
        <text class="loading-sub">请稍候，正在处理，切勿关闭页面</text>
      </view>
    </view>
  </view>
</template>

<script>
import CaptureGuide from '../../components/CaptureGuide.vue'
import Disclaimer from '../../components/Disclaimer.vue'
import { compressAndRead } from '../../utils/imageCompress.js'
import { assessHead } from '../../utils/sfClient.js'
import { calcTopMetrics } from '../../utils/geometry.js'
import { checkQuality, summarizeQuality } from '../../utils/qualityCheck.js'
import { aggregateResults } from '../../utils/aggregate.js'
import { store } from '../../utils/store.js'
import { STORAGE_KEY_APIKEY, BACKUP_MODEL, STORAGE_KEY_PRECISION } from '../../config.js'

function makeEmpty() {
  return { top: null, side: null, front: null, oblique: null }
}

export default {
  name: 'Capture',
  components: { CaptureGuide, Disclaimer },
  data() {
    return {
      views: ['top', 'side', 'front', 'oblique'],
      names: { top: '头顶俯视图', side: '头部侧视图', front: '头部正面图', oblique: '45°斜位图' },
      currentIndex: 0,
      currentSet: 0,
      precisionMode: true,
      secondSetStarted: false,
      groups: [makeEmpty(), null],
      loading: false,
      qcLoading: false,
      loadingText: '',
      qcText: '',
      quality: { byIndex: {}, failed: [], allOk: true }
    }
  },
  onLoad() {
    const pm = uni.getStorageSync(STORAGE_KEY_PRECISION)
    this.precisionMode = pm === '' || pm === undefined ? true : !!pm
  },
  computed: {
    currentView() {
      return this.views[this.currentIndex]
    },
    viewName() {
      return this.names[this.currentView]
    },
    curGroup() {
      return this.groups[this.currentSet]
    },
    thumbBase64() {
      const g = this.groups[this.currentSet]
      return g ? g[this.currentView] : null
    },
    // 仅在第 1 组显示对应视图的质量标记
    showQualityMark() {
      return this.currentSet === 0 && this.quality.byIndex[this.currentIndex]
    },
    qcOk() {
      const q = this.quality.byIndex[this.currentIndex]
      return q ? q.ok : true
    },
    group0Complete() {
      const g = this.groups[0]
      return g && this.views.every((v) => g[v])
    }
  },
  methods: {
    async takePhoto() {
      try {
        const res = await uni.chooseImage({
          count: 1,
          sourceType: ['camera', 'album'],
          sizeType: ['compressed']
        })
        const path = res.tempFilePaths[0]
        const base64 = await compressAndRead(path)
        const g = { ...this.groups[this.currentSet] }
        g[this.currentView] = base64
        const groups = [...this.groups]
        groups[this.currentSet] = g
        this.groups = groups
        // 清除该视图旧质检结果（重拍后需重新校验）
        const byIndex = { ...this.quality.byIndex }
        delete byIndex[this.currentIndex]
        this.quality = { ...this.quality, byIndex }
      } catch (e) {
        // 用户主动取消不处理，其余错误明确提示（原来是静默吞掉，导致"图片传不上"却无任何提示）
        const msg = (e && (e.errMsg || e.message)) || String(e)
        if (/cancel/i.test(msg)) return
        console.error('[takePhoto] 失败：', e)
        uni.showToast({
          title: '图片处理失败：' + msg.slice(0, 40),
          icon: 'none',
          duration: 3000
        })
      }
    },
    retake() {
      const g = { ...this.groups[this.currentSet] }
      g[this.currentView] = null
      const groups = [...this.groups]
      groups[this.currentSet] = g
      this.groups = groups
    },
    next() {
      if (this.currentIndex < 3) this.currentIndex++
    },
    prev() {
      if (this.currentIndex > 0) this.currentIndex--
    },
    startSecondSet() {
      const groups = [...this.groups]
      groups[1] = makeEmpty()
      this.groups = groups
      this.secondSetStarted = true
      this.currentSet = 1
      this.currentIndex = 0
    },
    switchSet(set) {
      if (set === 1 && !this.secondSetStarted) {
        this.startSecondSet()
      } else {
        this.currentSet = set
      }
    },
    // 对第 1 组四张做质量校验（用轻量备模型省成本），失败不阻塞
    async runQuality(images, apiKey) {
      const res = await checkQuality(images, apiKey, this.views, BACKUP_MODEL)
      this.quality = summarizeQuality(res, 4)
      return this.quality
    },
    async runQualityManual() {
      const g = this.groups[0]
      if (!g || !this.views.every((v) => g[v])) {
        uni.showToast({ title: '请先拍完第 1 组四张', icon: 'none' })
        return
      }
      const apiKey = uni.getStorageSync(STORAGE_KEY_APIKEY)
      if (!apiKey) return
      this.qcLoading = true
      this.qcText = '正在检查照片质量…'
      try {
        await this.runQuality(this.views.map((v) => ({ base64: g[v] })), apiKey)
        if (this.quality.allOk) {
          uni.showToast({ title: '照片质量合格', icon: 'success' })
        } else {
          uni.showModal({
            title: '照片质量提醒',
            content: '有 ' + this.quality.failed.length + ' 张质量不佳：' +
              this.quality.failed.map((f) => '图' + (f.index + 1) + ' ' + f.reason).join('；') +
              '。建议重拍以获得更准确结果。',
            showCancel: false
          })
        }
      } catch (e) {
        uni.showToast({ title: '质量检查失败，可忽略', icon: 'none' })
      } finally {
        this.qcLoading = false
        this.qcText = ''
      }
    },
    async analyze() {
      const apiKey = uni.getStorageSync(STORAGE_KEY_APIKEY)
      if (!apiKey) {
        uni.showToast({ title: '请先设置 API Key', icon: 'none' })
        return
      }
      if (!this.group0Complete) {
        uni.showToast({ title: '请先拍完第 1 组四张', icon: 'none' })
        return
      }
      this.loading = true
      this.loadingText = '正在校验照片质量…'
      try {
        // 1. 自动质量校验（第 1 组，轻量备模型）
        await this.runQuality(this.views.map((v) => ({ base64: this.groups[0][v] })), apiKey)

        // 2. 不合格则提醒用户（不强制阻断）
        if (!this.quality.allOk) {
          const cont = await new Promise((resolve) => {
            uni.showModal({
              title: '照片质量提醒',
              content: '有 ' + this.quality.failed.length + ' 张照片质量不佳（' +
                this.quality.failed.map((f) => '图' + (f.index + 1) + ' ' + f.reason).join('；') +
                '），可能影响准确度。仍继续分析？',
              confirmText: '继续分析',
              cancelText: '返回重拍',
              success: (r) => resolve(r.confirm)
            })
          })
          if (!cont) {
            this.loading = false
            return
          }
        }

        // 3. 收集完整组，逐组评估
        const completeGroups = this.groups.filter(
          (g) => g && this.views.every((v) => g[v])
        )
        const results = []
        for (let gi = 0; gi < completeGroups.length; gi++) {
          const g = completeGroups[gi]
          this.loadingText = completeGroups.length > 1
            ? `正在分析第 ${gi + 1}/${completeGroups.length} 组头型…`
            : '正在分析头型…'
          const images = this.views.map((v) => ({ base64: g[v] }))
          const r = await assessHead(images, apiKey, store.ageMonths)
          if (r.views && r.views.top) {
            const m = calcTopMetrics(r.views.top)
            if (m && r.metrics) {
              r.metrics.ci = m.ci
              r.metrics.asymmetry = m.asymmetry
            }
          }
          r._ageMonths = store.ageMonths
          results.push(r)
        }

        // 4. 多组取平均
        this.loadingText = '正在汇总分析结果…'
        const final =
          results.length > 1
            ? aggregateResults(results, store.ageMonths)
            : { ...results[0], _groups: 1, _averaged: false }

        store.result = final
        this.loadingText = '即将展示结果…'
        uni.navigateTo({ url: '/pages/result/result' })
      } catch (e) {
        uni.showToast({ title: (e && e.message) || '分析失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.page {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.precision-bar {
  display: flex;
  width: 100%;
  background: #f3f4f6;
  border-radius: 14rpx;
  padding: 6rpx;
  margin-bottom: 20rpx;
}
.set-tab {
  flex: 1;
  text-align: center;
  font-size: 26rpx;
  color: #6b7280;
  padding: 14rpx 0;
  border-radius: 10rpx;
}
.set-tab.active {
  background: #3b82f6;
  color: #fff;
  font-weight: 700;
}
.progress {
  font-size: 26rpx;
  color: #6b7280;
  margin-bottom: 24rpx;
}
.set-tag {
  color: #3b82f6;
}
.thumb-wrap {
  margin-top: 24rpx;
  position: relative;
}
.thumb {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  border: 2rpx solid #e5e7eb;
}
.thumb-ok {
  position: absolute;
  right: 8rpx;
  bottom: 8rpx;
  background: #22c55e;
  color: #fff;
  font-size: 20rpx;
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
}
.qc-badge {
  position: absolute;
  left: 8rpx;
  top: 8rpx;
  font-size: 20rpx;
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
  color: #fff;
}
.qc-badge.ok {
  background: #22c55e;
}
.qc-badge.bad {
  background: #ef4444;
}
.actions {
  width: 100%;
  margin-top: 32rpx;
}
.primary-btn {
  background: #3b82f6;
  color: #fff;
  font-size: 30rpx;
  border-radius: 14rpx;
  margin-bottom: 16rpx;
}
.ghost-btn {
  background: #fff;
  color: #374151;
  font-size: 28rpx;
  border-radius: 14rpx;
  margin-bottom: 16rpx;
  border: 1rpx solid #e5e7eb;
}
.second {
  background: #8b5cf6;
}
.analyze {
  margin-top: 8rpx;
}
.loading-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.loading-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 56rpx 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 380rpx;
}
.spinner {
  width: 64rpx;
  height: 64rpx;
  border: 6rpx solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.loading-title {
  font-size: 30rpx;
  color: #111827;
  font-weight: 600;
  margin-top: 28rpx;
  text-align: center;
}
.loading-sub {
  font-size: 24rpx;
  color: #6b7280;
  margin-top: 12rpx;
}
</style>
