<template>
  <view class="page">
    <!-- 步骤指示器 -->
    <view class="steps">
      <view v-for="s in 3" :key="s" class="steps__item" :class="{ 'steps__item--active': step >= s, 'steps__item--done': step > s }">
        <view class="steps__circle">
          <text class="steps__num">{{ step > s ? '✓' : s }}</text>
        </view>
        <text class="steps__label">{{ stepLabels[s - 1] }}</text>
      </view>
      <view class="steps__line" />
    </view>

    <!-- Step 1: 选择创建方式 -->
    <view v-if="step === 1" class="step-content">
      <text class="step-content__title">选择创建方式</text>

      <!-- 从模板创建 -->
      <text class="section-label">从模板创建</text>
      <view class="template-grid">
        <view
          v-for="tpl in templates"
          :key="tpl.templateId"
          class="template-card"
          :class="{ 'template-card--selected': selectedTemplateId === tpl.templateId }"
          @click="selectTemplate(tpl.templateId)"
        >
          <text class="template-card__name">{{ tpl.name }}</text>
          <text class="template-card__desc">{{ tpl.description }}</text>
          <text class="template-card__count">{{ tpl.defaultItems.length }}件装备</text>
        </view>
      </view>

      <!-- 智能生成 -->
      <view class="method-btn" @click="chooseMethod('smart')">
        <text class="method-btn__icon">🤖</text>
        <view class="method-btn__info">
          <text class="method-btn__title">智能生成</text>
          <text class="method-btn__desc">根据露营参数自动推荐装备</text>
        </view>
      </view>

      <!-- 空白清单 -->
      <view class="method-btn" @click="chooseMethod('blank')">
        <text class="method-btn__icon">📝</text>
        <view class="method-btn__info">
          <text class="method-btn__title">空白清单</text>
          <text class="method-btn__desc">从零开始手动添加装备</text>
        </view>
      </view>
    </view>

    <!-- Step 2: 设置参数 -->
    <view v-if="step === 2" class="step-content">
      <!-- 智能生成参数表单 -->
      <view v-if="genType === 'smart'" class="form">
        <text class="step-content__title">设置露营参数</text>

        <view class="form-item">
          <text class="form-item__label">露营人数</text>
          <picker :range="peopleRange" :value="smartParams.people - 1" @change="onPeopleChange">
            <view class="form-item__picker">
              <text>{{ smartParams.people }}人</text>
              <text class="form-item__arrow">▸</text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-item__label">露营天数</text>
          <picker :range="daysRange" :value="smartParams.days - 1" @change="onDaysChange">
            <view class="form-item__picker">
              <text>{{ smartParams.days }}天</text>
              <text class="form-item__arrow">▸</text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-item__label">季节</text>
          <view class="radio-group">
            <view
              v-for="(label, key) in SEASON_MAP"
              :key="key"
              class="radio-item"
              :class="{ 'radio-item--active': smartParams.season === key }"
              @click="smartParams.season = key as Season"
            >
              <text>{{ label }}</text>
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="form-item__label">露营类型</text>
          <view class="radio-group">
            <view
              v-for="(label, key) in CAMP_TYPE_MAP"
              :key="key"
              class="radio-item"
              :class="{ 'radio-item--active': smartParams.campType === key }"
              @click="smartParams.campType = key as CampType"
            >
              <text>{{ label }}</text>
            </view>
          </view>
        </view>

        <view class="form-item form-item--row">
          <text class="form-item__label">是否过夜</text>
          <switch :checked="smartParams.overnight" color="#2E7D32" @change="smartParams.overnight = $event.detail.value" />
        </view>

        <view class="form-item form-item--row">
          <text class="form-item__label">是否做饭</text>
          <switch :checked="smartParams.cooking" color="#2E7D32" @change="smartParams.cooking = $event.detail.value" />
        </view>
      </view>

      <!-- 模板方式提示 -->
      <view v-if="genType === 'template'" class="confirm-info">
        <text class="step-content__title">模板预览</text>
        <text class="confirm-info__text">将使用「{{ selectedTemplate?.name }}」模板，包含 {{ selectedTemplate?.defaultItems.length }} 件装备</text>
      </view>

      <view class="step-actions">
        <view class="btn btn--outline" @click="step = 1"><text class="btn__text btn__text--outline">上一步</text></view>
        <view class="btn btn--primary" @click="generateItems"><text class="btn__text">生成清单</text></view>
      </view>
    </view>

    <!-- Step 3: 调整保存 -->
    <view v-if="step === 3" class="step-content">
      <text class="step-content__title">调整清单</text>

      <view class="form-item">
        <text class="form-item__label">清单名称</text>
        <input class="form-item__input" v-model="checklistName" placeholder="请输入清单名称" />
      </view>

      <view class="form-item">
        <text class="form-item__label">露营日期</text>
        <picker mode="date" :value="campingDate" @change="campingDate = $event.detail.value">
          <view class="form-item__picker">
            <text>{{ campingDate || '请选择日期' }}</text>
            <text class="form-item__arrow">▸</text>
          </view>
        </picker>
      </view>

      <!-- 装备列表 -->
      <view class="items-section">
        <view class="items-section__header">
          <text class="items-section__title">装备列表（{{ editItems.length }}件）</text>
          <view class="items-section__add" @click="showAddItem = true">
            <text class="items-section__add-text">＋ 添加</text>
          </view>
        </view>

        <view v-for="(item, index) in editItems" :key="index" class="edit-item">
          <view class="edit-item__main">
            <text class="edit-item__name">{{ item.name }}</text>
            <CategoryTag :category="item.category" />
          </view>
          <view class="edit-item__row">
            <text class="edit-item__weight">{{ formatWeightGram(item.weight, 'kg') }}</text>
            <view class="edit-item__qty">
              <text class="edit-item__qty-label">数量:</text>
              <view class="edit-item__qty-btn" @click="changeQty(index, -1)"><text>-</text></view>
              <text class="edit-item__qty-val">{{ item.quantity }}</text>
              <view class="edit-item__qty-btn" @click="changeQty(index, 1)"><text>+</text></view>
            </view>
            <view class="edit-item__del" @click="removeItem(index)">
              <text class="edit-item__del-text">删除</text>
            </view>
          </view>
          <input
            class="edit-item__note"
            v-model="item.note"
            placeholder="备注（可选）"
          />
        </view>

        <Empty v-if="editItems.length === 0" text="暂无装备，请添加" icon="🎒" />
      </view>

      <view class="step-actions">
        <view class="btn btn--outline" @click="step = genType === 'blank' ? 1 : 2"><text class="btn__text btn__text--outline">上一步</text></view>
        <view class="btn btn--primary" @click="saveChecklist"><text class="btn__text">保存清单</text></view>
      </view>
    </view>

    <!-- 添加装备弹窗 -->
    <view v-if="showAddItem" class="modal-mask" @click="showAddItem = false">
      <view class="modal" @click.stop>
        <text class="modal__title">添加装备</text>
        <view class="form-item">
          <text class="form-item__label">装备名称</text>
          <input class="form-item__input" v-model="newItem.name" placeholder="请输入装备名称" />
        </view>
        <view class="form-item">
          <text class="form-item__label">分类</text>
          <view class="radio-group radio-group--small">
            <view
              v-for="(label, key) in GEAR_CATEGORY_MAP"
              :key="key"
              class="radio-item radio-item--small"
              :class="{ 'radio-item--active': newItem.category === key }"
              @click="newItem.category = key as GearCategory"
            >
              <text>{{ label }}</text>
            </view>
          </view>
        </view>
        <view class="form-item">
          <text class="form-item__label">重量(克)</text>
          <input class="form-item__input" v-model="newItem.weight" type="number" placeholder="请输入重量" />
        </view>
        <view class="form-item">
          <text class="form-item__label">数量</text>
          <input class="form-item__input" v-model="newItem.quantity" type="number" placeholder="1" />
        </view>
        <view class="modal__actions">
          <view class="btn btn--outline" @click="showAddItem = false"><text class="btn__text btn__text--outline">取消</text></view>
          <view class="btn btn--primary" @click="confirmAddItem"><text class="btn__text">添加</text></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { ChecklistItem, GearCategory, CampType, Season, GenerationType, SmartGenParams } from '@/types/models'
