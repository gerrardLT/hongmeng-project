/**
 * CultureBox 服务卡片 ArkUI 布局
 *
 * 本文件为鸿蒙原生 ArkTS/ETS 语法，用于定义负一屏服务卡片的 UI 布局。
 * 支持两种卡片尺寸：
 * - 2x2（标准服务卡片格子）：展示本月统计概览（读书、观影、播客、展览）
 * - 4x2（宽卡片）：扩展展示最近在读/在看的 3 个条目
 *
 * 注意：此文件仅在鸿蒙端编译，不参与 H5/小程序/App 等其他端的构建。
 */

import { formBindingData } from '@kit.FormKit'
import { BusinessError } from '@kit.BasicServicesKit'

/**
 * 主题色常量（琥珀金）
 */
const THEME_COLOR: string = '#8B6914'
const THEME_COLOR_LIGHT: string = '#FFF8E7'
const THEME_COLOR_SHADOW: string = 'rgba(139, 105, 20, 0.12)'

/**
 * 卡片数据模型
 * 与 UTS 层的 WidgetData 保持一致
 */
interface WidgetDataModel {
  monthBooks: number
  monthMovies: number
  monthPodcasts: number
  monthExhibitions: number
  recentItems: Array<{ title: string; subtitle: string; type: string }>
  dimension: string
}

/**
 * 默认数据（卡片加载中或数据异常时展示）
 */
const DEFAULT_DATA: WidgetDataModel = {
  monthBooks: 0,
  monthMovies: 0,
  monthPodcasts: 0,
  monthExhibitions: 0,
  recentItems: [],
  dimension: '2*2'
}

// ============================================
// 卡片入口组件
// ============================================

@Entry
@Component
struct CultureBoxCard {
  // 卡片展示数据，通过 formBindingData 从 UTS 层注入
  @State widgetData: WidgetDataModel = DEFAULT_DATA

  /**
   * 组件挂载时读取绑定数据
   */
  aboutToAppear(): void {
    // 尝试从 formBindingData 获取初始数据
    try {
      const data = formBindingData.getFormBindingData() as WidgetDataModel
      if (data && data.monthBooks !== undefined) {
        this.widgetData = data
      }
    } catch (e) {
      console.error('[CultureBoxCard] failed to load binding data:', JSON.stringify(e))
    }
  }

