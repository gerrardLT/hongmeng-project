# UniApp + 鸿蒙 编码规范文档

> 本文档基于 ColorAid / PetMeet / CultureBox 等真实项目提炼，适用于 UniApp 3.x + Vue 3 + TypeScript 技术栈，目标平台为鸿蒙 (HarmonyOS) / Android / iOS / H5。

---

## 1. UniApp 项目结构规范

### 1.1 标准目录结构

```
project/
├── src/
│   ├── components/          # 公共组件
│   │   ├── common/          # 通用基础组件（TabBar、NavBar、Loading 等）
│   │   ├── PetCard.vue      # 业务组件（PascalCase 命名）
│   │   └── DiaryItem.vue
│   ├── pages/               # 页面目录（按功能模块分子目录）
│   │   ├── index/
│   │   │   └── index.vue    # 首页
│   │   ├── login/
│   │   │   └── index.vue    # 登录页
│   │   └── profile/
│   │       ├── index.vue    # 个人中心
│   │       └── settings.vue # 设置页
│   ├── services/            # 服务层（API 调用 & 业务逻辑）
│   │   ├── auth.ts
│   │   ├── storage.ts
│   │   └── widget.ts
│   ├── store/               # 状态管理（Pinia）
│   │   ├── index.ts         # Pinia 实例导出
│   │   ├── user.ts
│   │   └── settings.ts
│   ├── types/               # TypeScript 类型定义
│   │   ├── models.ts        # 业务模型
│   │   └── api.ts           # API 响应结构
│   ├── utils/               # 工具函数
│   │   ├── request.ts       # HTTP 请求封装
│   │   ├── db.ts            # 本地存储封装
│   │   ├── platform.ts      # 平台判断
│   │   ├── permission.ts    # 权限管理
│   │   └── format.ts        # 格式化工具
│   ├── static/              # 静态资源
│   │   ├── images/
│   │   └── legal/           # 法律文档（隐私政策、用户协议）
│   ├── uni_modules/         # UTS 原生插件
│   ├── App.vue              # 应用入口
│   ├── main.ts              # 启动文件
│   ├── manifest.json        # 应用配置
│   ├── pages.json           # 页面路由配置
│   ├── uni.scss             # 全局 SCSS 变量
│   └── env.d.ts             # 类型声明补充
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### 1.2 命名约定

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| 页面目录 | kebab-case | `pages/login/index.vue` |
| 组件文件 | PascalCase | `PetCard.vue`、`FilterBar.vue` |
| 服务文件 | camelCase | `auth.ts`、`colorFilter.ts` |
| 工具文件 | camelCase | `request.ts`、`platform.ts` |
| 类型文件 | camelCase | `models.ts`、`api.ts` |
| Store 文件 | camelCase | `user.ts`、`settings.ts` |

---

## 2. Vue 3 + TypeScript 编码规范

### 2.1 script setup 语法

所有 `.vue` 文件统一使用 `<script setup lang="ts">` 组合式 API 写法：

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Pet } from '@/types/models'
import { useUserStore } from '@/store/user'

// 1. Store 引入
const userStore = useUserStore()

// 2. Props & Emits（紧跟 Store 之后）
const props = withDefaults(defineProps<{
  pet: Pet
  showActions?: boolean
}>(), {
  showActions: false
})

const emit = defineEmits<{
  edit: []
  share: []
}>()

// 3. 响应式状态
const loading = ref(false)
const list = ref<Pet[]>([])

// 4. 计算属性
const displayName = computed(() => props.pet.name || '未命名')

// 5. 方法（function 声明，非箭头函数）
function onEdit() {
  emit('edit')
}

// 6. 生命周期
onMounted(() => {
  loadData()
})
</script>
```

### 2.2 TypeScript 严格模式

`tsconfig.json` 必须开启严格模式，并配置路径别名：

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "jsx": "preserve",
    "sourceMap": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ESNext", "DOM"],
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```

### 2.3 类型定义规范

类型统一放在 `src/types/` 目录，使用 `type` 定义联合类型，`interface` 定义对象结构：

```ts
// types/models.ts — 业务模型

