import type { PatternParameters, ColorScheme, PreviewItemType, SceneTemplate } from '@/types/models'
import { requestStoragePermission } from '@/utils/permission'
import { renderPattern } from '@/services/render'
import { getPatternById } from '@/services/pattern'

/** 导出功能专用的轻量数据类型，不依赖完整的 Artwork 持久化模型 */
export interface ExportArtworkPayload {
  patternId?: string
  patternParams: PatternParameters
  colorScheme: ColorScheme
  previewDataUrl?: string
}

/**
 * 导出为壁纸（自适应屏幕分辨率）
 * @param artworkData 作品数据
 * @param template 场景模板
 * @returns 临时文件路径
 */
export async function exportAsWallpaper(artworkData: ExportArtworkPayload, template: SceneTemplate): Promise<string> {
  try {
    const sysInfo = uni.getSystemInfoSync()
    const width = (sysInfo.screenWidth || 1080) * (sysInfo.pixelRatio || 2)
    const height = (sysInfo.screenHeight || 1920) * (sysInfo.pixelRatio || 2)

    const imageData = await generateHighResImage(artworkData, width, height)
    console.log('[export] wallpaper generated:', width, 'x', height)
    return imageData
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '未知错误'
    console.error('[ExportService] exportAsWallpaper failed:', message)
    uni.showToast({ title: '导出壁纸失败，请重试', icon: 'none' })
    throw e
  }
}

/**
 * 导出为贺卡
 * @param artworkData 作品数据
 * @param template 场景模板
 * @param text 贺卡文字
 * @returns 临时文件路径
 */
export async function exportAsCard(artworkData: ExportArtworkPayload, template: SceneTemplate, text: string): Promise<string> {
  try {
    const width = 1080
    const height = 1440

    const imageData = await generateHighResImage(artworkData, width, height, text)
    console.log('[export] card generated with text:', text.slice(0, 20))
    return imageData
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '未知错误'
    console.error('[ExportService] exportAsCard failed:', message)
    uni.showToast({ title: '导出贺卡失败，请重试', icon: 'none' })
    throw e
  }
}

/**
 * 导出为请柬
 * @param artworkData 作品数据
 * @param template 场景模板
 * @param text 请柬文字
 * @returns 临时文件路径
 */
export async function exportAsInvitation(artworkData: ExportArtworkPayload, template: SceneTemplate, text: string): Promise<string> {
  try {
    const width = 1080
    const height = 1920

    const imageData = await generateHighResImage(artworkData, width, height, text)
    console.log('[export] invitation generated with text:', text.slice(0, 20))
    return imageData
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '未知错误'
    console.error('[ExportService] exportAsInvitation failed:', message)
    uni.showToast({ title: '导出请柬失败，请重试', icon: 'none' })
    throw e
  }
}

/**
 * 导出为周边预览图
 * @param artworkData 作品数据
 * @param previewType 预览物品类型
 * @returns 临时文件路径
 */
export async function exportAsPreview(artworkData: ExportArtworkPayload, previewType: PreviewItemType | string): Promise<string> {
  try {
    const sizeMap: Record<PreviewItemType, { width: number; height: number }> = {
      'phone-case': { width: 600, height: 1200 },
      'scarf': { width: 1200, height: 1200 },
      'tote-bag': { width: 900, height: 1000 },
      'tshirt': { width: 800, height: 1000 },
      'mug': { width: 1200, height: 600 }
    }

    const size = sizeMap[previewType as PreviewItemType] || { width: 800, height: 800 }
    const imageData = await generateHighResImage(artworkData, size.width, size.height)
    console.log('[export] preview generated for:', previewType)
    return imageData
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '未知错误'
    console.error('[ExportService] exportAsPreview failed:', message)
    uni.showToast({ title: '导出预览失败，请重试', icon: 'none' })
    throw e
  }
}

/**
 * 保存图片到系统相册
 * 需要存储权限，鸿蒙端使用特殊权限请求
 * @param imageData 图片临时文件路径
 */
export async function saveToAlbum(imageData: string): Promise<void> {
  // 请求存储权限
  const hasPermission = await requestStoragePermission()
  if (!hasPermission) {
    throw new Error('未获得存储权限，无法保存到相册')
  }

  return new Promise((resolve, reject) => {
    uni.saveImageToPhotosAlbum({
      filePath: imageData,
      success: () => {
        console.log('[export] saved to album successfully')
        uni.showToast({ title: '已保存到相册', icon: 'success' })
        resolve()
      },
      fail: (err) => {
        console.error('[export] saveToAlbum error:', err)
        reject(new Error(err.errMsg || '保存到相册失败'))
      }
    })
  })
}

/**
 * 生成高清图片
 * 创建离屏 Canvas 渲染后导出为临时文件
 * @param artworkData 作品数据
 * @param width 目标宽度
 * @param height 目标高度
 * @param overlayText 叠加文字（贺卡/请柬使用）
 * @returns 临时文件路径
 */
export async function generateHighResImage(
  artworkData: ExportArtworkPayload,
  width: number,
  height: number,
  overlayText?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const pattern = artworkData.patternId ? getPatternById(artworkData.patternId) : null
      if (!pattern) {
        reject(new Error('纹样数据未找到'))
        return
      }

      // 使用 uni.createOffscreenCanvas（兼容方式）
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('无法创建 Canvas 上下文'))
        return
      }

      // 渲染纹样
      renderPattern(ctx, pattern, artworkData.patternParams, artworkData.colorScheme)

      // 叠加文字
      if (overlayText) {
        ctx.save()
        ctx.fillStyle = artworkData.colorScheme.accentColor || '#333333'
        ctx.font = `bold ${Math.floor(width / 20)}px "PingFang SC", "Microsoft YaHei", sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // 文字阴影
        ctx.shadowColor = 'rgba(0,0,0,0.2)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2

        ctx.fillText(overlayText, width / 2, height * 0.75, width * 0.8)
        ctx.restore()
      }

      // 导出为 base64（后续可通过 uni API 转为临时文件）
      const dataUrl = canvas.toDataURL('image/png')
      console.log('[export] high-res image generated:', width, 'x', height)
      resolve(dataUrl)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '未知错误'
      console.error('[ExportService] generateHighResImage failed:', message)
      reject(e instanceof Error ? e : new Error(message))
    }
  })
}
