import type { TrainingPlan, TrainingDay, TrainingStatus } from '@/types/models'
import { dbGetAll, dbGet, dbSet, dbDelete, generateId } from '@/utils/db'

/**
 * 创建训练计划
 */
export async function createPlan(data: Omit<TrainingPlan, 'planId'>): Promise<TrainingPlan> {
  const plan: TrainingPlan = {
    ...data,
    planId: generateId()
  }
  dbSet('training_plans', plan.planId, plan)
  return plan
}

/**
 * 获取训练计划列表
 */
export async function getPlans(userId?: string): Promise<TrainingPlan[]> {
  const all = dbGetAll<TrainingPlan>('training_plans')
  return userId ? all.filter((p) => p.userId === userId) : all
}

/**
 * 获取训练计划详情
 */
export async function getPlanById(planId: string): Promise<TrainingPlan | null> {
  return dbGet<TrainingPlan>('training_plans', planId)
}

/**
 * 更新训练计划
 */
export async function updatePlan(planId: string, data: Partial<TrainingPlan>): Promise<TrainingPlan> {
  const existing = dbGet<TrainingPlan>('training_plans', planId)
  if (!existing) throw new Error('训练计划不存在')
  const updated = { ...existing, ...data }
  dbSet('training_plans', planId, updated)
  return updated
}

/**
 * 删除训练计划
 */
export async function deletePlan(planId: string): Promise<void> {
  dbDelete('training_plans', planId)
}

// ===== 每日训练打卡 =====

/**
 * 完成当天训练
 */
export async function completeDayTraining(planId: string, dayIndex: number): Promise<TrainingPlan> {
  const plan = dbGet<TrainingPlan>('training_plans', planId)
  if (!plan) throw new Error('训练计划不存在')
  if (dayIndex < 0 || dayIndex >= plan.schedule.length) throw new Error('训练日不存在')

  plan.schedule[dayIndex].completed = true
  plan.schedule[dayIndex].completedAt = Date.now()

  // 检查是否所有非休息日都完成
  const allCompleted = plan.schedule.every((d) => d.completed || d.type === 'rest')
  if (allCompleted) {
    plan.status = 'completed'
  }

  dbSet('training_plans', planId, plan)
  return plan
}

/**
 * 获取某天训练状态
 */
export async function getDayStatus(planId: string, dayIndex: number): Promise<TrainingDay | null> {
  const plan = dbGet<TrainingPlan>('training_plans', planId)
  if (!plan) return null
  if (dayIndex < 0 || dayIndex >= plan.schedule.length) return null
  return plan.schedule[dayIndex]
}

// ===== 进度计算 =====

/**
 * 获取训练计划进度
 */
export async function getPlanProgress(planId: string): Promise<{
  totalDays: number
  completedDays: number
  restDays: number
  progress: number
}> {
  const plan = dbGet<TrainingPlan>('training_plans', planId)
  if (!plan) {
    return { totalDays: 0, completedDays: 0, restDays: 0, progress: 0 }
  }

  const totalDays = plan.schedule.length
  const completedDays = plan.schedule.filter((d) => d.completed).length
  const restDays = plan.schedule.filter((d) => d.type === 'rest').length
  const effectiveDays = totalDays - restDays
  const progress = effectiveDays > 0 ? Math.round((completedDays / effectiveDays) * 100) : 0

  return {
    totalDays,
    completedDays,
    restDays,
    progress
  }
}
