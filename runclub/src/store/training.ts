import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TrainingPlan, TrainingDay } from '@/types/models'
import { dbGetAll, dbGet, dbSet, dbDelete, generateId } from '@/utils/db'
import { formatDate } from '@/utils/format'

export const useTrainingStore = defineStore('training', () => {
  // state
  const plans = ref<TrainingPlan[]>([])
  const currentPlan = ref<TrainingPlan | null>(null)

  // getters
  const activePlan = computed(() =>
    plans.value.find((p) => p.status === 'active') || null
  )

  const todayTraining = computed<TrainingDay | null>(() => {
    const plan = activePlan.value
    if (!plan) return null
    const startDate = new Date(plan.startDate)
    const today = new Date()
    const diffDays = Math.floor((today.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
    if (diffDays < 0 || diffDays >= plan.schedule.length) return null
    return plan.schedule[diffDays]
  })

  const planProgress = computed(() => {
    const plan = activePlan.value
    if (!plan || plan.schedule.length === 0) return 0
    const completed = plan.schedule.filter((d) => d.completed).length
    return Math.round((completed / plan.schedule.length) * 100)
  })

  // actions
  async function loadPlans() {
    plans.value = dbGetAll<TrainingPlan>('training_plans')
  }

  async function createPlan(data: Omit<TrainingPlan, 'planId'>) {
    const plan: TrainingPlan = {
      ...data,
      planId: generateId()
    }
    dbSet('training_plans', plan.planId, plan)
    plans.value.push(plan)
    return plan
  }

  async function updatePlan(planId: string, data: Partial<TrainingPlan>) {
    const existing = dbGet<TrainingPlan>('training_plans', planId)
    if (!existing) throw new Error('训练计划不存在')
    const updated = { ...existing, ...data }
    dbSet('training_plans', planId, updated)
    const index = plans.value.findIndex((p) => p.planId === planId)
    if (index >= 0) plans.value[index] = updated
    if (currentPlan.value?.planId === planId) {
      currentPlan.value = updated
    }
    return updated
  }

  async function completeDayTraining(planId: string, dayIndex: number) {
    const plan = dbGet<TrainingPlan>('training_plans', planId)
    if (!plan) throw new Error('训练计划不存在')
    if (dayIndex < 0 || dayIndex >= plan.schedule.length) throw new Error('训练日不存在')

    plan.schedule[dayIndex].completed = true
    plan.schedule[dayIndex].completedAt = Date.now()

    // 检查是否所有训练都完成
    const allCompleted = plan.schedule.every((d) => d.completed || d.type === 'rest')
    if (allCompleted) {
      plan.status = 'completed'
    }

    dbSet('training_plans', planId, plan)
    const index = plans.value.findIndex((p) => p.planId === planId)
    if (index >= 0) plans.value[index] = { ...plan }
    if (currentPlan.value?.planId === planId) {
      currentPlan.value = { ...plan }
    }
  }

  async function deletePlan(planId: string) {
    dbDelete('training_plans', planId)
    plans.value = plans.value.filter((p) => p.planId !== planId)
    if (currentPlan.value?.planId === planId) {
      currentPlan.value = null
    }
  }

  return {
    plans,
    currentPlan,
    activePlan,
    todayTraining,
    planProgress,
    loadPlans,
    createPlan,
    updatePlan,
    completeDayTraining,
    deletePlan
  }
})
