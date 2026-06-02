<template>
  <web-view :src="fullUrl" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const fullUrl = ref('')

onLoad((options) => {
  const url = decodeURIComponent(options?.url || '')
  if (url) {
    fullUrl.value = url
  }
})
</script>
