# PetMeet 服务卡片（鸿蒙负一屏）

## 插件说明

`pet-widget` 是 PetMeet 应用的鸿蒙负一屏服务卡片插件，基于 UniApp UTS 插件机制开发。

卡片尺寸：**2x2**

展示内容：
- 宠物头像（圆形）+ 宠物名字
- 最近日记摘要（最多2行）
- 宠友数量

## 目录结构

```
src/uni_modules/pet-widget/
├── package.json                          # 插件配置
├── readme.md                             # 本文件
└── utssdk/
    └── app-harmony/
        ├── index.uts                     # UTS 插件主入口（数据接口）
        └── widget/
            └── PetMeetCard.ets           # ArkUI 卡片布局（鸿蒙原生）
```

## 使用方法

### 1. App 端刷新卡片数据

在业务代码中引入并调用 `refreshWidget`：

```typescript
import { refreshWidget } from '@/services/widget'

// 创建宠物后
refreshWidget()

// 发布日记后
refreshWidget()

// 添加宠友后
refreshWidget()
```

### 2. 卡片数据读取

UTS 插件会自动从 App 本地存储中读取以下数据：

| 字段 | 数据来源 | 说明 |
|------|---------|------|
| `petName` | `petmeet_db_pets` | 当前用户第一个宠物的名字 |
| `petAvatar` | `petmeet_db_pets` | 当前用户第一个宠物的头像 |
| `latestDiary` | `petmeet_db_diaries` | 当前用户最近一篇日记的内容摘要 |
| `friendCount` | `petmeet_db_friendships` | 当前用户 active 状态的宠友数量 |

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
3. 在真机负一屏长按空白处 -> 添加服务卡片 -> 选择 PetMeet
4. 确保 App 已登录并有宠物数据

## 卡片数据更新时机

以下业务操作完成后，应调用 `refreshWidget()` 同步最新数据到负一屏：

| 业务操作 | 文件位置 | 调用位置 |
|---------|---------|---------|
| 创建宠物名片 | `src/pages/pet/create.vue` | `onSubmit()` 成功回调 |
| 编辑宠物名片 | `src/pages/pet/edit.vue` | 保存成功回调 |
| 发布新日记 | `src/pages/diary/publish.vue` | 发布成功回调 |
| 添加新宠友 | `src/pages/friends/index.vue` | 添加成功回调 |

## 注意事项

1. **条件编译**：所有鸿蒙专属代码均使用 `#ifdef APP-HARMONY` / `#ifndef APP-HARMONY` 包裹，确保跨平台编译无报错。
2. **模拟实现**：由于服务卡片依赖鸿蒙原生能力（FormManager、Want 等），UTS 插件中的部分接口为模拟实现，真机集成时需要根据实际 SDK 调整。
3. **头像路径**：卡片中头像路径需要确保在鸿蒙端可访问，建议使用应用私有目录或网络图片地址。
4. **数据一致性**：卡片数据从 App 本地存储读取，App 启动时应确保数据已加载到 storage。

## 版本记录

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-04-21 | 初始版本，支持 2x2 服务卡片 |
