# PatternCraft 服务卡片（鸿蒙负一屏）

## 插件说明

`patterncraft-widget` 是 PatternCraft 中式纹样设计工具的鸿蒙负一屏服务卡片插件，基于 UniApp UTS 插件机制开发。

支持两种卡片尺寸：
- **2x2（每日纹样卡片）**：展示每日推荐纹样缩略色块、纹样名称和 PatternCraft 品牌标识
- **4x2（快捷设计卡片）**：展示每日纹样 + 最近使用的 3 个纹样缩略 + "快速设计"按钮

展示内容：
- 应用图标 + "PatternCraft" 品牌标识
- 每日推荐纹样名称及缩略预览
- "快速设计"快捷操作按钮
- 最近使用的 3 个纹样缩略（4x2 尺寸）

## 目录结构

```
src/uni_modules/patterncraft-widget/
├── package.json                          # 插件配置
├── readme.md                             # 本文件
└── utssdk/
    └── app-harmony/
        ├── index.uts                     # UTS 插件主入口（数据接口）
        └── widget/
            └── PatternCraftCard.ets      # ArkUI 卡片布局（鸿蒙原生）
```

## 使用方法

### 1. App 端刷新卡片数据

在业务代码中引入并调用 `refreshWidget`：

```typescript
import { refreshWidget } from '@/services/widget'

// 收藏纹样后
refreshWidget()

// 完成作品后
refreshWidget()

// 每日自动更新
refreshWidget()
```

### 2. 卡片数据读取

UTS 插件会自动从 App 本地存储中读取以下数据：

| 字段 | 数据来源 | 说明 |
|------|---------|------|
| `dailyPatternName` | `patterncraft_daily` | 每日推荐纹样名称 |
| `dailyPatternPreview` | `patterncraft_daily` | 每日推荐纹样缩略预览色值 |
| `recentPatterns` | `patterncraft_recent` | 最近使用的 3 个纹样 |
| `totalWorks` | `patterncraft_stats` | 用户累计创作数量 |

### 3. 卡片点击跳转

用户点击卡片或"快速设计"按钮后，通过鸿蒙 `postCardAction` 发送消息，由 `EntryAbility` 接收并打开 App 纹样创作页面。

### 4. 快捷操作

4x2 卡片支持快捷操作区域，点击"快速设计"按钮可直接跳转至纹样创作页面。

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
3. 在真机负一屏长按空白处 -> 添加服务卡片 -> 选择 PatternCraft
4. 选择 2x2（每日纹样）或 4x2（快捷设计）尺寸
5. 确保 App 已启动并有过纹样创作记录

## 卡片数据更新时机

以下业务操作完成后，应调用 `refreshWidget()` 同步最新数据到负一屏：

| 业务操作 | 文件位置 | 调用位置 |
|---------|---------|---------|
| 收藏纹样 | `src/pages/gallery/index.vue` | 收藏操作完成后 |
| 完成作品 | `src/pages/editor/index.vue` | 作品保存后 |
| 每日更新 | `src/App.vue` | 应用启动时检查日期 |
| 浏览素材库 | `src/pages/library/index.vue` | 使用素材后 |

## 数据流程说明

```
App 业务层
    │
    ▼
调用 refreshWidget()
    │
    ▼
widget.ts (buildWidgetData)
    │  读取 patterncraft_daily
    │  读取 patterncraft_recent
    │  读取 patterncraft_stats
    ▼
UTS 插件 updateWidget(data)
    │
    ▼
formBindingData.createFormBindingData(data)
    │
    ▼
ArkUI 卡片 PatternCraftCard.ets
    │  解析绑定数据
    │  根据 dimension 渲染 2x2 或 4x2 布局
    ▼
鸿蒙负一屏展示
```

## 注意事项

1. **条件编译**：所有鸿蒙专属代码均使用 `#ifdef APP-HARMONY` / `#ifndef APP-HARMONY` 包裹，确保跨平台编译无报错。
2. **模拟实现**：由于服务卡片依赖鸿蒙原生能力（FormManager、Want 等），UTS 插件中的部分接口为模拟实现，真机集成时需要根据实际 SDK 调整。
3. **中式风格**：卡片采用故宫红（#C41A16）和金色（#D4A843）为主题色，展示中式纹样的文化特色。
4. **数据一致性**：卡片数据从 App 本地存储读取，App 启动时应确保纹样数据和创作记录已加载到 storage。
5. **多尺寸适配**：同一套数据模型驱动两种尺寸布局，ArkUI 层根据 `dimension` 字段判断渲染内容。

## 版本记录

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-04-26 | 初始版本，支持 2x2 每日纹样和 4x2 快捷设计服务卡片 |
