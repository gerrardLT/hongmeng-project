import type { Milestone, MilestoneType } from '@/types/models'
import { dbGet, dbGetAll, dbSet, dbDelete, dbQuery, generateId } from '@/utils/db'

const MILESTONE_COLLECTION = 'milestones'

/** 预置示例里程碑 */
const MOCK_MILESTONES: Partial<Milestone>[] = [
  {
    type: 'first_handprint',
    title: '第一次手印采集',
    description: '宝宝3个月大时，第一次尝试采集手印，小手比印泥还大，非常可爱。',
    recordDate: '2025-03-15',
    photos: ['/static/milestone/handprint_1.jpg']
  },
  {
    type: 'first_hair_cut',
    title: '第一次理发',
    description: '宝宝百日剃发，胎毛细软柔软，准备定制胎毛笔和胎毛画。',
    recordDate: '2025-05-20',
    photos: ['/static/milestone/hair_cut_1.jpg']
  },
  {
    type: 'first_tooth',
    title: '第一颗乳牙萌出',
    description: '宝宝8个月时萌出了第一颗乳牙，记录下这个重要的成长时刻。',
    recordDate: '2025-08-01',
    photos: ['/static/milestone/first_tooth.jpg']
  },
  {
    type: 'birthday',
    title: '周岁生日',
    description: '宝宝一岁啦！庆祝这个特别的日子，采集手脚印和乳牙留作纪念。',
    recordDate: '2026-02-15',
    photos: ['/static/milestone/first_birthday.jpg']
  }
]

/**
 * 获取里程碑列表
 * @param userId 用户 ID
 * @returns 里程碑列表（按记录日期倒序）
 */
export function getMilestones(userId: string): Milestone[] {
  const milestones = dbQuery<Milestone>(MILESTONE_COLLECTION, (item) => item.userId === userId)

  // 首次访问时预置 Mock 数据
  if (milestones.length === 0) {
    const defaultBookingId = 'booking_default'
    MOCK_MILESTONES.forEach((mock) => {
      const milestone: Milestone = {
        milestoneId: generateId(),
        userId,
        bookingId: defaultBookingId,
        type: mock.type as MilestoneType,
        title: mock.title!,
        description: mock.description!,
        recordDate: mock.recordDate!,
        photos: mock.photos || [],
        createdAt: Date.now()
      }
      dbSet(MILESTONE_COLLECTION, milestone.milestoneId, milestone)
    })
    return dbQuery<Milestone>(MILESTONE_COLLECTION, (item) => item.userId === userId)
  }

  return milestones.sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime())
}

/**
 * 添加里程碑
 * @param data 里程碑数据
 * @returns 创建的里程碑
 */
export function addMilestone(data: {
  userId: string
  bookingId: string
  type: MilestoneType
  title: string
  description: string
  recordDate: string
  photos: string[]
}): Milestone {
  const milestone: Milestone = {
    milestoneId: generateId(),
    userId: data.userId,
    bookingId: data.bookingId,
    type: data.type,
    title: data.title,
    description: data.description,
    recordDate: data.recordDate,
    photos: data.photos,
    createdAt: Date.now()
  }

  dbSet(MILESTONE_COLLECTION, milestone.milestoneId, milestone)
  return milestone
}

/**
 * 删除里程碑
 * @param milestoneId 里程碑 ID
 * @returns 是否删除成功
 */
export function deleteMilestone(milestoneId: string): boolean {
  const existing = dbGet<Milestone>(MILESTONE_COLLECTION, milestoneId)
  if (!existing) return false

  dbDelete(MILESTONE_COLLECTION, milestoneId)
  return true
}
