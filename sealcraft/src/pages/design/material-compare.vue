<template>
  <view class="compare-page">
    <!-- 材质选择区 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">选择对比材质</text>
        <text class="section-hint">已选 {{ selectedIds.length }}/3</text>
      </view>
      <view class="material-chips">
        <view
          v-for="mat in allMaterials"
          :key="mat.materialId"
          :class="['chip', { active: selectedIds.includes(mat.materialId), disabled: !selectedIds.includes(mat.materialId) && selectedIds.length >= 3 }]"
          @click="onToggleMaterial(mat.materialId)"
        >
          <text class="chip-text">{{ mat.name }}</text>
        </view>
      </view>
    </view>

    <!-- 卡片对比 -->
    <view v-if="compareList.length > 0" class="section">
      <view class="section-header">
        <text class="section-title">材质对比</text>
      </view>
      <view class="compare-cards">
        <view
          v-for="item in compareList"
          :key="item.materialId"
          class="compare-card"
        >
          <!-- 材质名称 -->
          <view class="card-header">
            <text class="card-title">{{ item.name }}</text>
          </view>

          <!-- 价格 -->
          <view class="card-row">
            <text class="row-label">价格区间</text>
            <text class="row-value price">{{ item.priceRange }}</text>
          </view>

          <!-- 硬度 -->
          <view class="card-row">
            <text class="row-label">硬度</text>
            <text class="row-value">{{ item.hardness }}</text>
          </view>

          <!-- 质感 -->
          <view class="card-row">
            <text class="row-label">质感</text>
            <text class="row-value texture">{{ item.texture }}</text>
          </view>

          <!-- 特点 -->
          <view class="card-row">
            <text class="row-label">特点</text>
          </view>
          <view class="feature-tags">
            <view
              v-for="(feature, idx) in item.features"
              :key="idx"
              class="feature-tag"
            >
              <text class="feature-tag-text">{{ feature }}</text>
            </view>
          </view>

          <!-- 适用场景 -->
          <view class="card-row">
            <text class="row-label">适用印章</text>
          </view>
          <view class="suit-tags">
            <view
              v-for="(suit, idx) in item.suitableFor"
              :key="idx"
              class="suit-tag"
            >
              <text class="suit-tag-text">{{ suit }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 表格对比 -->
    <view v-if="compareList.length >= 2" class="section">
      <view class="section-header">
        <text class="section-title">表格对比</text>
      </view>
      <scroll-view class="table-scroll" scroll-x enhanced :show-scrollbar="false">
        <view class="compare-table">
          <!-- 表头 -->
          <view class="table-row header">
            <view class="table-cell label-cell">
              <text class="table-header-text">对比维度</text>
            </view>
            <view
              v-for="item in compareList"
              :key="'h_' + item.materialId"
              class="table-cell value-cell"
            >
              <text class="table-header-text">{{ item.name }}</text>
            </view>
          </view>

          <!-- 价格 -->
          <view class="table-row">
            <view class="table-cell label-cell">
              <text class="table-label-text">价格</text>
            </view>
            <view
              v-for="item in compareList"
              :key="'p_' + item.materialId"
              class="table-cell value-cell"
            >
              <text class="table-value-text price">{{ item.priceRange }}</text>
            </view>
          </view>

          <!-- 硬度 -->
          <view class="table-row">
            <view class="table-cell label-cell">
              <text class="table-label-text">硬度</text>
            </view>
            <view
              v-for="item in compareList"
              :key="'h_' + item.materialId"
              class="table-cell value-cell"
            >
              <text class="table-value-text">{{ item.hardness }}</text>
            </view>
          </view>

          <!-- 质感 -->
          <view class="table-row">
            <view class="table-cell label-cell">
              <text class="table-label-text">质感</text>
            </view>
            <view
              v-for="item in compareList"
              :key="'t_' + item.materialId"
              class="table-cell value-cell"
            >
              <text class="table-value-text">{{ item.texture }}</text>
            </view>
          </view>

          <!-- 适用场景 -->
          <view class="table-row">
            <view class="table-cell label-cell">
              <text class="table-label-text">适用场景</text>
            </view>
            <view
              v-for="item in compareList"
              :key="'s_' + item.materialId"
              class="table-cell value-cell"
            >
              <text class="table-value-text">{{ item.suitableFor.join('、') }}</text>
            </view>
          </view>

          <!-- 特点 -->
          <view class="table-row">
            <view class="table-cell label-cell">
              <text class="table-label-text">特点</text>
            </view>
            <view
              v-for="item in compareList"
              :key="'f_' + item.materialId"
              class="table-cell value-cell"
            >
              <text class="table-value-text">{{ item.features.join('、') }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 空状态 -->
    <view v-if="selectedIds.length === 0" class="empty-hint">
      <text class="empty-text">请选择 2-3 种材质进行对比</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getMaterials } from '@/services/seal'
import { compareMaterials } from '@/services/design'
import type { Material, MaterialComparison } from '@/types/models'

const allMaterials = ref<Material[]>([])
const selectedIds = ref<string[]>([])
const compareList = ref<MaterialComparison[]>([])

function onToggleMaterial(materialId: string) {
  const idx = selectedIds.value.indexOf(materialId)
  if (idx >= 0) {
    selectedIds.value.splice(idx, 1)
  } else {
    if (selectedIds.value.length >= 3) {
      uni.showToast({ title: '最多选择3种材质', icon: 'none' })
      return
    }
    selectedIds.value.push(materialId)
  }
  updateCompareList()
}

function updateCompareList() {
  if (selectedIds.value.length === 0) {
    compareList.value = []
    return
  }
  compareList.value = compareMaterials(selectedIds.value)
}

onLoad((options) => {
  allMaterials.value = getMaterials()
  if (options?.selectedIds) {
    const ids = decodeURIComponent(options.selectedIds).split(',').filter(Boolean)
    ids.forEach(id => {
      if (!selectedIds.value.includes(id) && selectedIds.value.length < 3) {
        selectedIds.value.push(id)
      }
    })
    updateCompareList()
  }
})
</script>

<style scoped lang="scss">
.compare-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding: $spacing-md;
}