import { GEAR_CATEGORY_MAP, SEASON_MAP, CAMP_TYPE_MAP } from '@/types/models'
import { useChecklistsStore } from '@/store/checklists'
import { useTemplatesStore } from '@/store/templates'
import { generateSmartChecklist } from '@/data/templates'
import { formatWeightGram } from '@/utils/format'
import CategoryTag from '@/components/CategoryTag.vue'
import Empty from '@/components/common/Empty.vue'

const checklistsStore = useChecklistsStore()
const templatesStore = useTemplatesStore()

const step = ref(1)
const stepLabels = ['选择方式', '设置参数', '调整保存']
const genType = ref<GenerationType>('template')
const selectedTemplateId = ref('')

const smartParams = reactive<SmartGenParams>({
  people: 2,
  days: 2,
  season: 'spring',
  campType: 'car',
  overnight: true,
  cooking: true
})

const peopleRange = Array.from({ length: 10 }, (_, i) => `${i + 1}人`)
const daysRange = Array.from({ length: 7 }, (_, i) => `${i + 1}天`)

const checklistName = ref('')
const campingDate = ref('')
const editItems = ref<ChecklistItem[]>([])

const showAddItem = ref(false)
const newItem = reactive({
  name: '',
  category: 'other' as GearCategory,
  weight: '',
  quantity: '1'
})