// 联合类型用 type
export type PetGender = 'male' | 'female' | 'unknown'
export type PetSpecies = 'dog' | 'cat' | 'bird' | 'fish' | 'hamster' | 'rabbit' | 'turtle' | 'other'
export type DiaryVisibility = 'public' | 'private'

// 对象结构用 interface
export interface Pet {
  petId: string
  userId: string
  name: string
  species: PetSpecies
  breed: string
  age: number
  gender: PetGender
  personality: PersonalityTag[]
  avatar: string
  createdAt: number
  updatedAt: number
}
```

### 2.4 导入类型使用 `import type`

纯类型导入必须使用 `import type`，避免运行时引入不必要的模块：

```ts
import type { UserInfo } from '@/types/models'
import type { ApiResponse } from '@/types/api'
```

---

## 3. 组件开发规范

### 3.1 组件命名

- 文件名：PascalCase（如 `PetCard.vue`、`FilterSlider.vue`）
- 模板中使用：PascalCase 或 kebab-case 均可，推荐 PascalCase

### 3.2 Props 定义：withDefaults + defineProps

使用泛型语法定义 Props，通过 `withDefaults` 提供默认值：

```vue
<script setup lang="ts">
import type { Pet } from '@/types/models'

const props = withDefaults(defineProps<{
  pet: Pet
  showActions?: boolean
  size?: 'small' | 'medium' | 'large'
}>(), {
  showActions: false,
  size: 'medium'
})
</script>
```

### 3.3 Emits 定义

使用泛型语法定义事件，参数为元组类型：

```vue
<script setup lang="ts">
const emit = defineEmits<{
  edit: []                          // 无参数
  share: []                         // 无参数
  select: [id: string]              // 带参数
  change: [value: number, old: number]  // 多参数
}>()

function onEdit() {
  emit('edit')
}
</script>
```

### 3.4 模板规范

- 使用 `<view>` 代替 `<div>`，`<text>` 代替 `<span>`，确保多端兼容
- 图片使用 `<image>` 组件，必须指定 `mode`
- 事件使用 `@click`，需要阻止冒泡时用 `@click.stop`
- 列表循环必须指定 `:key`

```vue
<template>
  <view class="pet-card" :class="[`size-${size}`]">
    <image
      class="avatar"
      :src="pet.avatar || '/static/default-pet.png'"
      mode="aspectFill"
    />
    <view class="info-wrap">
      <text class="name">{{ pet.name }}</text>
    </view>
    <view
      v-for="(tag, index) in displayTags"
      :key="index"
      class="tag"
    >
      <text class="tag-text">{{ tag }}</text>
    </view>
    <view v-if="showActions" class="actions-wrap">
      <view class="action-btn" @click.stop="onEdit">
        <text class="action-text">编辑</text>
      </view>
    </view>
  </view>
</template>
```

---

## 4. 样式规范

### 4.1 rpx 单位基准

- 设计稿宽度以 **750rpx** 为基准（1rpx = 屏幕宽度 / 750）
- `manifest.json` 中 `"transformPx": false`，不自动转换 px
- 所有尺寸使用 rpx，文字大小、间距、圆角等一律 rpx

```scss
.card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.btn-primary {
  border-radius: 44rpx;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 30rpx;
}
```

### 4.2 scoped + SCSS

组件样式必须使用 `scoped`，全局样式写在 `App.vue`：

```vue
<!-- 组件内 -->
<style scoped lang="scss">
.pet-card {
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  padding: 32rpx;
}
</style>
```

```vue
<!-- App.vue 全局样式（不加 scoped） -->
<style lang="scss">
@import "uni.scss";

