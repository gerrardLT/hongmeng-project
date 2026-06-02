<template>
  <view class="webview-page">
    <web-view :src="url" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const url = ref('')

onLoad((options: any) => {
  if (options?.url) {
    // 支持绝对路径（/static/...）或完整 URL
    const target = decodeURIComponent(options.url)
    if (target.startsWith('http')) {
      url.value = target
    } else {
      // 本地 static 资源，拼接为绝对路径
      url.value = target.startsWith('/') ? target : `/${target}`
    }
  }
})
</script>

<style scoped>
.webview-page {
  width: 100vw;
  height: 100vh;
}
</style>
