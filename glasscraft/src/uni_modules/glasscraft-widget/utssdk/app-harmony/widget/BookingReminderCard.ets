/**
 * GlassCraft 预约提醒卡片 ArkUI 布局
 *
 * 卡片尺寸：2x2
 * 展示内容：工作室名称、预约时间、项目名称
 *
 * 注意：此文件仅在鸿蒙端编译，不参与 H5/小程序/App 等其他端的构建。
 */

import { formBindingData } from '@kit.FormKit'
import { BusinessError } from '@kit.BasicServicesKit'

/**
 * 预约提醒卡片数据模型
 */
interface BookingWidgetModel {
  studioName: string
  bookingTime: string
  projectName: string
}

/**
 * 默认数据
 */
const DEFAULT_DATA: BookingWidgetModel = {
  studioName: '暂无预约',
  bookingTime: '--',
  projectName: '--'
}

// ============================================
// 卡片入口组件
// ============================================

@Entry
@Component
struct BookingReminderCard {
  @State widgetData: BookingWidgetModel = DEFAULT_DATA

  aboutToAppear(): void {
    try {
      const data = formBindingData.getFormBindingData() as BookingWidgetModel
      if (data && data.studioName) {
        this.widgetData = data
      }
    } catch (e) {
      console.error('[BookingReminderCard] failed to load binding data:', JSON.stringify(e))
    }
  }

  build() {
    Column() {
      // ---------------- 顶部：卡片标题 ----------------
      Row() {
        Text('🔥')
          .fontSize(16)
          .margin({ right: 6 })

        Text('预约提醒')
          .fontSize(14)
          .fontWeight(FontWeight.Bold)
          .fontColor('#E8553A')
      }
      .width('100%')
      .height(28)
      .alignItems(VerticalAlign.Center)

      // ---------------- 中间：预约信息 ----------------
      Column() {
        // 工作室名称
        Text(this.widgetData.studioName)
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .fontColor('#2D3436')
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .width('100%')

        // 预约时间
        Row() {
          Text('🕐')
            .fontSize(12)
            .margin({ right: 4 })

          Text(this.widgetData.bookingTime)
            .fontSize(13)
            .fontColor('#636E72')
        }
        .width('100%')
        .margin({ top: 6 })
        .alignItems(VerticalAlign.Center)

        // 项目名称
        Row() {
          Text('💎')
            .fontSize(12)
            .margin({ right: 4 })

          Text(this.widgetData.projectName)
            .fontSize(13)
            .fontColor('#636E72')
        }
        .width('100%')
        .margin({ top: 4 })
        .alignItems(VerticalAlign.Center)
      }
      .width('100%')
      .layoutWeight(1)
      .justifyContent(FlexAlign.Center)

      // ---------------- 底部：查看详情提示 ----------------
      Row() {
        Text('查看详情 →')
          .fontSize(12)
          .fontColor('#E8553A')
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
          { color: '#FFF8F5', offset: 0.6 },
          { color: '#FFEDE5', offset: 1 }
        ]
      })
    )
    .borderRadius(20)
    .shadow({
      radius: 8,
      color: 'rgba(232, 85, 58, 0.08)',
      offsetX: 0,
      offsetY: 2
    })
    .onClick(() => {
      this.handleCardClick()
    })
  }

  private handleCardClick(): void {
    console.log('[BookingReminderCard] card clicked')
    postCardAction(this, {
      action: 'router',
      abilityName: 'EntryAbility',
      params: {
        fromWidget: true,
        targetPage: 'pages/booking/index',
        widgetType: 'booking'
      }
    })
  }
}

// ============================================
// 卡片配置
// ============================================

export default class BookingReminderCardConfig {
  static readonly cardName: string = 'BookingReminderCard'
  static readonly displayName: string = '预约提醒卡片'
  static readonly description: string = '显示即将到来的烧玻璃预约信息'
  static readonly supportDimensions: string[] = ['2*2']
  static readonly defaultDimension: string = '2*2'
  static readonly updateEnabled: boolean = true
  static readonly updateDuration: number = 30 * 60 * 1000
  static readonly formConfigAbility: string = 'FormExtensionAbility'
}
