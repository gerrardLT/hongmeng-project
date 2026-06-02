import type { Progress, ProgressStage } from '@/types/models'
import { dbGet, dbSet, dbQuery, generateId } from '@/utils/db'

const PROGRESS_COLLECTION = 'progresses'

/** 制作进度6个阶段的 Mock 数据模板 */
const PROGRESS_STAGES: { stage: ProgressStage; label: string; note: string }[] = [
  {
    stage: 'collected',
    label: '材料采集',
    note: '已采集宠物爪印/毛发/照片等原材料，正在进行初步整理和清洁处理'
  },
  {
    stage: 'design-confirmed',
    label: '设计方案确认',
    note: '设计师已根据您选择的风格完成方案，等待您确认后开始制作'
  },
  {
    stage: 'manufacturing',
    label: '手工制作中',
    note: '匠人正在精心手工制作您的宠物纪念品，每一道工序都用心打磨'
  },
  {
    stage: 'quality-check',
    label: '品质检验',
    note: '制作完成，正在进行严格的品质检验，确保每一个细节完美无瑕'
  },
  {
    stage: 'ready-pickup',
    label: '待取件/配送',
    note: '品质检验通过，已包装完成，可到店取件或等待快递配送'
  },
  {
    stage: 'shipped',
    label: '已发货',
    note: '纪念品已发出，请注意查收。收到后如有任何问题，请随时联系我们'
  }
]

/**
 * 为指定预约生成模拟进度数据
 * @param bookingId 预约 ID
 * @param currentStage 当前阶段索引（0-5）
 * @returns 生成的进度记录列表
 */
function generateMockProgress(bookingId: string, currentStage: number = 2): Progress[] {
  const progresses: Progress[] = []
  const now = Date.now()
  const stageDuration = 3 * 24 * 60 * 60 * 1000 // 每阶段3天

  for (let i = 0; i <= Math.min(currentStage, PROGRESS_STAGES.length - 1); i++) {
    const stageInfo = PROGRESS_STAGES[i]
    const progress: Progress = {
      progressId: generateId(),
      bookingId,
      stage: stageInfo.stage,
      status: i < currentStage ? 'completed' : 'in-progress',
      updateTime: now - (currentStage - i) * stageDuration,
      note: stageInfo.note,
      photos: i < currentStage ? [`/static/progress/step_${i + 1}.jpg`] : [],
      estimatedCompletionTime: i === currentStage
        ? now + stageDuration
        : undefined
    }
    progresses.push(progress)
  }

  return progresses
}

/**
 * 获取某预约的进度
 * @param bookingId 预约 ID
 * @returns 该预约的进度列表（按时间升序）
 */
export function getProgressByBookingId(bookingId: string): Progress[] {
  let progresses = dbQuery<Progress>(PROGRESS_COLLECTION, (p) => p.bookingId === bookingId)
    .sort((a, b) => a.updateTime - b.updateTime)

  // 如果没有进度数据，自动生成 Mock 数据
  if (progresses.length === 0) {
    const booking = dbGet<{ bookingId: string; status: string }>('bookings', bookingId)
    if (booking) {
      const currentStage = booking.status === 'completed' ? 5 : 2
      progresses = generateMockProgress(bookingId, currentStage)
      progresses.forEach((p) => {
        dbSet(PROGRESS_COLLECTION, p.progressId, p)
      })
    }
  }

  return progresses
}

/**
 * 获取用户所有制作进度
 * @param userId 用户 ID
 * @returns 进度列表
 */
export function getProgressList(userId: string): Progress[] {
  const bookings = dbQuery<{ bookingId: string; userId: string }>('bookings', (b) => (b as any).userId === userId)

  const allProgresses: Progress[] = []
  for (const booking of bookings) {
    const progresses = getProgressByBookingId((booking as any).bookingId)
    allProgresses.push(...progresses)
  }

  return allProgresses.sort((a, b) => b.updateTime - a.updateTime)
}

/**
 * 更新进度
 * @param progressId 进度 ID
 * @param stage 当前阶段
 * @param note 备注信息
 * @returns 更新后的进度或 null
 */
export function updateProgress(progressId: string, stage: ProgressStage, note?: string): Progress | null {
  const existing = dbGet<Progress>(PROGRESS_COLLECTION, progressId)
  if (!existing) return null

  const updated: Progress = {
    ...existing,
    stage,
    note: note || existing.note,
    updateTime: Date.now()
  }

  dbSet(PROGRESS_COLLECTION, progressId, updated)
  return updated
}

/**
 * 获取进度阶段标签
 * @param stage 进度阶段
 * @returns 阶段标签
 */
export function getStageLabel(stage: ProgressStage): string {
  const stageInfo = PROGRESS_STAGES.find((s) => s.stage === stage)
  return stageInfo?.label || '未知阶段'
}
