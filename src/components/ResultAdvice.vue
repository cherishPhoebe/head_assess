<template>
  <view class="advice">
    <text class="advice-title">改善与随访建议</text>

    <view class="age-note">
      <text class="age-icon">📅</text>
      <text class="age-text">{{ advice.ageNote }}</text>
    </view>

    <view class="group">
      <text class="group-title sleep">😴 睡眠与体位调整</text>
      <view v-for="(t, i) in advice.sleep" :key="'s' + i" class="line">
        <text class="dot">·</text><text class="txt">{{ t }}</text>
      </view>
    </view>

    <view class="group">
      <text class="group-title tummy">🤸 清醒趴卧训练</text>
      <view v-for="(t, i) in advice.tummy" :key="'t' + i" class="line">
        <text class="dot">·</text><text class="txt">{{ t }}</text>
      </view>
    </view>

    <view class="group">
      <text class="group-title medical">🏥 就医与随访</text>
      <view v-for="(t, i) in advice.medical" :key="'m' + i" class="line">
        <text class="dot">·</text><text class="txt">{{ t }}</text>
      </view>
    </view>

    <view class="aap">
      <text class="aap-title">权威参考（AAP 体位性斜头指南要点）</text>
      <view v-for="(t, i) in advice.aapRef" :key="'a' + i" class="aap-line">
        <text class="aap-idx">{{ i + 1 }}.</text><text class="aap-txt">{{ t }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ResultAdvice',
  props: {
    advice: { type: Object, default: () => ({ ageNote: '', sleep: [], tummy: [], medical: [], aapRef: [] }) }
  }
}
</script>

<style scoped>
.advice {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}
.advice-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #1a1a1a;
  display: block;
  margin-bottom: 12rpx;
}
.age-note {
  display: flex;
  align-items: flex-start;
  background: #eff6ff;
  border-radius: 12rpx;
  padding: 16rpx;
  margin-bottom: 16rpx;
}
.age-icon {
  font-size: 28rpx;
  margin-right: 10rpx;
}
.age-text {
  flex: 1;
  font-size: 24rpx;
  color: #1e40af;
  line-height: 1.6;
}
.group {
  margin-bottom: 16rpx;
}
.group-title {
  font-size: 26rpx;
  font-weight: 700;
  display: block;
  margin-bottom: 8rpx;
}
.group-title.sleep { color: #7c3aed; }
.group-title.tummy { color: #0891b2; }
.group-title.medical { color: #dc2626; }
.line {
  display: flex;
  align-items: flex-start;
  margin-bottom: 6rpx;
}
.dot {
  color: #9ca3af;
  margin-right: 10rpx;
}
.txt {
  flex: 1;
  font-size: 25rpx;
  color: #374151;
  line-height: 1.6;
}
.aap {
  margin-top: 8rpx;
  border-top: 1rpx dashed #e5e7eb;
  padding-top: 16rpx;
}
.aap-title {
  font-size: 24rpx;
  font-weight: 700;
  color: #6b7280;
  display: block;
  margin-bottom: 8rpx;
}
.aap-line {
  display: flex;
  align-items: flex-start;
  margin-bottom: 6rpx;
}
.aap-idx {
  color: #9ca3af;
  font-size: 22rpx;
  margin-right: 8rpx;
}
.aap-txt {
  flex: 1;
  font-size: 22rpx;
  color: #6b7280;
  line-height: 1.6;
}
</style>
