import type { Progress, ProgressStage } from '@/types/models'
import { dbGet, dbSet, dbQuery, generateId } from '@/utils/db'

const PROGRESS_COLLECTION = 'progresses'

/** 制作进度7个阶段的模板 */
const PROGRESS_STAGES: { stage: ProgressStage; label: string; note: string }[] = [
  {
    stage: 'design-confirmed',
    label: '设计方案确认',
    note: '篆刻师已确认设计方案，包括印面文字、字体风格、布局排版等细节，待您审核确认后开始制作'
  },
  {
    stage: 'material-prepared',
    label: '石料备选',
    note: '已根据您选择的材质准备相应石料，经过严格筛选确保无裂无砂，纹理色泽俱佳'
  },
  {
    stage: 'carving',
    label: '刻制中',
    note: '篆刻师正在精心刻制您的印章，每一刀都经过深思熟虑，力求笔意刀韵完美呈现'
  },
  {
    stage: 'polishing',
    label: '修整打磨',
    note: '印面刻制完成，正在进行精细修整和打磨，确保印面平整、线条流畅、边角圆润'
  },
  {
    stage: 'quality-check',
    label: '品质检验',
    note: '正在对印章进行全面品质检验，包括印面清晰度、试盖效果、石料完整性等多项指标'
  },
  {
    stage: 'ready-pickup',
    label: '待取件/配送',
    note: '品质检验通过，印章已配印泥、锦盒，可到店取件或等待快递配送'
  },
  {
    stage: 'shipped',
    label: '已发货',
    note: '印章已发出，请注意查收。收到后如有任何问题，请随时联系工作室'
  }
]

/** 阶段标签映射 */
const STAGE_LABELS: Record<ProgressStage, string> = {
  'design-confirmed': '设计方案确认',
  'material-prepared': '石料备选',
  'carving': '刻制中',
  'polishing': '修整打磨',
  'quality-check': '品质检验',
  'ready-pickup': '待取件/配送',
  'shipped': '已发货'
}

/**
 * 为指定预约初始化制作进度（创建 7 个阶段）
 * @param bookingId 预约 ID
 * @returns 生成的进度记录列表
 */
export function initProgress(bookingId: string): Progress[] {
  const progresses: Progress[] = []
  const now = Date.now()

  for (let i = 0; i < PROGRESS_STAGES.length; i++) {
    const stageInfo = PROGRESS_STAGES[i]
    const progress: Progress = {
      progressId: generateId(),
      bookingId,
      stage: stageInfo.stage,
      status: i === 0 ? 'active' : 'pending',
      updateTime: now,
      note: stageInfo.note,
      photos: [],
      estimatedCompletionTime: i === 0
        ? now + 3 * 24 * 60 * 60 * 1000
        : undefined
    }
    progresses.push(progress)
    dbSet(PROGRESS_COLLECTION, progress.progressId, progress)
  }

  return progresses
}

/**
 * 获取预约的制作进度
 * @param bookingId 预约 ID
 * @returns 该预约的进度列表（按阶段顺序）
 */
export function getProgressByBooking(bookingId: string): Progress[] {
  let progresses = dbQuery<Progress>(PROGRESS_COLLECTION, (p) => p.bookingId === bookingId)

  // 按阶段顺序排序
  const stageOrder = PROGRESS_STAGES.map((s) => s.stage)
  progresses.sort((a, b) => stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage))

  // 如果没有进度数据，自动初始化
  if (progresses.length === 0) {
    const booking = dbGet<{ bookingId: string; status: string }>('bookings', bookingId)
    if (booking) {
      progresses = initProgress(bookingId)
    }
  }

  return progresses
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
 * 获取用户所有订单进度
 * @param userId 用户 ID
 * @returns 进度列表
 */
export function getAllProgress(userId: string): Progress[] {
  const bookings = dbQuery<{ bookingId: string; userId: string }>('bookings', (b) => (b as any).userId === userId)

  const allProgresses: Progress[] = []
  for (const booking of bookings) {
    const progresses = getProgressByBooking((booking as any).bookingId)
    allProgresses.push(...progresses)
  }

  return allProgresses.sort((a, b) => b.updateTime - a.updateTime)
}

/**
 * 获取进度阶段标签
 * @param stage 进度阶段
 * @returns 阶段标签
 */
export function getStageLabel(stage: ProgressStage): string {
  return STAGE_LABELS[stage] || '未知阶段'
}
