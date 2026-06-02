<template>
  <view class="pet-create-page">
    <!-- 头像上传 -->
    <view class="avatar-section" @click="chooseAvatar">
      <image
        class="avatar"
        :src="form.avatar || '/static/images/default-pet.png'"
        mode="aspectFill"
      />
      <view class="avatar-edit-badge">
        <text class="edit-text">📷</text>
      </view>
      <text class="avatar-tip">点击更换头像</text>
    </view>

    <!-- 表单区域 -->
    <view class="form-section">
      <view class="form-item required">
        <text class="form-label">宠物名字</text>
        <input
          v-model="form.name"
          class="form-input"
          placeholder="请输入宠物名字"
          placeholder-class="input-placeholder"
        />
      </view>

      <view class="form-item">
        <text class="form-label">宠物类型</text>
        <picker :range="typeLabels" @change="onTypeChange">
          <view class="form-picker">
            <text :class="{ placeholder: !form.type }">{{ form.type ? typeLabels[typeOptions.indexOf(form.type)] : '请选择宠物类型' }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">品种</text>
        <input
          v-model="form.breed"
          class="form-input"
          placeholder="请输入品种，如英短、柯基"
          placeholder-class="input-placeholder"
        />
      </view>

      <view class="form-item">
        <text class="form-label">性别</text>
        <view class="gender-group">
          <view
            v-for="option in genderOptions"
            :key="option.value"
            class="gender-option"
            :class="{ active: form.gender === option.value }"
            @click="form.gender = option.value"
          >
            <text class="gender-icon">{{ option.icon }}</text>
            <text class="gender-text">{{ option.label }}</text>
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">生日</text>
        <picker mode="date" @change="onBirthdayChange">
          <view class="form-picker">
            <text :class="{ placeholder: !form.birthday }">{{ form.birthday || '请选择生日' }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">到家日期</text>
        <picker mode="date" @change="onAdoptDateChange">
          <view class="form-picker">
            <text :class="{ placeholder: !form.adoptDate }">{{ form.adoptDate || '请选择到家日期' }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">性格特点</text>
        <textarea
          v-model="form.personality"
          class="form-textarea"
          placeholder="描述一下宝贝的性格特点吧"
          placeholder-class="input-placeholder"
          maxlength="200"
        />
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-wrap">
      <view class="submit-btn" @click="onSubmit">
        <text class="submit-text">{{ isEdit ? '保存修改' : '创建档案' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { PetType, PetGender } from '@/types/models'
import { useUserStore } from '@/store/user'
import { usePetStore } from '@/store/pet'
import { createPet, getPetById, updatePet } from '@/services/pet'

const userStore = useUserStore()
const petStore = usePetStore()

const isEdit = ref(false)
const editPetId = ref('')

const typeOptions: PetType[] = ['cat', 'dog', 'other']
const typeLabels = ['猫咪', '狗狗', '其他']

const genderOptions = [
  { value: 'male' as PetGender, label: '公', icon: '♂' },
  { value: 'female' as PetGender, label: '母', icon: '♀' },
  { value: 'unknown' as PetGender, label: '未知', icon: '?' }
]

const form = ref({
  name: '',
  type: '' as PetType | '',
  breed: '',
  gender: 'unknown' as PetGender,
  birthday: '',
  adoptDate: '',
  avatar: '',
  personality: ''
})

onLoad((options) => {
  if (options?.petId) {
    isEdit.value = true
    editPetId.value = options.petId
    const pet = getPetById(options.petId)
    if (pet) {
      form.value = {
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        gender: pet.gender,
        birthday: pet.birthday,
        adoptDate: pet.adoptDate,
        avatar: pet.avatar,
        personality: pet.personality
      }
    }
  }
})

function chooseAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      form.value.avatar = res.tempFilePaths[0]
    }
  })
}

function onTypeChange(e: any) {
  const index = e.detail.value as number
  form.value.type = typeOptions[index]
}

function onBirthdayChange(e: any) {
  form.value.birthday = e.detail.value
}

function onAdoptDateChange(e: any) {
  form.value.adoptDate = e.detail.value
}

function validate(): boolean {
  if (!form.value.name.trim()) {
    uni.showToast({ title: '请输入宠物名字', icon: 'none' })
    return false
  }
  return true
}

function onSubmit() {
  if (!validate()) return

  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }

  if (isEdit.value) {
    const updated = updatePet(editPetId.value, {
      name: form.value.name.trim(),
      type: form.value.type || 'other',
      breed: form.value.breed,
      gender: form.value.gender,
      birthday: form.value.birthday,
      adoptDate: form.value.adoptDate,
      avatar: form.value.avatar,
      personality: form.value.personality
    })
    if (updated) {
      petStore.updatePet(editPetId.value, updated)
      uni.showToast({ title: '修改成功', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 1200)
    }
  } else {
    const pet = createPet({
      userId: userStore.userId,
      name: form.value.name.trim(),
      type: form.value.type || 'other',
      breed: form.value.breed,
      gender: form.value.gender,
      birthday: form.value.birthday,
      adoptDate: form.value.adoptDate,
      avatar: form.value.avatar,
      personality: form.value.personality
    })
    petStore.addPet(pet)
    uni.showToast({ title: '创建成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1200)
  }
}
</script>

<style scoped lang="scss">
.pet-create-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 180rpx;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xl 0 $spacing-md;
  background-color: $bg-card;
  position: relative;
}

.avatar {
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  background-color: #F5F5F5;
}

.avatar-edit-badge {
  position: absolute;
  top: 160rpx;
  left: 50%;
  transform: translateX(20rpx);
  width: 52rpx;
  height: 52rpx;
  background-color: $primary;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid #FFFFFF;
}

.edit-text {
  font-size: 24rpx;
}

.avatar-tip {
  font-size: 24rpx;
  color: $text-hint;
  margin-top: $spacing-sm;
}

.form-section {
  margin: $spacing-md $spacing-lg;
  background-color: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
}

.form-item {
  padding: $spacing-md $spacing-lg;
  border-bottom: 2rpx solid $bg-page;

  &.required .form-label::before {
    content: '*';
    color: $error;
    margin-right: 4rpx;
  }
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  font-size: 26rpx;
  color: $text-secondary;
  margin-bottom: $spacing-xs;
  display: block;
}

.form-input {
  width: 100%;
  height: 72rpx;
  font-size: 30rpx;
  color: $text-primary;
}

.input-placeholder {
  color: $text-hint;
}

.form-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72rpx;
}

.form-picker text:first-child {
  font-size: 30rpx;
  color: $text-primary;
}

.form-picker .placeholder {
  color: $text-hint;
}

.picker-arrow {
  font-size: 32rpx;
  color: $text-hint;
}

.gender-group {
  display: flex;
  gap: $spacing-sm;
}

.gender-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  height: 72rpx;
  border: 2rpx solid $border-color;
  border-radius: $radius-md;
}

.gender-option.active {
  border-color: $primary;
  background-color: rgba(139, 92, 246, 0.08);
}

.gender-icon {
  font-size: 30rpx;
}

.gender-text {
  font-size: 28rpx;
  color: $text-primary;
}

.form-textarea {
  width: 100%;
  height: 160rpx;
  font-size: 28rpx;
  color: $text-primary;
  line-height: 1.6;
}

.submit-wrap {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $spacing-md $spacing-xl;
  padding-bottom: calc(#{$spacing-md} + env(safe-area-inset-bottom));
  background-color: $bg-card;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
  border-radius: 44rpx;
}

.submit-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