.section {
  margin-bottom: $spacing-lg;
}

.section-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-md;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
}

.section-hint {
  font-size: 24rpx;
  color: $text-hint;
}

/* ===== 材质选择 chips ===== */
.material-chips {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16rpx;
}

.chip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14rpx 32rpx;
  background-color: $bg-card;
  border-radius: 36rpx;
  border: 2rpx solid $border-color;
}

.chip.active {
  border-color: $primary;
  background-color: #FDF5F5;
}

.chip.disabled {
  opacity: 0.5;
}

.chip-text {
  font-size: 26rpx;
  color: $text-primary;
}

.chip.active .chip-text {
  color: $primary;
  font-weight: 600;
}

/* ===== 卡片对比 ===== */
.compare-cards {
  display: flex;
  flex-direction: row;
  gap: 20rpx;
  overflow-x: auto;
}

.compare-card {
  flex: 1;
  min-width: 300rpx;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-md;
  flex-shrink: 0;
}

.card-header {
  padding-bottom: $spacing-sm;
  border-bottom: 1rpx solid #F0EBE6;
  margin-bottom: $spacing-sm;
}

.card-title {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
}

.card-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 12rpx;
}

.row-label {
  font-size: 24rpx;
  color: $text-hint;
  width: 120rpx;
  flex-shrink: 0;
}

.row-value {
  font-size: 24rpx;
  color: $text-primary;
  flex: 1;
}

.row-value.price {
  color: $primary;
  font-weight: 600;
}

.row-value.texture {
  line-height: 1.5;
}

.feature-tags,
.suit-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.feature-tag {
  background-color: #FDF0F0;
  border-radius: 6rpx;
  padding: 4rpx 14rpx;
}

.feature-tag-text {
  font-size: 20rpx;
  color: $primary;
}

.suit-tag {
  background-color: #F0F5F0;
  border-radius: 6rpx;
  padding: 4rpx 14rpx;
}

.suit-tag-text {
  font-size: 20rpx;
  color: $accent;
}

/* ===== 表格对比 ===== */
.table-scroll {
  white-space: nowrap;
}

.compare-table {
  background-color: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  min-width: 100%;
}

.table-row {
  display: flex;
  flex-direction: row;
  border-bottom: 1rpx solid #F0EBE6;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row.header {
  background-color: #FAF7F4;
}

.table-cell {
  padding: 20rpx 16rpx;
  display: flex;
  align-items: center;
}

.label-cell {
  width: 140rpx;
  flex-shrink: 0;
  justify-content: center;
  border-right: 1rpx solid #F0EBE6;
}

.value-cell {
  flex: 1;
  min-width: 200rpx;
  border-right: 1rpx solid #F0EBE6;
}

.value-cell:last-child {
  border-right: none;
}

.table-header-text {
  font-size: 24rpx;
  font-weight: 700;
  color: $text-primary;
}

.table-label-text {
  font-size: 24rpx;
  color: $text-secondary;
  font-weight: 600;
}

.table-value-text {
  font-size: 22rpx;
  color: $text-primary;
  line-height: 1.5;
  white-space: normal;
  word-break: break-all;
}

.table-value-text.price {
  color: $primary;
  font-weight: 600;
}

/* ===== 空状态 ===== */
.empty-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: $text-hint;
}
</style>
