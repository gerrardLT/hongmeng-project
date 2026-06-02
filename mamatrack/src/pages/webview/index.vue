<template>
  <web-view :src="fullUrl"></web-view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const url = ref('')
const title = ref('')

const fullUrl = computed(() => {
  const u = url.value
  if (!u) return ''
  // 处理本地文件路径
  if (u.startsWith('/static/')) {
    // #ifdef APP-PLUS
    return `${plus.io.convertLocalFileSystemURL(u)}`
    // #endif
    // #ifndef APP-PLUS
    return u
    // #endif
  }
  return u
})

onLoad((options) => {
  if (options?.url) {
    url.value = decodeURIComponent(options.url)
  }
  if (options?.title) {
    title.value = decodeURIComponent(options.title)
    uni.setNavigationBarTitle({ title: title.value })
  } else {
    // 根据 url 自动判断标题
    const u = url.value
    if (u.includes('privacy-policy')) {
      uni.setNavigationBarTitle({ title: '隐私政策' })
    } else if (u.includes('user-agreement')) {
      uni.setNavigationBarTitle({ title: '用户协议' })
    } else if (u.includes('third-party-sdk')) {
      uni.setNavigationBarTitle({ title: '第三方SDK目录' })
    }
  }
})
</script>
