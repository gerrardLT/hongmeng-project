import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ColorHistory, ColorInfo } from '@/types/models'

const STORAGE_KEY = 'coloraid_histories'
const MAX_HISTORY_COUNT = 100

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const useHistoryStore = defineStore('history', () => {
  // state
  const histories = ref<ColorHistory[]>([])

  // getters
  /** 最近3条识别记录，用于首页和服务卡片展示 */
  const recentColors = computed(() => histories.value.slice(0, 3))

  /**
   * 持久化历史记录到本地存储
   */
  function persist() {
    try {
      uni.setStorageSync(STORAGE_KEY, histories.value)
    } catch (e) {
      console.error('persist histories error:', e)
    }
  }

  /**
   * 添加一条颜色识别记录
   * @param color 颜色信息
   * @param source 识别来源：camera 相机 / photo 相册
   */
  function addHistory(color: ColorInfo, source: 'camera' | 'photo') {
    const record: ColorHistory = {
      historyId: generateId(),
      color,
      source,
      createdAt: Date.now()
    }
    histories.value.unshift(record)
    // 最多保留 100 条
    if (histories.value.length > MAX_HISTORY_COUNT) {
      histories.value = histories.value.slice(0, MAX_HISTORY_COUNT)
    }
    persist()
  }

  /**
   * 删除指定历史记录
   * @param historyId 记录 ID
   */
  function removeHistory(historyId: string) {
    const index = histories.value.findIndex((h) => h.historyId === historyId)
    if (index !== -1) {
      histories.value.splice(index, 1)
      persist()
    }
  }

  /**
   * 清空所有历史记录
   */
  function clearAll() {
    histories.value = []
    try {
      uni.removeStorageSync(STORAGE_KEY)
    } catch (e) {
      console.error('clear histories error:', e)
    }
  }

  /**
   * 从本地存储初始化恢复历史记录
   */
  function init() {
    try {
      const saved = uni.getStorageSync(STORAGE_KEY) as ColorHistory[] | undefined
      if (saved && Array.isArray(saved)) {
        // 按 createdAt 降序排列
        histories.value = saved.sort((a, b) => b.createdAt - a.createdAt)
      }
    } catch (e) {
      console.error('init histories error:', e)
    }
  }

  return {
    histories,
    recentColors,
    addHistory,
    removeHistory,
    clearAll,
    init
  }
})
