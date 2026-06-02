# CultureBox 服务卡片（鸿蒙负一屏）

## 插件说明

`culturebox-widget` 是 CultureBox 应用的鸿蒙负一屏服务卡片插件，基于 UniApp UTS 插件机制开发。

支持两种卡片尺寸：
- **2x2**：展示本月统计概览（读书、观影、播客、展览数量）
- **4x2**：扩展展示最近在读/在看的条目名称

展示内容：
- 应用图标 + "CultureBox" 品牌标识
- 本月读书数、观影数、播客数、展览数
- 最近在读/在看的 3 个条目标题

## 目录结构

```
src/uni_modules/culturebox-widget/
├── package.json                          # 插件配置
├── readme.md                             # 本文件
└── utssdk/
    └── app-harmony/
        ├── index.uts                     # UTS 插件主入口（数据接口）
        └── widget/
            └── CultureBoxCard.ets        # ArkUI 卡片布局（鸿蒙原生）
```

## 使用方法

### 1. App 端刷新卡片数据

在业务代码中引入并调用 `refreshWidget`：

```typescript
import { refreshWidget } from '@/services/widget'

// 新增条目后
refreshWidget()

// 编辑条目后
refreshWidget()

// 删除条目后
refreshWidget()
```

### 2. 卡片数据读取

UTS 插件会自动从 App 本地存储中读取以下数据：

| 字段 | 数据来源 | 说明 |
|------|---------|------|
| `monthBooks` | `entries` | 本月读书数量 |
| `monthMovies` | `entries` | 本月观影数量 |
| `monthPodcasts` | `entries` | 本月播客数量 |
| `monthExhibitions` | `entries` | 本月展览数量 |
| `recentItems` | `entries` | 最近在读/在看的 3 个条目 |

### 3. 卡片点击跳转

用户点击卡片后，通过鸿蒙 `postCardAction` 发送消息，由 `EntryAbility` 接收并打开 App 首页。

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
3. 在真机负一屏长按空白处 -> 添加服务卡片 -> 选择 CultureBox
4. 选择 2x2 或 4x2 尺寸
5. 确保 App 已启动并有文化条目记录

## 卡片数据更新时机

以下业务操作完成后，应调用 `refreshWidget()` 同步最新数据到负一屏：

| 业务操作 | 文件位置 | 调用位置 |
|---------|---------|---------|
| 新增条目 | `src/pages/entry/create.vue` | 保存成功后 |
| 编辑条目 | `src/pages/entry/edit.vue` | 保存成功后 |
| 删除条目 | `src/pages/entry/detail.vue` | 删除确认后 |

## 数据流程说明

```
App 业务层
    │
    ▼
调用 refreshWidget()
    │
    ▼
widget.ts (buildWidgetData)
    │  读取 entries
    ▼
UTS 插件 updateWidget(data)
    │
    ▼
formBindingData.createFormBindingData(data)
    │
    ▼
ArkUI 卡片 CultureBoxCard.ets
    │  解析绑定数据
    │  根据 dimension 渲染 2x2 或 4x2 布局
    ▼
鸿蒙负一屏展示
```

## 注意事项

1. **条件编译**：所有鸿蒙专属代码均使用 `#ifdef APP-HARMONY` / `#ifndef APP-HARMONY` 包裹，确保跨平台编译无报错。
2. **模拟实现**：由于服务卡片依赖鸿蒙原生能力（FormManager、Want 等），UTS 插件中的部分接口为模拟实现，真机集成时需要根据实际 SDK 调整。
3. **数据一致性**：卡片数据从 App 本地存储读取，App 启动时应确保条目数据已加载到 storage。
4. **多尺寸适配**：同一套数据模型驱动两种尺寸布局，ArkUI 层根据 `dimension` 字段判断渲染内容。
5. **暖色调主题**：卡片 UI 使用琥珀金（#8B6914）作为主题色，与 CultureBox 应用风格保持一致。

## 版本记录

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-04-23 | 初始版本，支持 2x2 和 4x2 服务卡片 |
