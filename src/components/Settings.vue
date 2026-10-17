<template>
  <view class="settings">
    <text class="sec-title">硅基流动 API Key</text>
    <input class="input" :value="apiKey" @input="onKey" placeholder="sk-..." password />

    <text class="sec-title">视觉模型</text>
    <input
      class="input"
      :value="model"
      @input="onModel"
      placeholder="例如 Qwen/Qwen3-VL-32B-Instruct"
    />
    <text class="sec-title">常用视觉模型（点击填入）</text>
    <view class="presets">
      <text
        v-for="p in presets"
        :key="p"
        class="preset"
        :class="{ active: model === p }"
        @click="usePreset(p)"
      >{{ shortName(p) }}</text>
    </view>

    <text class="sec-title">高精度模式（拍两组取平均）</text>
    <view class="switch-row">
      <text class="switch-label">开启后拍摄两组照片自动取平均，结果更稳健</text>
      <switch :checked="precision" color="#3b82f6" @change="onPrecision" />
    </view>

    <button class="save" @click="save">保存</button>
    <text class="tip">Key 仅保存在本机，不会上传或写入代码。可在硅基流动控制台获取。</text>
  </view>
</template>

<script>
import {
  DEFAULT_MODEL,
  BACKUP_MODEL,
  MODEL_PRESETS,
  STORAGE_KEY_APIKEY,
  STORAGE_KEY_MODEL,
  STORAGE_KEY_PRECISION
} from '../config.js'

export default {
  name: 'Settings',
  data() {
    return {
      apiKey: '',
      model: DEFAULT_MODEL,
      presets: MODEL_PRESETS,
      precision: true
    }
  },
  mounted() {
    this.apiKey = uni.getStorageSync(STORAGE_KEY_APIKEY) || ''
    this.model = uni.getStorageSync(STORAGE_KEY_MODEL) || DEFAULT_MODEL
    const pm = uni.getStorageSync(STORAGE_KEY_PRECISION)
    this.precision = pm === '' || pm === undefined ? true : !!pm
  },
  methods: {
    onKey(e) {
      this.apiKey = e.detail.value
    },
    onModel(e) {
      this.model = e.detail.value
    },
    usePreset(p) {
      this.model = p
    },
    shortName(p) {
      return String(p).replace('Qwen/', '')
    },
    onPrecision(e) {
      this.precision = e.detail.value
    },
    save() {
      uni.setStorageSync(STORAGE_KEY_APIKEY, (this.apiKey || '').trim())
      uni.setStorageSync(STORAGE_KEY_MODEL, (this.model || '').trim() || DEFAULT_MODEL)
      uni.setStorageSync(STORAGE_KEY_PRECISION, !!this.precision)
      this.$emit('saved')
      uni.showToast({ title: '已保存', icon: 'success' })
    }
  }
}
</script>

<style scoped>
.settings {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin: 16rpx 0;
}
.sec-title {
  font-size: 26rpx;
  color: #374151;
  font-weight: 600;
  display: block;
  margin: 12rpx 0 8rpx;
}
.input {
  background: #f3f4f6;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  font-size: 26rpx;
}
.picker {
  background: #f3f4f6;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  font-size: 26rpx;
}
.presets {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 8rpx;
}
.preset {
  font-size: 22rpx;
  color: #374151;
  background: #f3f4f6;
  border: 1rpx solid #e5e7eb;
  border-radius: 999rpx;
  padding: 8rpx 18rpx;
  margin: 0 12rpx 12rpx 0;
}
.preset.active {
  color: #fff;
  background: #3b82f6;
  border-color: #3b82f6;
}
.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f3f4f6;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  margin-bottom: 8rpx;
}
.switch-label {
  flex: 1;
  font-size: 24rpx;
  color: #374151;
  line-height: 1.5;
  margin-right: 12rpx;
}
.save {
  margin-top: 20rpx;
  background: #3b82f6;
  color: #fff;
  font-size: 28rpx;
  border-radius: 12rpx;
}
.tip {
  font-size: 22rpx;
  color: #6b7280;
  margin-top: 12rpx;
  display: block;
  line-height: 1.6;
}
</style>