  /**
   * 获取类型中文名
   */
  private getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      'book': '书',
      'movie': '影',
      'podcast': '播',
      'exhibition': '展'
    }
    return map[type] || '文'
  }

  /**
   * 构建 2x2 尺寸卡片 UI（本月统计概览）
   */
  @Builder
  buildTwoByTwo() {
    Column() {
      // ---------------- 顶部：图标 + 应用名 ----------------
      Row() {
        // 应用图标（圆形 36vp，主题色背景）
        Stack() {
          Text('文')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .fontColor('#FFFFFF')
        }
        .width(36)
        .height(36)
        .borderRadius(18)
        .backgroundColor(THEME_COLOR)
        .shadow({
          radius: 4,
          color: THEME_COLOR_SHADOW,
          offsetX: 0,
          offsetY: 2
        })

        // 应用名称
        Text('CultureBox')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor('#2D3436')
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .margin({ left: 8 })
          .layoutWeight(1)
      }
      .width('100%')
      .height(44)
      .alignItems(VerticalAlign.Center)

      // ---------------- 中间：本月统计 ----------------
      Row() {
        // 读书
        Column() {
          Text(`${this.widgetData.monthBooks}`)
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
            .fontColor(THEME_COLOR)
          Text('读书')
            .fontSize(10)
            .fontColor('#636E72')
            .margin({ top: 2 })
        }
        .layoutWeight(1)
        .alignItems(HorizontalAlign.Center)

        // 观影
        Column() {
          Text(`${this.widgetData.monthMovies}`)
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
            .fontColor(THEME_COLOR)
          Text('观影')
            .fontSize(10)
            .fontColor('#636E72')
            .margin({ top: 2 })
        }
        .layoutWeight(1)
        .alignItems(HorizontalAlign.Center)

        // 播客
        Column() {
          Text(`${this.widgetData.monthPodcasts}`)
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
            .fontColor(THEME_COLOR)
          Text('播客')
            .fontSize(10)
            .fontColor('#636E72')
            .margin({ top: 2 })
        }
        .layoutWeight(1)
        .alignItems(HorizontalAlign.Center)

        // 展览
        Column() {
          Text(`${this.widgetData.monthExhibitions}`)
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
            .fontColor(THEME_COLOR)
          Text('展览')
            .fontSize(10)
            .fontColor('#636E72')
            .margin({ top: 2 })
        }
        .layoutWeight(1)
        .alignItems(HorizontalAlign.Center)
      }
      .width('100%')
      .height(56)
      .alignItems(VerticalAlign.Center)
      .margin({ top: 4, bottom: 4 })

      // ---------------- 底部：本月总计 ----------------
      Text(`本月共记录 ${this.widgetData.monthBooks + this.widgetData.monthMovies + this.widgetData.monthPodcasts + this.widgetData.monthExhibitions} 条`)
        .fontSize(11)
        .fontColor('#B2BEC3')
        .maxLines(1)
        .textOverflow({ overflow: TextOverflow.Ellipsis })
        .width('100%')
        .textAlign(TextAlign.Center)
    }
    .width('100%')
    .height('100%')
    .padding(12)
    .justifyContent(FlexAlign.SpaceBetween)
  }

  /**
   * 构建 4x2 尺寸卡片 UI（最近在读/在看）
   */
  @Builder
  buildFourByTwo() {
    Column() {
      // ---------------- 第一行：图标 + 应用名 + 本月总计 ----------------
      Row() {
        Row() {
          // 应用图标
          Stack() {
            Text('文')
              .fontSize(16)
              .fontWeight(FontWeight.Bold)
              .fontColor('#FFFFFF')
          }
          .width(32)
          .height(32)
          .borderRadius(16)
          .backgroundColor(THEME_COLOR)

          Text('CultureBox')
            .fontSize(15)
            .fontWeight(FontWeight.Bold)
            .fontColor('#2D3436')
            .margin({ left: 8 })
        }
        .layoutWeight(1)
        .alignItems(VerticalAlign.Center)

        // 本月总计标签
        Text(`本月 ${this.widgetData.monthBooks + this.widgetData.monthMovies + this.widgetData.monthPodcasts + this.widgetData.monthExhibitions} 条`)
          .fontSize(11)
          .fontColor(THEME_COLOR)
          .fontWeight(FontWeight.Medium)
          .backgroundColor(THEME_COLOR_LIGHT)
          .borderRadius(10)
          .padding({ left: 8, right: 8, top: 3, bottom: 3 })
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
      }
      .width('100%')
      .height(36)
      .alignItems(VerticalAlign.Center)

      // ---------------- 第二行：最近在读/在看的条目 ----------------
      Column() {
        if (this.widgetData.recentItems && this.widgetData.recentItems.length > 0) {
          ForEach(this.widgetData.recentItems, (item: { title: string; subtitle: string; type: string }, index: number) => {
            Row() {
              // 类型标签
              Stack() {
                Text(this.getTypeLabel(item.type))
                  .fontSize(10)
                  .fontWeight(FontWeight.Medium)
                  .fontColor('#FFFFFF')
              }
              .width(22)
              .height(22)
              .borderRadius(11)
              .backgroundColor(THEME_COLOR)

              // 标题 + 副标题
              Column() {
                Text(item.title || '未知条目')
                  .fontSize(13)
                  .fontColor('#2D3436')
                  .fontWeight(FontWeight.Medium)
                  .maxLines(1)
                  .textOverflow({ overflow: TextOverflow.Ellipsis })
                  .width('100%')

                if (item.subtitle) {
                  Text(item.subtitle)
                    .fontSize(10)
                    .fontColor('#B2BEC3')
                    .maxLines(1)
                    .textOverflow({ overflow: TextOverflow.Ellipsis })
                    .width('100%')
                    .margin({ top: 2 })
                }
              }
              .layoutWeight(1)
              .margin({ left: 10 })
              .alignItems(HorizontalAlign.Start)
            }
            .width('100%')
            .height(40)
            .alignItems(VerticalAlign.Center)
            .margin({ top: index > 0 ? 4 : 0 })
          }, (item: { title: string; subtitle: string; type: string }) => item.title + item.type)
        } else {
          // 无数据时展示提示
          Text('暂无记录，快去添加吧')
            .fontSize(12)
            .fontColor('#B2BEC3')
            .width('100%')
            .textAlign(TextAlign.Center)
        }
      }
      .width('100%')
      .layoutWeight(1)
      .justifyContent(FlexAlign.Center)

      // ---------------- 底部：快捷按钮 ----------------
      Button('记一笔')
        .fontSize(13)
        .fontWeight(FontWeight.Medium)
        .fontColor('#FFFFFF')
        .backgroundColor(THEME_COLOR)
        .borderRadius(16)
        .height(32)
        .width('100%')
        .onClick(() => {
          this.handleQuickAction('addEntry')
        })
    }
    .width('100%')
    .height('100%')
    .padding(14)
    .justifyContent(FlexAlign.SpaceBetween)
  }

  /**
   * 构建卡片 UI
   */
  build() {
    Column() {
      if (this.widgetData.dimension === '4*2') {
        this.buildFourByTwo()
      } else {
        this.buildTwoByTwo()
      }
    }
    .width('100%')
    .height('100%')
    .background(
      // 暖色调渐变背景
      new LinearGradient({
        angle: 135,
        colors: [
          { color: '#FFFFFF', offset: 0 },
          { color: '#FFFBF2', offset: 0.5 },
          { color: THEME_COLOR_LIGHT, offset: 1 }
        ]
      })
    )
    .borderRadius(20)
    .shadow({
      radius: 8,
      color: THEME_COLOR_SHADOW,
      offsetX: 0,
      offsetY: 2
    })
    // 点击事件：跳转 App
    .onClick(() => {
      this.handleCardClick()
    })
  }

  /**
   * 处理卡片点击：唤起 CultureBox App
   */
  private handleCardClick(): void {
    console.log('[CultureBoxCard] card clicked')

    // 通过 postCardAction 向 FormExtensionAbility 发送消息
    // 由 UTS 层的 onWidgetClick 处理实际的跳转逻辑
    postCardAction(this, {
      action: 'router',
      abilityName: 'EntryAbility',
      params: {
        fromWidget: true,
        targetPage: 'pages/index/index'
      }
    })
  }

  /**
   * 处理快捷操作：唤起 App 并执行特定操作
   * @param action 快捷操作标识
   */
  private handleQuickAction(action: string): void {
    console.log('[CultureBoxCard] quick action:', action)

    postCardAction(this, {
      action: 'router',
      abilityName: 'EntryAbility',
      params: {
        fromWidget: true,
        targetPage: 'pages/entry/create',
        quickAction: action
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
export default class CultureBoxCardConfig {
  // 卡片名称
  static readonly cardName: string = 'CultureBoxCard'
  // 卡片显示名
  static readonly displayName: string = 'CultureBox 文化记录卡片'
  // 卡片描述
  static readonly description: string = '展示本月文化消费统计和最近在读/在看的条目'
  // 支持的尺寸
  static readonly supportDimensions: string[] = ['2*2', '4*2']
  // 默认尺寸
  static readonly defaultDimension: string = '2*2'
  // 是否支持卡片数据周期性更新
  static readonly updateEnabled: boolean = true
  // 卡片数据更新周期（毫秒），30 分钟
  static readonly updateDuration: number = 30 * 60 * 1000
  // 卡片关联的 FormExtensionAbility 名称
  static readonly formConfigAbility: string = 'FormExtensionAbility'
}
