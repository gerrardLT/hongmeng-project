# ColorAid 色盲色弱辅助滤镜 - 项目实现计划

## 技术栈

沿用 PetMeet 已验证的技术栈：
- **框架**: UniApp + Vue 3 (Composition API + `<script setup>`)
- **语言**: TypeScript (strict mode)
- **状态管理**: Pinia
- **构建工具**: Vite 5 + @dcloudio/vite-plugin-uni
- **UI**: @dcloudio/uni-ui + 自定义组件
- **样式**: SCSS + rpx 单位 + 设计变量系统
- **多端**: H5 / App(Android/iOS) / 鸿蒙(APP-HARMONY)

## 项目目录结构

```
d:\5个项目\hongmeng-ideas\coloraid\
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.ts
    ├── App.vue
    ├── manifest.json
    ├── pages.json
    ├── uni.scss
    ├── components/
    │   ├── common/           # 通用组件
    │   │   ├── NavBar.vue
    │   │   ├── Dialog.vue
    │   │   ├── Loading.vue
    │   │   └── Empty.vue
    │   ├── ColorCard.vue     # 颜色信息卡片
    │   ├── FilterSlider.vue  # 滤镜强度滑块
    │   ├── IshiharaPlate.vue # 石原图版测试卡片
    │   └── ColorLabel.vue    # 颜色标注组件
    ├── pages/
    │   ├── index/index.vue           # 首页（实时滤镜主界面）
    │   ├── login/index.vue           # 登录页
    │   ├── test/index.vue            # 色盲类型检测
    │   ├── test/result.vue           # 检测结果
    │   ├── camera/index.vue          # 实时滤镜（摄像头）
    │   ├── camera/identify.vue       # 颜色识别与播报
    │   ├── photo/index.vue           # 拍照色彩分析
    │   ├── photo/result.vue          # 分析结果
    │   ├── history/index.vue         # 历史记录
    │   ├── profile/index.vue         # 个人中心
    │   └── profile/settings.vue      # 设置页
    ├── services/
    │   ├── auth.ts           # 认证服务（华为账号/通用登录）
    │   ├── colorTest.ts      # 色盲检测服务
    │   ├── colorFilter.ts    # 色彩增强算法（Daltonization）
    │   ├── colorIdentify.ts  # 颜色识别与命名
    │   ├── photoAnalysis.ts  # 拍照分析服务
    │   ├── tts.ts            # 语音播报服务
    │   ├── storage.ts        # 设置同步服务
    │   └── widget.ts         # 服务卡片数据服务
    ├── store/
    │   ├── index.ts
    │   ├── user.ts           # 用户状态
    │   ├── settings.ts       # 滤镜设置状态（色盲类型、强度等）
    │   └── history.ts        # 颜色识别历史
    ├── types/
    │   ├── models.ts         # 业务模型（ColorBlindType, ColorInfo等）
    │   └── api.ts            # API类型
    ├── utils/
    │   ├── db.ts             # 本地存储
    │   ├── request.ts        # HTTP请求
    │   ├── permission.ts     # 权限管理（相机、存储等）
    │   ├── format.ts         # 数据格式化
    │   ├── platform.ts       # 平台检测
    │   └── colorUtils.ts     # 颜色工具（HEX/RGB转换、颜色命名）
    ├── uni_modules/
    │   └── coloraid-widget/  # 鸿蒙服务卡片
    │       ├── package.json
    │       └── utssdk/app-harmony/
    │           ├── index.uts
    │           └── widget/ColorAidCard.ets
    └── static/
        ├── images/
        │   ├── ishihara/     # 石原图版测试图片
        │   └── icons/        # 应用图标
        └── README.md
```

## Task 1: 项目脚手架搭建

创建 `coloraid/` 项目根目录及所有基础配置文件：

- `package.json` - 依赖配置（Vue3, Pinia, uni-ui, TypeScript, Vite, Sass）
- `tsconfig.json` - TypeScript严格模式，@路径别名
- `vite.config.ts` - Vite + uni插件 + @别名
- `src/manifest.json` - 应用配置，包含鸿蒙端 `app-harmony` 配置、权限声明（相机、存储、网络）
- `src/pages.json` - 页面路由 + TabBar（首页/检测/拍照/我的）
- `src/main.ts` - createSSRApp + Pinia
- `src/App.vue` - 根组件 + 全局样式 + onLaunch检查登录
- `src/uni.scss` - ColorAid设计变量系统（主色蓝紫色调，适合辅助工具定位）

## Task 2: 类型定义与基础工具层

- `src/types/models.ts` - 核心类型：
  - `ColorBlindType`: 'deuteranopia' | 'protanopia' | 'tritanopia' | 'achromatopsia' | 'normal'
  - `FilterMode`, `ColorInfo`, `TestResult`, `AnalysisResult`, `UserSettings`
- `src/types/api.ts` - ApiResponse, PageResult 泛型
- `src/utils/db.ts` - 本地存储工具（coloraid_db_ 前缀）
- `src/utils/request.ts` - HTTP请求封装
- `src/utils/permission.ts` - 相机/存储权限管理（含鸿蒙条件编译）
- `src/utils/platform.ts` - 平台检测
- `src/utils/format.ts` - 日期/数字格式化
- `src/utils/colorUtils.ts` - 颜色工具函数（RGB/HEX/HSL互转、中文颜色名映射库）

