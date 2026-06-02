// 纪念品分类
export type MemorialCategory = 'pawprint' | 'fur' | 'portrait' | 'seal' | 'jewelry'

// 宠物类型
export type PetType = 'cat' | 'dog' | 'other'

// 宠物性别
export type PetGender = 'male' | 'female' | 'unknown'

// 预约状态
export type BookingStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'

// 制作进度阶段
export type ProgressStage = 'collected' | 'design-confirmed' | 'manufacturing' | 'quality-check' | 'ready-pickup' | 'shipped'

// 纪念日类型
export type AnniversaryType = 'birthday' | 'adopt-day' | 'memorial-day' | 'custom'

// 纪念品种类
export interface MemorialType {
  typeId: string
  name: string
  category: MemorialCategory
  description: string
  suitablePet: string
  duration: string
  priceRange: string
  photos: string[]
  technique: string        // 制作工艺
  collectionMethod: string // 采集方法
  createdAt: number
}

// 宠物档案
export interface PetProfile {
  petId: string
  userId: string
  name: string
  type: PetType
  breed: string
  gender: PetGender
  birthday: string
  adoptDate: string
  avatar: string
  photos: string[]
  personality: string
  createdAt: number
  updatedAt: number
}

// 工作室
export interface Studio {
  studioId: string
  name: string
  address: string
  location: { latitude: number; longitude: number }
  services: MemorialCategory[]
  rating: number
  reviewCount: number
  photos: string[]
  phone: string
  businessHours: string
  distance?: number
  description: string
}

// 预约
export interface Booking {
  bookingId: string
  userId: string
  petId: string
  studioId: string
  typeId: string
  date: string
  timeSlot: string
  status: BookingStatus
  specialRequests?: string
  depositAmount: number
  totalAmount: number
  createdAt: number
  updatedAt: number
}

// 制作进度
export interface Progress {
  progressId: string
  bookingId: string
  stage: ProgressStage
  status: string
  updateTime: number
  note: string
  photos: string[]
  estimatedCompletionTime?: number
}

// 纪念日
export interface Anniversary {
  anniversaryId: string
  petId: string
  userId: string
  type: AnniversaryType
  title: string
  date: string
  reminderDays: number[]   // 提前几天提醒 [3, 1]
  enabled: boolean
  createdAt: number
}

// 用户
export interface User {
  userId: string
  phoneNumber?: string
  harmonyAccountId?: string
  nickname: string
  avatar: string
  petIds: string[]
  privacyAgreed: boolean
  notificationEnabled: boolean
  createdAt: number
  updatedAt: number
}
