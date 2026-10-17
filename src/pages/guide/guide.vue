<template>
  <view class="page">
    <text class="h">拍摄指南</text>

    <view class="block" v-for="(g, i) in guides" :key="i">
      <text class="block-title">{{ g.title }}</text>
      <text class="block-text">{{ g.text }}</text>
    </view>

    <view class="tips">
      <text class="tips-title">通用要点</text>
      <text class="tips-item">· 光线充足、均匀，避免强光直射或阴影</text>
      <text class="tips-item">· 去除帽子、发带、头饰，露出完整头型</text>
      <text class="tips-item">· 宝宝安静或睡眠时拍摄更稳</text>
      <text class="tips-item">· 手机与头部保持平行，避免倾斜</text>
    </view>

    <Disclaimer />
  </view>
</template>

<script>
import Disclaimer from '../../components/Disclaimer.vue'

export default {
  name: 'Guide',
  components: { Disclaimer },
  data() {
    return {
      guides: [
        { title: '1. 头顶俯视图', text: '让宝宝仰卧，从正上方垂直俯拍头顶，露出整个头顶部，去除帽子/发带。用于计算头颅指数与不对称指数。' },
        { title: '2. 头部侧视图', text: '从宝宝正侧面拍摄，耳朵露出，清晰呈现后枕轮廓。用于评估后枕是否扁平。' },
        { title: '3. 头部正面图', text: '正对宝宝面部拍摄，双耳对称入镜，光线均匀。用于评估耳位偏移与面部对称。' },
        { title: '4. 45°斜位图', text: '从宝宝头部 45°斜上方拍摄单侧，便于观察前额与眼眶对错位，是斜头评估的关键视图。' }
      ]
    }
  }
}
</script>

<style scoped>
.page {
  padding: 40rpx 32rpx;
}
.h {
  font-size: 40rpx;
  font-weight: 800;
  color: #111827;
  display: block;
  margin-bottom: 24rpx;
}
.block {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}
.block-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #1a1a1a;
  display: block;
}
.block-text {
  font-size: 25rpx;
  color: #6b7280;
  line-height: 1.7;
  display: block;
  margin-top: 8rpx;
}
.tips {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin: 16rpx 0;
}
.tips-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #1a1a1a;
  display: block;
  margin-bottom: 8rpx;
}
.tips-item {
  font-size: 25rpx;
  color: #6b7280;
  line-height: 1.8;
  display: block;
}
</style>
