/**
 * PetMemorial 制作进度卡片 ArkUI 布局
 *
 * 卡片尺寸：2x2
 * 展示内容：当前制作阶段、进度百分比、预计完成时间
 *
 * 注意：此文件仅在鸿蒙端编译，不参与 H5/小程序/App 等其他端的构建。
 */

import { formBindingData } from '@kit.FormKit'
import { BusinessError } from '@kit.BasicServicesKit'

/**
 * 制作进度卡片数据模型
 */
interface ProgressWidgetModel {
  currentStage: string
  progressPercent: number
  estimatedCompletion: string
}

/**
 * 默认数据
 */
const DEFAULT_DATA: ProgressWidgetModel = {
  currentStage: '暂无订单',
  progressPercent: 0,
  estimatedCompletion: '--'
}

// ============================================
// 卡片入口组件
// ============================================

@Entry
@Component
struct MakingProgressCard {
  @State widgetData: ProgressWidgetModel = DEFAULT_DATA

  aboutToAppear(): void {
    try {
      const data = formBindingData.getFormBindingData() as ProgressWidgetModel
      if (data && data.currentStage) {
        this.widgetData = data
      }
    } catch (e) {
      console.error('[MakingProgressCard] failed to load binding data:', JSON.stringify(e))
    }
  }

  build() {
    Column() {
      // ---------------- 顶部：卡片标题 ----------------
      Row() {
        Text('🔨')
          .fontSize(16)
          .margin({ right: 6 })

        Text('制作进度')
          .fontSize(14)
          .fontWeight(FontWeight.Bold)
          .fontColor('#8B5CF6')
      }
      .width('100%')
      .height(28)
      .alignItems(VerticalAlign.Center)

      // ---------------- 中间：进度信息 ----------------
      Column() {
        // 当前阶段
        Text(this.widgetData.currentStage)
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#2D3436')
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })

        // 进度条
        Row() {
          // 进度条背景
          Row() {
            // 进度条填充
            Row() {}
              .width(`${this.widgetData.progressPercent}%`)
              .height('100%')
              .borderRadius(4)
              .linearGradient({
                angle: 90,
                colors: [['#8B5CF6', 0], ['#A78BFA', 1]]
              })
          }
          .width('100%')
          .height(8)
          .borderRadius(4)
          .backgroundColor('#F0F0F0')
        }
        .width('100%')
        .margin({ top: 12 })

        // 进度百分比
        Text(`${this.widgetData.progressPercent}%`)
          .fontSize(12)
          .fontColor('#8B5CF6')
          .fontWeight(FontWeight.Medium)
          .width('100%')
          .textAlign(TextAlign.End)
          .margin({ top: 4 })

        // 预计完成时间
        Row() {
          Text('预计完成：')
            .fontSize(12)
            .fontColor('#BDBDBD')

          Text(this.widgetData.estimatedCompletion)
            .fontSize(12)
            .fontColor('#636E72')
            .fontWeight(FontWeight.Medium)
        }
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
    console.log('[MakingProgressCard] card clicked')
    postCardAction(this, {
      action: 'router',
      abilityName: 'EntryAbility',
      params: {
        fromWidget: true,
        targetPage: 'pages/progress/index',
        widgetType: 'progress'
      }
    })
  }
}

// ============================================
// 卡片配置
// ============================================

export default class MakingProgressCardConfig {
  static readonly cardName: string = 'MakingProgressCard'
  static readonly displayName: string = '制作进度卡片'
  static readonly description: string = '显示当前纪念品制作进度和预计完成时间'
  static readonly supportDimensions: string[] = ['2*2']
  static readonly defaultDimension: string = '2*2'
  static readonly updateEnabled: boolean = true
  static readonly updateDuration: number = 30 * 60 * 1000
  static readonly formConfigAbility: string = 'FormExtensionAbility'
}
