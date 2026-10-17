<template>
  <view class="disclaimer">
    <text class="disclaimer-text">⚠️ 本工具仅供健康自测参考，不构成医疗诊断，如有疑虑请咨询儿科或儿童保健医生。</text>
  </view>
</template>

<script>
export default {
  name: 'Disclaimer'
}
</script>

<style scoped>
.disclaimer {
  background: #fff7ed;
  border: 1rpx solid #fed7aa;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  margin: 16rpx 0;
}
.disclaimer-text {
  color: #9a3412;
  font-size: 24rpx;
  line-height: 1.6;
}
</style>
