import type { Booking, BookingStatus, DesignStyle } from '@/types/models'
import { dbGet, dbGetAll, dbSet, dbDelete, dbQuery, generateId } from '@/utils/db'

const BOOKING_COLLECTION = 'bookings'

/**
 * 创建预约
 * @param data 预约数据（不含 bookingId、createdAt、updatedAt、status）
 * @returns 创建的预约记录
 */
export function createBooking(data: {
  userId: string
  studioId: string
  typeId: string
  babyName: string
  babyBirthday: string
  appointmentDate: string
  appointmentTime: string
  designStyle: DesignStyle
  specialRequests?: string
  depositAmount: number
  totalAmount: number
}): Booking {
  const now = Date.now()
  const booking: Booking = {
    bookingId: generateId(),
    userId: data.userId,
    studioId: data.studioId,
    typeId: data.typeId,
    babyName: data.babyName,
    babyBirthday: data.babyBirthday,
    appointmentDate: data.appointmentDate,
    appointmentTime: data.appointmentTime,
    status: 'pending',
    designStyle: data.designStyle,
    specialRequests: data.specialRequests,
    depositAmount: data.depositAmount,
    totalAmount: data.totalAmount,
    createdAt: now,
    updatedAt: now
  }

  dbSet(BOOKING_COLLECTION, booking.bookingId, booking)
  return booking
}

/**
 * 获取预约列表
 * @param userId 用户 ID
 * @returns 预约列表（按创建时间倒序）
 */
export function getBookingList(userId: string): Booking[] {
  return dbQuery<Booking>(BOOKING_COLLECTION, (item) => item.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt)
}

/**
 * 获取预约详情
 * @param bookingId 预约 ID
 * @returns 预约详情或 null
 */
export function getBookingDetail(bookingId: string): Booking | null {
  return dbGet<Booking>(BOOKING_COLLECTION, bookingId)
}

/**
 * 更新预约
 * @param bookingId 预约 ID
 * @param data 需要更新的字段
 * @returns 更新后的预约或 null
 */
export function updateBooking(bookingId: string, data: Partial<Omit<Booking, 'bookingId' | 'userId' | 'createdAt'>>): Booking | null {
  const existing = dbGet<Booking>(BOOKING_COLLECTION, bookingId)
  if (!existing) return null

  // 已完成或已取消的预约不可修改
  if (existing.status === 'completed' || existing.status === 'cancelled') {
    throw new Error('已完成或已取消的预约不可修改')
  }

  const updated: Booking = {
    ...existing,
    ...data,
    bookingId: existing.bookingId,
    userId: existing.userId,
    createdAt: existing.createdAt,
    updatedAt: Date.now()
  }

  dbSet(BOOKING_COLLECTION, bookingId, updated)
  return updated
}

/**
 * 取消预约
 * @param bookingId 预约 ID
 * @returns 是否取消成功
 */
export function cancelBooking(bookingId: string): boolean {
  const existing = dbGet<Booking>(BOOKING_COLLECTION, bookingId)
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

  dbSet(BOOKING_COLLECTION, bookingId, updated)
  return true
}
