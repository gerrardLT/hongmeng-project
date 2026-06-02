<template>
  <view class="page">
    <NavBar title="编辑宠物名片" :left-icon="true" />

    <scroll-view class="form-scroll" scroll-y>
      <view class="form-content">
        <!-- 头像 -->
        <view class="form-item avatar-item">
          <text class="label">宠物头像</text>
          <ImageUploader v-model="form.avatar" mode="avatar" :max-count="1" />
        </view>

        <!-- 名字 -->
        <view class="form-item">
          <text class="label required">宠物名字</text>
          <input
            v-model="form.name"
            class="input"
            placeholder="给你的宠物起个名字"
            maxlength="20"
          />
        </view>

        <!-- 种类 -->
        <view class="form-item">
          <text class="label required">宠物种类</text>
          <picker mode="selector" :range="speciesOptions" :value="speciesIndex" @change="onSpeciesChange">
            <view class="picker">
              <text :class="{ placeholder: !form.species }">
                {{ speciesLabel }}
              </text>
              <text class="arrow">></text>
            </view>
          </picker>
        </view>

        <!-- 品种 -->
        <view class="form-item">
          <text class="label">品种</text>
          <input
            v-model="form.breed"
            class="input"
            placeholder="如：金毛 / 英短 / ..."
            maxlength="30"
          />
        </view>

        <!-- 年龄 -->
        <view class="form-item">
          <text class="label">年龄</text>
          <picker mode="selector" :range="ageOptions" :value="form.age" @change="onAgeChange">
            <view class="picker">
              <text>{{ form.age }}岁</text>
              <text class="arrow">></text>
            </view>
          </picker>
        </view>

        <!-- 性别 -->
        <view class="form-item">
          <text class="label">性别</text>
          <view class="gender-group">
            <view
              v-for="g in genderList"
              :key="g.value"
              class="gender-btn"
              :class="{ active: form.gender === g.value }"
              @click="form.gender = g.value"
            >
              <text class="gender-btn-text">{{ g.label }}</text>
            </view>
          </view>
        </view>

        <!-- 性格标签 -->
        <view class="form-item tags-item">
          <view class="label-row">
            <text class="label required">性格标签</text>
            <text class="hint">最多选择3个</text>
          </view>
          <view class="tags-cloud">
            <view
              v-for="tag in allTags"
              :key="tag"
              class="tag-btn"
              :class="{ active: form.personality.includes(tag) }"
              @click="toggleTag(tag)"
            >
              <text class="tag-btn-text">{{ tag }}</text>
            </view>
          </view>
        </view>

        <!-- 删除 -->
        <view class="delete-wrap">
          <text class="delete-link" @click="onDelete">删除宠物</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="footer">
      <view class="submit-btn" @click="onSubmit">
        <text class="submit-text">保存修改</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import NavBar from '@/components/common/NavBar.vue'
import ImageUploader from '@/components/ImageUploader.vue'
import { getPet, updatePet, deletePet } from '@/services/pet'
import { refreshWidget } from '@/services/widget'
import { usePetStore } from '@/store/pet'
import type { PetGender, PetSpecies, PersonalityTag } from '@/types/models'

const petStore = usePetStore()
const petId = ref('')

const speciesList: { value: PetSpecies; label: string }[] = [
  { value: 'dog', label: '狗狗' },
  { value: 'cat', label: '猫咪' },
  { value: 'bird', label: '鸟类' },
  { value: 'fish', label: '鱼类' },
  { value: 'hamster', label: '仓鼠' },
  { value: 'rabbit', label: '兔子' },
  { value: 'turtle', label: '乌龟' },
  { value: 'other', label: '其他' }
]

const genderList: { value: PetGender; label: string }[] = [
  { value: 'male', label: '公' },
  { value: 'female', label: '母' },
  { value: 'unknown', label: '未知' }
]

const allTags: PersonalityTag[] = [
  '活泼', '粘人', '高冷', '胆小', '贪吃', '调皮',
  '温顺', '社牛', '安静', '好奇', '忠诚', '独立'
]

const speciesOptions = speciesList.map((s) => s.label)
const ageOptions = Array.from({ length: 21 }, (_, i) => `${i}岁`)

const form = reactive({
  name: '',
  species: '' as PetSpecies | '',
  breed: '',
  age: 0,
  gender: 'unknown' as PetGender,
  personality: [] as PersonalityTag[],
  avatar: [] as string[]
})

const speciesIndex = computed(() => {
  if (!form.species) return -1
  return speciesList.findIndex((s) => s.value === form.species)
})

const speciesLabel = computed(() => {
  if (!form.species) return '请选择宠物种类'
  return speciesList.find((s) => s.value === form.species)?.label || ''
})

