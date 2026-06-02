/**
 * PatternCraft 服务卡片 ArkUI 布局
 *
 * 本文件为鸿蒙原生 ArkTS/ETS 语法，用于定义负一屏服务卡片的 UI 布局。
 * 支持两种卡片尺寸：
 * - 2x2（标准服务卡片格子）：展示每日纹样色块 + 纹样名称 + 品牌标识
 * - 4x2（宽卡片）：展示每日纹样 + 最近使用的3个纹样色块 + "快速设计"按钮
 *
 * 中式配色：故宫红 #C41A16、金色 #D4A843、宣纸白 #FFF8F0
 *
 * 注意：此文件仅在鸿蒙端编译，不参与 H5/小程序/App 等其他端的构建。
 */

import { formBindingData } from '@kit.FormKit'
import { BusinessError } from '@kit.BasicServicesKit'

/**
 * 中式主题色常量
 */
const FORBIDDEN_RED: string = '#C41A16'
const IMPERIAL_GOLD: string = '#D4A843'
const XUAN_PAPER_WHITE: string = '#FFF8F0'
const FORBIDDEN_RED_LIGHT: string = 'rgba(196, 26, 22, 0.08)'
const FORBIDDEN_RED_SHADOW: string = 'rgba(196, 26, 22, 0.12)'
const GOLD_SHADOW: string = 'rgba(212, 168, 67, 0.15)'

/**
 * 卡片数据模型
 * 与 UTS 层的 WidgetData 保持一致
 */
interface WidgetDataModel {
  dailyPatternName: string
  dailyPatternColors: Array<string>
  recentPatterns: Array<{ name: string; color: string }>
  dimension: string
}

/**
 * 默认数据（卡片加载中或数据异常时展示）
 */
const DEFAULT_DATA: WidgetDataModel = {
  dailyPatternName: '回纹',
  dailyPatternColors: [FORBIDDEN_RED, IMPERIAL_GOLD],
  recentPatterns: [],
  dimension: '2*2'
}

// ============================================
// 卡片入口组件
// ============================================

@Entry
@Component
struct PatternCraftCard {
  // 卡片展示数据，通过 formBindingData 从 UTS 层注入
  @State widgetData: WidgetDataModel = DEFAULT_DATA

  /**
   * 组件挂载时读取绑定数据
   */
  aboutToAppear(): void {
    try {
      const data = formBindingData.getFormBindingData() as WidgetDataModel
      if (data && data.dailyPatternName) {
        this.widgetData = data
      }
    } catch (e) {
      console.error('[PatternCraftCard] failed to load binding data:', JSON.stringify(e))
    }
  }

  /**
   * 构建 2x2 尺寸卡片 UI
   * 展示：每日纹样色块（故宫红/金色渐变） + 纹样名称 + 品牌标识
   */
  @Builder
  buildTwoByTwo() {
    Column() {
      // ---------------- 顶部：品牌标识 ----------------
      Row() {
        // 品牌图标（圆形，故宫红背景）
        Stack() {
          Image($r('app.media.patterncraft_icon'))
            .width(24)
            .height(24)
            .objectFit(ImageFit.Cover)
            .fillColor(IMPERIAL_GOLD)
        }
        .width(36)
        .height(36)
        .borderRadius(18)
        .backgroundColor(FORBIDDEN_RED)
        .shadow({
          radius: 4,
          color: FORBIDDEN_RED_SHADOW,
          offsetX: 0,
          offsetY: 2
        })

        Text('PatternCraft')
          .fontSize(15)
          .fontWeight(FontWeight.Bold)
          .fontColor('#2D3436')
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .margin({ left: 8 })
          .layoutWeight(1)
      }
      .width('100%')
      .height(42)
      .alignItems(VerticalAlign.Center)

      // ---------------- 中间：每日纹样渐变色块 ----------------
      Stack() {
        Column() {
          Text(this.widgetData.dailyPatternName)
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
            .fontColor(XUAN_PAPER_WHITE)
            .maxLines(1)
            .textOverflow({ overflow: TextOverflow.Ellipsis })

          Text('每日纹样')
            .fontSize(11)
            .fontColor('rgba(255, 248, 240, 0.8)')
            .margin({ top: 4 })
        }
        .alignItems(HorizontalAlign.Center)
        .justifyContent(FlexAlign.Center)
      }
      .width('100%')
      .layoutWeight(1)
      .borderRadius(12)
      .background(
        new LinearGradient({
          angle: 135,
          colors: [
            { color: FORBIDDEN_RED, offset: 0 },
            { color: IMPERIAL_GOLD, offset: 1 }
          ]
        })
      )
      .shadow({
        radius: 6,
        color: GOLD_SHADOW,
        offsetX: 0,
        offsetY: 3
      })
      .margin({ top: 6, bottom: 6 })

      // ---------------- 底部：品牌标识文字 ----------------
      Text('中式纹样设计')
        .fontSize(11)
        .fontColor('#999')
        .width('100%')
        .textAlign(TextAlign.Center)
    }
    .width('100%')
    .height('100%')
    .padding(14)
    .justifyContent(FlexAlign.SpaceBetween)
  }