page {
  background-color: #F5F5F5;
  font-size: 28rpx;
  color: #212121;
}
</style>
```

### 4.3 条件编译样式

在 `<style>` 中使用 CSS 注释语法进行条件编译：

```scss
/* 鸿蒙端特殊适配 */
/* #ifdef APP-HARMONY */
page {
  --status-bar-height: 47px;
}
/* #endif */
```

### 4.4 Flex 工具类

在 `App.vue` 中定义全局 Flex 工具类，组件内直接使用：

```scss
.flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.flex-col {
  display: flex;
  flex-direction: column;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-1 {
  flex: 1;
}
```

### 4.5 文字省略工具类

```scss
.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-ellipsis-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
```

---

## 5. 路由和页面配置规范

### 5.1 pages.json 配置

页面数组第一项为首页，使用 `globalStyle` 统一导航栏样式，`tabBar` 配置底部标签：

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页"
      }
    },
    {
      "path": "pages/login/index",
      "style": {
        "navigationBarTitleText": "登录"
      }
    },
    {
      "path": "pages/test/index",
      "style": {
        "navigationBarTitleText": "色盲检测"
      }
    },
    {
      "path": "pages/test/result",
      "style": {
        "navigationBarTitleText": "检测结果"
      }
    }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "ColorAid",
    "navigationBarBackgroundColor": "#FFFFFF",
    "backgroundColor": "#F5F5F5"
  },
  "tabBar": {
    "color": "#BDBDBD",
    "selectedColor": "#5B6EF5",
    "backgroundColor": "#FFFFFF",
    "borderStyle": "white",
    "list": [
      { "pagePath": "pages/index/index", "text": "首页" },
      { "pagePath": "pages/test/index", "text": "检测" },
      { "pagePath": "pages/photo/index", "text": "拍照" },
      { "pagePath": "pages/profile/index", "text": "我的" }
    ]
  }
}
```

### 5.2 路由跳转 API

```ts
// 普通跳转
uni.navigateTo({ url: '/pages/test/result?score=80' })

// 重定向（关闭当前页）
uni.redirectTo({ url: '/pages/login/index' })

// 跳转到 TabBar 页面
uni.switchTab({ url: '/pages/index/index' })

// 返回上一页
uni.navigateBack()

// 关闭所有页面并跳转
uni.reLaunch({ url: '/pages/index/index' })
```

### 5.3 参数传递与接收

```ts
// 传递参数
uni.navigateTo({
  url: `/pages/test/result?score=${score}&type=${encodeURIComponent(type)}`
})

// 接收参数（在目标页面）
import { onLoad } from '@dcloudio/uni-app'

onLoad((options) => {
  const score = Number(options?.score || 0)
  const type = decodeURIComponent(options?.type || '')
})
```

---

## 6. 状态管理规范

### 6.1 Pinia Setup Store 写法

统一使用 **Setup Store**（函数式）写法，不使用 Options Store：

```ts
// store/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types/models'

const STORAGE_KEY = 'coloraid_user'

export const useUserStore = defineStore('user', () => {
  // state —— ref
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string>('')
  const isPrivacyAgreed = ref<boolean>(false)

  // getters —— computed
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)
  const userId = computed(() => userInfo.value?.userId || '')

  // actions —— function
  function setUserInfo(info: UserInfo) {
    userInfo.value = info
    persist()
  }

  function setToken(t: string) {
    token.value = t
    uni.setStorageSync('token', t)
    persist()
  }

  function agreePrivacy() {
    isPrivacyAgreed.value = true
    persist()
  }

  function logout() {
    userInfo.value = null
    token.value = ''
    isPrivacyAgreed.value = false
    uni.removeStorageSync(STORAGE_KEY)
    uni.removeStorageSync('token')
  }

  /** 从本地存储恢复状态 */
  function init() {
    try {
      const state = uni.getStorageSync(STORAGE_KEY)
      if (state) {
        userInfo.value = state.userInfo ?? null
        token.value = state.token || ''
        isPrivacyAgreed.value = state.isPrivacyAgreed || false
      }
    } catch (e) {
      console.error('init user state error:', e)
    }
  }

  /** 持久化到本地存储 */
  function persist() {
    uni.setStorageSync(STORAGE_KEY, {
      userInfo: userInfo.value,
      token: token.value,
      isPrivacyAgreed: isPrivacyAgreed.value
    })
  }

  return {
    userInfo, token, isPrivacyAgreed,
    isLoggedIn, userId,
    setUserInfo, setToken, agreePrivacy, logout, init
  }
})
```

### 6.2 main.ts 初始化

```ts
// main.ts
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)
  return { app }
}
```

### 6.3 多模块划分

每个 Store 一个文件，按业务域拆分：

```
store/
├── index.ts      # createPinia() 实例（仅导出）
├── user.ts       # 用户信息、登录状态、隐私协议
├── settings.ts   # 应用设置（滤镜类型、语音偏好等）
├── history.ts    # 历史记录
├── entry.ts      # 条目数据（CultureBox）
├── tag.ts        # 标签管理
└── exchange.ts   # 交换功能
```

`index.ts` 仅负责导出 Pinia 实例：

```ts
import { createPinia } from 'pinia'
export default createPinia()
```

---

## 7. API 调用规范

### 7.1 request.ts 封装模式

统一封装 `uni.request`，自动注入 Token、统一错误处理：

```ts
// utils/request.ts
import { ApiResponse } from '@/types/api'

const BASE_URL = ''

interface RequestOptions {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  headers?: Record<string, string>
}

function request<T = any>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') as string | undefined

    uni.request({
      url: options.url.startsWith('http') ? options.url : `${BASE_URL}${options.url}`,
      method: options.method,
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      },
      success: (res) => {
        const response = res.data as ApiResponse<T>
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (response.code === 200 || response.code === 0) {
            resolve(response.data)
          } else {
            reject(new Error(response.message || '请求失败'))
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '网络请求失败'))
      }
    })
  })
}

// 导出便捷方法
export function get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
  const query = params
    ? '?' + Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&')
    : ''
  return request<T>({ url: url + query, method: 'GET' })
}

export function post<T = any>(url: string, data?: any): Promise<T> {
  return request<T>({ url, method: 'POST', data })
}

export function put<T = any>(url: string, data?: any): Promise<T> {
  return request<T>({ url, method: 'PUT', data })
}

export function del<T = any>(url: string, data?: any): Promise<T> {
  return request<T>({ url, method: 'DELETE', data })
}
```

### 7.2 ApiResponse 统一响应结构

```ts
// types/api.ts
export interface ApiResponse<T = any> {
  code: number       // 业务状态码（200 或 0 为成功）
  message: string    // 提示信息
  data: T            // 数据体
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
```

### 7.3 服务层组织

服务层按业务模块拆分，每个文件导出异步函数，内部调用 `request` 工具：

```ts
// services/auth.ts
import type { UserInfo } from '@/types/models'
import { post } from '@/utils/request'

export async function loginWithPhone(phone: string, code: string): Promise<{ userInfo: UserInfo; token: string }> {
  return post('/api/auth/login', { phone, code })
}

export async function logout(): Promise<void> {
  uni.clearStorageSync()
}
```

---

## 8. 鸿蒙平台条件编译

### 8.1 #ifdef APP-HARMONY 用法

UniApp 条件编译使用注释语法，在不同上下文中注释格式不同：

**脚本中（JS/TS）：**

```ts
// #ifdef APP-HARMONY
export async function loginWithHarmony(): Promise<{ userInfo: UserInfo; token: string }> {
  // 华为 Account Kit 登录逻辑
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'huawei',
      success: (res) => { /* ... */ },
      fail: (err) => { reject(new Error(err.errMsg)) }
    })
  })
}
// #endif

// #ifndef APP-HARMONY
export async function loginWithPhone(phone: string, code: string) {
  // 通用端登录逻辑
}
// #endif
```

**模板中（HTML）：**

```vue
<template>
  <!-- #ifdef APP-HARMONY -->
  <view class="harmony-login">
    <button @click="harmonyLogin">华为账号一键登录</button>
  </view>
  <!-- #endif -->

  <!-- #ifndef APP-HARMONY -->
  <view class="phone-login">
    <input placeholder="请输入手机号" />
  </view>
  <!-- #endif -->
</template>
```

**样式中（CSS/SCSS）：**

```scss
/* #ifdef APP-HARMONY */
page {
  --status-bar-height: 47px;
}
/* #endif */
```

**文件级条件编译：**

将文件命名为 `xxx.APP-HARMONY.vue` 或建立平台专属目录，UniApp 编译时自动按平台选择。

### 8.2 常用条件编译标识

| 标识 | 说明 |
|------|------|
| `APP-HARMONY` | 鸿蒙 App 端 |
| `APP-PLUS` | App 端（Android + iOS，不含鸿蒙） |
| `APP` | 所有 App 端（含鸿蒙） |
| `H5` | H5 网页端 |
| `MP-WEIXIN` | 微信小程序 |
| `MP-ALIPAY` | 支付宝小程序 |
| `MP` | 所有小程序 |

组合用法：
- `#ifdef APP-HARMONY` — 仅鸿蒙端编译
- `#ifndef APP-HARMONY` — 非鸿蒙端编译
- `#ifdef APP-HARMONY || APP-PLUS` — 鸿蒙或 App 端编译

---

## 9. 鸿蒙 UI 适配

### 9.1 安全区域 env(safe-area-inset-*)

鸿蒙设备有刘海屏、底部导航条等安全区域，需使用 CSS 环境变量适配：

```scss
/* 底部安全区域 */
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

/* 顶部安全区域（自定义导航栏时使用） */
.safe-top {
  padding-top: env(safe-area-inset-top);
}

/* 全屏安全区域 */
.safe-area {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### 9.2 状态栏高度获取

```ts
import { getSystemInfo } from '@/utils/platform'

// 获取状态栏高度（单位 px）
const info = getSystemInfo()
const statusBarHeight = info.statusBarHeight || 0

// 在鸿蒙端可能需要额外适配
// #ifdef APP-HARMONY
const harmonyStatusBarHeight = 47 // 鸿蒙默认状态栏高度
// #endif
```

### 9.3 平台检测工具

```ts
// utils/platform.ts
let systemInfo: UniApp.GetSystemInfoResult | null = null

export function getSystemInfo(): UniApp.GetSystemInfoResult {
  if (!systemInfo) {
    systemInfo = uni.getSystemInfoSync()
  }
  return systemInfo
}

export function isHarmony(): boolean {
  const info = getSystemInfo()
  return info.uniPlatform === 'app-harmony' || info.osName === 'harmony'
}

export function isH5(): boolean {
  const info = getSystemInfo()
  return info.uniPlatform === 'web' || info.platform === 'web'
}

export function isApp(): boolean {
  const info = getSystemInfo()
  return info.uniPlatform === 'app' || info.uniPlatform === 'app-plus' || info.uniPlatform === 'app-harmony'
}
```

### 9.4 屏幕适配注意

- 鸿蒙设备分辨率各异，**始终使用 rpx** 作为尺寸单位
- 图片使用 `mode="aspectFill"` 或 `mode="widthFix"` 防止变形
- 避免固定宽高，优先使用 Flex 布局 + 百分比

---

## 10. 鸿蒙权限申请规范

### 10.1 manifest.json 配置

在 `app-harmony` 节点中声明权限：

```json
{
  "app-harmony": {
    "enable": true,
    "package": "com.coloraid.app",
    "appName": "ColorAid",
    "debug": true
  }
}
```

鸿蒙权限需在 DevEco Studio 对应的 `module.json5` 中配置 `requestPermissions`：

```json5
{
  "module": {
    "requestPermissions": [
      { "name": "ohos.permission.CAMERA" },
      { "name": "ohos.permission.WRITE_MEDIA" },
      { "name": "ohos.permission.INTERNET" }
    ]
  }
}
```

### 10.2 运行时权限申请

通用权限请求（跨平台）：

```ts
export async function requestCameraPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    uni.authorize({
      scope: 'scope.camera',
      success: () => resolve(true),
      fail: () => resolve(false)
    })
  })
}
```

鸿蒙端专属权限请求（使用 abilityAccessCtrl）：

```ts
// #ifdef APP-HARMONY
export async function requestHarmonyCameraPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // @ts-ignore 鸿蒙原生 API
      if (typeof abilityAccessCtrl !== 'undefined') {
        // @ts-ignore
        const atManager = abilityAccessCtrl.createAtManager()
        // @ts-ignore
        atManager.requestPermissionsFromUser({
          permissions: ['ohos.permission.CAMERA'],
          success: (result: any) => {
            resolve(result.authResults?.[0] === 0)
          },
          fail: () => resolve(false)
        })
      } else {
        // 降级到通用 API
        uni.authorize({
          scope: 'scope.camera',
          success: () => resolve(true),
          fail: () => resolve(false)
        })
      }
    } catch (e) {
      console.error('requestHarmonyCameraPermission error:', e)
      resolve(false)
    }
  })
}
// #endif
```

### 10.3 权限检查

```ts
export function checkPermission(permName: string): Promise<boolean> {
  return new Promise((resolve) => {
    uni.getSetting({
      success: (res) => {
        const authSetting = res.authSetting as unknown as Record<string, boolean>
        resolve(authSetting[permName] === true)
      },
      fail: () => resolve(false)
    })
  })
}
```

---

## 11. 鸿蒙隐私政策与用户协议要求

### 11.1 首次启动必须弹窗

鸿蒙应用商店审核要求：**应用首次启动时必须展示隐私政策弹窗**，用户同意后才可使用功能。

```vue
<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'

