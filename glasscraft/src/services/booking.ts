import type { Booking, BookingStatus } from '@/types/models'
import { dbGet, dbSet, dbList, dbDelete, generateId } from '@/utils/db'

const BOOKING_COLLECTION = 'bookings'

/**
 * 生成二维码数据（Mock）
 * @param bookingId 预约 ID
 * @returns 二维码数据字符串
 */
function generateQrCode(bookingId: string): string {
  return `GLASSCRAFT://${bookingId}?t=${Date.now()}`
}

/**
 * 创建预约
 * @param data 预约数据
 * @returns 创建的预约记录
 */
export async function createBooking(data: {
  userId: string
  studioId: string
  projectId: string
  studioName: string
  projectName: string
  date: string
  timeSlot: string
  peopleCount: number
  deposit: number
  note?: string
}): Promise<Booking> {
  const now = Date.now()
  const bookingId = generateId()

  const booking: Booking = {
    bookingId,
    userId: data.userId,
    studioId: data.studioId,
    projectId: data.projectId,
    studioName: data.studioName,
    projectName: data.projectName,
    date: data.date,
    timeSlot: data.timeSlot,
    peopleCount: data.peopleCount,
    status: 'pending',
    deposit: data.deposit,
    note: data.note || '',
    qrCode: generateQrCode(bookingId),
    createdAt: now,
    updatedAt: now
  }

  dbSet(BOOKING_COLLECTION, bookingId, booking)
  return booking
}

/**
 * 获取用户预约列表
 * @param userId 用户 ID
 * @returns 预约列表（按创建时间倒序）
 */
export async function getBookingList(userId: string): Promise<Booking[]> {
  const bookings = dbList<Booking>(BOOKING_COLLECTION)
  return bookings
    .filter((b) => b.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt)
}

/**
 * 获取预约详情
 * @param bookingId 预约 ID
 * @returns 预约详情或 null
 */
export async function getBookingDetail(bookingId: string): Promise<Booking | null> {
  return dbGet<Booking>(BOOKING_COLLECTION, bookingId)
}

/**
 * 更新预约状态
 * @param bookingId 预约 ID
 * @param status 新状态
 * @returns 更新后的预约或 null
 */
export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<Booking | null> {
  const existing = dbGet<Booking>(BOOKING_COLLECTION, bookingId)
  if (!existing) return null

  const updated: Booking = {
    ...existing,
    status,
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
export async function cancelBooking(bookingId: string): Promise<boolean> {
  const existing = dbGet<Booking>(BOOKING_COLLECTION, bookingId)
  if (!existing) return false

  if (existing.status === 'completed') {
    throw new Error('已完成的预约不可取消')
  }

  if (existing.status === 'cancelled') {
    return false
  }

  const updated: Booking = {
    ...existing,
    status: 'cancelled',
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
export async function getAvailableTimeSlots(
  studioId: string,
  date: string
): Promise<string[]> {
  // Mock 固定时间段
  const allSlots = ['09:00-11:00', '11:00-13:00', '14:00-16:00', '16:00-18:00']

  // 获取该工作室该日期已有的预约
  const bookings = dbList<Booking>(BOOKING_COLLECTION)
  const bookedSlots = bookings
    .filter((b) => b.studioId === studioId && b.date === date && b.status !== 'cancelled')
    .map((b) => b.timeSlot)

  // 过滤掉已预约的时间段
  return allSlots.filter((slot) => !bookedSlots.includes(slot))
}
