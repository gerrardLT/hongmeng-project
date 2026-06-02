import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Activity, Registration, CheckIn, Result, ActivityStatus } from '@/types/models'
import { dbGetAll, dbGet, dbSet, dbDelete, dbQuery, generateId } from '@/utils/db'

export const useActivityStore = defineStore('activity', () => {
  // state
  const activities = ref<Activity[]>([])
  const currentActivity = ref<Activity | null>(null)
  const registrations = ref<Registration[]>([])
  const checkIns = ref<CheckIn[]>([])
  const results = ref<Result[]>([])

  // getters
  const upcomingActivities = computed(() =>
    activities.value.filter((a) => a.status === 'upcoming').sort((a, b) => b.createdAt - a.createdAt)
  )

  const ongoingActivities = computed(() =>
    activities.value.filter((a) => a.status === 'ongoing').sort((a, b) => b.createdAt - a.createdAt)
  )

  const completedActivities = computed(() =>
    activities.value.filter((a) => a.status === 'completed').sort((a, b) => b.createdAt - a.createdAt)
  )

  // actions
  async function loadActivities() {
    activities.value = dbGetAll<Activity>('activities')
      .sort((a, b) => b.createdAt - a.createdAt)
  }

  async function createActivity(data: Omit<Activity, 'activityId' | 'createdAt' | 'status'>) {
    const activity: Activity = {
      ...data,
      activityId: generateId(),
      status: 'upcoming',
      createdAt: Date.now()
    }
    dbSet('activities', activity.activityId, activity)
    activities.value.unshift(activity)
    return activity
  }

  async function updateActivity(activityId: string, data: Partial<Activity>) {
    const existing = dbGet<Activity>('activities', activityId)
    if (!existing) throw new Error('活动不存在')
    const updated = { ...existing, ...data }
    dbSet('activities', activityId, updated)
    const index = activities.value.findIndex((a) => a.activityId === activityId)
    if (index >= 0) activities.value[index] = updated
    if (currentActivity.value?.activityId === activityId) {
      currentActivity.value = updated
    }
    return updated
  }

  async function cancelActivity(activityId: string) {
    return updateActivity(activityId, { status: 'cancelled' as ActivityStatus })
  }

  async function register(activityId: string, userId: string, nickname: string, note: string) {
    const registration: Registration = {
      registrationId: generateId(),
      activityId,
      userId,
      nickname,
      note,
      registeredAt: Date.now()
    }
    dbSet('registrations', registration.registrationId, registration)
    registrations.value.push(registration)
    return registration
  }

  async function cancelRegistration(registrationId: string) {
    dbDelete('registrations', registrationId)
    registrations.value = registrations.value.filter((r) => r.registrationId !== registrationId)
  }

  async function checkIn(activityId: string, userId: string, nickname: string, location?: { name: string; latitude: number; longitude: number }, isManual = false) {
    const checkInData: CheckIn = {
      checkInId: generateId(),
      activityId,
      userId,
      nickname,
      checkInTime: Date.now(),
      checkInLocation: location,
      isManual
    }
    dbSet('checkins', checkInData.checkInId, checkInData)
    checkIns.value.push(checkInData)
    return checkInData
  }

  async function addResult(activityId: string, userId: string, nickname: string, finishTime: string, pace: string, source: 'manual' | 'health') {
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
    results.value.push(result)
    return result
  }

  async function loadActivityDetail(activityId: string) {
    currentActivity.value = dbGet<Activity>('activities', activityId)
    registrations.value = dbQuery<Registration>('registrations', (r) => r.activityId === activityId)
    checkIns.value = dbQuery<CheckIn>('checkins', (c) => c.activityId === activityId)
    results.value = dbQuery<Result>('results', (r) => r.activityId === activityId)
  }

  return {
    activities,
    currentActivity,
    registrations,
    checkIns,
    results,
    upcomingActivities,
    ongoingActivities,
    completedActivities,
    loadActivities,
    createActivity,
    updateActivity,
    cancelActivity,
    register,
    cancelRegistration,
    checkIn,
    addResult,
    loadActivityDetail
  }
})
