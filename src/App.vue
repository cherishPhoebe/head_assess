<template>
  <view class="app-root">
    <slot />
  </view>
</template>

<script>
export default {
  name: 'App',
  onLaunch() {
    // 应用启动：可在设置页已配置后预读取 API Key
  }
}
</script>

<style>
.app-root {
  min-height: 100vh;
  background: #f5f6f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
  color: #1a1a1a;
}
page {
  background: #f5f6f8;
}
</style>
