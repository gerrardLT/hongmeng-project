// 联合类型
export type ProjectCategory = 'ring' | 'earring' | 'pendant' | 'decoration' | 'other'
export type DifficultyLevel = 'easy' | 'medium' | 'hard'
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

// 工作室
export interface Studio {
  studioId: string
  name: string
  address: string
  location: { latitude: number; longitude: number }
  phone: string
  photos: string[]
  rating: number
  businessHours: string
  description: string
  priceRange: string
  distance?: number
}

// 项目
export interface Project {
  projectId: string
  studioId: string
  name: string
  category: ProjectCategory
  duration: number       // 时长（分钟）
  difficulty: DifficultyLevel
  price: number
  photos: string[]
  description: string
  suitableFor: string    // 适合人群
  process: string[]      // 制作流程步骤
  colors: string[]       // 可选颜色
  shapes: string[]       // 可选形状
}

// 预约
export interface Booking {
  bookingId: string
  userId: string
  studioId: string
  projectId: string
  studioName: string
  projectName: string
  date: string
  timeSlot: string
  peopleCount: number
  status: BookingStatus
  deposit: number
  note: string
  qrCode?: string
  createdAt: number
  updatedAt: number
}

// 作品
export interface Artwork {
  artworkId: string
  userId: string
  bookingId?: string
  studioId?: string
  studioName?: string
  projectId?: string
  projectName?: string
  photos: string[]
  description: string
  createdAt: number
}

// 用户信息
export interface UserInfo {
  userId: string
  nickname: string
  avatar: string
  phone?: string
  createdAt: number
}

// 筛选条件
export interface StudioFilter {
  sortBy: 'distance' | 'rating' | 'price'
  priceRange?: [number, number]
  minRating?: number
}