const templates = computed(() => templatesStore.templates)
const selectedTemplate = computed(() => templatesStore.getTemplateById(selectedTemplateId.value))

onLoad(() => {
  templatesStore.init()
  checklistsStore.init()
})

function genId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function selectTemplate(id: string) {
  selectedTemplateId.value = id
  genType.value = 'template'
  step.value = 2
}

function chooseMethod(method: 'smart' | 'blank') {
  genType.value = method
  if (method === 'blank') {
    editItems.value = []
    checklistName.value = ''
    step.value = 3
  } else {
    step.value = 2
  }
}

function onPeopleChange(e: any) {
  smartParams.people = Number(e.detail.value) + 1
}

function onDaysChange(e: any) {
  smartParams.days = Number(e.detail.value) + 1
}

function generateItems() {
  if (genType.value === 'template') {
    const tpl = selectedTemplate.value
    if (!tpl) return
    checklistName.value = tpl.name + '清单'
    editItems.value = tpl.defaultItems.map(item => ({
      ...item,
      itemId: genId(),
      isChecked: false
    }))
  } else if (genType.value === 'smart') {
    const rawItems = generateSmartChecklist(smartParams)
    checklistName.value = `${CAMP_TYPE_MAP[smartParams.campType]} ${smartParams.days}天`
    editItems.value = rawItems.map(item => ({
      ...item,
      itemId: genId(),
      isChecked: false
    }))
  }
  step.value = 3
}

function changeQty(index: number, delta: number) {
  const item = editItems.value[index]
  if (!item) return
  const newQty = item.quantity + delta
  if (newQty >= 1) {
    item.quantity = newQty
  }
}

function removeItem(index: number) {
  editItems.value.splice(index, 1)
}

function confirmAddItem() {
  if (!newItem.name.trim()) {
    uni.showToast({ title: '请输入装备名称', icon: 'none' })
    return
  }
  editItems.value.push({
    itemId: genId(),
    gearId: '',
    name: newItem.name.trim(),
    category: newItem.category,
    quantity: Math.max(1, Number(newItem.quantity) || 1),
    weight: Math.max(0, Number(newItem.weight) || 0),
    isChecked: false,
    note: ''
  })
  newItem.name = ''
  newItem.category = 'other'
  newItem.weight = ''
  newItem.quantity = '1'
  showAddItem.value = false
}

