import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RunningClub, RankingType } from '@/types/models'
import { dbGet, dbSet, dbGetAll } from '@/utils/db'

interface RankingItem {
  userId: string
  nickname: string
  avatar: string
  value: number
}

interface MonthlyStats {
  totalDistance: number
  totalActivities: number
  totalParticipants: number
  avgPace: string
}

export const useClubStore = defineStore('club', () => {
  // state
  const club = ref<RunningClub | null>(null)
  const members = ref<string[]>([])
  const rankings = ref<Record<RankingType, RankingItem[]>>({
    monthly_distance: [],
    participation: [],
    avg_pace: [],
    total_distance: []
  })

  // getters
  const memberCount = computed(() => members.value.length)

  const monthlyStats = computed<MonthlyStats>(() => {
    return {
      totalDistance: 0,
      totalActivities: 0,
      totalParticipants: 0,
      avgPace: '--'
    }
  })

  // actions
  async function loadClub() {
    const clubs = dbGetAll<RunningClub>('clubs')
    if (clubs.length > 0) {
      club.value = clubs[0]
      members.value = clubs[0].members || []
    }
  }

  async function createClub(name: string, description: string, ownerId: string) {
    const newClub: RunningClub = {
      clubId: `club_${Date.now().toString(36)}`,
      name,
      description,
      ownerId,
      members: [ownerId],
      createdAt: Date.now()
    }
    dbSet('clubs', newClub.clubId, newClub)
    club.value = newClub
    members.value = newClub.members
    return newClub
  }

  async function addMember(userId: string) {
    if (!club.value) throw new Error('跑团不存在')
    if (members.value.includes(userId)) return
    members.value.push(userId)
    const updated = { ...club.value, members: [...members.value] }
    dbSet('clubs', club.value.clubId, updated)
    club.value = updated
  }

  async function removeMember(userId: string) {
    if (!club.value) throw new Error('跑团不存在')
    members.value = members.value.filter((m) => m !== userId)
    const updated = { ...club.value, members: [...members.value] }
    dbSet('clubs', club.value.clubId, updated)
    club.value = updated
  }

  async function loadRankings(type: RankingType) {
    // 从本地存储计算排名数据
    const rankingData = dbGet<RankingItem[]>('rankings', type)
    if (rankingData) {
      rankings.value[type] = rankingData
    }
  }

  return {
    club,
    members,
    rankings,
    memberCount,
    monthlyStats,
    loadClub,
    createClub,
    addMember,
    removeMember,
    loadRankings
  }
})
