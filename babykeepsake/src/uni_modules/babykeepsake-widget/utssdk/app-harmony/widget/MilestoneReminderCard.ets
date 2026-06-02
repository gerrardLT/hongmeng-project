/**
 * BabyKeepsake 里程碑提醒卡片 ArkUI 布局
 *
 * 卡片尺寸：2x2
 * 展示内容：里程碑名称、宝宝月龄、下次采集时间
 *
 * 注意：此文件仅在鸿蒙端编译，不参与 H5/小程序/App 等其他端的构建。
 */

import { formBindingData } from '@kit.FormKit'
import { BusinessError } from '@kit.BasicServicesKit'

/**
 * 里程碑提醒卡片数据模型
 */
interface MilestoneWidgetModel {
  milestoneName: string
  babyAge: string
  nextCollectTime: string
}

/**
 * 默认数据
 */
const DEFAULT_DATA: MilestoneWidgetModel = {
  milestoneName: '暂无提醒',
  babyAge: '--',
  nextCollectTime: '--'
}

// ============================================
// 卡片入口组件
// ============================================

@Entry
@Component
struct MilestoneReminderCard {
  @State widgetData: MilestoneWidgetModel = DEFAULT_DATA

  aboutToAppear(): void {
    try {
      const data = formBindingData.getFormBindingData() as MilestoneWidgetModel
      if (data && data.milestoneName) {
        this.widgetData = data
      }
    } catch (e) {
      console.error('[MilestoneReminderCard] failed to load binding data:', JSON.stringify(e))
    }
  }

  build() {
    Column() {
      // ---------------- 顶部：卡片标题 ----------------
      Row() {
        Text('🌟')
          .fontSize(16)
          .margin({ right: 6 })

        Text('成长提醒')
          .fontSize(14)
          .fontWeight(FontWeight.Bold)
          .fontColor('#FF6B35')
      }
      .width('100%')
      .height(28)
      .alignItems(VerticalAlign.Center)

      // ---------------- 中间：里程碑信息 ----------------
      Column() {
        // 里程碑名称
        Text(this.widgetData.milestoneName)
          .fontSize(17)
          .fontWeight(FontWeight.Bold)
          .fontColor('#2D3436')
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .width('100%')

        // 宝宝月龄
        Row() {
          Text('👶')
            .fontSize(14)
            .margin({ right: 6 })

          Text(`宝宝 ${this.widgetData.babyAge}`)
            .fontSize(14)
            .fontColor('#636E72')
        }
        .width('100%')
        .margin({ top: 10 })
        .alignItems(VerticalAlign.Center)

        // 下次采集时间
        Row() {
          Text('📆')
            .fontSize(14)
            .margin({ right: 6 })

          Text(`下次采集：${this.widgetData.nextCollectTime}`)
            .fontSize(13)
            .fontColor('#FF6B35')
            .fontWeight(FontWeight.Medium)
        }
        .width('100%')
        .margin({ top: 8 })
        .alignItems(VerticalAlign.Center)

        // 提示文字
        Text('别忘了记录宝宝的成长瞬间')
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
          .fontColor('#FF6B35')
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
      color: 'rgba(255, 107, 53, 0.08)',
      offsetX: 0,
      offsetY: 2
    })
    .onClick(() => {
      this.handleCardClick()
    })
  }

  private handleCardClick(): void {
    console.log('[MilestoneReminderCard] card clicked')
    postCardAction(this, {
      action: 'router',
      abilityName: 'EntryAbility',
      params: {
        fromWidget: true,
        targetPage: 'pages/record/timeline',
        widgetType: 'milestone'
      }
    })
  }
}

// ============================================
// 卡片配置
// ============================================

export default class MilestoneReminderCardConfig {
  static readonly cardName: string = 'MilestoneReminderCard'
  static readonly displayName: string = '里程碑提醒卡片'
  static readonly description: string = '提醒宝宝成长节点和下次采集时间'
  static readonly supportDimensions: string[] = ['2*2']
  static readonly defaultDimension: string = '2*2'
  static readonly updateEnabled: boolean = true
  static readonly updateDuration: number = 30 * 60 * 1000
  static readonly formConfigAbility: string = 'FormExtensionAbility'
}
