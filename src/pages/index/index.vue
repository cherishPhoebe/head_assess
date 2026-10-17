<template>
  <view class="page">
    <view class="hero">
      <text class="hero-title">宝宝头型评估</text>
      <text class="hero-sub">拍照即可获得头型分析与改善建议</text>
    </view>

    <view class="card">
      <text class="label">宝宝月龄（月）</text>
      <input
        class="age-input"
        type="number"
        :value="ageMonths"
        @input="onAge"
        placeholder="如 4"
      />
    </view>

    <button class="primary-btn" @click="startAssess">开始评估</button>
    <button class="ghost-btn" @click="goGuide">拍摄指南</button>
    <button class="ghost-btn" @click="showSettings = !showSettings">设置（API Key / 模型）</button>

    <Settings v-if="showSettings" @saved="showSettings = false" />

    <Disclaimer />
  </view>
</template>

<script>
import Settings from '../../components/Settings.vue'
import Disclaimer from '../../components/Disclaimer.vue'
import { store } from '../../utils/store.js'
import { STORAGE_KEY_APIKEY } from '../../config.js'

export default {
  name: 'Index',
  components: { Settings, Disclaimer },
  data() {
    return {
      ageMonths: '',
      showSettings: false
    }
  },
  methods: {
    onAge(e) {
      this.ageMonths = e.detail.value
    },
    startAssess() {
      const age = Number(this.ageMonths)
      if (!this.ageMonths || Number.isNaN(age) || age < 0) {
        uni.showToast({ title: '请输入正确月龄', icon: 'none' })
        return
      }
      if (!uni.getStorageSync(STORAGE_KEY_APIKEY)) {
        uni.showToast({ title: '请先设置 API Key', icon: 'none' })
        this.showSettings = true
        return
      }
      store.ageMonths = age
      store.result = null
      uni.navigateTo({ url: '/pages/capture/capture' })
    },
    goGuide() {
      uni.navigateTo({ url: '/pages/guide/guide' })
    }
  }
}
</script>

<style scoped>
.page {
  padding: 40rpx 32rpx;
}
.hero {
  display: flex;
  flex-direction: column;
  margin-bottom: 40rpx;
}
.hero-title {
  font-size: 44rpx;
  font-weight: 800;
  color: #111827;
}
.hero-sub {
  font-size: 26rpx;
  color: #6b7280;
  margin-top: 8rpx;
}
.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}
.label {
  font-size: 26rpx;
  color: #374151;
  font-weight: 600;
}
.age-input {
  margin-top: 12rpx;
  background: #f3f4f6;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  font-size: 30rpx;
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
</style>