function saveChecklist() {
  if (!checklistName.value.trim()) {
    uni.showToast({ title: '请输入清单名称', icon: 'none' })
    return
  }
  if (!campingDate.value) {
    uni.showToast({ title: '请选择露营日期', icon: 'none' })
    return
  }

  const now = new Date().toISOString()
  const totalWeight = editItems.value.reduce((sum, i) => sum + i.weight * i.quantity, 0)

  checklistsStore.addChecklist({
    checklistId: `cl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId: '',
    name: checklistName.value.trim(),
    campingDate: campingDate.value,
    status: 'preparing',
    generationType: genType.value,
    parameters: genType.value === 'smart' ? { ...smartParams } : null,
    items: editItems.value,
    totalWeight,
    createdAt: now,
    updatedAt: now
  })

  uni.showToast({ title: '清单已创建', icon: 'success' })
  setTimeout(() => {
    uni.navigateBack()
  }, 1200)
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: #F5F7F5;
  padding: 24rpx 24rpx 120rpx;
}

.steps {
  display: flex;
  justify-content: space-between;
  padding: 24rpx 40rpx 40rpx;
  position: relative;

  &__line {
    position: absolute;
    top: 42rpx;
    left: 80rpx;
    right: 80rpx;
    height: 4rpx;
    background-color: #E0E0E0;
    z-index: 0;
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1;

    &--active .steps__circle {
      background-color: #2E7D32;
      border-color: #2E7D32;
    }

    &--active .steps__num {
      color: #ffffff;
    }

    &--active .steps__label {
      color: #2E7D32;
    }

    &--done .steps__circle {
      background-color: #4CAF50;
      border-color: #4CAF50;
    }
  }

  &__circle {
    width: 48rpx;
    height: 48rpx;
    border-radius: 50%;
    border: 3rpx solid #CCCCCC;
    background-color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8rpx;
  }

  &__num {
    font-size: 24rpx;
    color: #999999;
    font-weight: 600;
  }

  &__label {
    font-size: 22rpx;
    color: #999999;
  }
}

.step-content {
  &__title {
    font-size: 32rpx;
    font-weight: 700;
    color: #333333;
    margin-bottom: 28rpx;
    display: block;
  }
}

.section-label {
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 16rpx;
  display: block;
}

.template-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.template-card {
  width: calc(50% - 8rpx);
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx 20rpx;
  border: 3rpx solid transparent;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

  &--selected {
    border-color: #2E7D32;
    background-color: #E8F5E9;
  }

  &__name {
    font-size: 28rpx;
    font-weight: 600;
    color: #333333;
    display: block;
    margin-bottom: 8rpx;
  }

  &__desc {
    font-size: 22rpx;
    color: #999999;
    display: block;
    margin-bottom: 8rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &__count {
    font-size: 22rpx;
    color: #2E7D32;
    font-weight: 500;
  }
}

.method-btn {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

  &__icon {
    font-size: 48rpx;
    margin-right: 20rpx;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
  }

  &__title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333333;
    display: block;
    margin-bottom: 4rpx;
  }

  &__desc {
    font-size: 24rpx;
    color: #999999;
  }
}

.form {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 32rpx;
}

.form-item {
  margin-bottom: 28rpx;

  &--row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__label {
    font-size: 26rpx;
    color: #333333;
    font-weight: 500;
    margin-bottom: 12rpx;
    display: block;

    .form-item--row & {
      margin-bottom: 0;
    }
  }

  &__input {
    width: 100%;
    height: 72rpx;
    background-color: #F5F7F5;
    border-radius: 12rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
    color: #333333;
  }

  &__picker {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 72rpx;
    background-color: #F5F7F5;
    border-radius: 12rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
    color: #333333;
  }

  &__arrow {
    color: #999999;
    font-size: 24rpx;
  }
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;

  &--small {
    gap: 8rpx;
  }
}

.radio-item {
  padding: 12rpx 24rpx;
  border-radius: 24rpx;
  background-color: #F5F7F5;
  font-size: 26rpx;
  color: #666666;

  &--small {
    padding: 8rpx 16rpx;
    font-size: 24rpx;
  }

  &--active {
    background-color: #E8F5E9;
    color: #2E7D32;
    font-weight: 600;
  }
}

.confirm-info {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 32rpx;

  &__text {
    font-size: 28rpx;
    color: #666666;
    line-height: 1.6;
  }
}

.items-section {
  margin-top: 16rpx;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
  }

  &__title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333333;
  }

  &__add {
    padding: 8rpx 20rpx;
    background-color: #E8F5E9;
    border-radius: 20rpx;
  }

  &__add-text {
    font-size: 24rpx;
    color: #2E7D32;
    font-weight: 500;
  }
}

.edit-item {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 12rpx;

  &__main {
    display: flex;
    align-items: center;
    margin-bottom: 12rpx;
  }

  &__name {
    font-size: 28rpx;
    font-weight: 500;
    color: #333333;
    margin-right: 12rpx;
  }

  &__row {
    display: flex;
    align-items: center;
    margin-bottom: 12rpx;
  }

  &__weight {
    font-size: 24rpx;
    color: #999999;
    margin-right: 24rpx;
  }

  &__qty {
    display: flex;
    align-items: center;
    flex: 1;
  }

  &__qty-label {
    font-size: 24rpx;
    color: #666666;
    margin-right: 12rpx;
  }

  &__qty-btn {
    width: 44rpx;
    height: 44rpx;
    border-radius: 50%;
    background-color: #F5F7F5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    color: #333333;
  }

  &__qty-val {
    font-size: 28rpx;
    color: #333333;
    font-weight: 500;
    margin: 0 16rpx;
  }

  &__del {
    margin-left: auto;
    padding: 8rpx 16rpx;
  }

  &__del-text {
    font-size: 24rpx;
    color: #F44336;
  }

  &__note {
    width: 100%;
    height: 56rpx;
    background-color: #F5F7F5;
    border-radius: 8rpx;
    padding: 0 16rpx;
    font-size: 24rpx;
    color: #666666;
  }
}

.step-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
  padding-bottom: 40rpx;
}

.btn {
  flex: 1;
  height: 88rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &--primary {
    background-color: #2E7D32;
  }

  &--outline {
    background-color: #ffffff;
    border: 2rpx solid #2E7D32;
  }

  &__text {
    font-size: 30rpx;
    font-weight: 600;
    color: #ffffff;

    &--outline {
      color: #2E7D32;
    }
  }
}

.modal-mask {
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

.modal {
  width: 85%;
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx 32rpx;

  &__title {
    font-size: 32rpx;
    font-weight: 700;
    color: #333333;
    margin-bottom: 32rpx;
    display: block;
    text-align: center;
  }

  &__actions {
    display: flex;
    gap: 20rpx;
    margin-top: 32rpx;
  }
}
</style>
