<template>
  <view class="capture-guide">
    <view class="frame" :class="viewType">
      <view v-if="viewType === 'top'" class="shape ellipse"></view>
      <view v-else-if="viewType === 'side'" class="shape side-profile"></view>
      <view v-else-if="viewType === 'front'" class="shape circle"></view>
      <view v-else class="shape oblique"></view>
      <text class="frame-label">{{ viewName }}</text>
    </view>
    <text class="tip">{{ tip }}</text>
  </view>
</template>

<script>
const NAMES = {
  top: '头顶俯视图',
  side: '头部侧视图',
  front: '头部正面图',
  oblique: '45°斜位图'
}
const TIPS = {
  top: '让宝宝仰卧，从正上方垂直俯拍头顶，露出整个头顶部，去除帽子/发带。',
  side: '从宝宝正侧面拍摄，耳朵露出，清晰呈现后枕轮廓。',
  front: '正对宝宝面部拍摄，双耳对称入镜，光线均匀。',
  oblique: '从宝宝头部 45°斜上方拍摄单侧，便于观察前额与眼眶错位。'
}

export default {
  name: 'CaptureGuide',
  props: {
    viewType: { type: String, default: 'top' }
  },
  computed: {
    viewName() {
      return NAMES[this.viewType] || '拍摄'
    },
    tip() {
      return TIPS[this.viewType] || ''
    }
  }
}
</script>

<style scoped>
.capture-guide {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.frame {
  width: 420rpx;
  height: 420rpx;
  border: 4rpx dashed #94a3b8;
  border-radius: 20rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
}
.shape {
  position: absolute;
  border: 4rpx solid #3b82f6;
}
.ellipse {
  width: 260rpx;
  height: 320rpx;
  border-radius: 50%;
}
.circle {
  width: 280rpx;
  height: 280rpx;
  border-radius: 50%;
}
.side-profile {
  width: 200rpx;
  height: 300rpx;
  border-radius: 120rpx 120rpx 120rpx 120rpx / 160rpx 160rpx 120rpx 120rpx;
}
.oblique {
  width: 240rpx;
  height: 280rpx;
  transform: rotate(18deg);
  border-radius: 40%;
}
.frame-label {
  position: absolute;
  bottom: 16rpx;
  font-size: 26rpx;
  color: #475569;
  background: rgba(255, 255, 255, 0.85);
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}
.tip {
  margin-top: 24rpx;
  font-size: 26rpx;
  color: #475569;
  line-height: 1.6;
  text-align: center;
  padding: 0 32rpx;
}
</style>
