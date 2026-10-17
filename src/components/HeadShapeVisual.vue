<template>
  <view class="head-visual">
    <text class="title">头型轮廓示意（基于头颅指数与不对称指数）</text>

    <view class="svg-wrap">
      <svg viewBox="0 0 200 200" width="200" height="200">
        <!-- 正常参考轮廓（虚线） -->
        <ellipse
          cx="100" cy="100" rx="75" ry="92"
          fill="none" stroke="#9ca3af" stroke-width="2" stroke-dasharray="6 5"
        />
        <!-- 实际估算轮廓（实心，含不对称横向偏移） -->
        <ellipse
          :cx="100 + offsetX" :cy="100" :rx="actualRx" :ry="actualRy"
          :fill="shapeColor" :fill-opacity="0.55" :stroke="shapeStroke" stroke-width="2"
        />
        <text x="100" y="195" text-anchor="middle" font-size="13" fill="#374151">
          CI {{ ciText }} · 不对称 {{ asymText }}
        </text>
      </svg>
    </view>

    <view class="legend">
      <view class="legend-item"><view class="lg-line dash"></view><text>正常参考轮廓</text></view>
      <view class="legend-item"><view class="lg-dot" :style="{ background: shapeColor }"></view><text>实际估算轮廓</text></view>
    </view>

    <text class="note">示意图仅用于直观对照，实际判断以各维度指标与综合分级为准。</text>
  </view>
</template>

<script>
export default {
  name: 'HeadShapeVisual',
  props: {
    ci: { type: Number, default: 83 },
    asymmetry: { type: Number, default: 0 }
  },
  computed: {
    ciText() {
      return this.ci ? this.ci.toFixed(1) : '--'
    },
    asymText() {
      return this.asymmetry ? this.asymmetry.toFixed(1) + '%' : '--'
    },
    // 正常 CI≈83 基准；CI 越大越扁（rx 越大、ry 越小），越小越长（rx 越小、ry 越大）
    actualRx() {
      const ratio = (this.ci || 83) / 83
      return Math.min(95, Math.max(48, 75 * Math.sqrt(ratio)))
    },
    actualRy() {
      const ratio = (this.ci || 83) / 83
      return Math.min(110, Math.max(72, 92 / Math.sqrt(ratio)))
    },
    // 不对称指数映射到横向偏移（±最大值 12px），直观体现左右偏斜
    offsetX() {
      const a = Math.min(this.asymmetry || 0, 20)
      return (a / 20) * 14
    },
    shapeColor() {
      if (this.ci < 76) return '#bfdbfe' // 长头
      if (this.ci > 90) return '#fecaca' // 扁头
      return '#bbf7d0' // 正常
    },
    shapeStroke() {
      if (this.ci < 76) return '#3b82f6'
      if (this.ci > 90) return '#ef4444'
      return '#22c55e'
    }
  }
}
</script>

<style scoped>
.head-visual {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}
.title {
  font-size: 26rpx;
  color: #374151;
  font-weight: 600;
  display: block;
  margin-bottom: 12rpx;
}
.svg-wrap {
  display: flex;
  justify-content: center;
}
.legend {
  display: flex;
  justify-content: center;
  margin-top: 8rpx;
}
.legend-item {
  display: flex;
  align-items: center;
  font-size: 22rpx;
  color: #6b7280;
  margin: 0 16rpx;
}
.lg-line {
  width: 28rpx;
  height: 0;
  margin-right: 8rpx;
}
.lg-line.dash {
  border-top: 2rpx dashed #9ca3af;
}
.lg-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  margin-right: 8rpx;
}
.note {
  font-size: 20rpx;
  color: #9ca3af;
  display: block;
  margin-top: 12rpx;
  line-height: 1.5;
}
</style>
