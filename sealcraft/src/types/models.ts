// 印章类型分类
export type SealCategory = 'name' | 'leisure' | 'bookplate' | 'signature' | 'collection'

// 印章类型
export interface SealType {
  typeId: string
  name: string
  category: SealCategory
  description: string
  usage: string
  priceRange: string
  photos: string[]
}

// 材质
export interface Material {
  materialId: string
  name: string
  features: string[]
  priceRange: string
  suitableFor: string[]
  hardness: string
  texture: string
  photos: string[]
}

// 字体风格
export interface FontStyle {
  fontId: string
  name: string
  style: string
  sampleText: string
  suitableFor: string[]
  history: string
  photos: string[]
}

// 工作室
export interface Studio {
  studioId: string
  name: string
  address: string
  location: { latitude: number; longitude: number }
  services: string[]
  rating: number
  reviewCount: number
  photos: string[]
  phone: string
  businessHours: string
  distance?: number
  description: string
  masterName: string
  specialties: string[]
}

// 预约状态
export type BookingStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'

// 配送方式
export type DeliveryType = 'pickup' | 'shipping'

// 预约
export interface Booking {
  bookingId: string
  userId: string
  studioId: string
  content: string
  fontId: string
  materialId: string
  sealTypeId: string
  date: string
  timeSlot: string
  status: BookingStatus
  deliveryType: DeliveryType
  depositAmount: number
  totalAmount: number
  specialRequests?: string
  designSnapshot?: string
  createdAt: string
  updatedAt: string
}

// 制作进度阶段
export type ProgressStage = 'design-confirmed' | 'material-prepared' | 'carving' | 'polishing' | 'quality-check' | 'ready-pickup' | 'shipped'

// 制作进度
export interface Progress {
  progressId: string
  bookingId: string
  stage: ProgressStage
  status: 'pending' | 'active' | 'completed'
  updateTime: string
  note: string
  photos: string[]
  estimatedCompletionTime?: string
}

// 印章收藏
export interface SealCollection {
  collectionId: string
  userId: string
  bookingId: string
  name: string
  sealTypeId: string
  materialId: string
  fontId: string
  photos: string[]
  inkEffects: string[]
  createdAt: string
  notes?: string
}

// 用户
export interface User {
  userId: string
  phoneNumber?: string
  harmonyAccountId?: string
  nickname: string
  avatar: string
  privacyAgreed: boolean
  notificationEnabled: boolean
  createdAt: string
  updatedAt: string
}

// 设计方案
export interface DesignDraft {
  content: string
  fontId: string
  materialId: string
  sealTypeId: string
  layout: 'auto' | 'horizontal' | 'vertical' | 'circular'
  inkColor: 'red' | 'vermilion' | 'blue'
}