onLaunch(() => {
  checkLoginStatus()
  checkPrivacyAgreement()
})

function checkPrivacyAgreement() {
  const agreed = uni.getStorageSync('privacyAgreed')
  if (!agreed) {
    // 弹出隐私政策确认弹窗
    console.log('未同意隐私协议')
  }
}
</script>
```

### 11.2 用户同意前不初始化 SDK

**关键规则**：在用户点击"同意"之前，禁止调用任何第三方 SDK 初始化、数据采集、网络请求：

```ts
// services/auth.ts
export async function loginWithHarmony() {
  const userStore = useUserStore()

  // 必须先检查隐私协议状态
  if (!userStore.isPrivacyAgreed) {
    throw new Error('请先阅读并同意《用户协议》和《隐私政策》')
  }

  // 用户已同意后才可调用 SDK 登录
  return uni.login({ provider: 'huawei' })
}
```

### 11.3 隐私政策文档结构

在 `src/static/legal/` 目录中放置法律文档：

```
static/legal/
├── privacy-policy.html     # 隐私政策（HTML 格式，WebView 展示）
├── user-agreement.html     # 用户协议
└── third-party-sdk.html    # 第三方 SDK 目录（鸿蒙审核要求）
```

### 11.4 WebView 展示方案

通过 `pages/webview/index.vue` 统一展示法律文档：

```ts
// 跳转查看隐私政策
function openPrivacyPolicy() {
  uni.navigateTo({
    url: '/pages/webview/index?url=' + encodeURIComponent('/static/legal/privacy-policy.html')
  })
}

