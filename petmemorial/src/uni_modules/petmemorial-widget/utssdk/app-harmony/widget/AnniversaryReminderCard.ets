/**
 * PetMemorial 宠物纪念日提醒卡片 ArkUI 布局
 *
 * 卡片尺寸：2x2
 * 展示内容：宠物名称、纪念日类型、距离天数
 *
 * 注意：此文件仅在鸿蒙端编译，不参与 H5/小程序/App 等其他端的构建。
 */

import { formBindingData } from '@kit.FormKit'
import { BusinessError } from '@kit.BasicServicesKit'

/**
 * 宠物纪念日提醒卡片数据模型
 */
interface AnniversaryWidgetModel {
  petName: string
  anniversaryType: string
  daysUntil: string
}

/**
 * 默认数据
 */
const DEFAULT_DATA: AnniversaryWidgetModel = {
  petName: '爱宠',
  anniversaryType: '暂无提醒',
  daysUntil: '--'
}

// ============================================
// 卡片入口组件
// ============================================

@Entry
@Component
struct AnniversaryReminderCard {
  @State widgetData: AnniversaryWidgetModel = DEFAULT_DATA

  aboutToAppear(): void {
    try {
      const data = formBindingData.getFormBindingData() as AnniversaryWidgetModel
      if (data && data.petName) {
        this.widgetData = data
      }
    } catch (e) {
      console.error('[AnniversaryReminderCard] failed to load binding data:', JSON.stringify(e))
    }
  }

  build() {
    Column() {
      // ---------------- 顶部：卡片标题 ----------------
      Row() {
        Text('🐾')
          .fontSize(16)
          .margin({ right: 6 })

        Text('纪念日提醒')
          .fontSize(14)
          .fontWeight(FontWeight.Bold)
          .fontColor('#8B5CF6')
      }
      .width('100%')
      .height(28)
      .alignItems(VerticalAlign.Center)

      // ---------------- 中间：纪念日信息 ----------------
      Column() {
        // 宠物名称
        Text(this.widgetData.petName)
          .fontSize(17)
          .fontWeight(FontWeight.Bold)
          .fontColor('#2D3436')
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .width('100%')

        // 纪念日类型
        Row() {
          Text('🎂')
            .fontSize(14)
            .margin({ right: 6 })

          Text(this.widgetData.anniversaryType)
            .fontSize(14)
            .fontColor('#636E72')
        }
        .width('100%')
        .margin({ top: 10 })
        .alignItems(VerticalAlign.Center)

        // 距离天数
        Row() {
          Text('⏰')
            .fontSize(14)
            .margin({ right: 6 })

          Text(`还有 ${this.widgetData.daysUntil}`)
            .fontSize(13)
            .fontColor('#8B5CF6')
            .fontWeight(FontWeight.Medium)
        }
        .width('100%')
        .margin({ top: 8 })
        .alignItems(VerticalAlign.Center)

        // 提示文字
        Text('别忘了给毛孩子准备惊喜')
          .fontSize(11)
          .fontColor('#BDBDBD')
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .width('100%')
          .margin({ top: 8 })
      }
      .width('100%')
      .layoutWeight(1)
      .justifyContent(FlexAlign.Center)

      // ---------------- 底部：查看详情提示 ----------------
      Row() {
        Text('查看详情 →')
          .fontSize(12)
          .fontColor('#8B5CF6')
          .fontWeight(FontWeight.Medium)
      }
      .width('100%')
      .height(24)
      .justifyContent(FlexAlign.End)
      .alignItems(VerticalAlign.Center)
    }
    .width('100%')
    .height('100%')
    .padding(14)
    .background(
      new LinearGradient({
        angle: 135,
        colors: [
          { color: '#FFFFFF', offset: 0 },
          { color: '#F5F3FF', offset: 0.6 },
          { color: '#EDE9FE', offset: 1 }
        ]
      })
    )
    .borderRadius(20)
    .shadow({
      radius: 8,
      color: 'rgba(139, 92, 246, 0.08)',
      offsetX: 0,
      offsetY: 2
    })
    .onClick(() => {
      this.handleCardClick()
    })
  }

  private handleCardClick(): void {
    console.log('[AnniversaryReminderCard] card clicked')
    postCardAction(this, {
      action: 'router',
      abilityName: 'EntryAbility',
      params: {
        fromWidget: true,
        targetPage: 'pages/pet/index',
        widgetType: 'anniversary'
      }
    })
  }
}

// ============================================
// 卡片配置
// ============================================

export default class AnniversaryReminderCardConfig {
  static readonly cardName: string = 'AnniversaryReminderCard'
  static readonly displayName: string = '宠物纪念日提醒卡片'
  static readonly description: string = '提醒即将到来的宠物纪念日和生日'
  static readonly supportDimensions: string[] = ['2*2']
  static readonly defaultDimension: string = '2*2'
  static readonly updateEnabled: boolean = true
  static readonly updateDuration: number = 30 * 60 * 1000
  static readonly formConfigAbility: string = 'FormExtensionAbility'
}
