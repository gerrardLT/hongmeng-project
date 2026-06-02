<template>
  <view class="exchange-page">
    <!-- 碰一碰交换区域 -->
    <view class="share-card">
      <text class="share-title">碰一碰交换书单</text>
      <text class="share-desc">选择要分享的内容，与朋友碰一碰交换</text>

      <!-- 内容类型选择 -->
      <view class="type-selector">
        <view
          v-for="item in typeOptions"
          :key="item.value"
          class="type-btn"
          :class="{ active: selectedType === item.value }"
          @click="selectedType = item.value"
        >
          <text class="type-btn-text">{{ item.label }}</text>
        </view>
      </view>

      <!-- 条目数量选择 -->
      <view class="count-selector">
        <text class="count-label">分享数量</text>
        <view class="count-options">
          <view
            v-for="n in countOptions"
            :key="n"
            class="count-btn"
            :class="{ active: selectedCount === n }"
            @click="selectedCount = n"
          >
            <text class="count-btn-text">{{ n }}条</text>
          </view>
        </view>
      </view>

      <!-- 开始碰一碰 -->
      <view class="share-action" @click="handleShare">
        <text class="share-action-text">开始碰一碰</text>
      </view>
    </view>

    <!-- 收到的书单区域 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">收到的书单</text>
        <text class="section-count">{{ exchangeStore.receivedLists.length }}</text>
      </view>

      <template v-if="exchangeStore.sortedReceivedLists.length > 0">
        <view class="received-list">
          <ReceivedListItem
            v-for="list in exchangeStore.sortedReceivedLists"
            :key="list.listId"
            :list="list"
            @click="toggleExpand(list.listId)"
          />

          <!-- 展开的条目列表 -->
          <view
            v-if="expandedListId"
            class="expanded-entries"
          >
            <view
              v-for="entry in currentExpandedEntries"
              :key="entry.entryId"
              class="entry-row"
            >
              <view class="entry-info">
                <text class="entry-title">{{ entry.title }}</text>
                <text class="entry-meta">{{ typeLabelMap[entry.type] }} · {{ entry.rating }}星</text>
              </view>
              <view class="entry-actions">
                <text class="action-save" @click="saveEntryFromList(entry)">保存到收藏</text>
                <text class="action-ignore" @click="ignoreEntry(entry.entryId)">忽略</text>
              </view>
            </view>
          </view>
        </view>
      </template>
      <Empty
        v-else
        icon="🤝"
        text="还没有收到书单，碰一碰和朋友交换吧"
      />
    </view>

    <!-- 保存的条目区域 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">保存的条目</text>
      </view>

      <!-- Tab 切换 -->
      <view class="tab-bar">
        <view
          class="tab-item"
          :class="{ active: savedTab === 'pending' }"
          @click="savedTab = 'pending'"
        >
          <text class="tab-text">待消费</text>
        </view>
        <view
          class="tab-item"
          :class="{ active: savedTab === 'done' }"
          @click="savedTab = 'done'"
        >
          <text class="tab-text">已完成</text>
        </view>
      </view>

      <template v-if="currentSavedEntries.length > 0">
        <view class="saved-list">
          <view
            v-for="item in currentSavedEntries"
            :key="item.savedId"
            class="saved-item"
          >
            <view class="saved-info">
              <text class="saved-title">{{ item.entryData.title }}</text>
              <text class="saved-meta">{{ typeLabelMap[item.entryData.type] }} · {{ item.entryData.rating }}星</text>
              <text class="saved-source">来自 {{ getSourceName(item.sourceListId) }} 推荐</text>
              <text v-if="item.remark" class="saved-remark">备注：{{ item.remark }}</text>
              <text class="saved-status">{{ item.status === 'pending' ? '待消费' : '已完成' }}</text>
            </view>
            <view class="saved-actions">
              <text
                v-if="item.status === 'pending'"
                class="action-done"
                @click="markDone(item.savedId)"
              >标记已完成</text>
              <text
                class="action-remark"
                @click="addRemark(item.savedId)"
              >添加备注</text>
              <text
                class="action-delete"
                @click="deleteSaved(item.savedId)"
              >删除</text>
            </view>
          </view>
        </view>
      </template>
      <Empty
        v-else
        :icon="savedTab === 'pending' ? '📥' : '✅'"
        :text="savedTab === 'pending' ? '暂无待消费条目' : '暂无已完成条目'"
      />
    </view>

    <!-- 备注弹窗 -->
    <Dialog
      :visible="remarkDialogVisible"
      title="添加备注"
      confirm-text="保存"
      @update:visible="remarkDialogVisible = $event"
      @confirm="confirmRemark"
    >
      <view class="remark-input-wrap">
        <input
          class="remark-input"
          v-model="remarkText"
          placeholder="输入备注内容"
          :maxlength="200"
        />
      </view>
    </Dialog>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEntryStore } from '@/store/entry'
