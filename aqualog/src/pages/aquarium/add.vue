<template>
  <view class="add-page">
    <!-- 名称 -->
    <view class="form-section">
      <view class="form-label">
        <text class="label-text">水族箱名称</text>
      </view>
      <view class="form-input-wrap">
        <input
          v-model="formData.name"
          class="form-input"
          placeholder="如：客厅大缸"
          maxlength="20"
        />
      </view>
    </view>

    <!-- 类型 -->
    <view class="form-section">
      <view class="form-label">
        <text class="label-text">水族箱类型</text>
      </view>
      <view class="type-grid">
        <view
          v-for="item in typeOptions"
          :key="item.value"
          class="type-item"
          :class="{ active: formData.type === item.value }"
          @click="selectType(item.value)"
        >
          <text class="type-icon">{{ item.icon }}</text>
          <text class="type-name">{{ item.label }}</text>
        </view>
      </view>
    </view>

    <!-- 容量 -->
    <view class="form-section">
      <view class="form-label">
        <text class="label-text">容量（升）</text>
      </view>
      <view class="form-input-wrap">
        <input
          v-model="formData.volume"
          class="form-input"
          type="digit"
          placeholder="请输入容量"
        />
      </view>
    </view>

    <!-- 开缸日期 -->
    <view class="form-section">
      <view class="form-label">
        <text class="label-text">开缸日期</text>
      </view>
      <picker mode="date" :value="formData.setupDate" @change="onDateChange">
        <view class="form-input-wrap picker-wrap">
          <text :class="['picker-text', { placeholder: !formData.setupDate }]">
            {{ formData.setupDate || '请选择开缸日期' }}
          </text>
          <text class="picker-arrow">›</text>
        </view>
      </picker>
    </view>

    <!-- 备注 -->
    <view class="form-section">
      <view class="form-label">
        <text class="label-text">备注</text>
      </view>
      <view class="form-input-wrap textarea-wrap">
        <textarea
          v-model="formData.note"
          class="form-textarea"
          placeholder="可选，添加备注信息"
          maxlength="200"
          :auto-height="true"
        />
      </view>
    </view>

    <!-- 安全范围预览 -->
    <view v-if="formData.type" class="form-section">
      <view class="form-label">
        <text class="label-text">默认安全范围预览</text>
      </view>
      <view class="range-preview">
        <view v-for="param in previewParams" :key="param.name" class="range-item">
          <text class="range-label">{{ param.label }}</text>
          <text class="range-value">{{ param.range }}</text>
        </view>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="btn-section">
      <view class="btn-save" @click="handleSave">
        <text class="btn-save-text">{{ isEdit ? '保存修改' : '添加水族箱' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { AquariumType } from '@/types/models'
import { useUserStore } from '@/store/user'
import { useAquariumStore } from '@/store/aquarium'
import { getDefaultSafeRanges, getParamLabel, getParamUnit } from '@/utils/paramRanges'
import { formatDate } from '@/utils/format'

const userStore = useUserStore()
const aquariumStore = useAquariumStore()

const isEdit = ref(false)
const editId = ref('')

const formData = reactive({
  name: '',
  type: '' as AquariumType | '',
  volume: '',
  setupDate: '',
  note: ''
})

const typeOptions = [
  { value: 'freshwater' as AquariumType, icon: '🐠', label: '淡水缸' },
  { value: 'planted' as AquariumType, icon: '🌿', label: '草缸' },
  { value: 'marine' as AquariumType, icon: '🐙', label: '海水缸' },
  { value: 'shrimp' as AquariumType, icon: '🦐', label: '虾缸' }
]

const previewParams = computed(() => {
  if (!formData.type) return []
  const ranges = getDefaultSafeRanges(formData.type as AquariumType)
  const params: { name: string; label: string; range: string }[] = []
  const paramNames = ['temperature', 'ph', 'ammonia', 'nitrite', 'nitrate', 'gh', 'kh', 'salinity', 'phosphate']

  for (const name of paramNames) {
    const range = (ranges as any)[name]
    if (!range) continue
    if (name === 'gh' && range.min === 0 && range.max === 0) continue
    const unit = getParamUnit(name)
    params.push({
      name,
      label: getParamLabel(name),
      range: `${range.min}${unit ? ' ' + unit : ''} ~ ${range.max}${unit ? ' ' + unit : ''}`
    })
  }
  return params
})

onLoad((options) => {
  if (options?.aquariumId) {
    isEdit.value = true
    editId.value = options.aquariumId
    const aquarium = aquariumStore.getAquariumById(options.aquariumId)
    if (aquarium) {
      formData.name = aquarium.name
      formData.type = aquarium.type
      formData.volume = String(aquarium.volume)
      formData.setupDate = aquarium.setupDate
      formData.note = aquarium.note
      uni.setNavigationBarTitle({ title: '编辑水族箱' })
    }
  }
})

function selectType(type: AquariumType) {
  formData.type = type
}

function onDateChange(e: any) {
  formData.setupDate = e.detail.value
}

function handleSave() {
  if (!formData.name.trim()) {
    uni.showToast({ title: '请输入水族箱名称', icon: 'none' })
    return
  }
  if (!formData.type) {
    uni.showToast({ title: '请选择水族箱类型', icon: 'none' })
    return
  }
  if (!formData.volume || Number(formData.volume) <= 0) {
    uni.showToast({ title: '请输入有效容量', icon: 'none' })
    return
  }
  if (!formData.setupDate) {
    uni.showToast({ title: '请选择开缸日期', icon: 'none' })
    return
  }

  if (isEdit.value) {
    aquariumStore.updateAquarium(editId.value, {
      name: formData.name.trim(),
      type: formData.type as AquariumType,
      volume: Number(formData.volume),
      setupDate: formData.setupDate,
      note: formData.note
    })
    uni.showToast({ title: '修改成功', icon: 'success' })
  } else {
    aquariumStore.addAquarium({
      userId: userStore.userId || 'local_user',
      name: formData.name.trim(),
      type: formData.type as AquariumType,
      volume: Number(formData.volume),
      setupDate: formData.setupDate,
      note: formData.note
    })
    uni.showToast({ title: '添加成功', icon: 'success' })
  }

  setTimeout(() => {
    uni.navigateBack()
  }, 1000)
}
</script>

<style lang="scss" scoped>
.add-page {
  min-height: 100vh;
  background-color: $bg-grey;
  padding: $spacing-md;
  padding-bottom: 200rpx;
}

.form-section {
  margin-bottom: $spacing-md;
}

.form-label {
  margin-bottom: $spacing-xs;
  padding-left: $spacing-xs;
}

.label-text {
  font-size: $font-sm;
  color: $text-secondary;
  font-weight: 500;
}

.form-input-wrap {
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-sm $spacing-lg;
}

.form-input {
  width: 100%;
  height: 80rpx;
  font-size: $font-md;
  color: $text-primary;
}

.picker-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80rpx;
}

.picker-text {
  font-size: $font-md;
  color: $text-primary;

  &.placeholder {
    color: $text-light;
  }
}

.picker-arrow {
  font-size: $font-lg;
  color: $text-light;
}

.textarea-wrap {
  padding: $spacing-md $spacing-lg;
}

.form-textarea {
  width: 100%;
  min-height: 120rpx;
  font-size: $font-md;
  color: $text-primary;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-sm;
}

.type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-md $spacing-xs;
  background-color: $bg-card;
  border-radius: $radius-md;
  border: 2rpx solid transparent;
  transition: all 0.2s;

  &.active {
    border-color: $primary-color;
    background-color: $primary-lighter;
  }
}

.type-icon {
  font-size: 56rpx;
}

.type-name {
  font-size: $font-xs;
  color: $text-secondary;
  margin-top: $spacing-xs;
}

.range-preview {
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-sm $spacing-lg;
}

.range-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-xs 0;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.03);

  &:last-child {
    border-bottom: none;
  }
}

.range-label {
  font-size: $font-sm;
  color: $text-secondary;
}

.range-value {
  font-size: $font-sm;
  color: $primary-color;
}

.btn-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $spacing-md $spacing-lg;
  padding-bottom: calc(env(safe-area-inset-bottom) + #{$spacing-md});
  background-color: $bg-card;
  box-shadow: $shadow-sm;
}

.btn-save {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-save-text {
  font-size: $font-md;
  color: #ffffff;
  font-weight: bold;
}
</style>
