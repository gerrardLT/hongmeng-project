import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, UserTask, TaskType } from '@/types/models'

const STORAGE_KEY = 'petmeet_user'

interface UserStorageState {
  userInfo: UserInfo | null
  token: string
  isLoggedIn: boolean
  isPrivacyAgreed: boolean
  guideTasks: UserTask[]
}

export const useUserStore = defineStore('user', () => {
  // state
  const userInfo = ref<UserInfo | null>(null)
  const token = ref('')
  const isLoggedIn = ref(false)
  const isPrivacyAgreed = ref(false)
  const guideTasks = ref<UserTask[]>([])

  // getters
  const isGuideCompleted = computed(() => {
    if (guideTasks.value.length === 0) return false
    return guideTasks.value.every((task) => task.isCompleted)
  })

  // 持久化到本地存储
  function persist() {
    const state: UserStorageState = {
      userInfo: userInfo.value,
      token: token.value,
      isLoggedIn: isLoggedIn.value,
      isPrivacyAgreed: isPrivacyAgreed.value,
      guideTasks: guideTasks.value
    }
    try {
      uni.setStorageSync(STORAGE_KEY, state)
    } catch (e) {
      console.error('persist user state error:', e)
    }
  }

  // actions
  function login(user: UserInfo, tok: string) {
    userInfo.value = user
    token.value = tok
    isLoggedIn.value = true
    uni.setStorageSync('token', tok)
    persist()
  }

  function logout() {
    userInfo.value = null
    token.value = ''
    isLoggedIn.value = false
    guideTasks.value = []
    try {
      uni.removeStorageSync(STORAGE_KEY)
      uni.removeStorageSync('token')
    } catch (e) {
      console.error('logout error:', e)
    }
  }

  function checkLoginStatus() {
    try {
      const state = uni.getStorageSync(STORAGE_KEY) as UserStorageState | undefined
      if (state && state.isLoggedIn && state.token) {
        userInfo.value = state.userInfo
        token.value = state.token
        isLoggedIn.value = true
        isPrivacyAgreed.value = state.isPrivacyAgreed || false
        guideTasks.value = state.guideTasks || []
      }
    } catch (e) {
      console.error('checkLoginStatus error:', e)
    }
  }

  function agreePrivacy() {
    isPrivacyAgreed.value = true
    persist()
  }

  function updateGuideTask(taskType: TaskType, completed: boolean) {
    const task = guideTasks.value.find((t) => t.taskType === taskType)
    if (task) {
      task.isCompleted = completed
      if (completed) {
        task.completedAt = Date.now()
      } else {
        task.completedAt = undefined
      }
      persist()
    }
  }

  function initGuideTasks() {
    const userId = userInfo.value?.userId || ''
    const now = Date.now()
    guideTasks.value = [
      { taskId: `task_profile_${now}`, userId, taskType: 'complete_profile', isCompleted: false },
      { taskId: `task_diary_${now}`, userId, taskType: 'first_diary', isCompleted: false },
      { taskId: `task_bump_${now}`, userId, taskType: 'first_bump', isCompleted: false }
    ]
    persist()
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    isPrivacyAgreed,
    guideTasks,
    isGuideCompleted,
    login,
    logout,
    checkLoginStatus,
    agreePrivacy,
    updateGuideTask,
    initGuideTasks
  }
})
