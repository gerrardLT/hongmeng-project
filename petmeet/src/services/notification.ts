import { dbGet, dbGetAll, dbSet, dbDelete, dbQuery, generateId } from '@/utils/db'
import type { Notification, NotificationType } from '@/types/models'

const COLLECTION = 'notifications'

// 创建通知
export function createNotification(data: {
  userId: string
  type: NotificationType
  sourceUserId: string
  sourceUserName: string
  sourcePetName: string
  relatedDiaryId?: string
}): Notification {
  const notification: Notification = {
    notificationId: generateId(),
    userId: data.userId,
    type: data.type,
    sourceUserId: data.sourceUserId,
    sourceUserName: data.sourceUserName,
    sourcePetName: data.sourcePetName,
    relatedDiaryId: data.relatedDiaryId,
    isRead: false,
    createdAt: Date.now()
  }
  dbSet<Notification>(COLLECTION, notification.notificationId, notification)
  return notification
}

// 获取用户通知列表（按时间倒序）
export function getNotifications(userId: string): Notification[] {
  const list = dbQuery<Notification>(COLLECTION, (item) => item.userId === userId)
  return list.sort((a, b) => b.createdAt - a.createdAt)
}

// 标记已读
export function markAsRead(notificationId: string): boolean {
  const notification = dbGet<Notification>(COLLECTION, notificationId)
  if (!notification) return false
  notification.isRead = true
  dbSet<Notification>(COLLECTION, notificationId, notification)
  return true
}

// 标记全部已读
export function markAllAsRead(userId: string): void {
  const list = dbQuery<Notification>(COLLECTION, (item) => item.userId === userId && !item.isRead)
  for (const notification of list) {
    notification.isRead = true
    dbSet<Notification>(COLLECTION, notification.notificationId, notification)
  }
}

// 删除通知
export function deleteNotification(notificationId: string): boolean {
  const notification = dbGet<Notification>(COLLECTION, notificationId)
  if (!notification) return false
  dbDelete(COLLECTION, notificationId)
  return true
}

// 获取未读数量
export function getUnreadCount(userId: string): number {
  const list = dbQuery<Notification>(COLLECTION, (item) => item.userId === userId && !item.isRead)
  return list.length
}