onLoad((query) => {
  if (query?.petId) {
    petId.value = query.petId as string
    loadPetData()
  } else {
    uni.showToast({ title: '参数错误', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
  }
})

function loadPetData() {
  const pet = getPet(petId.value)
  if (!pet) {
    uni.showToast({ title: '宠物不存在', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
    return
  }

  form.name = pet.name
  form.species = pet.species
  form.breed = pet.breed
  form.age = pet.age
  form.gender = pet.gender
  form.personality = [...pet.personality]
  form.avatar = pet.avatar ? [pet.avatar] : []
}

function onSpeciesChange(e: any) {
  const index = e.detail.value as number
  form.species = speciesList[index].value
}

function onAgeChange(e: any) {
  form.age = Number(e.detail.value)
}

function toggleTag(tag: PersonalityTag) {
  const index = form.personality.indexOf(tag)
  if (index > -1) {
    form.personality.splice(index, 1)
  } else {
    if (form.personality.length >= 3) {
      uni.showToast({ title: '最多选择3个标签', icon: 'none' })
      return
    }
    form.personality.push(tag)
  }
}

function validate(): boolean {
  if (!form.name.trim()) {
    uni.showToast({ title: '请输入宠物名字', icon: 'none' })
    return false
  }
  if (!form.species) {
    uni.showToast({ title: '请选择宠物种类', icon: 'none' })
    return false
  }
  if (form.personality.length === 0) {
    uni.showToast({ title: '请至少选择1个性格标签', icon: 'none' })
    return false
  }
  return true
}

function onSubmit() {
  if (!validate()) return

  const updated = updatePet(petId.value, {
    name: form.name.trim(),
    species: form.species as PetSpecies,
    breed: form.breed.trim(),
    age: form.age,
    gender: form.gender,
    personality: [...form.personality],
    avatar: form.avatar[0] || ''
  })

  if (!updated) {
    uni.showToast({ title: '保存失败', icon: 'none' })
    return
  }

  petStore.updatePet(petId.value, updated)

  // 刷新鸿蒙负一屏服务卡片数据
  refreshWidget()

  uni.showToast({
    title: '保存成功',
    icon: 'success',
    success: () => {
      setTimeout(() => {
        uni.navigateBack()
      }, 1200)
    }
  })
}

function onDelete() {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，确定要删除该宠物名片吗？',
    confirmColor: '#FF4444',
    success: (res) => {
      if (res.confirm) {
        const ok = deletePet(petId.value)
        if (ok) {
          petStore.deletePet(petId.value)

          // 刷新鸿蒙负一屏服务卡片数据（宠物删除后同步）
          refreshWidget()

          uni.showToast({
            title: '已删除',
            icon: 'success',
            success: () => {
              setTimeout(() => {
                uni.navigateBack()
              }, 1200)
            }
          })
        } else {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: #F8F9FA;
  display: flex;
  flex-direction: column;
}

.form-scroll {
  flex: 1;
  overflow: hidden;
}

.form-content {
  padding: 24rpx;
}

.form-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.avatar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 28rpx;
  color: #2D3436;
  font-weight: 500;
  margin-bottom: 16rpx;
  display: block;
}

.label.required::after {
  content: '*';
  color: #FF6B35;
  margin-left: 4rpx;
}

.input {
  height: 60rpx;
  font-size: 28rpx;
  color: #2D3436;
  background-color: #F8F9FA;
  border-radius: 12rpx;
  padding: 0 20rpx;
}

.picker {
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #F8F9FA;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #2D3436;
}

.picker .placeholder {
  color: #B2BEC3;
}

.arrow {
  color: #B2BEC3;
  font-size: 28rpx;
}

.gender-group {
  display: flex;
  gap: 20rpx;
}

.gender-btn {
  flex: 1;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F8F9FA;
  border-radius: 32rpx;
  border: 2rpx solid transparent;
}

.gender-btn.active {
  background-color: #FF6B35;
  border-color: #FF6B35;
}

.gender-btn-text {
  font-size: 28rpx;
  color: #636E72;
}

.gender-btn.active .gender-btn-text {
  color: #fff;
  font-weight: 500;
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.hint {
  font-size: 24rpx;
  color: #B2BEC3;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag-btn {
  padding: 12rpx 28rpx;
  border-radius: 32rpx;
  background-color: #F8F9FA;
  border: 2rpx solid transparent;
}

.tag-btn.active {
  background-color: #FF6B35;
  border-color: #FF6B35;
}

.tag-btn-text {
  font-size: 26rpx;
  color: #636E72;
}

.tag-btn.active .tag-btn-text {
  color: #fff;
  font-weight: 500;
}

.delete-wrap {
  display: flex;
  justify-content: center;
  padding: 24rpx 0 48rpx;
}

.delete-link {
  font-size: 28rpx;
  color: #FF4444;
}

.footer {
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background-color: #fff;
  border-top: 1rpx solid #F0F0F0;
}

.submit-btn {
  height: 88rpx;
  background-color: #FF6B35;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-text {
  font-size: 32rpx;
  color: #fff;
  font-weight: 600;
}
</style>
