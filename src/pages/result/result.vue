<template>
  <view class="page" v-if="result">
    <view class="summary">
      <text class="shape">{{ shapeText }}</text>
      <text class="level" :style="{ color: levelColor }">{{ levelText }}</text>
    </view>

    <HeadShapeVisual :ci="result.metrics.ci" :asymmetry="result.metrics.asymmetry" />

    <view v-if="result._averaged" class="avg-tag">已对 {{ result._groups }} 组照片取平均，结果更稳健</view>

    <MetricCard
      label="头颅指数 CI"
      :value="result.metrics.ci"
      :status="cls.statuses.ci"
      :min="60"
      :max="100"
      hint="正常 76–90"
    />
    <MetricCard
      label="颅顶不对称指数"
      :value="result.metrics.asymmetry"
      unit="%"
      :status="cls.statuses.asymmetry"
      :min="0"
      :max="20"
      hint="<4% 正常"
    />
    <MetricCard
      label="侧视扁平度"
      :value="result.metrics.sideFlatness"
      :status="cls.statuses.sideFlatness"
      :min="0"
      :max="1"
      hint="越高越扁"
    />
    <MetricCard
      label="正面耳位偏移"
      :value="result.metrics.earOffset"
      unit="%"
      :status="cls.statuses.earOffset"
      :min="0"
      :max="15"
      hint="越小越好"
    />

    <RedFlagWarning
      :redFlags="result.redFlags || {}"
      :seeDoctor="cls.seeDoctor"
      :level="cls.level"
    />

    <ResultAdvice :advice="advice" />

    <button class="modal-btn" @click="showModal = true">查看指标说明</button>
    <MetricModal :show="showModal" @close="showModal = false" />

    <Disclaimer />
  </view>
  <view class="page empty" v-else>
    <text class="empty-text">暂无评估结果，请返回重新评估。</text>
  </view>
</template>

<script>
import MetricCard from '../../components/MetricCard.vue'
import HeadShapeVisual from '../../components/HeadShapeVisual.vue'
import RedFlagWarning from '../../components/RedFlagWarning.vue'
import ResultAdvice from '../../components/ResultAdvice.vue'
import MetricModal from '../../components/MetricModal.vue'
import Disclaimer from '../../components/Disclaimer.vue'
import { store } from '../../utils/store.js'
import { classify } from '../../utils/classify.js'
import { generateAdvice } from '../../utils/advice.js'

const SHAPE_MAP = {
  normal: '正常头型',
  scapho: '长头',
  brachy: '扁头 / 短头',
  plagio: '斜头',
  trigono: '三角头'
}
const LEVEL_MAP = { normal: '正常', mild: '轻度', moderate: '中度', severe: '重度' }
const LEVEL_COLOR = { normal: '#22c55e', mild: '#f59e0b', moderate: '#f97316', severe: '#ef4444' }

export default {
  name: 'Result',
  components: { MetricCard, HeadShapeVisual, RedFlagWarning, ResultAdvice, MetricModal, Disclaimer },
  data() {
    return {
      result: null,
      showModal: false
    }
  },
  onLoad() {
    this.result = store.result
  },
  computed: {
    cls() {
      if (!this.result) return { statuses: {}, level: 'normal', seeDoctor: false }
      return classify({
        metrics: this.result.metrics || {},
        shapeType: this.result.shapeType,
        ageMonths: store.ageMonths,
        redFlags: this.result.redFlags || {}
      })
    },
    advice() {
      if (!this.result) {
        return { ageNote: '', sleep: [], tummy: [], medical: [], aapRef: [] }
      }
      return generateAdvice({
        level: this.cls.level,
        shapeType: this.result.shapeType,
        ageMonths: store.ageMonths,
        seeDoctor: this.cls.seeDoctor,
        redFlags: this.result.redFlags || {}
      })
    },
    shapeText() {
      return SHAPE_MAP[this.result?.shapeType] || '头型'
    },
    levelText() {
      return LEVEL_MAP[this.cls.level] || '正常'
    },
    levelColor() {
      return LEVEL_COLOR[this.cls.level] || '#22c55e'
    }
  }
}
</script>

<style scoped>
.page {
  padding: 32rpx;
}
.summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 32rpx;
  margin-bottom: 20rpx;
}
.shape {
  font-size: 36rpx;
  font-weight: 800;
  color: #111827;
}
.level {
  font-size: 32rpx;
  font-weight: 700;
}
.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}
.empty-text {
  font-size: 28rpx;
  color: #6b7280;
}
.modal-btn {
  background: #fff;
  color: #3b82f6;
  font-size: 28rpx;
  border-radius: 14rpx;
  border: 1rpx solid #bfdbfe;
  margin: 8rpx 0 16rpx;
}
.avg-tag {
  background: #f5f3ff;
  color: #7c3aed;
  font-size: 22rpx;
  border-radius: 10rpx;
  padding: 12rpx 16rpx;
  margin-bottom: 16rpx;
  line-height: 1.5;
}
</style>
