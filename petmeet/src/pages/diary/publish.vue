<template>
  <view class="publish-page">
    <NavBar
      title="发布日记"
      left-icon
      right-text="发布"
      @right-click="onPublish"
    />

    <view class="content">
      <!-- 选择宠物 -->
      <view class="pet-selector">
        <scroll-view scroll-x class="pet-scroll">
          <view
            v-for="pet in petStore.myPets"
            :key="pet.petId"
            class="pet-item"
            :class="{ active: selectedPetId === pet.petId }"
            @click="selectedPetId = pet.petId"
          >
            <image class="pet-avatar" :src="pet.avatar" mode="aspectFill" />
            <text class="pet-name">{{ pet.name }}</text>
          </view>
        </scroll-view>
        <text v-if="petStore.myPets.length === 0" class="no-pet-tip">
          还没有宠物，先去添加宠物吧
        </text>
      </view>

      <!-- 文本输入 -->
      <view class="input-area">
        <textarea
          v-model="content"
          class="textarea"
          :placeholder="placeholderText"
          maxlength="500"
          auto-height
        />
        <text class="word-count" :class="{ over: content.length > 500 }">
          {{ content.length }}/500
        </text>
      </view>

      <!-- 图片上传 -->
      <view class="uploader-area">
        <ImageUploader v-model="images" mode="multi" :max-count="9" />
      </view>

      <!-- 可见性切换 -->
      <view class="visibility-bar">
        <view class="visibility-btn" @click="visibility = 'public'">
          <text class="icon" :class="{ active: visibility === 'public' }">🌍</text>
          <text class="label" :class="{ active: visibility === 'public' }">公开</text>
        </view>
        <view class="visibility-btn" @click="visibility = 'private'">
          <text class="icon" :class="{ active: visibility === 'private' }">🔒</text>
          <text class="label" :class="{ active: visibility === 'private' }">私密</text>
        </view>
      </view>
    </view>

    <Loading :loading="publishing" text="发布中..." />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePetStore } from '@/store/pet'
import { useDiaryStore } from '@/store/diary'
import { createDiary } from '@/services/diary'
import { refreshWidget } from '@/services/widget'
import type { DiaryVisibility } from '@/types/models'
import NavBar from '@/components/common/NavBar.vue'
import ImageUploader from '@/components/ImageUploader.vue'
import Loading from '@/components/common/Loading.vue'

const petStore = usePetStore()
const diaryStore = useDiaryStore()

const selectedPetId = ref('')
const content = ref('')
const images = ref<string[]>([])
const visibility = ref<DiaryVisibility>('public')
const publishing = ref(false)

const selectedPet = computed(() => {
  return petStore.myPets.find((p) => p.petId === selectedPetId.value) || null
})

const placeholderText = computed(() => {
  if (selectedPet.value) {
    return `记录今天和${selectedPet.value.name}的故事...`
  }
  return '记录今天和宠物的故事...'
})

const currentUserId = computed(() => {
  const userInfo = uni.getStorageSync('userInfo') as { userId?: string } | undefined
  return userInfo?.userId || 'default_user'
})

onMounted(() => {
  petStore.loadMyPets()
  if (petStore.myPets.length === 1) {
    selectedPetId.value = petStore.myPets[0].petId
  }
})

function onPublish() {
  if (publishing.value) return

  // 校验
  if (!selectedPetId.value) {
    uni.showToast({ title: '请选择宠物', icon: 'none' })
    return
  }
  if (!content.value.trim() && images.value.length === 0) {
    uni.showToast({ title: '请填写内容或上传图片', icon: 'none' })
    return
  }
  if (content.value.length > 500) {
    uni.showToast({ title: '内容不能超过500字', icon: 'none' })
    return
  }

  const pet = selectedPet.value
  if (!pet) {
    uni.showToast({ title: '宠物信息错误', icon: 'none' })
    return
  }

  publishing.value = true

  try {
    const diary = createDiary({
      userId: currentUserId.value,
      petId: pet.petId,
      petName: pet.name,
      petAvatar: pet.avatar,
      content: content.value.trim(),
      images: images.value,
      visibility: visibility.value
    })

    diaryStore.addDiary(diary)

    // 刷新鸿蒙负一屏服务卡片数据
    refreshWidget()

    uni.showToast({ title: '发布成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack({ delta: 1, fail: () => {} })
    }, 800)
  } catch (e) {
    console.error('发布日记失败:', e)
    uni.showToast({ title: '发布失败', icon: 'none' })
  } finally {
    publishing.value = false
  }
}
</script>

<style scoped lang="scss">
.publish-page {
  min-height: 100vh;
  background-color: #F8F9FA;
}

.content {
  padding: 24rpx;
}

/* 选择宠物 */
.pet-selector {
  margin-bottom: 24rpx;
}

.pet-scroll {
  white-space: nowrap;
}

.pet-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  margin-right: 24rpx;
  padding: 8rpx;
  border-radius: 16rpx;
  border: 4rpx solid transparent;

  &.active {
    border-color: #FF6B35;
  }
}

.pet-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background-color: #f0f0f0;
}

.pet-name {
  font-size: 24rpx;
  color: #2D3436;
}

.no-pet-tip {
  font-size: 26rpx;
  color: #B2BEC3;
  text-align: center;
  display: block;
  padding: 32rpx 0;
}

/* 文本输入 */
.input-area {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  position: relative;
}

.textarea {
  width: 100%;
  min-height: 200rpx;
  font-size: 28rpx;
  color: #2D3436;
  line-height: 1.6;
}

.word-count {
  position: absolute;
  right: 24rpx;
  bottom: 16rpx;
  font-size: 22rpx;
  color: #B2BEC3;

  &.over {
    color: #FF4444;
  }
}

/* 图片上传 */
.uploader-area {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

/* 可见性切换 */
.visibility-bar {
  display: flex;
  align-items: center;
  gap: 32rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.visibility-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  border-radius: 28rpx;
  border: 2rpx solid #E5E5E5;

  .icon {
    font-size: 28rpx;
  }

  .label {
    font-size: 26rpx;
    color: #636E72;

    &.active {
      color: #FF6B35;
      font-weight: 500;
    }
  }
}
</style>
