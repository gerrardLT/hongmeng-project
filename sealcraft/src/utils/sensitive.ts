/**
 * 敏感词库（政治、色情、违法等类别）
 */
const SENSITIVE_WORDS: string[] = [
  // 政治类
  '法轮', '六四', '天安门事件', '台独', '藏独', '疆独',
  // 违法类
  '毒品', '大麻', '冰毒', '海洛因', '卖枪', '炸弹', '爆炸物',
  '诈骗', '洗钱', '传销', '黑市',
  // 色情类
  '色情', '裸体', '淫秽', '卖淫', '嫖娼',
  // 赌博类
  '赌博', '赌场', '博彩',
  // 诽谤/暴力类
  '杀人', '自杀', '恐怖', '暴恐'
]

/**
 * 检测文本中的敏感词
 * @param text 待检测文本
 * @returns 检测结果，包含是否含敏感词及具体词汇
 */
export function checkSensitiveWords(text: string): { hasSensitive: boolean; words: string[] } {
  if (!text) return { hasSensitive: false, words: [] }

  const found: string[] = []
  for (const word of SENSITIVE_WORDS) {
    if (text.includes(word)) {
      found.push(word)
    }
  }

  return {
    hasSensitive: found.length > 0,
    words: found
  }
}

/**
 * 检查刻字内容的特殊字符（仅允许中文、英文字母、数字、常见标点）
 * @param text 待检测文本
 * @returns 是否含非法特殊字符
 */
function hasIllegalSpecialChars(text: string): boolean {
  // 允许：中文、英文、数字、常见中英文标点（。，、！？·…—「」『』【】《》〈〉）
  const allowedPattern = /^[\u4e00-\u9fa5a-zA-Z0-9\s。，、！？·…—「」『』【】《》〈〉,.!?\-_]+$/
  return !allowedPattern.test(text)
}

/**
 * 验证刻字内容是否合法（SealCraft 专用）
 * - 长度：1-4 个汉字（或等价字符）
 * - 不含敏感词
 * - 不含非法特殊字符
 * @param text 刻字内容
 * @returns 验证结果，包含是否合法及提示消息
 */
export function isValidSealContent(text: string): { valid: boolean; message: string } {
  if (!text || text.trim().length === 0) {
    return { valid: false, message: '刻字内容不能为空' }
  }

  const trimmed = text.trim()

  // 计算字符长度（中文算1个，英文/数字算0.5个，向上取整）
  const charCount = Array.from(trimmed).reduce((count, char) => {
    const code = char.charCodeAt(0)
    // 中文及全角字符
    return count + (code > 127 ? 1 : 0.5)
  }, 0)

  if (charCount < 1) {
    return { valid: false, message: '刻字内容不能为空' }
  }

  if (charCount > 4) {
    return { valid: false, message: '刻字内容不超过4个字' }
  }

  // 检查非法特殊字符
  if (hasIllegalSpecialChars(trimmed)) {
    return { valid: false, message: '刻字内容含有不支持的特殊字符' }
  }

  // 检查敏感词
  const { hasSensitive, words } = checkSensitiveWords(trimmed)
  if (hasSensitive) {
    return { valid: false, message: `刻字内容含有违禁词汇：${words.join('、')}` }
  }

  return { valid: true, message: '' }
}