// 跳转查看用户协议
function openUserAgreement() {
  uni.navigateTo({
    url: '/pages/webview/index?url=' + encodeURIComponent('/static/legal/user-agreement.html')
  })
}
```

---

## 12. 鸿蒙应用审核要点

### 12.1 应用信息要求

| 项目 | 要求 |
|------|------|
| 应用名称 | 不得包含特殊符号，不超过 30 字符 |
| 应用描述 | 如实描述功能，不得包含诱导或虚假信息 |
| 应用图标 | 256×256 PNG，不得包含其他品牌 Logo |
| 版本号 | `versionName` 语义化（如 1.0.0），`versionCode` 递增整数 |
| 隐私政策链接 | **必须** 提供有效链接且内容完整 |

### 12.2 权限审核

- 只申请应用实际使用的权限，不得多申请
- 敏感权限（相机、存储、位置）需在应用描述中说明使用场景
- 权限被拒后需给出合理引导，不得强制退出应用

### 12.3 内容审核

- 应用内不得包含违法违规内容
- 用户生成内容（UGC）需有审核机制
- 不得包含绕过系统安全机制的代码

### 12.4 性能要求

- 冷启动时间不超过 2 秒
- 页面切换流畅无明显卡顿
- 不得有内存泄漏问题
- 后台不得持续消耗 CPU 或网络资源

---

## 13. 鸿蒙不支持的 API 与替代方案

### 13.1 plus API 不可用

鸿蒙端 **不支持 `plus.*` 系列 API**（如 `plus.io`、`plus.nativeUI`），必须使用条件编译避免调用：

```ts
// ❌ 错误：鸿蒙端会报错
plus.io.resolveLocalFileSystemURL(...)

