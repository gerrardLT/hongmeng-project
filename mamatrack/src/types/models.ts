// === 联合类型和常量 ===

export type ProfileStatus = 'active' | 'completed'
export type WeightSource = 'manual' | 'health'  // 手动输入 / 华为运动健康同步
export type ShareStatus = 'active' | 'revoked'
export type GainStatus = 'low' | 'normal' | 'high'  // 增重偏低/正常/偏高

// BMI分类
export type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese'

// BMI标准增重范围（WHO标准）
export const BMI_GAIN_STANDARDS: Record<BMICategory, { min: number; max: number; weeklyMin: number; weeklyMax: number }> = {
  underweight: { min: 12.5, max: 18, weeklyMin: 0.44, weeklyMax: 0.58 },
  normal: { min: 11.5, max: 16, weeklyMin: 0.35, weeklyMax: 0.5 },
  overweight: { min: 7, max: 11.5, weeklyMin: 0.23, weeklyMax: 0.33 },
  obese: { min: 5, max: 9, weeklyMin: 0.17, weeklyMax: 0.27 }
}

// === 用户信息 ===
export interface UserInfo {
  userId: string
  nickname: string
  avatar: string
  phone?: string
  createdAt: number
}

// === 孕期档案 ===
export interface PregnancyProfile {
  profileId: string
  userId: string
  height: number          // 身高(cm)
  preWeight: number       // 孕前体重(kg)
  preBMI: number          // 孕前BMI
  bmiCategory: BMICategory
  dueDate: string         // 预产期 YYYY-MM-DD
  startDate: string       // 建档日期
  targetGainMin: number   // 推荐增重下限(kg)
  targetGainMax: number   // 推荐增重上限(kg)
  status: ProfileStatus
  createdAt: number
  updatedAt?: number
}

// === 体重记录 ===
export interface WeightRecord {
  recordId: string
  profileId: string
  weight: number          // 体重(kg)
  date: string            // 记录日期 YYYY-MM-DD
  week: number            // 孕周
  weekDay: number         // 孕周+天
  gainFromPre: number     // 距孕前增重(kg)
  gainFromLast: number    // 距上次增重(kg)
  source: WeightSource
  note: string
  createdAt: number
}

// === 孕期拍照记录 ===
export interface PregnancyLog {
  logId: string
  profileId: string
  week: number
  frontPhotoUrl: string   // 正面照本地路径
  sidePhotoUrl: string    // 侧面照本地路径
  note: string
  createdAt: number
}

// === 家人共享 ===
export interface FamilyShare {
  shareId: string
  profileId: string
  ownerId: string
  familyUserId: string
  familyNickname: string
  inviteCode: string
  status: ShareStatus
  createdAt: number
}

// === 产检记录 ===
export interface CheckupRecord {
  checkupId: string
  profileId: string
  date: string            // 产检日期
  week: number            // 孕周
  weight: number          // 体重(kg)
  bloodPressureHigh?: number   // 收缩压
  bloodPressureLow?: number    // 舒张压
  fundalHeight?: number        // 宫高(cm)
  abdominalCircumference?: number  // 腹围(cm)
  fetalHeartRate?: number      // 胎心率
  note: string
  createdAt: number
}

// === 提醒设置 ===
export interface ReminderSettings {
  weightReminder: boolean      // 称重提醒
  weightReminderTime: string   // 提醒时间 HH:mm
  weightReminderDays: number[] // 提醒日 [1,3,5] = 周一三五
  checkupReminder: boolean     // 产检提醒
  nextCheckupDate: string      // 下次产检日期
}

// === 增重统计 ===
export interface GainStats {
  totalGain: number            // 总增重
  weeklyAvgGain: number        // 周平均增重
  lastWeekGain: number         // 上周增重
  last4WeeksTrend: number[]    // 最近4周增重趋势
  gainStatus: GainStatus       // 当前状态
  estimatedTotalGain: number   // 预估总增重
  currentPercentile: number    // 当前百分位
}

// === 知识条目 ===
export interface KnowledgeItem {
  id: string
  category: 'guide' | 'diet' | 'exercise' | 'faq'
  title: string
  summary: string
  content: string
  weekRange?: [number, number]  // 适用孕周范围
  icon: string
}

// Store 持久化状态
export interface UserStorageState {
  userInfo: UserInfo | null
  token: string
  isLoggedIn: boolean
  isPrivacyAgreed: boolean
}

export interface PregnancyStorageState {
  currentProfileId: string
  profiles: PregnancyProfile[]
}
