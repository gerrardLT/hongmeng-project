import { dbGet, dbSet, dbQuery, generateId } from '@/utils/db'

const ORDER_COLLECTION = 'orders'
const PAYMENT_COLLECTION = 'payments'

/** 订单状态 */
type OrderStatus = 'unpaid' | 'deposit_paid' | 'paid' | 'refunded'

/** 支付状态 */
type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'refunded'

/** 订单 */
interface Order {
  orderId: string
  bookingId: string
  userId: string
  amount: number
  depositAmount: number
  status: OrderStatus
  createdAt: number
  updatedAt: number
}

/** 支付记录 */
interface PaymentRecord {
  paymentId: string
  orderId: string
  amount: number
  type: 'deposit' | 'full'
  status: PaymentStatus
  paidAt?: number
  mockTransactionId: string
  createdAt: number
}

/**
 * 创建订单
 * @param bookingId 预约 ID
 * @param amount 订单总金额
 * @returns 创建的订单
 */
export function createOrder(bookingId: string, amount: number): Order {
  const now = Date.now()

  // 查找预约信息以获取用户ID
  const booking = dbGet<{ bookingId: string; userId: string; depositAmount: number }>('bookings', bookingId)
  const userId = booking?.userId || ''
  const depositAmount = booking?.depositAmount || Math.round(amount * 0.3)

  const order: Order = {
    orderId: generateId(),
    bookingId,
    userId,
    amount,
    depositAmount,
    status: 'unpaid',
    createdAt: now,
    updatedAt: now
  }

  dbSet(ORDER_COLLECTION, order.orderId, order)
  return order
}

/**
 * 支付定金
 * @param orderId 订单 ID
 * @param amount 支付金额
 * @returns 支付结果
 */
export async function payDeposit(orderId: string, amount: number): Promise<PaymentRecord> {
  const order = dbGet<Order>(ORDER_COLLECTION, orderId)
  if (!order) {
    throw new Error('订单不存在')
  }

  if (order.status !== 'unpaid') {
    throw new Error('订单状态不允许支付定金')
  }

  // 模拟支付延迟
  await new Promise((resolve) => setTimeout(resolve, 800))

  const now = Date.now()

  // 创建支付记录
  const payment: PaymentRecord = {
    paymentId: generateId(),
    orderId,
    amount,
    type: 'deposit',
    status: 'success',
    paidAt: now,
    mockTransactionId: `TX_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: now
  }

  dbSet(PAYMENT_COLLECTION, payment.paymentId, payment)

  // 更新订单状态
  const updatedOrder: Order = {
    ...order,
    status: 'deposit_paid',
    updatedAt: now
  }
  dbSet(ORDER_COLLECTION, orderId, updatedOrder)

  return payment
}

/**
 * 查询支付状态
 * @param orderId 订单 ID
 * @returns 订单及支付状态信息
 */
export function getPaymentStatus(orderId: string): {
  order: Order | null
  payments: PaymentRecord[]
  isPaid: boolean
} {
  const order = dbGet<Order>(ORDER_COLLECTION, orderId)

  const payments = dbQuery<PaymentRecord>(
    PAYMENT_COLLECTION,
    (p) => p.orderId === orderId
  ).sort((a, b) => (b.paidAt || 0) - (a.paidAt || 0))

  const isPaid = order?.status === 'paid' || order?.status === 'deposit_paid'

  return { order, payments, isPaid }
}

/**
 * 模拟全额支付（制作完成后支付尾款）
 * @param orderId 订单 ID
 * @returns 支付结果
 */
export async function payFull(orderId: string): Promise<PaymentRecord> {
  const order = dbGet<Order>(ORDER_COLLECTION, orderId)
  if (!order) {
    throw new Error('订单不存在')
  }

  if (order.status !== 'deposit_paid') {
    throw new Error('订单状态不允许支付尾款')
  }

  // 模拟支付延迟
  await new Promise((resolve) => setTimeout(resolve, 800))

  const now = Date.now()
  const remainingAmount = order.amount - order.depositAmount

  const payment: PaymentRecord = {
    paymentId: generateId(),
    orderId,
    amount: remainingAmount,
    type: 'full',
    status: 'success',
    paidAt: now,
    mockTransactionId: `TX_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: now
  }

  dbSet(PAYMENT_COLLECTION, payment.paymentId, payment)

  // 更新订单状态
  const updatedOrder: Order = {
    ...order,
    status: 'paid',
    updatedAt: now
  }
  dbSet(ORDER_COLLECTION, orderId, updatedOrder)

  return payment
}
