import type { Pet } from '@/types/models'

export interface SharePetData {
  userId: string
  pet: Pet
}

// #ifdef APP-HARMONY
export async function startBump(petData: SharePetData): Promise<void> {
  console.log('[Harmony] Starting NFC bump with pet:', petData.pet.name)
  // 鸿蒙 Share Kit 碰一碰实现
  // 实际需要调用 UTS 插件，此处为接口预留
}

export async function onBumpReceive(callback: (data: SharePetData) => void): Promise<void> {
  console.log('[Harmony] Listening for NFC bump...')
  // 注册碰一碰接收回调
}

export function stopBump(): void {
  console.log('[Harmony] Stop NFC bump')
}
// #endif

// #ifndef APP-HARMONY
export function generateShareQRCode(petData: SharePetData): string {
  const jsonStr = JSON.stringify(petData)
  const encoded = encodeURIComponent(jsonStr)
  return `petmeet://share?data=${encoded}`
}

export function parseShareQRCode(qrContent: string): SharePetData | null {
  try {
    const url = new URL(qrContent)
    const data = url.searchParams.get('data')
    if (!data) return null
    return JSON.parse(decodeURIComponent(data))
  } catch {
    return null
  }
}

export async function scanQRCode(): Promise<SharePetData | null> {
  return new Promise((resolve) => {
    uni.scanCode({
      onlyFromCamera: false,
      success: (res: any) => {
        const data = parseShareQRCode(res.result)
        resolve(data)
      },
      fail: () => resolve(null)
    })
  })
}
// #endif

// 模拟交换（开发调试用）
export function mockExchange(): SharePetData {
  return {
    userId: 'mock_user_' + Date.now(),
    pet: {
      petId: 'mock_pet_' + Date.now(),
      userId: 'mock_user_' + Date.now(),
      name: '旺财',
      species: 'dog',
      breed: '金毛寻回犬',
      age: 3,
      gender: 'male',
      personality: ['活泼', '社牛', '贪吃'],
      avatar: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  }
}
