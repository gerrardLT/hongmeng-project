// 纪念品种类
export type KeepsakeCategory = 'handprint' | 'hair' | 'tooth' | 'birth' | 'growth'

// 设计风格
export type DesignStyle = 'modern' | 'vintage' | 'cartoon' | 'traditional' | 'custom'

// 预约状态
export type BookingStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'

// 制作进度阶段
export type ProgressStage = 'collected' | 'design-confirmed' | 'manufacturing' | 'quality-check' | 'ready-pickup' | 'shipped'

// 里程碑类型
export type MilestoneType = 'first_handprint' | 'first_hair_cut' | 'first_tooth' | 'birthday'

// 性别
export type Gender = 'male' | 'female' | 'unknown'

// 纪念品类型
export interface KeepsakeType {
  typeId: string
  name: string
  category: KeepsakeCategory
  description: string
  suitableAge: string
  duration: string
  priceRange: string
  photos: string[]
  technique: string
  storageMethod: string
  createdAt: number
}

// 工作室
export interface Studio {
  studioId: string
  name: string
  address: string
  location: { latitude: number; longitude: number }
  services: string[]
  rating: number
  photos: string[]
  phone: string
  businessHours: string
  distance?: number
}

// 预约
export interface Booking {
  bookingId: string
  userId: string
  studioId: string
  typeId: string
  babyName: string
  babyBirthday: string
  appointmentDate: string
  appointmentTime: string
  status: BookingStatus
  designStyle: DesignStyle
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
  estimatedCompletionTime?: number
}

// 里程碑
export interface Milestone {
  milestoneId: string
  userId: string
  bookingId: string
  type: MilestoneType
  title: string
  description: string
  recordDate: string
  photos: string[]
  createdAt: number
}

// 宝宝信息
export interface BabyInfo {
  babyId: string
  name: string
  birthDate: string
  gender: Gender
  avatar?: string
}

// 用户
export interface User {
  userId: string
  phoneNumber?: string
  harmonyAccountId?: string
  nickname: string
  avatar: string
  babyInfos: BabyInfo[]
  privacyAgreed: boolean
  notificationEnabled: boolean
  createdAt: number
  updatedAt: number
}
