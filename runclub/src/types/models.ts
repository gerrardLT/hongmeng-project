// ===== 联合类型 =====

export type ActivityType = 'regular' | 'training' | 'race' | 'casual'

export type ActivityStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

export type TrainingType = 'rest' | 'easy' | 'tempo' | 'long' | 'interval' | 'recovery'

export type TrainingStatus = 'active' | 'completed' | 'paused'

export type ResultSource = 'manual' | 'health'

export type RankingType = 'monthly_distance' | 'participation' | 'avg_pace' | 'total_distance'

export type DistancePreset = '5km' | '10km' | 'half' | 'full' | 'custom'

// ===== 数据模型 =====

export interface UserInfo {
  userId: string
  nickname: string
  avatar: string
  createdAt: number
}

export interface RunningClub {
  clubId: string
  name: string
  description: string
  ownerId: string
  members: string[]
  createdAt: number
}

export interface ActivityLocation {
  name: string
  latitude: number
  longitude: number
}

export interface Activity {
  activityId: string
  clubId: string
  name: string
  type: ActivityType
  date: string
  time: string
  location: ActivityLocation
  distance: number
  description: string
  maxParticipants?: number
  registrationDeadline: string
  status: ActivityStatus
  createdAt: number
}

export interface Registration {
  registrationId: string
  activityId: string
  userId: string
  nickname: string
  note: string
  registeredAt: number
}

export interface CheckIn {
  checkInId: string
  activityId: string
  userId: string
  nickname: string
  checkInTime: number
  checkInLocation?: ActivityLocation
  isManual: boolean
}

export interface Result {
  resultId: string
  activityId: string
  userId: string
  nickname: string
  finishTime: string
  pace: string
  source: ResultSource
  createdAt: number
}

export interface TrainingDay {
  day: number
  type: TrainingType
  description: string
  distance?: number
  completed: boolean
  completedAt?: number
}

export interface TrainingPlan {
  planId: string
  userId: string
  name: string
  duration: number
  schedule: TrainingDay[]
  targetRace?: string
  startDate: string
  status: TrainingStatus
}

export interface RunnerCard {
  cardId: string
  userId: string
  nickname: string
  avatar: string
  runningAge: number
  totalDistance: number
  motto: string
  contactVisible: boolean
  contact?: string
  createdAt: number
}

export interface RunRecord {
  recordId: string
  userId: string
  date: string
  distance: number
  duration: number
  pace: string
  calories?: number
  source: ResultSource
  createdAt: number
}
