/**
 * GlassCraft 作品展示卡片 ArkUI 布局
 *
 * 卡片尺寸：2x2
 * 展示内容：作品照片、工作室名称、创建日期
 *
 * 注意：此文件仅在鸿蒙端编译，不参与 H5/小程序/App 等其他端的构建。
 */

import { formBindingData } from '@kit.FormKit'
import { BusinessError } from '@kit.BasicServicesKit'

/**
 * 作品展示卡片数据模型
 */
interface ArtworkWidgetModel {
  artworkPhoto: string
  studioName: string
  createdDate: string
}

/**
 * 默认数据
 */
const DEFAULT_DATA: ArtworkWidgetModel = {
  artworkPhoto: '',
  studioName: '暂无作品',
  createdDate: '--'
}

// ============================================
// 卡片入口组件
// ============================================

@Entry
@Component
struct ArtworkShowcaseCard {
  @State widgetData: ArtworkWidgetModel = DEFAULT_DATA

  aboutToAppear(): void {
    try {
      const data = formBindingData.getFormBindingData() as ArtworkWidgetModel
      if (data && data.studioName) {
        this.widgetData = data
      }
    } catch (e) {
      console.error('[ArtworkShowcaseCard] failed to load binding data:', JSON.stringify(e))
    }
  }

  build() {
    Column() {
      // ---------------- 顶部：卡片标题 ----------------
      Row() {
        Text('✨')
          .fontSize(16)
          .margin({ right: 6 })

        Text('我的作品')
          .fontSize(14)
          .fontWeight(FontWeight.Bold)
          .fontColor('#E8553A')
      }
      .width('100%')
      .height(28)
      .alignItems(VerticalAlign.Center)

      // ---------------- 中间：作品信息 ----------------
      Column() {
        // 作品照片
        if (this.widgetData.artworkPhoto) {
          Image(this.widgetData.artworkPhoto)
            .width('100%')
            .height(80)
            .objectFit(ImageFit.Cover)
            .borderRadius(10)
            .margin({ top: 4 })
        } else {
          // 无照片时的占位区域
          Row() {
            Text('🔥')
              .fontSize(28)
          }
          .width('100%')
          .height(80)
          .justifyContent(FlexAlign.Center)
          .alignItems(VerticalAlign.Center)
          .borderRadius(10)
          .backgroundColor('#FFF0EB')
          .margin({ top: 4 })
        }

        // 工作室名称
        Row() {
          Text('🏠')
            .fontSize(12)
            .margin({ right: 4 })

          Text(this.widgetData.studioName)
            .fontSize(13)
            .fontColor('#636E72')
            .maxLines(1)
            .textOverflow({ overflow: TextOverflow.Ellipsis })
            .layoutWeight(1)
        }
        .width('100%')
        .margin({ top: 8 })
        .alignItems(VerticalAlign.Center)

        // 创建日期
        Row() {
          Text('📅')
            .fontSize(12)
            .margin({ right: 4 })

          Text(this.widgetData.createdDate)
            .fontSize(12)
            .fontColor('#BDBDBD')
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
    console.log('[ArtworkShowcaseCard] card clicked')
    postCardAction(this, {
      action: 'router',
      abilityName: 'EntryAbility',
      params: {
        fromWidget: true,
        targetPage: 'pages/artwork/index',
        widgetType: 'artwork'
      }
    })
  }
}

// ============================================
// 卡片配置
// ============================================

export default class ArtworkShowcaseCardConfig {
  static readonly cardName: string = 'ArtworkShowcaseCard'
  static readonly displayName: string = '作品展示卡片'
  static readonly description: string = '展示最近的烧玻璃作品'
  static readonly supportDimensions: string[] = ['2*2']
  static readonly defaultDimension: string = '2*2'
  static readonly updateEnabled: boolean = true
  static readonly updateDuration: number = 30 * 60 * 1000
  static readonly formConfigAbility: string = 'FormExtensionAbility'
}