import { useExchangeStore } from '@/store/exchange'
import { shareEntryList, saveEntryFromList as saveEntryService } from '@/services/exchange'
import { useUserStore } from '@/store/user'
import ReceivedListItem from '@/components/ReceivedListItem.vue'
import Empty from '@/components/common/Empty.vue'
import Dialog from '@/components/common/Dialog.vue'
import type { Entry, EntryType } from '@/types/models'

const entryStore = useEntryStore()
const exchangeStore = useExchangeStore()
const userStore = useUserStore()

// 碰一碰选项
const typeOptions = [
  { value: 'book', label: '书单' },
  { value: 'movie', label: '影单' },
  { value: 'podcast', label: '播客单' },
  { value: 'exhibition', label: '展览单' },
  { value: 'all', label: '全部' }
]
const countOptions = [3, 5, 10]

const selectedType = ref<EntryType | 'all'>('all')
const selectedCount = ref(5)

// 收到的书单展开
const expandedListId = ref<string>('')

const typeLabelMap: Record<string, string> = {
  book: '📖 书',
  movie: '🎬 影',
  podcast: '🎙️ 播客',
  exhibition: '🎨 展'
}

const currentExpandedEntries = computed(() => {
  if (!expandedListId.value) return []
  const list = exchangeStore.receivedLists.find(l => l.listId === expandedListId.value)
  return list?.entries || []
})

// 保存的条目 Tab
const savedTab = ref<'pending' | 'done'>('pending')

const currentSavedEntries = computed(() => {
  return savedTab.value === 'pending'
    ? exchangeStore.pendingSavedEntries
    : exchangeStore.doneSavedEntries
})

// 备注弹窗
const remarkDialogVisible = ref(false)
const remarkTargetId = ref('')
const remarkText = ref('')

function toggleExpand(listId: string) {
  expandedListId.value = expandedListId.value === listId ? '' : listId
}

function getSourceName(sourceListId: string): string {
  const list = exchangeStore.receivedLists.find(l => l.listId === sourceListId)
  return list?.senderName || '某位朋友'
}

async function handleShare() {
  // 根据选择类型获取条目
  let entries: Entry[]
  if (selectedType.value === 'all') {
    entries = entryStore.sortedEntries
  } else {
    entries = entryStore.entriesByType(selectedType.value as EntryType)
  }

  // 截取指定数量
  const shareEntries = entries.slice(0, selectedCount.value)

  if (shareEntries.length === 0) {
    uni.showToast({ title: '没有可分享的条目', icon: 'none' })
    return
  }

  // #ifdef APP-HARMONY
  try {
    await shareEntryList(shareEntries, selectedType.value)
    uni.showToast({ title: '分享成功', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '分享失败', icon: 'none' })
  }
  // #endif

  // #ifndef APP-HARMONY
  shareEntryList(shareEntries, selectedType.value)
  // #endif
}

function saveEntryFromList(entry: Entry) {
  const listId = expandedListId.value
  if (!listId) return
  const saved = saveEntryService(entry, listId, userStore.userId)
  exchangeStore.saveEntry(saved)
  uni.showToast({ title: '已保存到收藏', icon: 'success' })
}

function ignoreEntry(_entryId: string) {
  uni.showToast({ title: '已忽略', icon: 'none' })
}

function markDone(savedId: string) {
  exchangeStore.updateSavedEntryStatus(savedId, 'done')
  uni.showToast({ title: '已标记完成', icon: 'success' })
}

function addRemark(savedId: string) {
  remarkTargetId.value = savedId
  const entry = exchangeStore.savedEntries.find(e => e.savedId === savedId)
  remarkText.value = entry?.remark || ''
  remarkDialogVisible.value = true
}

function confirmRemark() {
  if (remarkTargetId.value && remarkText.value.trim()) {
    exchangeStore.updateSavedEntryRemark(remarkTargetId.value, remarkText.value.trim())
    uni.showToast({ title: '备注已保存', icon: 'success' })
  }
  remarkText.value = ''
  remarkTargetId.value = ''
}

