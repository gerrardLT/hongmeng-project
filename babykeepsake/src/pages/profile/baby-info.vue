<template>
  <view class="baby-info-page">
    <!-- 宝宝列表 -->
    <view class="baby-list">
      <view
        v-for="baby in babyList"
        :key="baby.babyId"
        class="baby-card"
        :class="{ selected: baby.babyId === userStore.selectedBabyId }"
      >
        <view class="baby-main" @click="onSelectBaby(baby.babyId)">
          <image
            class="baby-avatar"
            :src="baby.avatar || '/static/default-baby.png'"
            mode="aspectFill"
          />
          <view class="baby-text">
            <view class="baby-name-row">
              <text class="baby-name">{{ baby.name }}</text>
              <text v-if="baby.babyId === userStore.selectedBabyId" class="current-tag">当前</text>
            </view>
            <text class="baby-detail">{{ baby.birthDate }} · {{ getGenderText(baby.gender) }}</text>
            <text class="baby-age">{{ getBabyAge(baby.birthDate) }}</text>
          </view>
        </view>
        <view class="baby-actions">
          <text class="action-btn edit" @click="onEditBaby(baby)">编辑</text>
          <text class="action-btn delete" @click="onDeleteBaby(baby)">删除</text>
        </view>
      </view>
    </view>

    <!-- 添加宝宝按钮 -->
    <view class="add-baby-btn" @click="onAddBaby">
      <text class="add-icon">＋</text>
      <text class="add-text">添加宝宝</text>
    </view>

    <!-- 添加/编辑表单弹窗 -->
    <view v-if="showForm" class="form-overlay" @click="showForm = false">
      <view class="form-box" @click.stop>
        <text class="form-title">{{ isEditing ? '编辑宝宝信息' : '添加宝宝' }}</text>

        <view class="form-item">
          <text class="form-label">姓名</text>
          <input
            v-model="formData.name"
            class="form-input"
            placeholder="请输入宝宝姓名"
            placeholder-class="input-placeholder"
          />
        </view>

        <view class="form-item">
          <text class="form-label">生日</text>
          <picker mode="date" :value="formData.birthDate" @change="onBirthDateChange">
            <text class="form-input picker-text">{{ formData.birthDate || '请选择生日' }}</text>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">性别</text>
          <view class="gender-group">
            <text
              class="gender-btn"
              :class="{ active: formData.gender === 'male' }"
              @click="formData.gender = 'male'"
            >男孩</text>
            <text
              class="gender-btn"
              :class="{ active: formData.gender === 'female' }"
              @click="formData.gender = 'female'"
            >女孩</text>
            <text
              class="gender-btn"
              :class="{ active: formData.gender === 'unknown' }"
              @click="formData.gender = 'unknown'"
            >未知</text>
          </view>
        </view>

        <view class="form-actions">
          <text class="form-btn cancel" @click="showForm = false">取消</text>
          <text class="form-btn confirm" @click="onSubmitForm">确定</text>
        </view>
      </view>
    </view>

    <!-- 删除确认弹窗 -->
    <Dialog
      :visible="deleteDialogVisible"
      title="确认删除"
      :content="`确定要删除「${deleteTarget?.name}」的信息吗？删除后不可恢复。`"
      :show-cancel="true"
      confirm-text="删除"
      @confirm="confirmDelete"
      @cancel="deleteDialogVisible = false"
      @close="deleteDialogVisible = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { addBabyInfo, updateBabyInfo, deleteBabyInfo } from '@/services/user'
import type { BabyInfo, Gender } from '@/types/models'
import Dialog from '@/components/common/Dialog.vue'

const userStore = useUserStore()

const babyList = computed(() => userStore.userInfo?.babyInfos || [])

const showForm = ref(false)
const isEditing = ref(false)
const editingBabyId = ref('')
const deleteDialogVisible = ref(false)
const deleteTarget = ref<BabyInfo | null>(null)

const formData = ref({
  name: '',
  birthDate: '',
  gender: 'unknown' as Gender
})

onShow(() => {
  // 刷新数据
})

function getGenderText(gender: Gender): string {
  const map: Record<Gender, string> = { male: '男孩', female: '女孩', unknown: '未知' }
  return map[gender]
}

function getBabyAge(birthDate: string): string {
  if (!birthDate) return '年龄未知'
  const birth = new Date(birthDate)
  const now = new Date()
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (months < 1) return '新生儿'
  if (months < 12) return `${months}个月`
  const years = Math.floor(months / 12)
  const remainMonths = months % 12
  return remainMonths > 0 ? `${years}岁${remainMonths}个月` : `${years}岁`
}

function onSelectBaby(babyId: string) {
  userStore.selectBaby(babyId)
  uni.showToast({ title: '已切换宝宝', icon: 'none' })
}

function onAddBaby() {
  isEditing.value = false
  editingBabyId.value = ''
  formData.value = { name: '', birthDate: '', gender: 'unknown' }
  showForm.value = true
}

function onEditBaby(baby: BabyInfo) {
  isEditing.value = true
  editingBabyId.value = baby.babyId
  formData.value = {
    name: baby.name,
    birthDate: baby.birthDate,
    gender: baby.gender
  }
  showForm.value = true
}

