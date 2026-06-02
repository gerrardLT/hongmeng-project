# ColorAid 服务卡片（鸿蒙负一屏）

## 插件说明

`coloraid-widget` 是 ColorAid 应用的鸿蒙负一屏服务卡片插件，基于 UniApp UTS 插件机制开发。

支持两种卡片尺寸：
- **2x2**：快速展示当前滤镜模式和一键开启按钮
- **4x2**：扩展展示最近识别的 3 个颜色、增强强度等详细信息

展示内容：
- 应用图标 + "ColorAid" 品牌标识
- 当前滤镜模式名称及增强强度
- "一键开启滤镜"快捷操作按钮
- 最近识别的 3 个颜色（4x2 尺寸）

## 目录结构

```
src/uni_modules/coloraid-widget/
├── package.json                          # 插件配置
├── readme.md                             # 本文件
└── utssdk/
    └── app-harmony/
        ├── index.uts                     # UTS 插件主入口（数据接口）
        └── widget/
            └── ColorAidCard.ets          # ArkUI 卡片布局（鸿蒙原生）
```

## 使用方法

### 1. App 端刷新卡片数据

在业务代码中引入并调用 `refreshWidget`：

```typescript
import { refreshWidget } from '@/services/widget'

// 颜色识别完成后
refreshWidget()

// 切换滤镜模式后
refreshWidget()

// 修改设置后
refreshWidget()
```

### 2. 卡片数据读取

UTS 插件会自动从 App 本地存储中读取以下数据：

| 字段 | 数据来源 | 说明 |
|------|---------|------|
| `filterMode` | `coloraid_settings` | 当前启用的滤镜模式 |
| `filterStrength` | `coloraid_settings` | 当前增强强度（1-10）|
| `recentColors` | `color_histories` | 最近识别的 3 个颜色 |
| `colorBlindType` | `coloraid_settings` | 用户设置的色盲类型 |

### 3. 卡片点击跳转

用户点击卡片或"一键开启滤镜"按钮后，通过鸿蒙 `postCardAction` 发送消息，由 `EntryAbility` 接收并打开 App 实时滤镜页面。

### 4. 快捷操作

4x2 卡片支持快捷操作区域，点击可触发不同的滤镜行为。

## 鸿蒙端配置要求

### manifest.json

确保已开启鸿蒙支持：

```json
{
  "app-harmony": {
    "enable": true,
    "debug": true
  }
}
```

### 模块配置

插件 `package.json` 中已声明 `formAbility: true`，UniApp 编译鸿蒙端时会自动生成 `FormExtensionAbility` 相关配置。

### 真机测试步骤

1. 使用 DevEco Studio 打开鸿蒙工程
2. 在 `module.json5` 中确认 `FormExtensionAbility` 已注册
3. 在真机负一屏长按空白处 -> 添加服务卡片 -> 选择 ColorAid
4. 选择 2x2 或 4x2 尺寸
5. 确保 App 已启动并有过颜色识别记录

## 卡片数据更新时机

以下业务操作完成后，应调用 `refreshWidget()` 同步最新数据到负一屏：

| 业务操作 | 文件位置 | 调用位置 |
|---------|---------|---------|
| 颜色识别完成 | `src/pages/identify/index.vue` | 识别结果保存后 |
| 切换滤镜模式 | `src/pages/filter/index.vue` | 模式切换回调 |
| 修改增强强度 | `src/pages/settings/index.vue` | 设置保存后 |
| 石原图测试完成 | `src/pages/test/result.vue` | 结果保存后 |

## 数据流程说明

```
App 业务层
    │
    ▼
调用 refreshWidget()
    │
    ▼
widget.ts (buildWidgetData)
    │  读取 coloraid_settings
    │  读取 color_histories
    ▼
UTS 插件 updateWidget(data)
    │
    ▼
formBindingData.createFormBindingData(data)
    │
    ▼
ArkUI 卡片 ColorAidCard.ets
    │  解析绑定数据
    │  根据 dimension 渲染 2x2 或 4x2 布局
    ▼
鸿蒙负一屏展示
```

## 注意事项

1. **条件编译**：所有鸿蒙专属代码均使用 `#ifdef APP-HARMONY` / `#ifndef APP-HARMONY` 包裹，确保跨平台编译无报错。
2. **模拟实现**：由于服务卡片依赖鸿蒙原生能力（FormManager、Want 等），UTS 插件中的部分接口为模拟实现，真机集成时需要根据实际 SDK 调整。
3. **颜色数据**：卡片中展示的颜色 hex 值需要确保格式正确（如 `#FF5733`）。
4. **数据一致性**：卡片数据从 App 本地存储读取，App 启动时应确保设置和历史记录已加载到 storage。
5. **多尺寸适配**：同一套数据模型驱动两种尺寸布局，ArkUI 层根据 `dimension` 字段判断渲染内容。

## 版本记录

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-04-22 | 初始版本，支持 2x2 和 4x2 服务卡片 |
