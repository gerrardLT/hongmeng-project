/**
 * ColorAid 服务卡片 ArkUI 布局
 *
 * 本文件为鸿蒙原生 ArkTS/ETS 语法，用于定义负一屏服务卡片的 UI 布局。
 * 支持两种卡片尺寸：
 * - 2x2（标准服务卡片格子）：展示应用标识、当前模式和一键开启按钮
 * - 4x2（宽卡片）：扩展展示最近识别的 3 个颜色及增强强度
 *
 * 注意：此文件仅在鸿蒙端编译，不参与 H5/小程序/App 等其他端的构建。
 */

import { formBindingData } from '@kit.FormKit'
import { BusinessError } from '@kit.BasicServicesKit'

/**
 * 主题色常量
 */
const THEME_COLOR: string = '#5B6EF5'
const THEME_COLOR_LIGHT: string = '#EEF0FE'
const THEME_COLOR_SHADOW: string = 'rgba(91, 110, 245, 0.12)'

/**
 * 卡片数据模型
 * 与 UTS 层的 WidgetData 保持一致
 */
interface WidgetDataModel {
  filterMode: string
  filterStrength: number
  recentColors: Array<{ name: string; hex: string }>
  colorBlindType: string
  dimension: string
}

/**
 * 默认数据（卡片加载中或数据异常时展示）
 */
const DEFAULT_DATA: WidgetDataModel = {
  filterMode: '未开启',
  filterStrength: 5,
  recentColors: [],
  colorBlindType: '正常视觉',
  dimension: '2*2'
}

// ============================================
// 卡片入口组件
// ============================================

@Entry
@Component
struct ColorAidCard {
  // 卡片展示数据，通过 formBindingData 从 UTS 层注入
  @State widgetData: WidgetDataModel = DEFAULT_DATA

  /**
   * 组件挂载时读取绑定数据
   */
  aboutToAppear(): void {
    // 尝试从 formBindingData 获取初始数据
    try {
      const data = formBindingData.getFormBindingData() as WidgetDataModel
      if (data && data.filterMode) {
        this.widgetData = data
      }
    } catch (e) {
      console.error('[ColorAidCard] failed to load binding data:', JSON.stringify(e))
    }
  }

