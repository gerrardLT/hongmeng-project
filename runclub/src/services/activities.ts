import type { Activity, Registration, CheckIn, Result, ActivityStatus } from '@/types/models'
import { dbGetAll, dbGet, dbSet, dbDelete, dbQuery, generateId } from '@/utils/db'

/**
 * 创建活动
 */
export async function createActivity(data: Omit<Activity, 'activityId' | 'createdAt' | 'status'>): Promise<Activity> {
  const activity: Activity = {
    ...data,
    activityId: generateId(),
    status: 'upcoming',
    createdAt: Date.now()
  }
  dbSet('activities', activity.activityId, activity)
  return activity
}

/**
 * 获取活动列表
 */
export async function getActivities(status?: ActivityStatus): Promise<Activity[]> {
  const all = dbGetAll<Activity>('activities')
  const filtered = status ? all.filter((a) => a.status === status) : all
  return filtered.sort((a, b) => b.createdAt - a.createdAt)
}

/**
 * 获取活动详情
 */
export async function getActivityById(activityId: string): Promise<Activity | null> {
  return dbGet<Activity>('activities', activityId)
}

/**
 * 更新活动
 */
export async function updateActivity(activityId: string, data: Partial<Activity>): Promise<Activity> {
  const existing = dbGet<Activity>('activities', activityId)
  if (!existing) throw new Error('活动不存在')
  const updated = { ...existing, ...data }
  dbSet('activities', activityId, updated)
  return updated
}

/**
 * 删除活动
 */
export async function deleteActivity(activityId: string): Promise<void> {
  dbDelete('activities', activityId)
}

// ===== 报名管理 =====

/**
 * 报名活动
 */
export async function registerActivity(activityId: string, userId: string, nickname: string, note = ''): Promise<Registration> {
  // 检查是否已报名
  const existing = dbQuery<Registration>('registrations', (r) => r.activityId === activityId && r.userId === userId)
  if (existing.length > 0) throw new Error('已报名该活动')

  const registration: Registration = {
    registrationId: generateId(),
    activityId,
    userId,
    nickname,
    note,
    registeredAt: Date.now()
  }
  dbSet('registrations', registration.registrationId, registration)
  return registration
}

/**
 * 取消报名
 */
export async function cancelRegistration(registrationId: string): Promise<void> {
  dbDelete('registrations', registrationId)
}

/**
 * 获取活动报名列表
 */
export async function getRegistrations(activityId: string): Promise<Registration[]> {
  return dbQuery<Registration>('registrations', (r) => r.activityId === activityId)
}

// ===== 签到管理 =====

/**
 * 签到
 */
export async function checkInActivity(
  activityId: string,
  userId: string,
  nickname: string,
  location?: { name: string; latitude: number; longitude: number }
): Promise<CheckIn> {
  // 检查是否已签到
  const existing = dbQuery<CheckIn>('checkins', (c) => c.activityId === activityId && c.userId === userId)
  if (existing.length > 0) throw new Error('已签到')

  const checkIn: CheckIn = {
    checkInId: generateId(),
    activityId,
    userId,
    nickname,
    checkInTime: Date.now(),
    checkInLocation: location,
    isManual: false
  }
  dbSet('checkins', checkIn.checkInId, checkIn)
  return checkIn
}

/**
 * 获取活动签到列表
 */
export async function getCheckIns(activityId: string): Promise<CheckIn[]> {
  return dbQuery<CheckIn>('checkins', (c) => c.activityId === activityId)
}

/**
 * 手动签到（管理员操作）
 */
export async function manualCheckIn(activityId: string, userId: string, nickname: string): Promise<CheckIn> {
  const checkIn: CheckIn = {
    checkInId: generateId(),
    activityId,
    userId,
    nickname,
    checkInTime: Date.now(),
    isManual: true
  }
  dbSet('checkins', checkIn.checkInId, checkIn)
  return checkIn
}

// ===== 成绩管理 =====

/**
 * 添加成绩
 */
export async function addResult(
  activityId: string,
  userId: string,
  nickname: string,
  finishTime: string,
  pace: string,
  source: 'manual' | 'health' = 'manual'
): Promise<Result> {
  const result: Result = {
    resultId: generateId(),
    activityId,
    userId,
    nickname,
    finishTime,
    pace,
    source,
    createdAt: Date.now()
  }
  dbSet('results', result.resultId, result)
  return result
}

/**
 * 获取活动成绩列表
 */
export async function getResults(activityId: string): Promise<Result[]> {
  return dbQuery<Result>('results', (r) => r.activityId === activityId)
    .sort((a, b) => {
      // 按完成时间排序（升序）
      return a.finishTime.localeCompare(b.finishTime)
    })
}

/**
 * 获取活动排名
 */
export async function getRanking(activityId: string): Promise<Result[]> {
  const results = await getResults(activityId)
  return results.map((r, index) => ({ ...r, rank: index + 1 }))
}