// ✅ 正确：条件编译
// #ifdef APP-PLUS
plus.io.resolveLocalFileSystemURL(...)
// #endif

// #ifdef APP-HARMONY
// 使用 uni API 或鸿蒙原生能力替代
uni.getFileSystemManager().readFile(...)
// #endif
```

### 13.2 文件系统差异

鸿蒙文件系统路径与 Android/iOS 不同，不能硬编码路径：

```ts
// ❌ 错误：硬编码 Android 路径
const path = '/storage/emulated/0/Download/file.jpg'

// ✅ 正确：使用 uni API 获取路径
const tempPath = `${uni.env.USER_DATA_PATH}/temp_${Date.now()}.jpg`
```

### 13.3 替代方案速查表

| 不可用 API | 替代方案 | 说明 |
|-----------|---------|------|
| `plus.io.*` | `uni.getFileSystemManager()` | 文件操作 |
| `plus.nativeUI.*` | `uni.showToast()` / `uni.showModal()` | 原生弹窗 |
| `plus.device.*` | `uni.getSystemInfoSync()` | 设备信息 |
| `plus.camera.*` | `uni.chooseImage()` / `uni.chooseMedia()` | 相机调用 |
| `plus.gallery.*` | `uni.chooseImage()` | 相册访问 |
| `plus.audio.*` | `uni.createInnerAudioContext()` | 音频播放 |
| `plus.sqlite.*` | `uni.getStorageSync()` / Cloud DB | 数据库 |
| `plus.push.*` | 华为推送 SDK (条件编译) | 推送通知 |
| `plus.share.*` | 鸿蒙 Share Kit (条件编译) | 分享功能 |
| `plus.payment.*` | 华为 IAP SDK (条件编译) | 支付功能 |
| `window.location` | `uni.navigateTo()` | 页面跳转 |
| `document.*` | 不可用，使用组件化方案 | DOM 操作 |

---

## 14. 多端兼容最佳实践

### 14.1 服务层统一接口模式

通过条件编译在同一文件中为不同平台提供实现，对外暴露统一函数签名：

```ts
// services/auth.ts

