import { BMI_GAIN_STANDARDS, type BMICategory, type GainStatus } from '@/types/models'

/**
 * 计算 BMI
 * @param height 身高(cm)
 * @param weight 体重(kg)
 */
export function calculateBMI(height: number, weight: number): number {
  try {
    const h = height / 100
    if (h <= 0) return 0
    return parseFloat((weight / (h * h)).toFixed(1))
  } catch (e) {
    console.error('calculateBMI error:', e)
    return 0
  }
}

/**
 * 根据 BMI 获取分类
 */
export function getBMICategory(bmi: number): BMICategory {
  if (bmi < 18.5) return 'underweight'
  if (bmi < 25) return 'normal'
  if (bmi < 30) return 'overweight'
  return 'obese'
}

/**
 * 获取推荐总增重范围
 */
export function getRecommendedGainRange(bmiCategory: BMICategory): { min: number; max: number } {
  const std = BMI_GAIN_STANDARDS[bmiCategory]
  return { min: std.min, max: std.max }
}

/**
 * 获取每周推荐增重范围
 */
export function getWeeklyGainRange(bmiCategory: BMICategory): { min: number; max: number } {
  const std = BMI_GAIN_STANDARDS[bmiCategory]
  return { min: std.weeklyMin, max: std.weeklyMax }
}

/**
 * 根据预产期计算当前孕周
 * 预产期 = 末次月经 + 280天
 * 当前天数 = 280 - (预产期 - 今天)
 */
