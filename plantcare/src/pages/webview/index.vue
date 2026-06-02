<template>
  <view class="webview-page">
    <web-view :src="webUrl" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const webUrl = ref('/static/legal/privacy-policy.html')

onLoad((options) => {
  if (options?.url) {
    webUrl.value = decodeURIComponent(options.url)
  }
})
</script>

<style lang="scss" scoped>
.webview-page {
  width: 100%;
  height: 100vh;
}
</style>
