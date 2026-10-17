<template>
  <view v-if="show" class="redflag">
    <text class="rf-title">⚠️ 建议尽快就医</text>
    <text class="rf-text">{{ message }}</text>
    <view v-if="signs.length" class="rf-signs">
      <text v-for="(s, i) in signs" :key="i" class="rf-sign">· {{ s }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'RedFlagWarning',
  props: {
    redFlags: { type: Object, default: () => ({}) },
    seeDoctor: { type: Boolean, default: false },
    level: { type: String, default: 'normal' }
  },
  computed: {
    show() {
      return this.seeDoctor || !!this.redFlags?.suspectedSynostosis
    },
    message() {
      if (this.redFlags?.suspectedSynostosis) {
        return '检测到可能为颅骨早闭（骨缝早闭）的征象，建议尽快就诊小儿神经外科评估。'
      }
      if (this.seeDoctor) {
        return '建议尽快到儿科或儿童保健科就诊，由专业医生评估头型情况。'
      }
      return ''
    },
    signs() {
      return this.redFlags?.signs || []
    }
  }
}
</script>

<style scoped>
.redflag {
  background: #fef2f2;
  border: 2rpx solid #fecaca;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}
.rf-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #b91c1c;
  display: block;
}
.rf-text {
  font-size: 26rpx;
  color: #7f1d1d;
  line-height: 1.6;
  margin-top: 8rpx;
  display: block;
}
.rf-signs {
  margin-top: 8rpx;
}
.rf-sign {
  font-size: 24rpx;
  color: #7f1d1d;
  display: block;
  line-height: 1.6;
}
</style>
