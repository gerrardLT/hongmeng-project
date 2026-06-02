<template>
  <view class="webview-page">
    <web-view :src="resolvedUrl" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const resolvedUrl = ref('')

onLoad((options) => {
  const url = options?.url ? decodeURIComponent(options.url) : ''
  const title = options?.title ? decodeURIComponent(options.title) : ''

  if (title) {
    uni.setNavigationBarTitle({ title })
  }

  // 本地文件路径（/static/ 开头）和远程 URL 均直接使用
  resolvedUrl.value = url
})
</script>

<style scoped lang="scss">
.webview-page {
  width: 100%;
  height: 100vh;
}

web-view {
  width: 100%;
  height: 100%;
}
</style>
