import type { RunningClub, RankingType, RunRecord, Result } from '@/types/models'
import { dbGetAll, dbGet, dbSet, dbQuery, generateId } from '@/utils/db'

/**
 * 创建跑团
 */
export async function createClub(name: string, description: string, ownerId: string): Promise<RunningClub> {
  const club: RunningClub = {
    clubId: generateId(),
    name,
    description,
    ownerId,
    members: [ownerId],
    createdAt: Date.now()
  }
  dbSet('clubs', club.clubId, club)
  return club
}

/**
 * 获取跑团信息
 */
export async function getClub(clubId: string): Promise<RunningClub | null> {
  return dbGet<RunningClub>('clubs', clubId)
}

/**
 * 更新跑团信息
 */
export async function updateClub(clubId: string, data: Partial<RunningClub>): Promise<RunningClub> {
  const existing = dbGet<RunningClub>('clubs', clubId)
  if (!existing) throw new Error('跑团不存在')
  const updated = { ...existing, ...data }
  dbSet('clubs', clubId, updated)
  return updated
}

// ===== 成员管理 =====

/**
 * 获取跑团成员列表
 */
export async function getMembers(clubId: string): Promise<string[]> {
  const club = dbGet<RunningClub>('clubs', clubId)
  return club?.members || []
}

/**
 * 添加成员
 */
export async function addMember(clubId: string, userId: string): Promise<void> {
  const club = dbGet<RunningClub>('clubs', clubId)
  if (!club) throw new Error('跑团不存在')
  if (club.members.includes(userId)) return
  club.members.push(userId)
  dbSet('clubs', clubId, club)
}

/**
 * 移除成员
 */
export async function removeMember(clubId: string, userId: string): Promise<void> {
  const club = dbGet<RunningClub>('clubs', clubId)
  if (!club) throw new Error('跑团不存在')
  club.members = club.members.filter((m) => m !== userId)
  dbSet('clubs', clubId, club)
}

// ===== 排名统计 =====

interface RankingItem {
  userId: string
  nickname: string
  avatar: string
  value: number
}

/**
 * 获取月度距离排名
 */
export async function getMonthlyDistanceRanking(): Promise<RankingItem[]> {
  const records = dbGetAll<RunRecord>('records')
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthRecords = records.filter((r) => new Date(r.date) >= monthStart)

  const userMap = new Map<string, { distance: number; nickname: string }>()
  for (const record of monthRecords) {
    const existing = userMap.get(record.userId)
    if (existing) {
      existing.distance += record.distance
    } else {
      userMap.set(record.userId, { distance: record.distance, nickname: '' })
    }
  }

  return Array.from(userMap.entries())
    .map(([userId, data]) => ({
      userId,
      nickname: data.nickname || userId,
      avatar: '',
      value: Math.round(data.distance * 10) / 10
    }))
    .sort((a, b) => b.value - a.value)
}

/**
 * 获取参与度排名
 */
export async function getParticipationRanking(): Promise<RankingItem[]> {
  const results = dbGetAll<Result>('results')
  const userMap = new Map<string, number>()
  for (const result of results) {
    userMap.set(result.userId, (userMap.get(result.userId) || 0) + 1)
  }

  return Array.from(userMap.entries())
    .map(([userId, count]) => ({
      userId,
      nickname: userId,
      avatar: '',
      value: count
    }))
    .sort((a, b) => b.value - a.value)
}

/**
 * 获取平均配速排名
 */
export async function getAvgPaceRanking(): Promise<RankingItem[]> {
  const records = dbGetAll<RunRecord>('records')
  const userMap = new Map<string, { totalPace: number; count: number }>()

  for (const record of records) {
    const parts = record.pace.split(':')
    const paceSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1] || '0')
    const existing = userMap.get(record.userId)
    if (existing) {
      existing.totalPace += paceSeconds
      existing.count++
    } else {
      userMap.set(record.userId, { totalPace: paceSeconds, count: 1 })
    }
  }

  return Array.from(userMap.entries())
    .map(([userId, data]) => ({
      userId,
      nickname: userId,
      avatar: '',
      value: Math.round(data.totalPace / data.count)
    }))
    .sort((a, b) => a.value - b.value) // 配速越小越好
}

/**
 * 获取总距离排名
 */
export async function getTotalDistanceRanking(): Promise<RankingItem[]> {
  const records = dbGetAll<RunRecord>('records')
  const userMap = new Map<string, number>()

  for (const record of records) {
    userMap.set(record.userId, (userMap.get(record.userId) || 0) + record.distance)
  }

  return Array.from(userMap.entries())
    .map(([userId, distance]) => ({
      userId,
      nickname: userId,
      avatar: '',
      value: Math.round(distance * 10) / 10
    }))
    .sort((a, b) => b.value - a.value)
}

/**
 * 获取跑团统计
 */
export async function getClubStats(clubId: string): Promise<{
  totalMembers: number
  totalActivities: number
  totalDistance: number
  avgPace: string
}> {
  const club = dbGet<RunningClub>('clubs', clubId)
  const records = dbGetAll<RunRecord>('records')
  const totalDistance = records.reduce((sum, r) => sum + r.distance, 0)

  return {
    totalMembers: club?.members.length || 0,
    totalActivities: dbGetAll('activities').length,
    totalDistance: Math.round(totalDistance * 10) / 10,
    avgPace: '--'
  }
}