function deleteSaved(savedId: string) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条保存的条目吗？',
    success: (res) => {
      if (res.confirm) {
        exchangeStore.deleteSavedEntry(savedId)
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}
</script>

<style scoped lang="scss">
.exchange-page {
  min-height: 100vh;
  background-color: $bg-color;
  padding: $spacing-md;
  padding-bottom: calc($spacing-md + env(safe-area-inset-bottom));
}

.share-card {
  background: linear-gradient(135deg, $primary-color, $accent-color);
  border-radius: $radius-lg;
  padding: $spacing-xl;
  margin-bottom: $spacing-lg;
}

.share-title {
  font-size: $font-xl;
  font-weight: 600;
  color: #FFFFFF;
  display: block;
  margin-bottom: $spacing-sm;
}

.share-desc {
  font-size: $font-sm;
  color: rgba(255, 255, 255, 0.8);
  display: block;
  margin-bottom: $spacing-lg;
}

.type-selector {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.type-btn {
  padding: $spacing-sm $spacing-md;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: $radius-pill;
  transition: all $transition-fast;

  &.active {
    background-color: #FFFFFF;

    .type-btn-text {
      color: $primary-color;
    }
  }
}

.type-btn-text {
  font-size: $font-sm;
  color: #FFFFFF;
}

.count-selector {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-lg;
}

.count-label {
  font-size: $font-md;
  color: rgba(255, 255, 255, 0.9);
}

.count-options {
  display: flex;
  flex-direction: row;
  gap: $spacing-sm;
}

.count-btn {
  padding: $spacing-xs $spacing-md;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: $radius-pill;
  transition: all $transition-fast;

  &.active {
    background-color: #FFFFFF;

    .count-btn-text {
      color: $primary-color;
    }
  }
}

.count-btn-text {
  font-size: $font-sm;
  color: #FFFFFF;
}

.share-action {
  background-color: #FFFFFF;
  border-radius: $radius-pill;
  padding: $spacing-md 0;
  text-align: center;

  &:active {
    opacity: 0.85;
  }
}

.share-action-text {
  font-size: $font-lg;
  font-weight: 600;
  color: $primary-color;
}

.section {
  margin-bottom: $spacing-lg;
}

.section-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.section-title {
  font-size: $font-lg;
  font-weight: 600;
  color: $text-primary;
}

.section-count {
  font-size: $font-sm;
  color: $text-hint;
  background-color: rgba($primary-color, 0.1);
  padding: 2rpx $spacing-sm;
  border-radius: $radius-pill;
}

.received-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.expanded-entries {
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-top: $spacing-xs;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.entry-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-sm 0;
  border-bottom: 1rpx solid $border-color;

  &:last-child {
    border-bottom: none;
  }
}

.entry-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.entry-title {
  font-size: $font-md;
  color: $text-primary;
  font-weight: 500;
}

.entry-meta {
  font-size: $font-xs;
  color: $text-secondary;
}

.entry-actions {
  display: flex;
  flex-direction: row;
  gap: $spacing-sm;
  flex-shrink: 0;
}

.action-save {
  font-size: $font-xs;
  color: $primary-color;
  padding: 4rpx $spacing-sm;
  background-color: rgba($primary-color, 0.08);
  border-radius: $radius-sm;
}

.action-ignore {
  font-size: $font-xs;
  color: $text-hint;
  padding: 4rpx $spacing-sm;
}

.tab-bar {
  display: flex;
  flex-direction: row;
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: 4rpx;
  margin-bottom: $spacing-md;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: $spacing-sm 0;
  border-radius: $radius-sm;
  transition: all $transition-fast;

  &.active {
    background-color: $primary-color;

    .tab-text {
      color: #FFFFFF;
    }
  }
}

.tab-text {
  font-size: $font-md;
  color: $text-secondary;
}

.saved-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.saved-item {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-md $spacing-lg;
  box-shadow: $shadow-sm;
}

.saved-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  margin-bottom: $spacing-sm;
}

.saved-title {
  font-size: $font-md;
  font-weight: 500;
  color: $text-primary;
}

.saved-meta {
  font-size: $font-xs;
  color: $text-secondary;
}

.saved-source {
  font-size: $font-xs;
  color: $accent-color;
}

.saved-remark {
  font-size: $font-xs;
  color: $text-hint;
  font-style: italic;
}

.saved-status {
  font-size: $font-xs;
  color: $secondary-color;
}

.saved-actions {
  display: flex;
  flex-direction: row;
  gap: $spacing-md;
  padding-top: $spacing-sm;
  border-top: 1rpx solid $border-color;
}

.action-done {
  font-size: $font-xs;
  color: $secondary-color;
  padding: 4rpx $spacing-sm;
  background-color: rgba($secondary-color, 0.08);
  border-radius: $radius-sm;
}

.action-remark {
  font-size: $font-xs;
  color: $accent-color;
  padding: 4rpx $spacing-sm;
  background-color: rgba($accent-color, 0.08);
  border-radius: $radius-sm;
}

.action-delete {
  font-size: $font-xs;
  color: $error-color;
  padding: 4rpx $spacing-sm;
}

.remark-input-wrap {
  width: 100%;
  padding: $spacing-sm 0;
}

.remark-input {
  width: 100%;
  height: 72rpx;
  border: 1rpx solid $border-color;
  border-radius: $radius-md;
  padding: 0 $spacing-md;
  font-size: $font-md;
  color: $text-primary;
  background-color: $bg-color;
  box-sizing: border-box;
}
</style>
