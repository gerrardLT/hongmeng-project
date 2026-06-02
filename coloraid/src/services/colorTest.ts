import type { IshiharaPlate, TestResult, ColorBlindType, FilterMode } from '@/types/models'
import { generateId } from '@/utils/db'

/**
 * 石原图版测试题库（5 题简化版）
 * 每题对应不同的色盲检测目标
 */
const TEST_PLATES: IshiharaPlate[] = [
  {
    plateId: 'plate_1',
    imageUrl: '/static/images/ishihara/plate_1.png',
    correctAnswer: '12',
    options: ['12', '3', '5', '无法辨认'],
    targetType: ['normal']
  },
  {
    plateId: 'plate_2',
    imageUrl: '/static/images/ishihara/plate_2.png',
    correctAnswer: '8',
    options: ['8', '3', '6', '无法辨认'],
    targetType: ['protanopia', 'deuteranopia']
  },
  {
    plateId: 'plate_3',
    imageUrl: '/static/images/ishihara/plate_3.png',
    correctAnswer: '29',
    options: ['29', '70', '15', '无法辨认'],
    targetType: ['protanopia', 'deuteranopia']
  },
  {
    plateId: 'plate_4',
    imageUrl: '/static/images/ishihara/plate_4.png',
    correctAnswer: '5',
    options: ['5', '2', '3', '无法辨认'],
    targetType: ['tritanopia']
  },
  {
    plateId: 'plate_5',
    imageUrl: '/static/images/ishihara/plate_5.png',
    correctAnswer: '45',
    options: ['45', '73', '18', '无法辨认'],
    targetType: ['tritanopia']
  }
]

/**
 * 获取石原图版测试题列表
 * @returns 5 张测试题
 */
export function getTestPlates(): IshiharaPlate[] {
  return TEST_PLATES.map((plate) => ({ ...plate }))
}

/**
 * 根据答题结果判定色盲类型
 * @param answers 每题的答题结果 { plateId, selected }
 * @returns 测试结果
 */
export function evaluateTest(
  answers: { plateId: string; selected: string }[]
): TestResult {
  const gradedAnswers = answers.map((ans) => {
    const plate = TEST_PLATES.find((p) => p.plateId === ans.plateId)
    const correct = plate ? ans.selected === plate.correctAnswer : false
    return {
      plateId: ans.plateId,
      selected: ans.selected,
      correct
    }
  })

  // 统计各类型错题数
  let protanopiaWrong = 0
  let deuteranopiaWrong = 0
  let tritanopiaWrong = 0
  let normalWrong = 0

  gradedAnswers.forEach((ans) => {
    if (ans.correct) return
    const plate = TEST_PLATES.find((p) => p.plateId === ans.plateId)
    if (!plate) return

    if (plate.targetType.includes('normal')) {
      normalWrong++
    }
    if (plate.targetType.includes('protanopia')) {
      protanopiaWrong++
    }
    if (plate.targetType.includes('deuteranopia')) {
      deuteranopiaWrong++
    }
    if (plate.targetType.includes('tritanopia')) {
      tritanopiaWrong++
    }
  })

  const totalWrong = gradedAnswers.filter((a) => !a.correct).length
  const total = TEST_PLATES.length

  // 判定逻辑
  let colorBlindType: ColorBlindType = 'normal'
  let confidence = 0

  const redGreenWrong = protanopiaWrong + deuteranopiaWrong
  const blueYellowWrong = tritanopiaWrong

  if (totalWrong === 0) {
    colorBlindType = 'normal'
    confidence = 1.0
  } else if (redGreenWrong > blueYellowWrong && redGreenWrong >= 2) {
    // 红绿色盲（无法区分 protanopia / deuteranopia，统一归类）
    colorBlindType = 'deuteranopia'
    confidence = Math.min(0.95, redGreenWrong / 3)
  } else if (blueYellowWrong > redGreenWrong && blueYellowWrong >= 1) {
    colorBlindType = 'tritanopia'
    confidence = Math.min(0.95, blueYellowWrong / 2)
  } else if (totalWrong >= 3) {
    colorBlindType = 'achromatopsia'
    confidence = Math.min(0.9, totalWrong / total)
  } else {
    // 偶发错误，可能仍属正常
    colorBlindType = 'normal'
    confidence = 1.0 - totalWrong / total
  }

  const recommendedFilter = getRecommendedFilter(colorBlindType)

  return {
    resultId: generateId(),
    answers: gradedAnswers,
    colorBlindType,
    recommendedFilter,
    confidence: Math.round(confidence * 100) / 100,
    testedAt: Date.now()
  }
}

/**
 * 根据色盲类型推荐滤镜模式
 * @param type 色盲类型
 * @returns 推荐的滤镜模式或 null
 */
export function getRecommendedFilter(type: ColorBlindType): FilterMode | null {
  switch (type) {
    case 'protanopia':
      return 'protanopia'
    case 'deuteranopia':
      return 'deuteranopia'
    case 'tritanopia':
      return 'tritanopia'
    case 'achromatopsia':
      return 'achromatopsia'
    case 'normal':
    default:
      return null
  }
}
