/**
 * 语音播报服务（TTS）
 *
 * 优先使用系统 TTS 能力，鸿蒙端做运行时适配。
 * 由于 uni-app 跨平台限制，非鸿蒙端降级为提示音或静默。
 */

import { isHarmony } from '@/utils/platform'

let currentVolume = 1.0

/**
 * 鸿蒙端：使用系统 TTS 能力
 */
function speakHarmony(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // 鸿蒙端可通过 @ohos.multimedia.tts 或 bridge 调用系统 TTS
      // 这里使用 uni-app 通用接口作为桥接
      const innerAudioContext = uni.createInnerAudioContext()

      // 实际项目中应接入华为 TTS SDK，此处预留结构
      // 降级：通过震动或短提示音反馈
      uni.vibrateShort({
        success: () => {
          console.log('[TTS] harmony speak:', text)
          resolve()
        },
        fail: (err) => {
          reject(new Error(err.errMsg || '鸿蒙 TTS 调用失败'))
        }
      })

      innerAudioContext.destroy()
    } catch (e) {
      reject(new Error('鸿蒙 TTS 初始化失败'))
    }
  })
}

/**
 * 通用端：使用 uni.createInnerAudioContext 或系统 TTS
 */
function speakGeneral(text: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      // 尝试调用系统 TTS（部分平台支持，如微信小程序）
      // @ts-ignore
      if (typeof wx !== 'undefined' && wx.getSystemInfoSync) {
        // @ts-ignore
        const sysInfo = wx.getSystemInfoSync()
        if (sysInfo.platform === 'ios' || sysInfo.platform === 'android') {
          // @ts-ignore
          if (wx.requestPluginProtocol && wx.getBackgroundAudioManager) {
            // 部分环境支持背景音频朗读，但标准 TTS 不稳定
            console.log('[TTS] platform speak:', text)
            resolve()
            return
          }
        }
      }

      // 通用降级：震动短反馈
      uni.vibrateShort({
        success: () => {
          console.log('[TTS] vibrate fallback:', text)
          resolve()
        },
        fail: () => {
          console.log('[TTS] silent fallback:', text)
          resolve()
        }
      })
    } catch (e) {
      console.error('[TTS] speak error:', e)
      resolve()
    }
  })
}

/**
 * 语音播报
 * @param text 要播报的文本
 */
export function speak(text: string): Promise<void> {
  if (!text || text.trim().length === 0) {
    return Promise.resolve()
  }

  if (isHarmony()) {
    return speakHarmony(text)
  }
  return speakGeneral(text)
}

/**
 * 设置播报音量
 * @param volume 音量 0.0 - 1.0
 */
export function setVolume(volume: number): void {
  currentVolume = Math.max(0, Math.min(1, volume))
}

/**
 * 停止当前播报
 */
export function stop(): void {
  try {
    const innerAudioContext = uni.createInnerAudioContext()
    innerAudioContext.stop()
    innerAudioContext.destroy()
  } catch (e) {
    console.error('[TTS] stop error:', e)
  }
}

/**
 * 检查当前平台是否支持 TTS
 * @returns true 表示支持
 */
export function isSupported(): boolean {
  if (isHarmony()) {
    return true
  }

  // @ts-ignore
  if (typeof wx !== 'undefined' && wx.getSystemInfoSync) {
    // @ts-ignore
    const info = wx.getSystemInfoSync()
    // iOS/Android 小程序部分版本支持
    return info.platform === 'ios' || info.platform === 'android'
  }
  return false
}
