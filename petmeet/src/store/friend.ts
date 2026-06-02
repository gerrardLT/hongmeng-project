import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Friendship } from '@/types/models'
import * as friendService from '@/services/friend'

export const useFriendStore = defineStore('friend', () => {
  const friends = ref<Friendship[]>([])
  const friendCount = computed(() => friends.value.filter(f => f.status === 'active').length)
  const activeFriends = computed(() =>
    friends.value
      .filter(f => f.status === 'active')
      .sort((a, b) => b.createdAt - a.createdAt)
  )

  function loadFriends() {
    const userId = uni.getStorageSync('petmeet_user')?.userInfo?.userId || 'default_user'
    friends.value = friendService.getFriendsByUserId(userId)
  }

  function addFriend(friendUserId: string, friendPet: any, meetLocation?: string) {
    const userId = uni.getStorageSync('petmeet_user')?.userInfo?.userId || 'default_user'
    const friendship = friendService.addFriend(userId, friendUserId, friendPet, meetLocation)
    friends.value.unshift(friendship)
    return friendship
  }

  function updateFriend(friendshipId: string, data: Partial<Friendship>) {
    const idx = friends.value.findIndex(f => f.friendshipId === friendshipId)
    if (idx >= 0) {
      const updated = { ...friends.value[idx], ...data }
      if (data.remark !== undefined) {
        friendService.updateFriendRemark(friendshipId, data.remark)
      }
      friends.value[idx] = updated
    }
  }

  function removeFriend(friendshipId: string) {
    friendService.deleteFriend(friendshipId)
    friends.value = friends.value.filter(f => f.friendshipId !== friendshipId)
  }

  function blockFriend(friendshipId: string) {
    friendService.blockFriend(friendshipId)
    const idx = friends.value.findIndex(f => f.friendshipId === friendshipId)
    if (idx >= 0) friends.value[idx].status = 'blocked'
  }

  function getFriendByUserId(userId: string) {
    return friends.value.find(f => f.friendUserId === userId && f.status === 'active')
  }

  return {
    friends,
    friendCount,
    activeFriends,
    loadFriends,
    addFriend,
    updateFriend,
    removeFriend,
    blockFriend,
    getFriendByUserId
  }
})
