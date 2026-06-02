/**
 * PetMeet 2x2 服务卡片 ArkUI 布局
 *
 * 本文件为鸿蒙原生 ArkTS/ETS 语法，用于定义负一屏服务卡片的 UI 布局。
 * 卡片尺寸：2x2（标准服务卡片格子）
 *
 * 注意：此文件仅在鸿蒙端编译，不参与 H5/小程序/App 等其他端的构建。
 */

import { formBindingData } from '@kit.FormKit'
import { BusinessError } from '@kit.BasicServicesKit'

/**
 * 卡片数据模型
 * 与 UTS 层的 WidgetData 保持一致
 */
interface WidgetDataModel {
  petName: string
  petAvatar: string
  latestDiary: string
  friendCount: number
}

/**
 * 默认数据（卡片加载中或数据异常时展示）
 */
const DEFAULT_DATA: WidgetDataModel = {
  petName: '我的宠物',
  petAvatar: '',
  latestDiary: '还没有日记哦~',
  friendCount: 0
}

// ============================================
// 卡片入口组件
// ============================================

@Entry
@Component
struct PetMeetCard {
  // 卡片展示数据，通过 formBindingData 从 UTS 层注入
  @State widgetData: WidgetDataModel = DEFAULT_DATA

  /**
   * 组件挂载时读取绑定数据
   */
  aboutToAppear(): void {
    // 尝试从 formBindingData 获取初始数据
    try {
      const data = formBindingData.getFormBindingData() as WidgetDataModel
      if (data && data.petName) {
        this.widgetData = data
      }
    } catch (e) {
      console.error('[PetMeetCard] failed to load binding data:', JSON.stringify(e))
    }
  }

  /**
   * 构建卡片 UI
   */
  build() {
    Column() {
      // ---------------- 顶部：头像 + 名字 ----------------
      Row() {
        // 宠物头像（圆形 48vp）
        Stack() {
          if (this.widgetData.petAvatar && this.widgetData.petAvatar.length > 0) {
            Image(this.widgetData.petAvatar)
              .width(48)
              .height(48)
              .borderRadius(24)
              .objectFit(ImageFit.Cover)
              .alt($r('app.media.pet_avatar_placeholder'))
          } else {
            // 无头像时显示默认图标
            Image($r('app.media.pet_avatar_placeholder'))
              .width(48)
              .height(48)
              .borderRadius(24)
              .objectFit(ImageFit.Cover)
              .fillColor('#FF6B35')
          }
        }
        .width(48)
        .height(48)
        .borderRadius(24)
        .border({ width: 2, color: '#FFE5D9' })

        // 宠物名字
        Text(this.widgetData.petName)
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#2D3436')
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .margin({ left: 12 })
          .layoutWeight(1)
      }
      .width('100%')
      .height(56)
      .alignItems(VerticalAlign.Center)

      // ---------------- 中间：最近日记摘要 ----------------
      Column() {
        Text(this.widgetData.latestDiary)
          .fontSize(14)
          .fontColor('#636E72')
          .maxLines(2)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .width('100%')
          .lineHeight(20)
      }
      .width('100%')
      .height(44)
      .margin({ top: 4, bottom: 4 })
      .justifyContent(FlexAlign.Center)

      // ---------------- 底部：宠友数量 ----------------
      Row() {
        // 小爪印图标（使用系统图标或占位）
        Text('🐾')
          .fontSize(14)
          .margin({ right: 4 })

        Text(`${this.widgetData.friendCount} 位宠友`)
          .fontSize(13)
          .fontColor('#FF6B35')
          .fontWeight(FontWeight.Medium)
      }
      .width('100%')
      .height(28)
      .alignItems(VerticalAlign.Center)
    }
    .width('100%')
    .height('100%')
    .padding(16)
    .background(
      // 浅橙色渐变背景
      new LinearGradient({
        angle: 135,
        colors: [
          { color: '#FFFFFF', offset: 0 },
          { color: '#FFF5F0', offset: 0.6 },
          { color: '#FFE8E0', offset: 1 }
        ]
      })
    )
    .borderRadius(20)
    .shadow({
      radius: 8,
      color: 'rgba(255, 107, 53, 0.08)',
      offsetX: 0,
      offsetY: 2
    })
    // 点击事件：跳转 App
    .onClick(() => {
      this.handleCardClick()
    })
  }

  /**
   * 处理卡片点击：唤起 PetMeet App
   */
  private handleCardClick(): void {
    console.log('[PetMeetCard] card clicked')

    // 通过 postCardAction 向 FormExtensionAbility 发送消息
    // 由 UTS 层的 onWidgetClick 处理实际的跳转逻辑
    postCardAction(this, {
      action: 'router',
      abilityName: 'EntryAbility',
      params: {
        fromWidget: true,
        targetPage: 'pages/index/index',
        petName: this.widgetData.petName
      }
    })
  }
}

// ============================================
// 卡片配置（鸿蒙服务卡片必需）
// ============================================

/**
 * 卡片外部化配置
 * 定义卡片支持的尺寸、默认尺寸等信息
 */
export default class PetMeetCardConfig {
  // 卡片名称
  static readonly cardName: string = 'PetMeetCard'
  // 卡片显示名
  static readonly displayName: string = 'PetMeet 宠物卡片'
  // 卡片描述
  static readonly description: string = '展示宠物信息、日记和宠友数量'
  // 支持的尺寸
  static readonly supportDimensions: string[] = ['2*2']
  // 默认尺寸
  static readonly defaultDimension: string = '2*2'
  // 是否支持卡片数据周期性更新
  static readonly updateEnabled: boolean = true
  // 卡片数据更新周期（毫秒），30 分钟
  static readonly updateDuration: number = 30 * 60 * 1000
  // 卡片关联的 FormExtensionAbility 名称
  static readonly formConfigAbility: string = 'FormExtensionAbility'
}
