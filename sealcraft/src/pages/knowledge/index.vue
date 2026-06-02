<template>
  <view class="knowledge-page">
    <!-- 顶部标题 -->
    <view class="page-header">
      <text class="page-title">印章知识</text>
      <text class="page-subtitle">探索篆刻的千年文化</text>
    </view>

    <!-- Tab 切换栏 -->
    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentTab === tab.value }"
        @click="onTabChange(tab.value)"
      >
        <text class="tab-text" :class="{ 'tab-text-active': currentTab === tab.value }">
          {{ tab.label }}
        </text>
      </view>
    </view>

    <!-- 内容区 -->
    <scroll-view class="content-scroll" scroll-y @scrolltolower="onScrollBottom">
      <!-- 印章类型 Tab -->
      <view v-if="currentTab === 'seal'" class="tab-content">
        <view class="section-intro">
          <text class="section-intro-text">印章按用途可分为五大类，每种都有独特的文化渊源与使用场景。</text>
        </view>
        <view class="seal-list">
          <view
            v-for="item in sealTypes"
            :key="item.typeId"
            class="seal-list-item"
          >
            <SealCard
              :sealType="item"
              :showPrice="true"
              @click="goSealTypeDetail(item.typeId)"
            />
          </view>
        </view>
        <view v-if="sealTypes.length === 0" class="empty-state">
          <text class="empty-icon">🔖</text>
          <text class="empty-text">暂无印章类型数据</text>
        </view>
      </view>

      <!-- 材质介绍 Tab -->
      <view v-if="currentTab === 'material'" class="tab-content">
        <view class="section-intro">
          <text class="section-intro-text">从石料到金属，从木料到角质，不同材质赋予印章各异的气质与价值。</text>
        </view>
        <view class="material-list">
          <view
            v-for="item in materials"
            :key="item.materialId"
            class="material-list-item"
          >
            <MaterialCard
              :material="item"
              @click="goMaterialDetail(item.materialId)"
            />
          </view>
        </view>
        <view v-if="materials.length === 0" class="empty-state">
          <text class="empty-icon">💎</text>
          <text class="empty-text">暂无材质数据</text>
        </view>
      </view>

      <!-- 字体介绍 Tab -->
      <view v-if="currentTab === 'font'" class="tab-content">
        <view class="section-intro">
          <text class="section-intro-text">书体风格影响印章的整体气韵，篆、隶、楷、行各有其美。</text>
        </view>
        <view class="font-list">
          <view
            v-for="item in fontStyles"
            :key="item.fontId"
            class="font-list-item"
          >
            <FontPreview
              :font="item"
              @select="goFontDetail(item.fontId)"
            />
          </view>
        </view>
        <view v-if="fontStyles.length === 0" class="empty-state">
          <text class="empty-icon">✍️</text>
          <text class="empty-text">暂无字体数据</text>
        </view>
      </view>

      <view class="safe-bottom"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import SealCard from '@/components/SealCard.vue'
import MaterialCard from '@/components/MaterialCard.vue'
import FontPreview from '@/components/FontPreview.vue'
import { getSealTypes, getMaterials, getFontStyles } from '@/services/seal'
import type { SealType, Material, FontStyle } from '@/types/models'

type TabValue = 'seal' | 'material' | 'font'

const tabs = [
  { label: '印章类型', value: 'seal' as TabValue },
  { label: '材质介绍', value: 'material' as TabValue },
  { label: '字体介绍', value: 'font' as TabValue }
]

const currentTab = ref<TabValue>('seal')
const sealTypes = ref<SealType[]>([])
const materials = ref<Material[]>([])
const fontStyles = ref<FontStyle[]>([])

function loadData() {
  sealTypes.value = getSealTypes()
  materials.value = getMaterials()
  fontStyles.value = getFontStyles()
}

onMounted(() => {
  loadData()
})

onShow(() => {
  loadData()
})

function onTabChange(value: TabValue) {
  currentTab.value = value
}

function goSealTypeDetail(typeId: string) {
  uni.navigateTo({ url: `/pages/knowledge/seal-type-detail?typeId=${typeId}` })
}

function goMaterialDetail(materialId: string) {
  uni.navigateTo({ url: `/pages/knowledge/material-detail?materialId=${materialId}` })
}

function goFontDetail(fontId: string) {
  uni.navigateTo({ url: `/pages/knowledge/font-detail?fontId=${fontId}` })
}

function onScrollBottom() {
  // 预留上拉加载更多
}
</script>

<style scoped lang="scss">
.knowledge-page {
  min-height: 100vh;
  background-color: $bg-page;
  display: flex;
  flex-direction: column;
}

/* 顶部标题 */
.page-header {
  padding: 48rpx 32rpx 24rpx;
  background: linear-gradient(160deg, #C41A1A 0%, #8B1010 100%);
}

.page-title {
  display: block;
  font-size: 44rpx;
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: 4rpx;
  margin-bottom: 8rpx;
}

.page-subtitle {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.75);
  letter-spacing: 2rpx;
}

/* Tab 栏 */
.tab-bar {
  display: flex;
  flex-direction: row;
  background-color: #FFFFFF;
  border-bottom: 2rpx solid #F0E8E8;
  padding: 0 32rpx;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0;
  position: relative;
  transition: all 0.2s ease;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  width: 60%;
  height: 4rpx;
  background-color: #C41A1A;
  border-radius: 4rpx;
}

.tab-text {
  font-size: 28rpx;
  color: $text-secondary;
  font-weight: 500;
}

.tab-text-active {
  color: #C41A1A;
  font-weight: 700;
}

/* 内容区 */
.content-scroll {
  flex: 1;
  height: 0;
}

.tab-content {
  padding: 0 0 32rpx;
}

.section-intro {
  padding: 24rpx 32rpx 16rpx;
  background-color: #FDF8F8;
  border-left: 6rpx solid #C41A1A;
  margin: 24rpx 32rpx 24rpx;
  border-radius: 0 $radius-sm $radius-sm 0;
}

.section-intro-text {
  font-size: 24rpx;
  color: $text-secondary;
  line-height: 1.6;
}

/* 印章类型列表 */
.seal-list {
  padding: 0 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.seal-list-item {
  width: 100%;
}

/* 材质列表 */
.material-list {
  padding: 0 32rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.material-list-item {
  width: 100%;
}

/* 字体列表 */
.font-list {
  padding: 0 32rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.font-list-item {
  width: 100%;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: $text-hint;
}

/* 安全区 */
.safe-bottom {
  height: env(safe-area-inset-bottom);
  padding-bottom: 40rpx;
}
</style>