  /**
   * 构建 4x2 尺寸卡片 UI
   * 展示：每日纹样 + 最近使用的3个纹样色块 + "快速设计"按钮
   */
  @Builder
  buildFourByTwo() {
    Column() {
      // ---------------- 第一行：品牌标识 + 每日纹样标签 ----------------
      Row() {
        Row() {
          // 品牌图标
          Stack() {
            Image($r('app.media.patterncraft_icon'))
              .width(20)
              .height(20)
              .objectFit(ImageFit.Cover)
              .fillColor(IMPERIAL_GOLD)
          }
          .width(32)
          .height(32)
          .borderRadius(16)
          .backgroundColor(FORBIDDEN_RED)

          Text('PatternCraft')
            .fontSize(15)
            .fontWeight(FontWeight.Bold)
            .fontColor('#2D3436')
            .margin({ left: 8 })
        }
        .layoutWeight(1)
        .alignItems(VerticalAlign.Center)

        // 每日纹样名称标签
        Text(this.widgetData.dailyPatternName)
          .fontSize(11)
          .fontColor(FORBIDDEN_RED)
          .fontWeight(FontWeight.Medium)
          .backgroundColor(FORBIDDEN_RED_LIGHT)
          .borderRadius(10)
          .padding({ left: 8, right: 8, top: 3, bottom: 3 })
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
      }
      .width('100%')
      .height(36)
      .alignItems(VerticalAlign.Center)

      // ---------------- 第二行：每日纹样色块 + 最近使用的3个纹样 ----------------
      Row() {
        // 每日纹样大色块
        Stack() {
          Text(this.widgetData.dailyPatternName)
            .fontSize(12)
            .fontWeight(FontWeight.Bold)
            .fontColor(XUAN_PAPER_WHITE)
        }
        .width(60)
        .height(50)
        .borderRadius(10)
        .background(
          new LinearGradient({
            angle: 135,
            colors: [
              { color: FORBIDDEN_RED, offset: 0 },
              { color: IMPERIAL_GOLD, offset: 1 }
            ]
          })
        )
        .shadow({
          radius: 4,
          color: GOLD_SHADOW,
          offsetX: 0,
          offsetY: 2
        })

        // 最近使用的纹样色块
        if (this.widgetData.recentPatterns && this.widgetData.recentPatterns.length > 0) {
          ForEach(this.widgetData.recentPatterns, (item: { name: string; color: string }, index: number) => {
            Column() {
              // 纹样色块圆点
              Stack() {
                Circle({ width: 20, height: 20 })
                  .fill(item.color || '#CCCCCC')
                  .stroke(XUAN_PAPER_WHITE)
                  .strokeWidth(2)
                  .shadow({
                    radius: 2,
                    color: 'rgba(0,0,0,0.1)',
                    offsetX: 0,
                    offsetY: 1
                  })
              }
              .width(24)
              .height(24)

              // 纹样名称
              Text(item.name || '未知')
                .fontSize(10)
                .fontColor('#636E72')
                .maxLines(1)
                .textOverflow({ overflow: TextOverflow.Ellipsis })
                .margin({ top: 4 })
                .width(54)
                .textAlign(TextAlign.Center)
            }
            .layoutWeight(1)
            .alignItems(HorizontalAlign.Center)
          }, (item: { name: string; color: string }) => item.color + item.name)
        } else {
          // 无纹样数据时展示提示
          Text('暂无最近使用')
            .fontSize(12)
            .fontColor('#B2BEC3')
            .layoutWeight(1)
            .textAlign(TextAlign.Center)
        }
      }
      .width('100%')
      .height(54)
      .alignItems(VerticalAlign.Center)
      .margin({ top: 4, bottom: 4 })

      // ---------------- 第三行：快速设计按钮 ----------------
      Row() {
        Button('快速设计')
          .fontSize(13)
          .fontWeight(FontWeight.Medium)
          .fontColor(XUAN_PAPER_WHITE)
          .backgroundColor(FORBIDDEN_RED)
          .borderRadius(16)
          .height(32)
          .layoutWeight(1)
          .onClick(() => {
            this.handleQuickAction('quickDesign')
          })

        Text('中式纹样')
          .fontSize(11)
          .fontColor('#B2BEC3')
          .margin({ left: 10 })
          .width(56)
          .textAlign(TextAlign.End)
      }
      .width('100%')
      .height(36)
      .alignItems(VerticalAlign.Center)
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
      // 宣纸白渐变背景
      new LinearGradient({
        angle: 135,
        colors: [
          { color: XUAN_PAPER_WHITE, offset: 0 },
          { color: '#FFFDF8', offset: 0.5 },
          { color: '#FFF5E6', offset: 1 }
        ]
      })
    )
    .borderRadius(20)
    .shadow({
      radius: 8,
      color: FORBIDDEN_RED_SHADOW,
      offsetX: 0,
      offsetY: 2
    })
    // 点击事件：跳转 App
    .onClick(() => {
      this.handleCardClick()
    })
  }

  /**
   * 处理卡片点击：唤起 PatternCraft App
   */
  private handleCardClick(): void {
    console.log('[PatternCraftCard] card clicked')

    postCardAction(this, {
      action: 'router',
      abilityName: 'EntryAbility',
      params: {
        fromWidget: true,
        targetPage: 'pages/create/index',
        patternName: this.widgetData.dailyPatternName
      }
    })
  }

  /**
   * 处理快捷操作：唤起 App 并执行特定操作
   * @param action 快捷操作标识
   */
  private handleQuickAction(action: string): void {
    console.log('[PatternCraftCard] quick action:', action)

    postCardAction(this, {
      action: 'router',
      abilityName: 'EntryAbility',
      params: {
        fromWidget: true,
        targetPage: 'pages/create/index',
        quickAction: action,
        patternName: this.widgetData.dailyPatternName
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
export default class PatternCraftCardConfig {
  // 卡片名称
  static readonly cardName: string = 'PatternCraftCard'
  // 卡片显示名
  static readonly displayName: string = 'PatternCraft 纹样卡片'
  // 卡片描述
  static readonly description: string = '展示每日纹样、最近使用纹样和快速设计入口'
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
