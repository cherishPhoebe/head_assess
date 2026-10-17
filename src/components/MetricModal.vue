<template>
  <view v-if="show" class="modal-mask" @click="$emit('close')">
    <view class="modal" @click.stop>
      <text class="modal-title">指标说明</text>
      <scroll-view scroll-y class="modal-body">
        <view class="blk">
          <text class="blk-h">头颅指数 CI</text>
          <text class="blk-p">= 头颅最大宽度 / 头颅最大长度 × 100%</text>
          <text class="blk-p">正常 76–90；&lt;76 长头；&gt;90 扁头</text>
        </view>
        <view class="blk">
          <text class="blk-h">颅顶不对称指数</text>
          <text class="blk-p">= |对角线₁ − 对角线₂| / max(对角线) × 100%</text>
          <text class="blk-p">&lt;4% 正常；4–8% 轻度；8–12% 中度；&gt;12% 重度</text>
        </view>
        <view class="blk">
          <text class="blk-h">侧视扁平度</text>
          <text class="blk-p">评估后枕扁平程度（0–1，越高越扁）</text>
        </view>
        <view class="blk">
          <text class="blk-h">正面耳位偏移</text>
          <text class="blk-p">= 左右耳到面部中线距离差 / 头宽（%）</text>
        </view>
      </scroll-view>
      <button class="modal-close" @click="$emit('close')">关闭</button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'MetricModal',
  props: {
    show: { type: Boolean, default: false }
  }
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  width: 600rpx;
  max-height: 70vh;
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
}
.modal-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16rpx;
}
.modal-body {
  flex: 1;
}
.blk {
  margin-bottom: 20rpx;
}
.blk-h {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
  display: block;
}
.blk-p {
  font-size: 24rpx;
  color: #6b7280;
  line-height: 1.6;
  display: block;
}
.modal-close {
  margin-top: 16rpx;
  background: #3b82f6;
  color: #fff;
  font-size: 28rpx;
  border-radius: 12rpx;
}
</style>