// #ifdef APP-HARMONY
export async function loginWithHarmony(): Promise<{ userInfo: UserInfo; token: string }> {
  const userStore = useUserStore()
  if (!userStore.isPrivacyAgreed) {
    throw new Error('请先阅读并同意《用户协议》和《隐私政策》')
  }
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'huawei',
      success: (res) => {
        const userInfo: UserInfo = {
          userId: `hw_${res.code.slice(0, 16)}`,
          nickname: '华为用户',
          avatar: '',
          createdAt: Date.now()
        }
        resolve({ userInfo, token: `token_harmony_${res.code}` })
      },
      fail: (err) => reject(new Error(err.errMsg))
    })
  })
}
// #endif

// #ifndef APP-HARMONY
export async function loginWithPhone(phone: string, code: string): Promise<{ userInfo: UserInfo; token: string }> {
  // 通用端逻辑
}
// #endif

// 通用函数（所有平台共享）
export async function logout(): Promise<void> {
  uni.clearStorageSync()
}
```

### 14.2 组件级条件编译

在模板中使用条件编译实现不同平台展示不同 UI：

```vue
<template>
  <view class="login-page">
    <!-- #ifdef APP-HARMONY -->
    <button class="btn-huawei" @click="harmonyLogin">华为账号一键登录</button>
    <!-- #endif -->

    <!-- #ifndef APP-HARMONY -->
    <view class="phone-form">
      <input v-model="phone" placeholder="手机号" />
      <input v-model="code" placeholder="验证码" />
      <button @click="phoneLogin">登录</button>
    </view>
    <!-- #endif -->

    <!-- 所有平台共享 -->
    <view class="agreement">
      <text @click="openPrivacy">隐私政策</text>
    </view>
  </view>
