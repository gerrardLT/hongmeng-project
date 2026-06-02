import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Pattern, PatternParameters, ColorScheme, PatternDensity, PatternRotation } from '@/types/models'

const DEFAULT_PARAMETERS: PatternParameters = {
  density: 'medium',
  size: 50,
  rotation: '0',
  advanced: {}
}

const DENSITY_OPTIONS: PatternDensity[] = ['sparse', 'medium', 'dense']
const ROTATION_OPTIONS: PatternRotation[] = ['0', '45', '90', 'random']

export const useDesignStore = defineStore('design', () => {
  // state
  const currentPattern = ref<Pattern | null>(null)
  const parameters = ref<PatternParameters>({ ...DEFAULT_PARAMETERS })
  const colorScheme = ref<ColorScheme | null>(null)
  const previewDataUrl = ref<string>('')

  // getters
  const hasPattern = computed(() => !!currentPattern.value)
  const canExport = computed(() => !!currentPattern.value && !!colorScheme.value && !!previewDataUrl.value)

  /**
   * 设置当前编辑纹样
   * @param pattern 纹样对象
   */
  function setPattern(pattern: Pattern) {
    currentPattern.value = pattern
    // 使用纹样自带的默认参数
    parameters.value = { ...pattern.parameters }
  }

  /**
   * 更新基础参数
   * @param key 参数键名
   * @param value 参数值
   */
  function updateParameter<K extends keyof PatternParameters>(key: K, value: PatternParameters[K]) {
    parameters.value = { ...parameters.value, [key]: value }
  }

  /**
   * 更新高级参数
   * @param key 高级参数键名
   * @param value 参数值
   */
  function updateAdvancedParameter(key: string, value: number | string) {
    const advanced = { ...(parameters.value.advanced || {}), [key]: value }
    parameters.value = { ...parameters.value, advanced }
  }

  /**
   * 设置配色方案
   * @param scheme 配色方案对象
   */
  function setColorScheme(scheme: ColorScheme | null) {
    colorScheme.value = scheme
  }

  /**
   * 设置预览图数据URL
   * @param url 预览图base64或url
   */
  function setPreviewDataUrl(url: string) {
    previewDataUrl.value = url
  }

  /**
   * 随机化参数
   */
  function randomize() {
    const density = DENSITY_OPTIONS[Math.floor(Math.random() * DENSITY_OPTIONS.length)]
    const size = Math.floor(Math.random() * 81) + 20 // 20-100
    const rotation = ROTATION_OPTIONS[Math.floor(Math.random() * ROTATION_OPTIONS.length)]
    parameters.value = {
      density,
      size,
      rotation,
      advanced: parameters.value.advanced
    }
  }

  /**
   * 重置设计状态
   */
  function reset() {
    currentPattern.value = null
    parameters.value = { ...DEFAULT_PARAMETERS }
    colorScheme.value = null
    previewDataUrl.value = ''
  }

  return {
    currentPattern,
    parameters,
    colorScheme,
    previewDataUrl,
    hasPattern,
    canExport,
    setPattern,
    updateParameter,
    updateAdvancedParameter,
    setColorScheme,
    setPreviewDataUrl,
    randomize,
    reset
  }
})
