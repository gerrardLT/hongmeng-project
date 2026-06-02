/**
 * MamaTrack 家人共享状态管理
 * 管理家人共享列表和邀请码
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FamilyShare } from '@/types/models'
import { generateId } from '@/utils/db'

const STORAGE_KEY = 'mamatrack_family'

export const useFamilyStore = defineStore('family', () => {
  // state
  const shares = ref<FamilyShare[]>([])
  const myInviteCode = ref('')

  // getters
  const activeShares = computed(() => {
    return shares.value.filter((s) => s.status === 'active')
  })

  // actions
  function addShare(data: Omit<FamilyShare, 'shareId' | 'createdAt'>) {
    const share: FamilyShare = {
      ...data,
      shareId: generateId(),
      createdAt: Date.now()
    }
    shares.value.push(share)
    persist()
    return share
  }

  function removeShare(shareId: string) {
    shares.value = shares.value.filter((s) => s.shareId !== shareId)
    persist()
  }

  function generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    myInviteCode.value = code
    persist()
    return code
  }

  function persist() {
    try {
      uni.setStorageSync(STORAGE_KEY, {
        shares: shares.value,
        myInviteCode: myInviteCode.value
      })
    } catch (e) {
      console.error('[family store] persist error:', e)
    }
  }

  function init() {
    try {
      const stored = uni.getStorageSync(STORAGE_KEY) as {
        shares?: FamilyShare[]
        myInviteCode?: string
      } | undefined
      if (stored) {
        if (stored.shares) shares.value = stored.shares
        if (stored.myInviteCode) myInviteCode.value = stored.myInviteCode
      }
    } catch (e) {
      console.error('[family store] init error:', e)
    }
  }

  return {
    shares,
    myInviteCode,
    activeShares,
    addShare,
    removeShare,
    generateInviteCode,
    init,
    persist
  }
})
