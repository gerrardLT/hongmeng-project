import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Tag } from '@/types/models'
import { dbGetAll, dbSet, dbDelete, generateId } from '@/utils/db'
import { useUserStore } from './user'

const COLLECTION = 'tags'

export const useTagStore = defineStore('tag', () => {
  // state
  const tags = ref<Tag[]>([])

  // getters
  /** 按使用次数降序排列的标签 */
  const sortedTags = computed(() => {
    return [...tags.value].sort((a, b) => b.count - a.count)
  })

  /** 所有标签名数组 */
  const tagNames = computed(() => tags.value.map(t => t.name))

  // actions
  /**
   * 添加标签，如已存在则使用次数 +1
   * @param name 标签名称
   */
  function addTag(name: string) {
    const existing = tags.value.find(t => t.name === name)
    if (existing) {
      existing.count += 1
      dbSet(COLLECTION, existing.tagId, existing)
      return
    }
    const userStore = useUserStore()
    const newTag: Tag = {
      tagId: generateId(),
      userId: userStore.userId || '',
      name,
      count: 1,
      createdAt: Date.now()
    }
    tags.value.push(newTag)
    dbSet(COLLECTION, newTag.tagId, newTag)
  }

  /**
   * 删除标签
   * @param tagId 标签 ID
   */
  function removeTag(tagId: string) {
    const index = tags.value.findIndex(t => t.tagId === tagId)
    if (index !== -1) {
      tags.value.splice(index, 1)
    }
    dbDelete(COLLECTION, tagId)
  }

  /**
   * 增加标签使用次数
   * @param name 标签名称
   */
  function incrementTagCount(name: string) {
    const tag = tags.value.find(t => t.name === name)
    if (!tag) {
      addTag(name)
      return
    }
    tag.count += 1
    dbSet(COLLECTION, tag.tagId, tag)
  }

  /**
   * 减少标签使用次数，若减至 0 则删除该标签
   * @param name 标签名称
   */
  function decrementTagCount(name: string) {
    const tag = tags.value.find(t => t.name === name)
    if (!tag) return
    tag.count -= 1
    if (tag.count <= 0) {
      removeTag(tag.tagId)
    } else {
      dbSet(COLLECTION, tag.tagId, tag)
    }
  }

  /**
   * 从本地存储初始化恢复标签数据
   */
  function init() {
    try {
      const all = dbGetAll<Tag>(COLLECTION)
      tags.value = all.sort((a, b) => b.count - a.count)
    } catch (e) {
      console.error('init tags error:', e)
    }
  }

  return {
    tags,
    sortedTags,
    tagNames,
    addTag,
    removeTag,
    incrementTagCount,
    decrementTagCount,
    init
  }
})