export function calculateCurrentWeek(dueDate: string): { week: number; day: number } {
  try {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const due = new Date(dueDate)
    due.setHours(0, 0, 0, 0)

    const daysUntilDue = Math.round((due.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
    const currentDays = 280 - daysUntilDue

    const week = Math.max(0, Math.floor(currentDays / 7))
    const day = Math.max(0, currentDays % 7)
    return { week, day }
  } catch (e) {
    console.error('calculateCurrentWeek error:', e)
    return { week: 0, day: 0 }
  }
}

/**
 * 计算指定日期对应的孕周
 */
export function calculateWeekForDate(date: string, dueDate: string): { week: number; day: number } {
  try {
    const target = new Date(date)
    target.setHours(0, 0, 0, 0)
    const due = new Date(dueDate)
    due.setHours(0, 0, 0, 0)

    const daysUntilDue = Math.round((due.getTime() - target.getTime()) / (24 * 60 * 60 * 1000))
    const currentDays = 280 - daysUntilDue

    const week = Math.max(0, Math.floor(currentDays / 7))
    const day = Math.max(0, currentDays % 7)
    return { week, day }
  } catch (e) {
    console.error('calculateWeekForDate error:', e)
    return { week: 0, day: 0 }
  }
}

/**
 * 计算指定孕周的标准增重范围
 * 前12周增重约总量10-15%，之后线性增长
 */
function getExpectedGainAtWeek(
  week: number,
  bmiCategory: BMICategory
): { min: number; max: number } {
  const { min: totalMin, max: totalMax } = BMI_GAIN_STANDARDS[bmiCategory]

  if (week <= 0) return { min: 0, max: 0 }
  if (week >= 40) return { min: totalMin, max: totalMax }

  if (week <= 12) {
    const progress = week / 12
    return {
      min: totalMin * 0.10 * progress,
      max: totalMax * 0.15 * progress
    }
  }

  const baseMin = totalMin * 0.10
  const baseMax = totalMax * 0.15
  const remainingMin = totalMin - baseMin
  const remainingMax = totalMax - baseMax
  const progress = (week - 12) / 28

  return {
    min: baseMin + remainingMin * progress,
    max: baseMax + remainingMax * progress
  }
}

/**
 * 评估当前增重状态
 */
export function evaluateGainStatus(
  currentGain: number,
  currentWeek: number,
  bmiCategory: BMICategory
): GainStatus {
  try {
    const expected = getExpectedGainAtWeek(currentWeek, bmiCategory)

    if (currentGain < expected.min) return 'low'
    if (currentGain > expected.max) return 'high'
    return 'normal'
  } catch (e) {
    console.error('evaluateGainStatus error:', e)
    return 'normal'
  }
}

/**
 * 生成 0-40 周标准增重曲线
 */
export function generateStandardCurve(
  bmiCategory: BMICategory
): { week: number; min: number; max: number }[] {
  try {
    const curve: { week: number; min: number; max: number }[] = []
    for (let w = 0; w <= 40; w++) {
      const range = getExpectedGainAtWeek(w, bmiCategory)
      curve.push({
        week: w,
        min: parseFloat(range.min.toFixed(2)),
        max: parseFloat(range.max.toFixed(2))
      })
    }
    return curve
  } catch (e) {
    console.error('generateStandardCurve error:', e)
    return []
  }
}

/**
 * 生成 0-40 周群体平均增重曲线
 */
export function generatePopulationCurve(
  bmiCategory: BMICategory
): { week: number; avg: number }[] {
  try {
    const curve: { week: number; avg: number }[] = []
    for (let w = 0; w <= 40; w++) {
      const range = getExpectedGainAtWeek(w, bmiCategory)
      curve.push({
        week: w,
        avg: parseFloat(((range.min + range.max) / 2).toFixed(2))
      })
    }
    return curve
  } catch (e) {
    console.error('generatePopulationCurve error:', e)
    return []
  }
}

/**
 * 预估总增重（到40周）
 */
export function estimateTotalGain(
  currentGain: number,
  currentWeek: number,
  bmiCategory: BMICategory
): number {
  try {
    if (currentWeek <= 0) return currentGain
    if (currentWeek >= 40) return currentGain

    const { min: totalMin, max: totalMax } = BMI_GAIN_STANDARDS[bmiCategory]
    const totalAvg = (totalMin + totalMax) / 2
    const currentExpected = getExpectedGainAtWeek(currentWeek, bmiCategory)
    const expectedAvg = (currentExpected.min + currentExpected.max) / 2

    if (expectedAvg <= 0) return currentGain

    const proportion = expectedAvg / totalAvg
    const estimated = currentGain / proportion
    return parseFloat(estimated.toFixed(1))
  } catch (e) {
    console.error('estimateTotalGain error:', e)
    return currentGain
  }
}

/**
 * 获取当前孕周健康提示（0-42周）
 */
export function getWeeklyTip(week: number): string {
  const clampedWeek = Math.max(0, Math.min(42, week))

  const tips: Record<number, string> = {
    0: '备孕阶段：保持均衡饮食，补充叶酸，戒烟戒酒，为宝宝的到来做好准备。',
    1: '孕早期开始：胚胎正在着床，避免剧烈运动和重体力劳动，保持心情放松。',
    2: '胎儿心脏开始形成：继续补充叶酸，注意营养均衡，避免接触有害物质。',
    3: '可能出现早孕反应：少食多餐，选择清淡易消化的食物，多喝水缓解不适。',
    4: '胚胎进入子宫：避免性生活和剧烈运动，如有腹痛或出血请及时就医。',
    5: '心脏开始跳动：保持充足睡眠，避免熬夜，可以适当进行轻度散步。',
    6: '早孕反应可能加重：尝试生姜、柠檬等缓解恶心，补充维生素B6。',
    7: '四肢开始发育：增加蛋白质摄入，多吃鱼、蛋、奶等优质蛋白。',
    8: '重要器官发育期：避免用药，远离辐射和化学污染，按时产检。',
    9: '胎儿开始活动：虽然你还感觉不到，但保持心情愉悦很重要。',
    10: '进入胎儿期：各器官快速发育，保证充足营养，避免节食。',
    11: '胎儿会伸展身体：孕吐可能减轻，可以逐渐恢复正常饮食。',
    12: '孕早期即将结束：NT检查建议在此阶段完成，记得预约产检。',
    13: '进入孕中期：不适感减轻，是孕期最舒适的阶段，适当增加运动量。',
    14: '胎儿开始长头发：食欲好转，注意控制食量，避免体重增长过快。',
    15: '可以感受到胎动：开始记录胎动，感受宝宝与你的互动。',
    16: '唐筛检查时间：记得按时进行唐氏筛查或无创DNA检测。',
    17: '骨骼开始硬化：增加钙质摄入，多喝牛奶，适当晒太阳。',
    18: '大排畸检查：预约系统超声检查，观察胎儿发育情况。',
    19: '听觉开始发育：可以开始胎教，给宝宝听轻柔的音乐。',
    20: '孕程过半：注意皮肤护理，预防妊娠纹，可以使用孕妇专用护肤品。',
    21: '胎动更明显：每天留意胎动规律，如有异常及时就医。',
    22: '胎儿体重增加：保持适度运动，如孕妇瑜伽、散步等。',
    23: '注意血糖控制：少食甜食，预防妊娠糖尿病，按时糖耐检查。',
    24: '可能出现腰背痛：注意坐姿和睡姿，可以使用孕妇枕支撑腰部。',
    25: '胎儿开始睁眼：注意补铁，预防贫血，多吃红肉和动物肝脏。',
    26: '体重管理关键期：每周称重，控制增重速度，避免暴饮暴食。',
    27: '可能出现水肿：避免久站久坐，休息时抬高双腿，减少盐分摄入。',
    28: '进入孕晚期：胎动计数很重要，每天固定时间记录胎动次数。',
    29: '胎儿快速增重：保证优质蛋白摄入，为宝宝发育提供充足营养。',
    30: '可能感觉气短：避免平躺，采用左侧卧位，保证胎盘供血。',
    31: '注意胎位：定期产检确认胎位，为分娩方式做准备。',
    32: '准备待产包：提前准备分娩和产后用品，避免临产时手忙脚乱。',
    33: '可能出现假性宫缩：学会区分真假宫缩，了解临产征兆。',
    34: '胎心监护开始：定期进行胎心监护，评估胎儿宫内状况。',
    35: '胎儿入盆准备：可能感觉胃部不适减轻，但尿频会加重。',
    36: '进入分娩倒计时：确认分娩医院和交通路线，保持通讯畅通。',
    37: '胎儿足月：随时可能分娩，准备好证件和待产包，放松心情。',
    38: '身体为分娩做准备：可能出现分泌物增多，注意保持清洁。',
    39: '预产期临近：密切关注临产征兆，如规律宫缩、破水、见红。',
    40: '到达预产期：如未发动不必焦虑，多数宝宝会在预产期前后两周出生。',
    41: '过期妊娠观察：医生会评估是否需要催产，遵医嘱按时产检。',
    42: '必须住院观察：超过42周需住院处理，确保母婴安全。'
  }

  return tips[clampedWeek] || '保持心情愉快，定期产检，均衡饮食，适度运动。'
}
