<template>
  <view class="metric-card">
    <view class="metric-head">
      <text class="metric-label">{{ label }}</text>
      <text class="metric-status" :style="{ color: statusColor }">{{ statusText }}</text>
    </view>
    <view class="metric-value">
      {{ displayValue }}<text class="metric-unit">{{ unit }}</text>
    </view>
    <view class="metric-bar">
      <view class="metric-bar-fill" :style="{ width: barWidth, background: statusColor }"></view>
    </view>
    <text v-if="hint" class="metric-hint">{{ hint }}</text>
  </view>
</template>

<script>
const MAP = {
  normal: { text: '正常', color: '#22c55e' },
  mild: { text: '轻度', color: '#f59e0b' },
  moderate: { text: '中度', color: '#f97316' },
  severe: { text: '重度', color: '#ef4444' }
}

export default {
  name: 'MetricCard',
  props: {
    label: { type: String, default: '' },
    value: { type: [Number, String], default: '--' },
    unit: { type: String, default: '' },
    status: { type: String, default: 'normal' },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    hint: { type: String, default: '' }
  },
  computed: {
    statusText() {
      return (MAP[this.status] || MAP.normal).text
    },
    statusColor() {
      return (MAP[this.status] || MAP.normal).color
    },
    displayValue() {
      return this.value === undefined || this.value === null ? '--' : this.value
    },
    barWidth() {
      const v = Number(this.value)
      if (Number.isNaN(v)) return '50%'
      const pct = ((v - this.min) / (this.max - this.min)) * 100
      return Math.min(100, Math.max(0, pct)) + '%'
    }
  }
}
</script>

<style scoped>
.metric-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}
.metric-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.metric-label {
  font-size: 28rpx;
  color: #1a1a1a;
  font-weight: 600;
}
.metric-status {
  font-size: 24rpx;
  font-weight: 600;
}
.metric-value {
  font-size: 48rpx;
  font-weight: 700;
  color: #111827;
  margin: 8rpx 0 12rpx;
}
.metric-unit {
  font-size: 24rpx;
  color: #6b7280;
  margin-left: 6rpx;
  font-weight: 400;
}
.metric-bar {
  height: 12rpx;
  background: #e5e7eb;
  border-radius: 6rpx;
  overflow: hidden;
}
.metric-bar-fill {
  height: 100%;
  border-radius: 6rpx;
}
.metric-hint {
  font-size: 22rpx;
  color: #6b7280;
  margin-top: 8rpx;
  display: block;
}
</style>