## Task 3: 状态管理层

- `src/store/index.ts` - Pinia入口
- `src/store/user.ts` - 用户信息、登录状态、隐私政策同意
- `src/store/settings.ts` - 色盲类型、滤镜模式、增强强度(1-10)、语音开关、音量
- `src/store/history.ts` - 颜色识别历史记录

## Task 4: 服务层实现

- `src/services/auth.ts` - 认证服务（鸿蒙华为账号 / 通用登录，条件编译）
- `src/services/colorTest.ts` - 色盲检测（5张石原图版测试、结果判定算法、推荐滤镜模式）
- `src/services/colorFilter.ts` - Daltonization色彩增强算法（红绿/蓝黄/全色盲三种模式，强度可调）
- `src/services/colorIdentify.ts` - 颜色识别（3x3像素区域取色、中文颜色名匹配、HEX/RGB输出）
- `src/services/photoAnalysis.ts` - 拍照分析（主要颜色提取最多5种、区域标注）
- `src/services/tts.ts` - 语音播报（uni.createInnerAudioContext / 系统TTS，鸿蒙端适配）
- `src/services/storage.ts` - 设置同步（本地存储 + 云端同步预留）
- `src/services/widget.ts` - 服务卡片数据刷新

## Task 5: 通用组件

- `src/components/common/NavBar.vue` - 导航栏（状态栏适配、返回按钮）
- `src/components/common/Dialog.vue` - 弹窗（隐私政策弹窗复用）
- `src/components/common/Loading.vue` - 加载状态
- `src/components/common/Empty.vue` - 空状态
- `src/components/ColorCard.vue` - 颜色信息展示（名称+HEX+RGB+色块）
- `src/components/FilterSlider.vue` - 滤镜强度滑块（1-10级）
- `src/components/IshiharaPlate.vue` - 石原图版卡片（图片+选项）
- `src/components/ColorLabel.vue` - 照片颜色标注浮层

## Task 6: 登录页与隐私政策

- `src/pages/login/index.vue`
  - 隐私政策弹窗（首次启动必须同意）
  - 鸿蒙端：华为账号一键登录
  - 通用端：手机号验证码登录（模拟）
  - 免责声明："辅助工具，非医疗器械"

## Task 7: 色盲类型检测模块

- `src/pages/test/index.vue` - 检测主页面
  - 5张石原图版测试
  - 每张图提供4个颜色选项
  - 支持跳过直接手动选择
  - 进度指示器
- `src/pages/test/result.vue` - 结果页面
  - 显示检测结果（色盲类型）
  - 推荐滤镜模式
  - "开始使用"按钮进入主界面

## Task 8: 首页与实时滤镜模块

- `src/pages/index/index.vue` - 首页
  - 快捷功能入口（实时滤镜、拍照分析、色盲检测）
  - 最近识别颜色展示
  - 当前滤镜模式状态
- `src/pages/camera/index.vue` - 实时滤镜
  - 摄像头实时预览（camera组件）
  - 滤镜模式切换（红绿/蓝黄/全色盲）
  - 强度调节滑块
  - 前后摄像头切换
  - 手电筒补光开关
  - 鸿蒙端Core Vision Kit条件编译适配
- `src/pages/camera/identify.vue` - 颜色识别
  - 点击屏幕取色
  - 显示颜色名称+HEX+RGB
  - 语音播报开关
  - 识别历史列表

## Task 9: 拍照色彩分析模块

- `src/pages/photo/index.vue` - 拍照/选图
  - 拍照或从相册选择
  - 触发自动分析
- `src/pages/photo/result.vue` - 分析结果
  - 照片上标注主要颜色（最多5种）
  - 每种颜色显示名称+色块+占比
  - 保存到相册/分享功能

## Task 10: 个人中心与设置

- `src/pages/profile/index.vue` - 个人中心
  - 用户信息
  - 色盲类型设置
  - 历史记录入口
  - 关于应用（免责声明）
- `src/pages/profile/settings.vue` - 设置页
  - 色盲类型切换
  - 默认滤镜强度
  - 语音播报开关+音量
  - 重新检测色盲类型
  - 退出登录/删除数据
- `src/pages/history/index.vue` - 历史记录
  - 颜色识别记录列表
  - 拍照分析记录

## Task 11: 鸿蒙服务卡片

- `src/uni_modules/coloraid-widget/package.json` - 插件配置（formAbility: true）
- `src/uni_modules/coloraid-widget/utssdk/app-harmony/index.uts` - 卡片数据接口
  - 导出 getWidgetData / updateWidget / onWidgetClick
  - "一键开启实时滤镜"功能
  - 最近识别的3个颜色
- `src/uni_modules/coloraid-widget/utssdk/app-harmony/widget/ColorAidCard.ets` - ArkUI卡片布局
  - 2x2 和 4x2 两种卡片尺寸
- `src/uni_modules/coloraid-widget/readme.md`

## Task 12: 依赖安装与验证

- 在 coloraid/ 目录执行 `npm install`
- 验证项目结构完整性
- 确认 TypeScript 类型检查通过

## 执行顺序

Task 1 -> Task 2, 3 (并行) -> Task 4, 5 (并行) -> Task 6, 7, 8, 9, 10, 11 (按模块并行) -> Task 12
