import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Notification } from '@/types/models'
import {
  createNotification as createNotificationService,
  getNotifications,
  markAsRead as markAsReadService,
  markAllAsRead as markAllAsReadService,
  deleteNotification as deleteNotificationService,
  getUnreadCount
} from '@/services/notification'

const MESSAGE_TAB_INDEX = 3

export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)

  // Getters
  const unreadNotifications = computed(() => {
    return notifications.value.filter((n) => !n.isRead)
  })

  const hasUnread = computed(() => {
    return unreadCount.value > 0
  })

  // Actions
  function loadNotifications(userId: string) {
    loading.value = true
    notifications.value = getNotifications(userId)
    unreadCount.value = getUnreadCount(userId)
    loading.value = false
    updateTabBarBadge()
  }

  function addNotification(notification: Notification) {
    notifications.value.unshift(notification)
    if (!notification.isRead) {
      unreadCount.value++
    }
    updateTabBarBadge()
  }

  function markAsRead(notificationId: string) {
    const success = markAsReadService(notificationId)
    if (success) {
      const notification = notifications.value.find((n) => n.notificationId === notificationId)
      if (notification && !notification.isRead) {
        notification.isRead = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
        updateTabBarBadge()
      }
    }
  }

  function markAllAsRead() {
    const userId = getCurrentUserId()
    markAllAsReadService(userId)
    notifications.value.forEach((n) => {
      n.isRead = true
    })
    unreadCount.value = 0
    updateTabBarBadge()
  }

  function deleteNotification(notificationId: string) {
    const notification = notifications.value.find((n) => n.notificationId === notificationId)
    const success = deleteNotificationService(notificationId)
    if (success) {
      if (notification && !notification.isRead) {
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
      notifications.value = notifications.value.filter((n) => n.notificationId !== notificationId)
      updateTabBarBadge()
    }
  }

  function refreshUnreadCount() {
    const userId = getCurrentUserId()
    unreadCount.value = getUnreadCount(userId)
    updateTabBarBadge()
  }

  function createFriendNotification(sourceUserId: string, sourceUserName: string, sourcePetName: string) {
    const userId = getCurrentUserId()
    const notification = createNotificationService({
      userId,
      type: 'new_friend',
      sourceUserId,
      sourceUserName,
      sourcePetName
    })
    addNotification(notification)
  }

  function createDiaryNotification(sourceUserId: string, sourceUserName: string, sourcePetName: string, diaryId: string) {
    const userId = getCurrentUserId()
    const notification = createNotificationService({
      userId,
      type: 'new_diary',
      sourceUserId,
      sourceUserName,
      sourcePetName,
      relatedDiaryId: diaryId
    })
    addNotification(notification)
  }

  function createReactionNotification(sourceUserId: string, sourceUserName: string, sourcePetName: string, diaryId: string) {
    const userId = getCurrentUserId()
    const notification = createNotificationService({
      userId,
      type: 'new_reaction',
      sourceUserId,
      sourceUserName,
      sourcePetName,
      relatedDiaryId: diaryId
    })
    addNotification(notification)
  }

  function updateTabBarBadge() {
    if (unreadCount.value > 0) {
      uni.setTabBarBadge({
        index: MESSAGE_TAB_INDEX,
        text: unreadCount.value > 99 ? '99+' : String(unreadCount.value)
      })
    } else {
      uni.removeTabBarBadge({ index: MESSAGE_TAB_INDEX })
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    unreadNotifications,
    hasUnread,
    loadNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshUnreadCount,
    createFriendNotification,
    createDiaryNotification,
    createReactionNotification,
    updateTabBarBadge
  }
})

function getCurrentUserId(): string {
  const userInfo = uni.getStorageSync('userInfo') as { userId?: string } | undefined
  return userInfo?.userId || 'default_user'
}
