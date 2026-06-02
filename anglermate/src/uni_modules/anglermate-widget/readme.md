# AnglerMate 服务卡片（鸿蒙负一屏）

## 插件说明

`anglermate-widget` 是 AnglerMate 钓鱼天气钓点记录应用的鸿蒙负一屏服务卡片插件，基于 UniApp UTS 插件机制开发。

卡片尺寸：**2x2**

展示内容：
- 今日钓鱼指数（星级 + 温度 + 天气状况）
- 最近钓点名称及距离
- 快捷记录入口（跳转记录渔获页）

## 目录结构

```
src/uni_modules/anglermate-widget/
├── package.json                          # 插件配置
├── readme.md                             # 本文件
└── utssdk/
    └── app-harmony/
        ├── index.uts                     # UTS 插件主入口（数据接口）
        └── config.json                   # 鸿蒙卡片配置
```

## 使用方法

### 1. App 端刷新卡片数据

在业务代码中引入并调用对应的 widget 服务：

```typescript
import { updateWeatherWidget, updateSpotWidget } from '@/services/widget'

// 天气数据刷新后
updateWeatherWidget({ fishingIndex: 4, temperature: 22, condition: 'sunny' })

// 钓点信息变更后
updateSpotWidget({ spotName: '翠湖水库', latitude: 30.12, longitude: 120.35 })
```

### 2. 卡片数据读取

UTS 插件会自动从 App 本地存储中读取以下数据：

| 字段 | 数据来源 | 说明 |
|------|---------|------|
| `fishingIndex` | `anglermate_weather` | 当前钓鱼指数（1-5星） |
| `temperature` | `anglermate_weather` | 当前温度 |
| `condition` | `anglermate_weather` | 天气状况描述 |
| `nearestSpot` | `anglermate_spots` | 最近的钓点名称 |

### 3. 卡片点击跳转

- 点击卡片主体：通过 deeplink 打开 App 首页
- 点击快捷记录入口：通过 deeplink 跳转到记录渔获页 `/pages/catches/create`

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

## 卡片数据更新时机

以下业务操作完成后，应调用对应刷新方法同步最新数据到负一屏：

| 业务操作 | 调用方法 |
|---------|---------|
| 天气数据刷新 | `updateWeatherWidget()` |
| 钓点信息变更 | `updateSpotWidget()` |

## 注意事项

1. **条件编译**：所有鸿蒙专属代码均使用 `#ifdef APP-HARMONY` / `#ifndef APP-HARMONY` 包裹，确保跨平台编译无报错。
2. **模拟实现**：由于服务卡片依赖鸿蒙原生能力（FormManager、Want 等），UTS 插件中的部分接口为模拟实现，真机集成时需要根据实际 SDK 调整。
3. **数据一致性**：卡片数据从 App 本地存储读取，App 启动时应确保数据已加载到 storage。

## 版本记录

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-04-27 | 初始版本，支持 2x2 服务卡片，展示钓鱼指数、最近钓点 |
