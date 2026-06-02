import type { Booking, BookingStatus } from '@/types/models'
import { dbGet, dbSet, dbDelete, dbQuery, generateId } from '@/utils/db'

const BOOKING_COLLECTION = 'bookings'

/**
 * 创建预约
 * @param data 预约数据
 * @returns 创建的预约记录
 */
export function createBooking(data: {
  userId: string
  petId: string
  studioId: string
  typeId: string
  date: string
  timeSlot: string
  specialRequests?: string
  depositAmount: number
  totalAmount: number
}): Booking {
  const now = Date.now()
  const booking: Booking = {
    bookingId: generateId(),
    userId: data.userId,
    petId: data.petId,
    studioId: data.studioId,
    typeId: data.typeId,
    date: data.date,
    timeSlot: data.timeSlot,
    status: 'pending',
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
 * @param bookingId 预约 ID
 * @returns 预约详情或 null
 */
export function getBookingById(bookingId: string): Booking | null {
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

/**
 * 获取可用时间段
 * @param studioId 工作室 ID
 * @param date 日期（YYYY-MM-DD）
 * @returns 可用时间段列表
 */
export function getAvailableTimeSlots(studioId: string, date: string): string[] {
  // Mock 可用时间段
  const allSlots = [
    '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00',
    '16:00-17:00', '17:00-18:00', '18:00-19:00'
  ]

  // 查询该工作室当天已预约的时间段
  const booked = dbQuery<Booking>(BOOKING_COLLECTION, (b) =>
    b.studioId === studioId && b.date === date && b.status !== 'cancelled'
  )

  const bookedSlots = booked.map((b) => b.timeSlot)

  // 过滤掉已预约的时间段
  return allSlots.filter((slot) => !bookedSlots.includes(slot))
}
