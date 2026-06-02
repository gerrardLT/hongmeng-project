/**
 * 条目类型
 */
export type EntryType = 'book' | 'movie' | 'podcast' | 'exhibition'

/**
 * 文化条目
 */
export interface Entry {
  entryId: string
  userId: string
  type: EntryType
  title: string            // 书名/片名/节目名/展览名
  subtitle: string         // 作者/导演/单集标题/场馆
  coverUrl: string         // 封面/海报URL
  date: string             // 阅读/观影/收听/观展日期 YYYY-MM-DD
  rating: number           // 评分 1-5
  review: string           // 短评（最多500字）
  tags: string[]           // 标签
  platform: string         // 平台（仅电影：影院/Netflix等）
  photos: string[]         // 展览照片URL数组
  isTopOfYear: boolean     // 是否年度精选
  createdAt: number        // 创建时间戳
  updatedAt: number        // 更新时间戳
}

/**
 * 标签
 */
export interface Tag {
  tagId: string
  userId: string
  name: string
  count: number
  createdAt: number
}

/**
 * 收到的书单
 */
export interface ReceivedList {
  listId: string
  userId: string           // 接收者
  senderId: string
  senderName: string
  listType: EntryType | 'all'
  entries: Entry[]         // 条目快照
  meetTime: number
  createdAt: number
}

/**
 * 保存的条目
 */
export interface SavedEntry {
  savedId: string
  userId: string
  sourceListId: string
  entryData: Entry         // 条目完整数据快照
  status: 'pending' | 'done'
  remark: string
  createdAt: number
}

/**
 * 用户信息
 */
export interface UserInfo {
  userId: string
  nickname: string
  avatar: string
  createdAt: number
}

/**
 * 用户设置
 */
export interface UserSettings {
  syncOnWifi: boolean      // Wi-Fi下自动同步
  syncOnMobile: boolean    // 移动网络手动同步
}

/**
 * 年度统计数据
 */
export interface YearStats {
  year: number
  totalBooks: number
  totalMovies: number
  totalPodcasts: number
  totalExhibitions: number
  monthlyDistribution: number[]   // 12个月各月条目数
  typeDistribution: Record<EntryType, number>
  ratingDistribution: number[]    // index 0-4 对应 1-5星数量
  topTags: { name: string; count: number }[]
}
