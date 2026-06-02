// 宠物性别
export type PetGender = 'male' | 'female' | 'unknown'

// 宠物种类
export type PetSpecies = 'dog' | 'cat' | 'bird' | 'fish' | 'hamster' | 'rabbit' | 'turtle' | 'other'

// 性格标签
export type PersonalityTag = '活泼' | '粘人' | '高冷' | '胆小' | '贪吃' | '调皮' | '温顺' | '社牛' | '安静' | '好奇' | '忠诚' | '独立'

// 日记可见性
export type DiaryVisibility = 'public' | 'private'

// 宠友关系状态
export type FriendshipStatus = 'active' | 'blocked' | 'deleted'

// 表情反应类型
export type ReactionEmoji = '🐾' | '❤️' | '😍' | '🤣' | '👏'

// 通知类型
export type NotificationType = 'new_friend' | 'new_diary' | 'new_reaction'

// 引导任务类型
export type TaskType = 'complete_profile' | 'first_diary' | 'first_bump'

// Pet 宠物模型
export interface Pet {
  petId: string
  userId: string
  name: string
  species: PetSpecies
  breed: string
  age: number
  gender: PetGender
  personality: PersonalityTag[]
  avatar: string
  createdAt: number
  updatedAt: number
}

// Friendship 宠友关系
export interface Friendship {
  friendshipId: string
  userId: string
  friendUserId: string
  friendPet: Pet  // 对方宠物信息快照
  meetTime: number
  meetLocation?: string
  remark: string
  status: FriendshipStatus
  createdAt: number
}

// Diary 日记
export interface Diary {
  diaryId: string
  userId: string
  petId: string
  petName: string
  petAvatar: string
  content: string
  images: string[]
  visibility: DiaryVisibility
  reactionCount: Record<ReactionEmoji, number>
  createdAt: number
}

// Reaction 表情反应
export interface Reaction {
  reactionId: string
  diaryId: string
  userId: string
  emoji: ReactionEmoji
  createdAt: number
}

// Notification 通知
export interface Notification {
  notificationId: string
  userId: string
  type: NotificationType
  sourceUserId: string
  sourceUserName: string
  sourcePetName: string
  relatedDiaryId?: string
  isRead: boolean
  createdAt: number
}

// UserTask 引导任务
export interface UserTask {
  taskId: string
  userId: string
  taskType: TaskType
  isCompleted: boolean
  completedAt?: number
}

// UserInfo 用户信息
export interface UserInfo {
  userId: string
  nickname: string
  avatar: string
  createdAt: number
}
