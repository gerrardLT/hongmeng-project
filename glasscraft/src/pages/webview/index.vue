<template>
  <view class="webview-page">
    <web-view :src="webviewUrl" @message="onMessage" @error="onError" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const webviewUrl = ref('')
const pageTitle = ref('')

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const options = currentPage?.options || currentPage?.$route?.query || {}

  const url = options.url || ''
  const title = decodeURIComponent(options.title || '')

  pageTitle.value = title

  if (url) {
    if (url.startsWith('/static/')) {
      // #ifdef APP-HARMONY
      webviewUrl.value = url
      // #endif
      // #ifndef APP-HARMONY
      webviewUrl.value = url
      // #endif
    } else {
      webviewUrl.value = url
    }
  }
})

function onMessage(e: any) {
  console.log('[webview] message:', e)
}

function onError(e: any) {
  console.error('[webview] error:', e)
  uni.showToast({ title: '页面加载失败', icon: 'none' })
}
</script>

<style scoped lang="scss">
.webview-page {
  width: 100%;
  height: 100vh;
}
</style>
