import type { Booking, BookingStatus, DeliveryType } from '@/types/models'
import { dbGet, dbSet, dbDelete, dbQuery, generateId } from '@/utils/db'

const BOOKING_COLLECTION = 'bookings'

/**
 * 创建预约
 * @param data 预约数据
 * @returns 创建的预约记录
 */
export function createBooking(data: {
  userId: string
  studioId: string
  content: string
  fontId: string
  materialId: string
  sealTypeId: string
  date: string
  timeSlot: string
  deliveryType: DeliveryType
  depositAmount: number
  totalAmount: number
  specialRequests?: string
  designSnapshot?: string
}): Booking {
  const now = Date.now()
  const booking: Booking = {
    bookingId: generateId(),
    userId: data.userId,
    studioId: data.studioId,
    content: data.content,
    fontId: data.fontId,
    materialId: data.materialId,
    sealTypeId: data.sealTypeId,
    date: data.date,
    timeSlot: data.timeSlot,
    status: 'pending',
    deliveryType: data.deliveryType,
    depositAmount: data.depositAmount,
    totalAmount: data.totalAmount,
    specialRequests: data.specialRequests,
    designSnapshot: data.designSnapshot,
    createdAt: now,
    updatedAt: now
  }

  dbSet(BOOKING_COLLECTION, booking.bookingId, booking)
  return booking
}

/**
 * 获取用户预约列表
 * @param userId 用户 ID
 * @returns 预约列表（按创建时间倒序）
 */
export function getBookings(userId: string): Booking[] {
  return dbQuery<Booking>(BOOKING_COLLECTION, (item) => item.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt)
}

/**
 * 获取预约详情
 * @param id 预约 ID
 * @returns 预约详情或 null
 */
export function getBookingById(id: string): Booking | null {
  return dbGet<Booking>(BOOKING_COLLECTION, id)
}

/**
 * 更新预约状态
 * @param id 预约 ID
 * @param status 新状态
 * @returns 更新后的预约或 null
 */
export function updateBookingStatus(id: string, status: BookingStatus): Booking | null {
  const existing = dbGet<Booking>(BOOKING_COLLECTION, id)
  if (!existing) return null

  // 已完成的预约不可修改状态
  if (existing.status === 'completed') {
    throw new Error('已完成的预约不可修改')
  }

  // 已取消的预约不可修改状态
  if (existing.status === 'cancelled') {
    throw new Error('已取消的预约不可修改')
  }

  const updated: Booking = {
    ...existing,
    status,
    updatedAt: Date.now()
  }

  dbSet(BOOKING_COLLECTION, id, updated)
  return updated
}

/**
 * 取消预约
 * @param id 预约 ID
 * @returns 是否取消成功
 */
export function cancelBooking(id: string): boolean {
  const existing = dbGet<Booking>(BOOKING_COLLECTION, id)
  if (!existing) return false

  // 已完成的预约不可取消
  if (existing.status === 'completed') {
    throw new Error('已完成的预约不可取消')
  }

  // 已取消的预约无需重复取消
  if (existing.status === 'cancelled') {
    return false
  }

  const updated: Booking = {
    ...existing,
    status: 'cancelled' as BookingStatus,
    updatedAt: Date.now()
  }

  dbSet(BOOKING_COLLECTION, id, updated)
  return true
}
