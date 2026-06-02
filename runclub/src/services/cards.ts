import type { RunnerCard } from '@/types/models'
import { dbGetAll, dbGet, dbSet, dbQuery, generateId } from '@/utils/db'

/**
 * 创建跑友名片
 */
export async function createCard(data: Omit<RunnerCard, 'cardId' | 'createdAt'>): Promise<RunnerCard> {
  const card: RunnerCard = {
    ...data,
    cardId: generateId(),
    createdAt: Date.now()
  }
  dbSet('runner_cards', card.cardId, card)
  return card
}

/**
 * 获取我的名片
 */
export async function getMyCard(userId: string): Promise<RunnerCard | null> {
  const cards = dbQuery<RunnerCard>('runner_cards', (c) => c.userId === userId)
  return cards.length > 0 ? cards[0] : null
}

/**
 * 更新名片
 */
export async function updateCard(cardId: string, data: Partial<RunnerCard>): Promise<RunnerCard> {
  const existing = dbGet<RunnerCard>('runner_cards', cardId)
  if (!existing) throw new Error('名片不存在')
  const updated = { ...existing, ...data }
  dbSet('runner_cards', cardId, updated)
  return updated
}

// ===== 碰一碰交换 =====

interface FriendRecord {
  friendId: string
  userId: string
  friendUserId: string
  cardId: string
  remark: string
  addedAt: number
}

// #ifdef APP-HARMONY
/**
 * 鸿蒙端：NFC碰一碰交换名片
 */
export async function exchangeCard(myCard: RunnerCard): Promise<RunnerCard | null> {
  // 通过 NFC 发送和接收名片数据
  return new Promise((resolve) => {
    try {
      // @ts-ignore 鸿蒙 NFC API
      if (typeof nfc !== 'undefined') {
        console.log('[cards] NFC exchange initiated')
        // 实际 NFC 交换逻辑
        resolve(null)
      } else {
        console.warn('[cards] NFC not available')
        resolve(null)
      }
    } catch (e) {
      console.error('[cards] NFC exchange error:', e)
      resolve(null)
    }
  })
}
// #endif

// #ifndef APP-HARMONY
/**
 * 非鸿蒙端：碰一碰交换降级实现
 */
export async function exchangeCard(myCard: RunnerCard): Promise<RunnerCard | null> {
  console.log('[cards] NFC exchange not supported on this platform')
  return null
}
// #endif

/**
 * 获取跑友列表
 */
export async function getFriends(userId: string): Promise<FriendRecord[]> {
  return dbQuery<FriendRecord>('friends', (f) => f.userId === userId)
    .sort((a, b) => b.addedAt - a.addedAt)
}

/**
 * 添加跑友备注
 */
export async function addFriendRemark(friendId: string, remark: string): Promise<void> {
  const friend = dbGet<FriendRecord>('friends', friendId)
  if (!friend) throw new Error('跑友不存在')
  friend.remark = remark
  dbSet('friends', friendId, friend)
}

/**
 * 获取跑友列表（跑友录）
 */
export async function getFriendList(userId: string): Promise<RunnerCard[]> {
  const friends = await getFriends(userId)
  const cards: RunnerCard[] = []
  for (const friend of friends) {
    const card = dbGet<RunnerCard>('runner_cards', friend.cardId)
    if (card) cards.push(card)
  }
  return cards
}

/**
 * 获取跑友名片详情
 */
export async function getFriendCard(cardId: string): Promise<RunnerCard | null> {
  return dbGet<RunnerCard>('runner_cards', cardId)
}