  /**
   * 构建 2x2 尺寸卡片 UI
   */
  @Builder
  buildTwoByTwo() {
    Column() {
      // ---------------- 顶部：图标 + 应用名 ----------------
      Row() {
        // 应用图标（圆形 40vp，主题色背景）
        Stack() {
          Image($r('app.media.coloraid_icon'))
            .width(28)
            .height(28)
            .objectFit(ImageFit.Cover)
            .fillColor('#FFFFFF')
        }
        .width(40)
        .height(40)
        .borderRadius(20)
        .backgroundColor(THEME_COLOR)
        .shadow({
          radius: 4,
          color: THEME_COLOR_SHADOW,
          offsetX: 0,
          offsetY: 2
        })

        // 应用名称
        Text('ColorAid')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#2D3436')
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .margin({ left: 10 })
          .layoutWeight(1)
      }
      .width('100%')
      .height(48)
      .alignItems(VerticalAlign.Center)

      // ---------------- 中间：一键开启滤镜按钮 ----------------
      Button('一键开启滤镜')
        .fontSize(14)
        .fontWeight(FontWeight.Medium)
        .fontColor('#FFFFFF')
        .backgroundColor(THEME_COLOR)
        .borderRadius(18)
        .height(36)
        .width('100%')
        .margin({ top: 8, bottom: 8 })
        .onClick(() => {
          this.handleQuickAction('toggleFilter')
        })

      // ---------------- 底部：当前滤镜模式 ----------------
      Text(`${this.widgetData.filterMode} · 强度${this.widgetData.filterStrength}`)
        .fontSize(12)
        .fontColor('#636E72')
        .maxLines(1)
        .textOverflow({ overflow: TextOverflow.Ellipsis })
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
   */
  @Builder
  buildFourByTwo() {
    Column() {
      // ---------------- 第一行：图标 + 应用名 + 当前模式标签 ----------------
      Row() {
        Row() {
          // 应用图标
          Stack() {
            Image($r('app.media.coloraid_icon'))
              .width(22)
              .height(22)
              .objectFit(ImageFit.Cover)
              .fillColor('#FFFFFF')
          }
          .width(34)
          .height(34)
          .borderRadius(17)
          .backgroundColor(THEME_COLOR)

          Text('ColorAid')
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
            .fontColor('#2D3436')
            .margin({ left: 8 })
        }
        .layoutWeight(1)
        .alignItems(VerticalAlign.Center)

        // 当前模式标签
        Text(`${this.widgetData.filterMode}`)
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
      .height(38)
      .alignItems(VerticalAlign.Center)

      // ---------------- 第二行：最近识别的 3 个颜色 ----------------
      Row() {
        if (this.widgetData.recentColors && this.widgetData.recentColors.length > 0) {
          ForEach(this.widgetData.recentColors, (item: { name: string; hex: string }, index: number) => {
            Column() {
              // 颜色圆点
              Stack() {
                Circle({ width: 18, height: 18 })
                  .fill(item.hex || '#CCCCCC')
                  .stroke('#FFFFFF')
                  .strokeWidth(2)
                  .shadow({
                    radius: 2,
                    color: 'rgba(0,0,0,0.1)',
                    offsetX: 0,
                    offsetY: 1
                  })
              }
              .width(22)
              .height(22)

              // 颜色名称
              Text(item.name || '未知')
                .fontSize(10)
                .fontColor('#636E72')
                .maxLines(1)
                .textOverflow({ overflow: TextOverflow.Ellipsis })
                .margin({ top: 4 })
                .width(60)
                .textAlign(TextAlign.Center)
            }
            .layoutWeight(1)
            .alignItems(HorizontalAlign.Center)
          }, (item: { name: string; hex: string }) => item.hex + item.name)
        } else {
          // 无颜色数据时展示提示
          Text('暂无识别记录')
            .fontSize(12)
            .fontColor('#B2BEC3')
            .width('100%')
            .textAlign(TextAlign.Center)
        }
      }
      .width('100%')
      .height(50)
      .alignItems(VerticalAlign.Center)
      .margin({ top: 4, bottom: 4 })

      // ---------------- 第三行：一键开启按钮 + 强度信息 ----------------
      Row() {
        Button('一键开启滤镜')
          .fontSize(13)
          .fontWeight(FontWeight.Medium)
          .fontColor('#FFFFFF')
          .backgroundColor(THEME_COLOR)
          .borderRadius(16)
          .height(32)
          .layoutWeight(1)
          .onClick(() => {
            this.handleQuickAction('toggleFilter')
          })

        Text(`强度 ${this.widgetData.filterStrength}`)
          .fontSize(11)
          .fontColor('#B2BEC3')
          .margin({ left: 10 })
          .width(48)
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
      // 浅紫蓝渐变背景
      new LinearGradient({
        angle: 135,
        colors: [
          { color: '#FFFFFF', offset: 0 },
          { color: '#F8F9FE', offset: 0.5 },
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
   * 处理卡片点击：唤起 ColorAid App
   */
  private handleCardClick(): void {
    console.log('[ColorAidCard] card clicked')

    // 通过 postCardAction 向 FormExtensionAbility 发送消息
    // 由 UTS 层的 onWidgetClick 处理实际的跳转逻辑
    postCardAction(this, {
      action: 'router',
      abilityName: 'EntryAbility',
      params: {
        fromWidget: true,
        targetPage: 'pages/filter/index',
        filterMode: this.widgetData.filterMode,
        autoStartFilter: true
      }
    })
  }

  /**
   * 处理快捷操作：唤起 App 并执行特定操作
   * @param action 快捷操作标识
   */
  private handleQuickAction(action: string): void {
    console.log('[ColorAidCard] quick action:', action)

    postCardAction(this, {
      action: 'router',
      abilityName: 'EntryAbility',
      params: {
        fromWidget: true,
        targetPage: 'pages/filter/index',
        quickAction: action,
        autoStartFilter: action === 'toggleFilter',
        filterMode: this.widgetData.filterMode
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
export default class ColorAidCardConfig {
  // 卡片名称
  static readonly cardName: string = 'ColorAidCard'
  // 卡片显示名
  static readonly displayName: string = 'ColorAid 滤镜卡片'
  // 卡片描述
  static readonly description: string = '展示当前滤镜模式、最近识别颜色和快捷操作'
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