function onDeleteBaby(baby: BabyInfo) {
  deleteTarget.value = baby
  deleteDialogVisible.value = true
}

function onBirthDateChange(e: any) {
  formData.value.birthDate = e.detail.value
}

function onSubmitForm() {
  if (!formData.value.name.trim()) {
    uni.showToast({ title: '请输入宝宝姓名', icon: 'none' })
    return
  }
  if (!formData.value.birthDate) {
    uni.showToast({ title: '请选择宝宝生日', icon: 'none' })
    return
  }

  const userId = userStore.userId
  if (!userId) return

  if (isEditing.value) {
    const result = updateBabyInfo(userId, editingBabyId.value, {
      name: formData.value.name.trim(),
      birthDate: formData.value.birthDate,
      gender: formData.value.gender
    })
    if (result) {
      const updatedUser = { ...userStore.userInfo!, updatedAt: Date.now() }
      userStore.setUserInfo(updatedUser)
      uni.showToast({ title: '修改成功', icon: 'success' })
    }
  } else {
    const result = addBabyInfo(userId, {
      name: formData.value.name.trim(),
      birthDate: formData.value.birthDate,
      gender: formData.value.gender
    })
    if (result) {
      const updatedUser = { ...userStore.userInfo!, updatedAt: Date.now() }
      userStore.setUserInfo(updatedUser)
      // 如果是第一个宝宝，自动选中
      if (babyList.value.length === 1) {
        userStore.selectBaby(result.babyId)
      }
      uni.showToast({ title: '添加成功', icon: 'success' })
    }
  }

  showForm.value = false
}

function confirmDelete() {
  if (!deleteTarget.value || !userStore.userId) return

  const success = deleteBabyInfo(userStore.userId, deleteTarget.value.babyId)
  if (success) {
    const updatedUser = { ...userStore.userInfo!, updatedAt: Date.now() }
    userStore.setUserInfo(updatedUser)

    // 如果删除的是当前选中的宝宝，重置选中
    if (deleteTarget.value.babyId === userStore.selectedBabyId) {
      const remaining = updatedUser.babyInfos
      if (remaining.length > 0) {
        userStore.selectBaby(remaining[0].babyId)
      } else {
        userStore.selectBaby('')
      }
    }

    uni.showToast({ title: '已删除', icon: 'success' })
  }

  deleteDialogVisible.value = false
  deleteTarget.value = null
}
</script>

<style scoped lang="scss">
.baby-info-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding: $spacing-md;
}

.baby-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.baby-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-md $spacing-lg;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.baby-card.selected {
  border-left: 6rpx solid $primary;
}

.baby-main {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.baby-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #FFF3EB;
}

.baby-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.baby-name-row {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
}

.baby-name {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
}

.current-tag {
  font-size: 20rpx;
  color: #FFFFFF;
  background-color: $primary;
  padding: 2rpx 12rpx;
  border-radius: $radius-sm;
}

.baby-detail {
  font-size: 24rpx;
  color: $text-secondary;
}

.baby-age {
  font-size: 24rpx;
  color: $primary;
}

.baby-actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-md;
  margin-top: $spacing-sm;
  padding-top: $spacing-sm;
  border-top: 2rpx solid $bg-page;
}

.action-btn {
  font-size: 26rpx;
  padding: 8rpx 24rpx;
  border-radius: $radius-sm;
}

.action-btn.edit {
  color: $primary;
  background-color: #FFF3EB;
}

.action-btn.delete {
  color: $error;
  background-color: #FFF0F0;
}

/* 添加宝宝按钮 */
.add-baby-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  margin-top: $spacing-md;
  height: 96rpx;
  background-color: $bg-card;
  border: 2rpx dashed $border-color;
  border-radius: $radius-lg;
}

.add-icon {
  font-size: 40rpx;
  color: $primary;
  font-weight: bold;
}

.add-text {
  font-size: 28rpx;
  color: $primary;
}

/* 表单弹窗 */
.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.form-box {
  width: 600rpx;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-lg;
}

.form-title {
  font-size: 34rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-md;
  display: block;
  text-align: center;
}

.form-item {
  margin-bottom: $spacing-md;
}

.form-label {
  font-size: 26rpx;
  color: $text-secondary;
  margin-bottom: $spacing-xs;
  display: block;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background-color: $bg-page;
  border-radius: $radius-md;
  padding: 0 $spacing-sm;
  font-size: 28rpx;
  color: $text-primary;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.input-placeholder {
  color: $text-hint;
}

.picker-text {
  line-height: 80rpx;
}

.gender-group {
  display: flex;
  gap: $spacing-sm;
}

.gender-btn {
  flex: 1;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: $text-secondary;
  background-color: $bg-page;
  border-radius: $radius-md;
}

.gender-btn.active {
  color: #FFFFFF;
  background-color: $primary;
}

.form-actions {
  display: flex;
  gap: $spacing-sm;
  margin-top: $spacing-lg;
}

.form-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;
  font-size: 28rpx;
}

.form-btn.cancel {
  background-color: $bg-page;
  color: $text-secondary;
}

.form-btn.confirm {
  background-color: $primary;
  color: #FFFFFF;
}
</style>