</template>
```

### 14.3 工具函数封装

将平台差异封装到工具函数中，业务层直接调用无需关心平台：

```ts
// utils/permission.ts

/** 请求相机权限（跨平台） */
export async function requestCamera(): Promise<boolean> {
  // #ifdef APP-HARMONY
  return requestHarmonyCameraPermission()
  // #endif

  // #ifndef APP-HARMONY
  return requestCameraPermission()
  // #endif
}
```

```ts
// utils/db.ts — 本地存储统一封装

export function dbGet<T>(collection: string, id: string): T | null {
  try {
    const key = getCollectionKey(collection)
    const data = uni.getStorageSync(key) as Record<string, T> | undefined
    if (!data) return null
    return data[id] ?? null
  } catch (e) {
    console.error('dbGet error:', e)
    return null
  }
}

export function dbSet<T>(collection: string, id: string, data: T): void {
  try {
    const key = getCollectionKey(collection)
    const existing = uni.getStorageSync(key) as Record<string, T> | undefined
    const store = existing || {}
    store[id] = data
    uni.setStorageSync(key, store)
  } catch (e) {
    console.error('dbSet error:', e)
  }
}
```

### 14.4 样式条件编译

针对特定平台编写差异化样式：

```scss
/* 基础样式（所有平台） */
.page-container {
  padding: 24rpx;
}

/* #ifdef APP-HARMONY */
.page-container {
  padding-top: calc(24rpx + env(safe-area-inset-top));
}

page {
  --status-bar-height: 47px;
}
/* #endif */

/* #ifdef H5 */
.page-container {
  max-width: 750px;
  margin: 0 auto;
}
/* #endif */

/* #ifdef MP-WEIXIN */
.page-container {
  padding-top: 24rpx;
}
/* #endif */
```

### 14.5 vite.config.ts 配置

```ts
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'

export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
```

### 14.6 package.json 脚本配置

```json
{
  "scripts": {
    "dev:h5": "uni",
    "build:h5": "uni build",
    "dev:app": "uni --platform app",
    "dev:harmony": "uni --platform app-harmony"
  }
}
```

---

## 附录：快速检查清单

在提交代码或创建新项目时，确认以下要点：

- [ ] 使用 `<script setup lang="ts">` 组合式 API
- [ ] Props 使用 `withDefaults(defineProps<{}>(), {})`
- [ ] Emits 使用泛型语法 `defineEmits<{}>()`
- [ ] 类型导入使用 `import type`
- [ ] 样式使用 `scoped lang="scss"`，尺寸使用 rpx
- [ ] 路由跳转使用 uni API（navigateTo / switchTab / redirectTo）
- [ ] Store 使用 Pinia Setup Store 写法
- [ ] API 请求通过 `utils/request.ts` 封装
- [ ] 鸿蒙差异代码使用 `#ifdef APP-HARMONY` 条件编译
- [ ] 不使用 `plus.*` API（鸿蒙不支持）
- [ ] 隐私政策弹窗前不初始化任何 SDK
- [ ] 安全区域使用 `env(safe-area-inset-*)` 适配
- [ ] 敏感权限运行时申请且有拒绝后引导
