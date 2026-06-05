---
inclusion: manual
---

# ArkTS 完整开发指南

> 基于 HarmonyOS NEXT (API 12+) 深度调研整理  
> 整理日期：2026-06-05  
> 参考来源：[华为官方文档](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/arkts)、ArkTS Specification 1.1.0、社区实践

---

## 一、开发环境与工具链

### 1.1 DevEco Studio

DevEco Studio 是 HarmonyOS 应用开发的官方 IDE，基于 IntelliJ 平台打造。

**核心能力：**
- ArkTS/JS 语言智能提示与代码补全
- 实时预览器（Preview）：无需编译即可预览 UI
- 模拟器 & 真机调试
- 性能分析工具（Profiler）
- 一键打包签名发布

**版本要求：**
- DevEco Studio 5.0+ 对应 HarmonyOS NEXT
- 推荐使用最新稳定版，支持 API 12/13

### 1.2 项目结构（Stage 模型）

```
MyApplication/
├── AppScope/                    # 应用全局配置
│   ├── app.json5                # 应用级配置（bundleName、版本等）
│   └── resources/               # 全局资源
├── entry/                       # 主模块（HAP）
│   ├── src/main/
│   │   ├── ets/                 # ArkTS 源码目录
│   │   │   ├── entryability/    # UIAbility 入口
│   │   │   │   └── EntryAbility.ets
│   │   │   ├── pages/           # 页面文件
│   │   │   │   └── Index.ets
│   │   │   ├── components/      # 自定义组件
│   │   │   ├── model/           # 数据模型
│   │   │   ├── utils/           # 工具类
│   │   │   └── viewmodel/       # 视图模型
│   │   ├── resources/           # 模块资源（字符串、图片、颜色等）
│   │   │   ├── base/
│   │   │   │   ├── element/     # 字符串、颜色、尺寸定义
│   │   │   │   ├── media/       # 图片资源
│   │   │   │   └── profile/     # 配置文件
│   │   │   ├── en_US/           # 英文资源
│   │   │   └── zh_CN/           # 中文资源
│   │   └── module.json5         # 模块配置（权限、Ability声明等）
│   ├── oh-package.json5         # 模块依赖配置
│   └── build-profile.json5      # 构建配置
├── oh-package.json5             # 项目级依赖
├── build-profile.json5          # 项目级构建配置
└── hvigorfile.ts                # 构建脚本
```

### 1.3 核心配置文件

#### app.json5（应用级）
```json5
{
  "app": {
    "bundleName": "com.example.myapp",
    "vendor": "example",
    "versionCode": 1000000,
    "versionName": "1.0.0",
    "icon": "$media:app_icon",
    "label": "$string:app_name",
    "minAPIVersion": 12,
    "targetAPIVersion": 12
  }
}
```

#### module.json5（模块级）
```json5
{
  "module": {
    "name": "entry",
    "type": "entry",
    "description": "$string:module_desc",
    "mainElement": "EntryAbility",
    "deviceTypes": ["phone", "tablet"],
    "requestPermissions": [
      { "name": "ohos.permission.INTERNET" },
      { "name": "ohos.permission.LOCATION" }
    ],
    "abilities": [
      {
        "name": "EntryAbility",
        "srcEntry": "./ets/entryability/EntryAbility.ets",
        "description": "$string:EntryAbility_desc",
        "icon": "$media:icon",
        "label": "$string:EntryAbility_label",
        "startWindowIcon": "$media:startIcon",
        "startWindowBackground": "$color:start_window_background",
        "exported": true,
        "skills": [
          {
            "entities": ["entity.system.home"],
            "actions": ["action.system.home"]
          }
        ]
      }
    ]
  }
}
```

### 1.4 包管理器 ohpm

ohpm 是 HarmonyOS 的官方包管理工具，类似于 npm。

```bash
# 安装依赖
ohpm install

# 安装指定三方库
ohpm install @ohos/axios

# 卸载依赖
ohpm uninstall @ohos/axios

# 查看已安装依赖
ohpm list
```

**oh-package.json5 示例：**
```json5
{
  "name": "entry",
  "version": "1.0.0",
  "description": "My HarmonyOS Module",
  "main": "",
  "author": "",
  "license": "Apache-2.0",
  "dependencies": {
    "@ohos/axios": "^2.2.0"
  },
  "devDependencies": {}
}
```


---

## 二、Stage 模型与应用生命周期

### 2.1 应用模型概述

HarmonyOS NEXT 统一使用 **Stage 模型**（废弃了旧的 FA 模型）。Stage 模型的核心概念：

| 概念 | 说明 |
|------|------|
| UIAbility | 包含 UI 的应用组件，是系统调度的基本单元 |
| ExtensionAbility | 后台扩展能力（如 ServiceExtension、FormExtension） |
| WindowStage | 窗口管理，负责页面加载和生命周期 |
| Context | 应用/组件的上下文，提供资源访问和能力调用 |
| Want | 组件间通信的载体，包含目标和数据 |

### 2.2 UIAbility 生命周期

UIAbility 有 4 个核心状态 + WindowStage 相关回调：

```
Create → WindowStageCreate → Foreground ⇄ Background → WindowStageDestroy → Destroy
```

```typescript
import { AbilityConstant, UIAbility, Want } from '@kit.AbilityKit';
import { window } from '@kit.ArkUI';
import { hilog } from '@kit.PerformanceAnalysisKit';

export default class EntryAbility extends UIAbility {
  // 1. 创建：Ability 实例创建时调用
  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    hilog.info(0x0000, 'Ability', 'onCreate');
    // 初始化非 UI 相关的逻辑
  }

  // 2. 窗口创建：WindowStage 创建后调用
  onWindowStageCreate(windowStage: window.WindowStage): void {
    hilog.info(0x0000, 'Ability', 'onWindowStageCreate');
    // 加载首页
    windowStage.loadContent('pages/Index', (err, data) => {
      if (err.code) {
        hilog.error(0x0000, 'Ability', 'Failed to load: %{public}s', JSON.stringify(err));
        return;
      }
      hilog.info(0x0000, 'Ability', 'Succeeded in loading');
    });
  }

  // 3. 前台：Ability 切换到前台时调用
  onForeground(): void {
    hilog.info(0x0000, 'Ability', 'onForeground');
    // 恢复 UI 相关资源
  }

  // 4. 后台：Ability 切换到后台时调用
  onBackground(): void {
    hilog.info(0x0000, 'Ability', 'onBackground');
    // 释放 UI 不可见时的资源
  }

  // 5. 窗口销毁
  onWindowStageDestroy(): void {
    hilog.info(0x0000, 'Ability', 'onWindowStageDestroy');
  }

  // 6. 销毁：Ability 销毁时调用
  onDestroy(): void {
    hilog.info(0x0000, 'Ability', 'onDestroy');
    // 清理所有资源
  }
}
```

### 2.3 页面生命周期

页面（被 `@Entry` 装饰的组件）有自己的生命周期回调：

```typescript
@Entry
@Component
struct Index {
  @State message: string = 'Hello World';

  // 页面显示时触发（包括路由跳转返回）
  onPageShow(): void {
    console.info('Index onPageShow');
  }

  // 页面隐藏时触发
  onPageHide(): void {
    console.info('Index onPageHide');
  }

  // 用户点击返回键时触发
  onBackPress(): boolean | void {
    console.info('Index onBackPress');
    // 返回 true 表示自行处理，不执行默认返回逻辑
  }

  build() {
    Column() {
      Text(this.message).fontSize(50)
    }
    .width('100%')
    .height('100%')
  }
}
```

### 2.4 组件生命周期

自定义组件（`@Component`）的生命周期：

```typescript
@Component
struct MyComponent {
  @State count: number = 0;

  // 组件即将出现时调用（build 之后、挂载之前）
  aboutToAppear(): void {
    console.info('MyComponent aboutToAppear');
    // 适合做数据初始化、网络请求
  }

  // 组件即将销毁时调用
  aboutToDisappear(): void {
    console.info('MyComponent aboutToDisappear');
    // 适合做资源释放、取消订阅
  }

  build() {
    Column() {
      Text(`Count: ${this.count}`)
      Button('Add').onClick(() => { this.count++; })
    }
  }
}
```


---

## 三、ArkUI 声明式 UI 框架

### 3.1 核心概念

ArkUI 是 HarmonyOS 的声明式 UI 框架，核心理念：**UI = f(State)**

- 声明式描述 UI 结构
- 状态驱动 UI 自动更新
- 组件化开发，高度复用

### 3.2 组件装饰器

| 装饰器 | 作用 | 说明 |
|--------|------|------|
| `@Entry` | 页面入口 | 标记为页面级组件，可作为路由目标 |
| `@Component` | 自定义组件 | 可复用的 UI 单元 |
| `@Builder` | 轻量构建函数 | 封装可复用的 UI 片段 |
| `@BuilderParam` | 构建函数参数 | 用于组件的 slot 模式 |
| `@Styles` | 样式复用 | 封装通用样式集合 |
| `@Extend` | 组件扩展 | 为已有组件添加自定义样式方法 |
| `@AnimatableExtend` | 动画扩展 | 创建可动画属性 |
| `@Require` | 必传参数 | API 12+ 标记构造时必须传入的参数 |

### 3.3 基础组件

```typescript
@Entry
@Component
struct BasicComponents {
  build() {
    Column({ space: 16 }) {
      // 文本
      Text('Hello ArkUI')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .fontColor('#333333')

      // 图片
      Image($r('app.media.icon'))
        .width(100)
        .height(100)
        .objectFit(ImageFit.Contain)

      // 按钮
      Button('Click Me')
        .type(ButtonType.Capsule)
        .width(200)
        .height(48)
        .onClick(() => {
          console.info('Button clicked');
        })

      // 文本输入
      TextInput({ placeholder: '请输入内容' })
        .width('90%')
        .height(48)
        .onChange((value: string) => {
          console.info('Input: ' + value);
        })

      // 切换开关
      Toggle({ type: ToggleType.Switch, isOn: true })
        .onChange((isOn: boolean) => {
          console.info('Toggle: ' + isOn);
        })

      // 进度条
      Progress({ value: 60, total: 100, type: ProgressType.Linear })
        .width('80%')

      // 加载指示器
      LoadingProgress()
        .width(48)
        .height(48)
    }
    .width('100%')
    .height('100%')
    .padding(16)
  }
}
```

### 3.4 布局组件

#### Column（垂直布局）& Row（水平布局）
```typescript
// 线性布局
Column({ space: 12 }) {
  Text('Item 1')
  Text('Item 2')
  Text('Item 3')
}
.justifyContent(FlexAlign.Center)  // 主轴对齐
.alignItems(HorizontalAlign.Center) // 交叉轴对齐
.width('100%')

Row({ space: 8 }) {
  Text('Left')
  Blank() // 弹性空白
  Text('Right')
}
.width('100%')
.justifyContent(FlexAlign.SpaceBetween)
```

#### Flex（弹性布局）
```typescript
Flex({ wrap: FlexWrap.Wrap, justifyContent: FlexAlign.SpaceAround }) {
  ForEach(this.items, (item: string) => {
    Text(item)
      .width('30%')
      .height(60)
      .backgroundColor('#F5F5F5')
      .textAlign(TextAlign.Center)
  })
}
```

#### Stack（层叠布局）
```typescript
Stack({ alignContent: Alignment.BottomEnd }) {
  Image($r('app.media.background')).width('100%').height('100%')
  Text('Overlay Text')
    .fontSize(16)
    .fontColor(Color.White)
    .padding(8)
}
```

#### Grid（网格布局）
```typescript
Grid() {
  ForEach(this.gridItems, (item: GridItem) => {
    GridItem() {
      Text(item.title)
        .textAlign(TextAlign.Center)
    }
    .backgroundColor('#F0F0F0')
  })
}
.columnsTemplate('1fr 1fr 1fr')  // 3列等分
.rowsGap(12)
.columnsGap(12)
.height(300)
```

#### List（列表）
```typescript
List({ space: 8 }) {
  ForEach(this.dataList, (item: ItemModel) => {
    ListItem() {
      Row() {
        Image(item.icon).width(48).height(48)
        Column() {
          Text(item.title).fontSize(16)
          Text(item.subtitle).fontSize(12).fontColor('#999')
        }.alignItems(HorizontalAlign.Start).margin({ left: 12 })
      }
      .width('100%')
      .padding(12)
    }
  })
}
.divider({ strokeWidth: 0.5, color: '#E5E5E5' })
.scrollBar(BarState.Off)
```

#### Tabs（标签页）
```typescript
@State currentIndex: number = 0;

Tabs({ barPosition: BarPosition.End, index: this.currentIndex }) {
  TabContent() {
    Text('首页内容')
  }.tabBar(this.tabBuilder('首页', 0, $r('app.media.ic_home')))

  TabContent() {
    Text('发现内容')
  }.tabBar(this.tabBuilder('发现', 1, $r('app.media.ic_discover')))

  TabContent() {
    Text('我的内容')
  }.tabBar(this.tabBuilder('我的', 2, $r('app.media.ic_mine')))
}
.onChange((index: number) => { this.currentIndex = index; })

@Builder
tabBuilder(title: string, targetIndex: number, icon: Resource) {
  Column() {
    Image(icon).width(24).height(24)
    Text(title).fontSize(12).margin({ top: 4 })
  }
  .justifyContent(FlexAlign.Center)
}
```

#### Swiper（轮播图）
```typescript
Swiper() {
  ForEach(this.banners, (banner: BannerItem) => {
    Image(banner.imageUrl)
      .width('100%')
      .height(200)
      .borderRadius(12)
      .objectFit(ImageFit.Cover)
  })
}
.autoPlay(true)
.interval(3000)
.indicator(true)
.loop(true)
```

### 3.5 @Builder 与 @Styles

```typescript
// @Builder：封装可复用 UI 片段
@Builder
function CardBuilder(title: string, content: string) {
  Column({ space: 8 }) {
    Text(title).fontSize(18).fontWeight(FontWeight.Bold)
    Text(content).fontSize(14).fontColor('#666')
  }
  .padding(16)
  .backgroundColor(Color.White)
  .borderRadius(12)
  .shadow({ radius: 4, color: '#1A000000', offsetY: 2 })
}

// @Styles：封装通用样式
@Styles
function cardStyle() {
  .padding(16)
  .backgroundColor(Color.White)
  .borderRadius(12)
  .shadow({ radius: 4, color: '#1A000000', offsetY: 2 })
}

// @Extend：为特定组件扩展样式方法
@Extend(Text)
function titleStyle() {
  .fontSize(18)
  .fontWeight(FontWeight.Bold)
  .fontColor('#333')
}

// 使用
@Entry
@Component
struct StyleDemo {
  build() {
    Column({ space: 16 }) {
      // 使用 Builder
      CardBuilder('标题', '这是内容描述')

      // 使用 Styles
      Column() {
        Text('使用 cardStyle').titleStyle()
      }.cardStyle()
    }
  }
}
```


---

## 四、状态管理

### 4.1 状态管理装饰器一览

ArkUI 的响应式系统通过装饰器实现：

| 装饰器 | 数据流向 | 适用场景 |
|--------|---------|---------|
| `@State` | 组件内部 | 组件私有状态，变化触发 UI 刷新 |
| `@Prop` | 父 → 子（单向） | 父传子值拷贝，子修改不影响父 |
| `@Link` | 父 ⇄ 子（双向） | 父子双向同步 |
| `@Provide` | 祖先 → 后代 | 跨层级向下传递 |
| `@Consume` | 后代 ← 祖先 | 跨层级接收 @Provide 的数据 |
| `@Observed` | 类装饰 | 标记需深度观察的类 |
| `@ObjectLink` | 父 → 子 | 观察 @Observed 对象的变化 |
| `@Watch` | 状态监听 | 状态变化时执行回调 |
| `@StorageLink` | 全局同步 | 与 AppStorage 双向绑定 |
| `@StorageProp` | 全局单向 | 与 AppStorage 单向绑定 |
| `@LocalStorageLink` | 页面级同步 | 与 LocalStorage 双向绑定 |
| `@LocalStorageProp` | 页面级单向 | 与 LocalStorage 单向绑定 |

### 4.2 @State — 组件内部状态

```typescript
@Entry
@Component
struct Counter {
  @State count: number = 0;
  @State isEnabled: boolean = true;
  @State title: string = '计数器';

  build() {
    Column({ space: 20 }) {
      Text(this.title).fontSize(24)
      Text(`当前计数: ${this.count}`).fontSize(32)
      Row({ space: 16 }) {
        Button('-')
          .onClick(() => { this.count--; })
          .enabled(this.isEnabled)
        Button('+')
          .onClick(() => { this.count++; })
          .enabled(this.isEnabled)
      }
      Toggle({ type: ToggleType.Switch, isOn: this.isEnabled })
        .onChange((isOn: boolean) => { this.isEnabled = isOn; })
    }
  }
}
```

**@State 规则：**
- 必须在声明时初始化
- 只能在组件内部修改
- 支持类型：number、string、boolean、class、数组、enum
- 不支持 any 和 undefined

### 4.3 @Prop — 单向数据流

```typescript
// 父组件
@Entry
@Component
struct Parent {
  @State parentCount: number = 0;

  build() {
    Column({ space: 16 }) {
      Text(`父组件: ${this.parentCount}`)
      Button('父+1').onClick(() => { this.parentCount++; })

      // 子组件接收 @Prop，修改不会回传给父
      ChildComponent({ count: this.parentCount })
    }
  }
}

// 子组件
@Component
struct ChildComponent {
  @Prop count: number; // 单向接收父组件数据

  build() {
    Column() {
      Text(`子组件: ${this.count}`)
      // 子组件可以修改自己的 @Prop，但不会影响父组件
      Button('子+1').onClick(() => { this.count++; })
    }
  }
}
```

### 4.4 @Link — 双向数据绑定

```typescript
// 父组件
@Entry
@Component
struct Parent {
  @State isRefreshing: boolean = false;

  build() {
    Column() {
      Text(`刷新状态: ${this.isRefreshing}`)
      // 使用 $ 符号传递引用
      RefreshHeader({ isRefreshing: $isRefreshing })
    }
  }
}

// 子组件
@Component
struct RefreshHeader {
  @Link isRefreshing: boolean; // 双向绑定

  build() {
    Row() {
      if (this.isRefreshing) {
        LoadingProgress().width(24).height(24)
        Text('刷新中...')
      } else {
        Text('下拉刷新')
      }
      Button('切换').onClick(() => {
        this.isRefreshing = !this.isRefreshing; // 会同步给父组件
      })
    }
  }
}
```

### 4.5 @Provide / @Consume — 跨层级传递

```typescript
// 祖先组件
@Entry
@Component
struct GrandParent {
  @Provide('theme') theme: string = 'light';
  @Provide('fontSize') baseFontSize: number = 16;

  build() {
    Column() {
      Button('切换主题').onClick(() => {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
      })
      Parent() // 中间层不需要传递
    }
  }
}

@Component
struct Parent {
  build() {
    Column() {
      // 不需要知道 theme 的存在
      GrandChild()
    }
  }
}

// 后代组件：直接消费
@Component
struct GrandChild {
  @Consume('theme') theme: string;
  @Consume('fontSize') baseFontSize: number;

  build() {
    Text('我是后代组件')
      .fontSize(this.baseFontSize)
      .fontColor(this.theme === 'light' ? '#333' : '#FFF')
      .backgroundColor(this.theme === 'light' ? '#FFF' : '#333')
  }
}
```

### 4.6 @Observed / @ObjectLink — 嵌套对象观察

```typescript
// 标记类为可观察
@Observed
class TaskItem {
  title: string;
  isCompleted: boolean;

  constructor(title: string, isCompleted: boolean = false) {
    this.title = title;
    this.isCompleted = isCompleted;
  }
}

// 父组件
@Entry
@Component
struct TaskList {
  @State tasks: TaskItem[] = [
    new TaskItem('学习 ArkTS'),
    new TaskItem('完成 UI 设计'),
    new TaskItem('编写测试')
  ];

  build() {
    List({ space: 8 }) {
      ForEach(this.tasks, (task: TaskItem) => {
        ListItem() {
          TaskItemView({ task: task })
        }
      })
    }
  }
}

// 子组件：通过 @ObjectLink 观察对象变化
@Component
struct TaskItemView {
  @ObjectLink task: TaskItem;

  build() {
    Row() {
      Toggle({ type: ToggleType.Checkbox, isOn: this.task.isCompleted })
        .onChange((isOn: boolean) => {
          this.task.isCompleted = isOn; // 直接修改，UI 自动更新
        })
      Text(this.task.title)
        .decoration({
          type: this.task.isCompleted ? TextDecorationType.LineThrough : TextDecorationType.None
        })
    }
  }
}
```

### 4.7 @Watch — 状态变化监听

```typescript
@Entry
@Component
struct WatchDemo {
  @State @Watch('onCountChange') count: number = 0;
  @State message: string = '';

  // count 变化时自动调用
  onCountChange(): void {
    if (this.count > 10) {
      this.message = '⚠️ 数值过大！';
    } else if (this.count < 0) {
      this.message = '⚠️ 数值为负！';
    } else {
      this.message = '';
    }
  }

  build() {
    Column({ space: 12 }) {
      Text(`Count: ${this.count}`).fontSize(32)
      if (this.message) {
        Text(this.message).fontColor(Color.Red)
      }
      Row({ space: 16 }) {
        Button('-').onClick(() => { this.count--; })
        Button('+').onClick(() => { this.count++; })
      }
    }
  }
}
```

### 4.8 AppStorage — 应用全局状态

```typescript
// 初始化全局状态（在 EntryAbility 中）
AppStorage.setOrCreate('currentUser', '');
AppStorage.setOrCreate('isLoggedIn', false);

// 组件中使用
@Entry
@Component
struct ProfilePage {
  @StorageLink('currentUser') currentUser: string = '';
  @StorageLink('isLoggedIn') isLoggedIn: boolean = false;

  build() {
    Column() {
      if (this.isLoggedIn) {
        Text(`欢迎, ${this.currentUser}`)
        Button('登出').onClick(() => {
          this.isLoggedIn = false;
          this.currentUser = '';
        })
      } else {
        Button('登录').onClick(() => {
          this.currentUser = '张三';
          this.isLoggedIn = true;
        })
      }
    }
  }
}
```

### 4.9 状态管理最佳实践

1. **不可变更新**：修改数组/对象状态时，始终创建新的引用
```typescript
// ❌ 错误：直接 push 不会触发刷新
this.list.push(newItem);

// ✅ 正确：创建新数组
this.list = [...this.list, newItem];
```

2. **最小化状态提升**：状态放在需要它的最近公共祖先

3. **避免深层嵌套**：使用 @Provide/@Consume 替代多层 @Prop/@Link 传递

4. **合理使用 @Watch**：避免在 Watch 回调中触发大量状态变化


---

## 五、路由与页面导航

### 5.1 路由方案对比

HarmonyOS NEXT 提供两种页面导航方案：

| 方案 | 特点 | 推荐场景 |
|------|------|---------|
| Navigation（推荐） | 组件级路由，支持分栏、动画自定义、模块解耦 | 大型应用、复杂导航结构 |
| router | 传统页面级路由，API 简单 | 简单应用、快速原型 |

### 5.2 Router 路由（传统方式）

```typescript
import { router } from '@kit.ArkUI';

// 页面跳转
router.pushUrl({
  url: 'pages/DetailPage',
  params: { id: '123', title: '详情' }
});

// 替换当前页面（不可返回）
router.replaceUrl({
  url: 'pages/LoginPage'
});

// 返回上一页
router.back();

// 带结果返回
router.back({ url: 'pages/Index', params: { result: 'success' } });

// 获取传递的参数
@Entry
@Component
struct DetailPage {
  @State itemId: string = '';

  aboutToAppear(): void {
    const params = router.getParams() as Record<string, string>;
    this.itemId = params?.id ?? '';
  }

  build() {
    Column() {
      Text(`Item ID: ${this.itemId}`)
      Button('返回').onClick(() => { router.back(); })
    }
  }
}
```

**路由配置（main_pages.json）：**
```json
{
  "src": [
    "pages/Index",
    "pages/DetailPage",
    "pages/LoginPage",
    "pages/SettingsPage"
  ]
}
```

### 5.3 Navigation 路由（官方推荐）

Navigation 是组件级路由，性能更好、扩展性更强：

```typescript
@Entry
@Component
struct MainPage {
  private navStack: NavPathStack = new NavPathStack();

  build() {
    Navigation(this.navStack) {
      Column({ space: 16 }) {
        Button('跳转详情').onClick(() => {
          this.navStack.pushPath({ name: 'DetailPage', param: { id: '123' } });
        })
        Button('跳转设置').onClick(() => {
          this.navStack.pushPath({ name: 'SettingsPage' });
        })
      }
    }
    .title('首页')
    .navDestination(this.pageBuilder)
  }

  @Builder
  pageBuilder(name: string, param: Object) {
    if (name === 'DetailPage') {
      DetailPage({ param: param as Record<string, string> })
    } else if (name === 'SettingsPage') {
      SettingsPage()
    }
  }
}

// 子页面
@Component
struct DetailPage {
  param: Record<string, string> = {};

  build() {
    NavDestination() {
      Column() {
        Text(`详情 ID: ${this.param.id}`)
      }
    }
    .title('详情页')
  }
}
```

**NavPathStack 常用 API：**
```typescript
// 压栈（跳转）
navStack.pushPath({ name: 'PageName', param: data });

// 弹栈（返回）
navStack.pop();

// 弹到指定页面
navStack.popToName('HomePage');

// 清空栈
navStack.clear();

// 替换当前页
navStack.replacePath({ name: 'NewPage' });

// 获取栈内页面数量
navStack.size();
```

### 5.4 页面转场动画

```typescript
// 自定义页面转场
@Entry
@Component
struct AnimatedPage {
  build() {
    Column() {
      Text('带动画的页面')
    }
    .width('100%')
    .height('100%')
    // 页面入场动画
    .transition(TransitionEffect.SLIDE_RIGHT.animation({ duration: 300 }))
  }

  // 也可以使用 pageTransition
  pageTransition() {
    PageTransitionEnter({ duration: 300 })
      .slide(SlideEffect.Right)
    PageTransitionExit({ duration: 300 })
      .slide(SlideEffect.Left)
  }
}
```


---

## 六、网络通信

### 6.1 HTTP 请求（@ohos.net.http）

HarmonyOS 原生 HTTP 模块，支持 GET/POST/PUT/DELETE 等方法。

**前置条件：** 在 `module.json5` 中声明网络权限：
```json5
"requestPermissions": [
  { "name": "ohos.permission.INTERNET" }
]
```

```typescript
import { http } from '@kit.NetworkKit';

// GET 请求
async function fetchData(url: string): Promise<string> {
  const httpRequest = http.createHttp();
  try {
    const response = await httpRequest.request(url, {
      method: http.RequestMethod.GET,
      header: {
        'Content-Type': 'application/json'
      },
      connectTimeout: 10000,  // 连接超时 10s
      readTimeout: 10000      // 读取超时 10s
    });

    if (response.responseCode === http.ResponseCode.OK) {
      return response.result as string;
    } else {
      throw new Error(`HTTP Error: ${response.responseCode}`);
    }
  } finally {
    httpRequest.destroy(); // 必须销毁，释放资源
  }
}

// POST 请求
async function postData(url: string, body: object): Promise<string> {
  const httpRequest = http.createHttp();
  try {
    const response = await httpRequest.request(url, {
      method: http.RequestMethod.POST,
      header: {
        'Content-Type': 'application/json'
      },
      extraData: JSON.stringify(body)
    });
    return response.result as string;
  } finally {
    httpRequest.destroy();
  }
}
```

### 6.2 RCP 远程通信（推荐，API 12+）

RCP (Remote Communication Platform) 是 HarmonyOS NEXT 推荐的网络请求方案，支持拦截器、会话管理等高级特性。

```typescript
import { rcp } from '@kit.RemoteCommunicationKit';

// 创建会话（可复用）
const session = rcp.createSession({
  baseAddress: 'https://api.example.com',
  headers: {
    'Authorization': 'Bearer token_xxx'
  },
  requestConfiguration: {
    transfer: {
      timeout: { connectMs: 10000, transferMs: 30000 }
    }
  }
});

// GET 请求
async function getData(): Promise<void> {
  try {
    const response = await session.get('/users');
    const data = response.toJSON(); // 直接解析 JSON
    console.info('Data:', JSON.stringify(data));
  } catch (err) {
    console.error('Request failed:', JSON.stringify(err));
  }
}

// POST 请求
async function createUser(user: object): Promise<void> {
  try {
    const response = await session.post('/users', user);
    console.info('Created:', response.statusCode);
  } catch (err) {
    console.error('Create failed:', JSON.stringify(err));
  }
}

// 自定义拦截器
class AuthInterceptor implements rcp.Interceptor {
  intercept(context: rcp.RequestContext, next: rcp.RequestHandler): Promise<rcp.Response> {
    // 请求前：添加认证头
    context.request.headers = {
      ...context.request.headers,
      'X-Timestamp': Date.now().toString()
    };
    // 继续请求链
    return next.handle(context);
  }
}

// 使用拦截器
const sessionWithInterceptor = rcp.createSession({
  interceptors: [new AuthInterceptor()]
});

// 关闭会话（不再使用时）
session.close();
```

### 6.3 网络请求封装示例

```typescript
import { rcp } from '@kit.RemoteCommunicationKit';

// API 响应类型
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

class HttpClient {
  private session: rcp.Session;

  constructor(baseUrl: string) {
    this.session = rcp.createSession({
      baseAddress: baseUrl,
      requestConfiguration: {
        transfer: {
          timeout: { connectMs: 10000, transferMs: 30000 }
        }
      }
    });
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    let url = path;
    if (params) {
      const query = Object.entries(params)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&');
      url = `${path}?${query}`;
    }
    const response = await this.session.get(url);
    const result = response.toJSON() as ApiResponse<T>;
    if (result.code !== 200) {
      throw new Error(result.message);
    }
    return result.data;
  }

  async post<T>(path: string, body: object): Promise<T> {
    const response = await this.session.post(path, body);
    const result = response.toJSON() as ApiResponse<T>;
    if (result.code !== 200) {
      throw new Error(result.message);
    }
    return result.data;
  }

  close(): void {
    this.session.close();
  }
}

// 使用
const api = new HttpClient('https://api.myapp.com');
const users = await api.get<UserModel[]>('/users');
```

---

## 七、数据持久化

### 7.1 用户首选项（Preferences）

轻量级键值对存储，适合保存配置项、用户设置。

```typescript
import { preferences } from '@kit.ArkData';
import { common } from '@kit.AbilityKit';

class PreferenceManager {
  private static prefs: preferences.Preferences | null = null;
  private static readonly STORE_NAME = 'app_settings';

  // 初始化（在 UIAbility 的 onCreate 中调用）
  static async init(context: common.UIAbilityContext): Promise<void> {
    PreferenceManager.prefs = await preferences.getPreferences(context, PreferenceManager.STORE_NAME);
  }

  // 存储数据
  static async set(key: string, value: preferences.ValueType): Promise<void> {
    await PreferenceManager.prefs?.put(key, value);
    await PreferenceManager.prefs?.flush(); // 持久化到磁盘
  }

  // 读取数据
  static async get(key: string, defaultValue: preferences.ValueType): Promise<preferences.ValueType> {
    return await PreferenceManager.prefs?.get(key, defaultValue) ?? defaultValue;
  }

  // 删除数据
  static async delete(key: string): Promise<void> {
    await PreferenceManager.prefs?.delete(key);
    await PreferenceManager.prefs?.flush();
  }

  // 判断是否存在
  static async has(key: string): Promise<boolean> {
    return await PreferenceManager.prefs?.has(key) ?? false;
  }
}

// 使用示例
await PreferenceManager.init(this.context);
await PreferenceManager.set('theme', 'dark');
await PreferenceManager.set('fontSize', 16);
const theme = await PreferenceManager.get('theme', 'light');
```

### 7.2 关系型数据库（RDB）

基于 SQLite 的关系型数据库，适合结构化数据存储。

```typescript
import { relationalStore } from '@kit.ArkData';
import { common } from '@kit.AbilityKit';

// 数据库配置
const DB_CONFIG: relationalStore.StoreConfig = {
  name: 'myapp.db',
  securityLevel: relationalStore.SecurityLevel.S1
};

// 建表 SQL
const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
`;

class DatabaseHelper {
  private store: relationalStore.RdbStore | null = null;

  async init(context: common.UIAbilityContext): Promise<void> {
    this.store = await relationalStore.getRdbStore(context, DB_CONFIG);
    await this.store.executeSql(CREATE_TABLE_SQL);
  }

  // 插入数据
  async insertNote(title: string, content: string): Promise<number> {
    const now = Date.now();
    const bucket: relationalStore.ValuesBucket = {
      'title': title,
      'content': content,
      'created_at': now,
      'updated_at': now
    };
    return await this.store!.insert('notes', bucket);
  }

  // 查询数据
  async queryNotes(): Promise<NoteModel[]> {
    const predicates = new relationalStore.RdbPredicates('notes');
    predicates.orderByDesc('created_at');

    const resultSet = await this.store!.query(predicates, [
      'id', 'title', 'content', 'created_at', 'updated_at'
    ]);

    const notes: NoteModel[] = [];
    while (resultSet.goToNextRow()) {
      notes.push({
        id: resultSet.getLong(resultSet.getColumnIndex('id')),
        title: resultSet.getString(resultSet.getColumnIndex('title')),
        content: resultSet.getString(resultSet.getColumnIndex('content')),
        createdAt: resultSet.getLong(resultSet.getColumnIndex('created_at')),
        updatedAt: resultSet.getLong(resultSet.getColumnIndex('updated_at'))
      });
    }
    resultSet.close();
    return notes;
  }

  // 更新数据
  async updateNote(id: number, title: string, content: string): Promise<number> {
    const bucket: relationalStore.ValuesBucket = {
      'title': title,
      'content': content,
      'updated_at': Date.now()
    };
    const predicates = new relationalStore.RdbPredicates('notes');
    predicates.equalTo('id', id);
    return await this.store!.update(bucket, predicates);
  }

  // 删除数据
  async deleteNote(id: number): Promise<number> {
    const predicates = new relationalStore.RdbPredicates('notes');
    predicates.equalTo('id', id);
    return await this.store!.delete(predicates);
  }
}

interface NoteModel {
  id: number;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}
```

### 7.3 数据持久化方案选择

| 方案 | 适用场景 | 数据量 |
|------|---------|--------|
| Preferences | 配置项、简单键值对 | 小（KB 级） |
| RDB | 结构化数据、复杂查询 | 中大（MB 级） |
| 分布式数据 | 跨设备同步 | 中（需组网） |
| 文件存储 | 图片、文档等非结构化 | 大 |


---

## 八、并发编程

### 8.1 并发模型概述

ArkTS 基于 **Actor 并发模型**，线程间内存隔离，通过消息传递通信。提供两种方案：

| 方案 | 特点 | 适用场景 |
|------|------|---------|
| TaskPool | 系统自动管理线程池，支持优先级/取消/延时 | 独立计算任务（< 3分钟） |
| Worker | 手动管理的后台长时线程 | 长时间运行任务 |

### 8.2 TaskPool

```typescript
import { taskpool } from '@kit.ArkTS';

// 并发函数必须用 @Concurrent 装饰
@Concurrent
function heavyComputation(data: number[]): number {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += Math.sqrt(data[i]) * Math.log(data[i] + 1);
  }
  return sum;
}

@Concurrent
function imageProcess(pixelBuffer: ArrayBuffer): ArrayBuffer {
  // 图片处理逻辑
  return pixelBuffer;
}

// 执行单个任务
async function runTask(): Promise<void> {
  const data = Array.from({ length: 1000000 }, (_, i) => i);
  const task = new taskpool.Task(heavyComputation, data);

  // 设置优先级
  task.setPriority(taskpool.Priority.HIGH);

  const result = await taskpool.execute(task) as number;
  console.info(`Result: ${result}`);
}

// 任务组：多个任务并行执行
async function runTaskGroup(): Promise<void> {
  const group = new taskpool.TaskGroup();

  const task1 = new taskpool.Task(heavyComputation, [1, 2, 3, 4, 5]);
  const task2 = new taskpool.Task(heavyComputation, [6, 7, 8, 9, 10]);
  const task3 = new taskpool.Task(heavyComputation, [11, 12, 13, 14, 15]);

  group.addTask(task1);
  group.addTask(task2);
  group.addTask(task3);

  // 所有任务完成后返回结果数组
  const results = await taskpool.execute(group) as number[];
  console.info(`Results: ${results}`);
}

// 任务取消
async function cancellableTask(): Promise<void> {
  const data = Array.from({ length: 10000000 }, (_, i) => i);
  const task = new taskpool.Task(heavyComputation, data);

  // 提交任务
  const promise = taskpool.execute(task);

  // 某个条件下取消
  setTimeout(() => {
    taskpool.cancel(task);
  }, 100);

  try {
    const result = await promise;
  } catch (err) {
    console.info('Task cancelled');
  }
}

// 串行队列：按顺序执行
async function serialExecution(): Promise<void> {
  const queue = new taskpool.SequenceRunner();
  const task1 = new taskpool.Task(heavyComputation, [1, 2, 3]);
  const task2 = new taskpool.Task(heavyComputation, [4, 5, 6]);

  // 任务按顺序执行
  await queue.execute(task1);
  await queue.execute(task2);
}
```

### 8.3 Worker

```typescript
// main thread (主线程)
import { worker } from '@kit.ArkTS';

const myWorker = new worker.ThreadWorker('entry/ets/workers/MyWorker.ets');

// 发送消息给 Worker
myWorker.postMessage({ type: 'start', data: [1, 2, 3, 4, 5] });

// 接收 Worker 返回的消息
myWorker.onmessage = (event: MessageEvents) => {
  console.info('Worker result:', JSON.stringify(event.data));
};

// 错误处理
myWorker.onerror = (err: ErrorEvent) => {
  console.error('Worker error:', err.message);
};

// 终止 Worker
myWorker.terminate();
```

```typescript
// Worker 线程文件：entry/ets/workers/MyWorker.ets
import { worker, MessageEvents } from '@kit.ArkTS';

const workerPort = worker.workerPort;

// 接收主线程消息
workerPort.onmessage = (event: MessageEvents) => {
  const { type, data } = event.data;

  if (type === 'start') {
    // 执行耗时操作
    const result = data.map((n: number) => n * n);

    // 返回结果给主线程
    workerPort.postMessage({ type: 'result', data: result });
  }
};
```

### 8.4 异步编程模式

```typescript
// Promise + async/await（推荐）
async function loadData(): Promise<DataModel> {
  try {
    const response = await fetchFromNetwork();
    const parsed = JSON.parse(response) as DataModel;
    await saveToLocal(parsed);
    return parsed;
  } catch (err) {
    console.error('Load failed:', (err as Error).message);
    // 降级：从本地缓存读取
    return await loadFromLocal();
  }
}

// 并行请求
async function loadAllData(): Promise<void> {
  const [users, posts, comments] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
    fetchComments()
  ]);
  // 全部完成后处理
}

// 竞争请求（取最快响应）
async function fetchWithFallback(): Promise<string> {
  return await Promise.race([
    fetchFromServer1(),
    fetchFromServer2()
  ]);
}
```

---

## 九、动画系统

### 9.1 属性动画

```typescript
@Entry
@Component
struct AnimationDemo {
  @State angle: number = 0;
  @State scale: number = 1;
  @State opacity: number = 1;

  build() {
    Column({ space: 20 }) {
      Image($r('app.media.icon'))
        .width(100)
        .height(100)
        .rotate({ angle: this.angle })
        .scale({ x: this.scale, y: this.scale })
        .opacity(this.opacity)
        // 属性动画：属性变化时自动执行动画
        .animation({
          duration: 500,
          curve: Curve.EaseInOut,
          iterations: 1,
          playMode: PlayMode.Normal
        })

      Button('旋转').onClick(() => {
        this.angle += 360;
      })
      Button('缩放').onClick(() => {
        this.scale = this.scale === 1 ? 1.5 : 1;
      })
      Button('淡入淡出').onClick(() => {
        this.opacity = this.opacity === 1 ? 0.3 : 1;
      })
    }
  }
}
```

### 9.2 显式动画 animateTo

```typescript
@Entry
@Component
struct ExplicitAnimation {
  @State translateX: number = 0;
  @State bgColor: ResourceColor = '#FF0000';
  @State cardHeight: number = 100;

  build() {
    Column({ space: 16 }) {
      // 被动画影响的组件
      Column()
        .width(100)
        .height(this.cardHeight)
        .backgroundColor(this.bgColor)
        .translate({ x: this.translateX })
        .borderRadius(12)

      Button('执行动画').onClick(() => {
        // animateTo：闭包中的状态变化都会带动画
        animateTo({
          duration: 800,
          curve: Curve.Spring,
          onFinish: () => {
            console.info('动画完成');
          }
        }, () => {
          // 这里的状态变化都会以动画形式展现
          this.translateX = this.translateX === 0 ? 200 : 0;
          this.bgColor = this.bgColor === '#FF0000' ? '#0000FF' : '#FF0000';
          this.cardHeight = this.cardHeight === 100 ? 200 : 100;
        });
      })
    }
    .width('100%')
    .padding(20)
  }
}
```

### 9.3 转场动画（Transition）

```typescript
@Entry
@Component
struct TransitionDemo {
  @State isShow: boolean = false;

  build() {
    Column({ space: 16 }) {
      Button(this.isShow ? '隐藏' : '显示')
        .onClick(() => {
          this.isShow = !this.isShow;
        })

      if (this.isShow) {
        Column() {
          Text('我有转场动画')
            .fontSize(20)
        }
        .width(200)
        .height(200)
        .backgroundColor('#87CEEB')
        .borderRadius(12)
        // 组件插入时的动画
        .transition(TransitionEffect.OPACITY
          .combine(TransitionEffect.scale({ x: 0.5, y: 0.5 }))
          .animation({ duration: 400, curve: Curve.EaseOut })
        )
      }
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }
}
```

### 9.4 手势处理

```typescript
@Entry
@Component
struct GestureDemo {
  @State offsetX: number = 0;
  @State offsetY: number = 0;
  @State scaleValue: number = 1;
  @State rotateAngle: number = 0;

  build() {
    Column() {
      Image($r('app.media.photo'))
        .width(200)
        .height(200)
        .translate({ x: this.offsetX, y: this.offsetY })
        .scale({ x: this.scaleValue, y: this.scaleValue })
        .rotate({ angle: this.rotateAngle })
        // 拖拽手势
        .gesture(
          PanGesture()
            .onActionUpdate((event: GestureEvent) => {
              this.offsetX = event.offsetX;
              this.offsetY = event.offsetY;
            })
        )
        // 捏合缩放手势
        .gesture(
          PinchGesture({ fingers: 2 })
            .onActionUpdate((event: GestureEvent) => {
              this.scaleValue = event.scale;
            })
        )
        // 旋转手势
        .gesture(
          RotationGesture()
            .onActionUpdate((event: GestureEvent) => {
              this.rotateAngle = event.angle;
            })
        )

      // 点击手势
      Text('双击我')
        .gesture(
          TapGesture({ count: 2 }) // 双击
            .onAction(() => {
              console.info('Double tapped!');
            })
        )

      // 长按手势
      Text('长按我')
        .gesture(
          LongPressGesture({ repeat: false, duration: 800 })
            .onAction(() => {
              console.info('Long pressed!');
            })
        )
    }
  }
}
```


---

## 十、分布式能力

### 10.1 分布式概述

HarmonyOS 的核心差异化能力 — **分布式软总线**，实现多设备协同：

| 能力 | 说明 |
|------|------|
| 分布式数据对象 | 多设备间数据实时同步 |
| 跨设备调用 | 远程启动 Ability、调用服务 |
| 分布式文件 | 跨设备文件访问 |
| 跨设备迁移 | 应用任务无缝流转 |
| 多端协同 | 多设备协作完成任务 |

### 10.2 分布式数据对象

```typescript
import { distributedDataObject } from '@kit.ArkData';

// 定义分布式数据对象
interface SharedNote {
  title: string;
  content: string;
  lastEditor: string;
  updatedAt: number;
}

// 创建分布式数据对象
const note = distributedDataObject.create(this.context, {
  title: '会议记录',
  content: '',
  lastEditor: '',
  updatedAt: Date.now()
} as SharedNote);

// 设置 SessionId（相同 SessionId 的设备可同步数据）
note.setSessionId('meeting_note_001');

// 监听数据变化
note.on('change', (sessionId: string, fields: string[]) => {
  console.info(`Data changed by other device: ${fields.join(', ')}`);
  // 更新本地 UI
});

// 监听设备上下线
note.on('status', (sessionId: string, networkId: string, status: string) => {
  console.info(`Device ${networkId}: ${status}`); // 'online' | 'offline'
});

// 修改数据（自动同步到其他设备）
note.title = '新标题';
note.content = '新内容';
note.lastEditor = '设备A';
note.updatedAt = Date.now();

// 保存到本地（持久化）
note.save('localDeviceId');

// 退出同步
note.setSessionId('');
```

### 10.3 跨设备启动 Ability

```typescript
import { common, Want } from '@kit.AbilityKit';

// 获取跨设备的 Want
function getRemoteWant(deviceId: string): Want {
  return {
    deviceId: deviceId,
    bundleName: 'com.example.myapp',
    abilityName: 'EntryAbility',
    parameters: {
      'action': 'openNote',
      'noteId': '12345'
    }
  };
}

// 跨设备启动
async function startRemoteAbility(context: common.UIAbilityContext, deviceId: string): Promise<void> {
  const want = getRemoteWant(deviceId);
  try {
    await context.startAbility(want);
    console.info('Remote ability started successfully');
  } catch (err) {
    console.error('Failed to start remote ability:', JSON.stringify(err));
  }
}
```

### 10.4 应用迁移（任务流转）

```typescript
import { UIAbility, AbilityConstant, Want } from '@kit.AbilityKit';

export default class MigrationAbility extends UIAbility {
  // 保存迁移数据
  onContinue(wantParam: Record<string, Object>): AbilityConstant.OnContinueResult {
    // 保存当前状态到 wantParam
    wantParam['currentPage'] = 'reading';
    wantParam['pageProgress'] = 0.65;
    wantParam['articleId'] = 'article_001';

    return AbilityConstant.OnContinueResult.AGREE; // 同意迁移
  }

  // 接收迁移数据（目标设备）
  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    if (launchParam.launchReason === AbilityConstant.LaunchReason.CONTINUATION) {
      // 恢复迁移状态
      const page = want.parameters?.['currentPage'] as string;
      const progress = want.parameters?.['pageProgress'] as number;
      // 恢复到迁移前的状态
    }
  }
}
```

---

## 十一、模块化与包管理

### 11.1 模块类型

| 类型 | 全称 | 特点 |
|------|------|------|
| HAP | Harmony Ability Package | 应用安装包，包含代码和资源 |
| HAR | Harmony Archive | 静态共享包，编译时合入 HAP |
| HSP | Harmony Shared Package | 动态共享包，运行时加载，多 HAP 共享 |

### 11.2 HAR（静态共享包）

适用于在多模块间复用代码和资源：

```
library/                        # HAR 模块
├── src/main/ets/
│   ├── components/             # 共享组件
│   │   └── CommonButton.ets
│   ├── utils/                  # 共享工具
│   │   └── DateUtils.ets
│   └── Index.ets               # 导出入口
├── oh-package.json5
└── build-profile.json5
```

```typescript
// library/src/main/ets/Index.ets — 统一导出
export { CommonButton } from './components/CommonButton';
export { DateUtils } from './utils/DateUtils';
export { HttpClient } from './utils/HttpClient';
```

```json5
// entry/oh-package.json5 — 引用 HAR
{
  "dependencies": {
    "@libs/common": "file:../library"
  }
}
```

```typescript
// 使用
import { CommonButton, DateUtils } from '@libs/common';
```

### 11.3 HSP（动态共享包）

运行时按需加载，减少安装包体积：

```typescript
// 动态加载 HSP 中的页面
import { router } from '@kit.ArkUI';

router.pushUrl({
  url: '@bundle:com.example.myapp/feature_pay/ets/pages/PayPage'
});
```

### 11.4 模块间通信

```typescript
// 通过 EventHub 实现模块解耦通信
import { common } from '@kit.AbilityKit';

// 发送事件
const context = getContext(this) as common.UIAbilityContext;
context.eventHub.emit('loginSuccess', { userId: '123', userName: '张三' });

// 监听事件
context.eventHub.on('loginSuccess', (data: Record<string, string>) => {
  console.info(`User logged in: ${data.userName}`);
});

// 取消监听
context.eventHub.off('loginSuccess');
```


---

## 十二、ArkTS 语言约束（与 TypeScript 的关键差异）

ArkTS 在 TypeScript 基础上施加了更严格的静态约束，以下是必须遵守的规则：

### 12.1 禁止的 TypeScript 特性

| 禁止特性 | 说明 | 替代方案 |
|---------|------|---------|
| `any` 类型 | 不允许使用 any | 使用具体类型或 Object |
| 动态属性访问 | `obj[dynamicKey]` 受限 | 使用 Record 类型或接口 |
| `eval()` | 禁止 | 无替代，重构逻辑 |
| `with` 语句 | 禁止 | 使用变量引用 |
| `arguments` 对象 | 禁止 | 使用 rest 参数 |
| 隐式类型转换 | 受限 | 显式转换 |
| 结构化类型匹配 | 受限（鸭子类型） | 使用 implements 显式声明 |
| `typeof` 类型守卫 | 部分受限 | 使用 instanceof |
| `delete` 运算符 | 禁止 | 设为 undefined 或重建对象 |
| 解构赋值展开 | 部分受限 | 按属性逐一赋值 |

### 12.2 必须遵守的规则

```typescript
// ❌ 禁止：未初始化的类属性
class Bad {
  name: string; // 编译报错！
}

// ✅ 正确：必须初始化
class Good {
  name: string = '';
  age: number = 0;
}

// ❌ 禁止：使用 any
function process(data: any) { } // 编译报错！

// ✅ 正确：使用具体类型
function process(data: string | number) { }
function processObject(data: Record<string, Object>) { }

// ❌ 禁止：对象字面量动态属性
let obj = {};
obj['dynamicKey'] = 'value'; // 编译报错！

// ✅ 正确：预定义接口或使用 Record
interface Config {
  theme: string;
  fontSize: number;
}
let config: Config = { theme: 'dark', fontSize: 16 };

// ❌ 禁止：函数声明后立即调用 (IIFE)
(function() { })(); // 不支持

// ✅ 正确：正常函数调用
function init() { }
init();

// ❌ 禁止：in 运算符用于类型收窄
if ('name' in obj) { } // 不支持

// ✅ 正确：使用 instanceof
if (obj instanceof Person) { }

// ❌ 禁止：展开运算符用于对象
let merged = { ...obj1, ...obj2 }; // 受限

// ✅ 正确：使用 Object.assign 或手动合并
let merged = Object.assign({}, obj1, obj2);
```

### 12.3 类型系统增强

```typescript
// ArkTS 支持的特殊类型
// Sendable：可跨线程传递的对象（用于并发）
@Sendable
class SharedData {
  value: number = 0;
}

// 严格的数组类型
let arr: number[] = [1, 2, 3]; // OK
// let arr2: (number | string)[] = [1, 'a']; // 需明确联合类型

// 严格的函数返回类型
function calculate(x: number): number { // 必须声明返回类型
  return x * 2;
}
```

---

## 十三、权限管理

### 13.1 权限分类

| 类型 | 说明 | 示例 |
|------|------|------|
| system_grant | 系统自动授予 | INTERNET、GET_NETWORK_INFO |
| user_grant | 需用户手动授权 | LOCATION、CAMERA、MICROPHONE |

### 13.2 权限声明

在 `module.json5` 中声明：
```json5
{
  "module": {
    "requestPermissions": [
      {
        "name": "ohos.permission.INTERNET"
      },
      {
        "name": "ohos.permission.APPROXIMATELY_LOCATION",
        "reason": "$string:location_reason",
        "usedScene": {
          "abilities": ["EntryAbility"],
          "when": "inuse"
        }
      },
      {
        "name": "ohos.permission.CAMERA",
        "reason": "$string:camera_reason",
        "usedScene": {
          "abilities": ["EntryAbility"],
          "when": "inuse"
        }
      }
    ]
  }
}
```

### 13.3 动态权限申请

```typescript
import { abilityAccessCtrl, common, Permissions } from '@kit.AbilityKit';

class PermissionManager {
  private context: common.UIAbilityContext;

  constructor(context: common.UIAbilityContext) {
    this.context = context;
  }

  // 检查权限
  async checkPermission(permission: Permissions): Promise<boolean> {
    const atManager = abilityAccessCtrl.createAtManager();
    const tokenId = this.context.applicationInfo.accessTokenId;
    const result = atManager.checkAccessTokenSync(tokenId, permission);
    return result === abilityAccessCtrl.GrantStatus.PERMISSION_GRANTED;
  }

  // 请求权限
  async requestPermissions(permissions: Permissions[]): Promise<boolean> {
    const atManager = abilityAccessCtrl.createAtManager();
    try {
      const result = await atManager.requestPermissionsFromUser(this.context, permissions);
      // 检查所有权限是否都被授予
      return result.authResults.every(
        (status) => status === abilityAccessCtrl.GrantStatus.PERMISSION_GRANTED
      );
    } catch (err) {
      console.error('Permission request failed:', JSON.stringify(err));
      return false;
    }
  }

  // 请求定位权限
  async requestLocation(): Promise<boolean> {
    return await this.requestPermissions([
      'ohos.permission.APPROXIMATELY_LOCATION' as Permissions
    ]);
  }

  // 请求相机权限
  async requestCamera(): Promise<boolean> {
    return await this.requestPermissions([
      'ohos.permission.CAMERA' as Permissions
    ]);
  }
}

// 使用示例
const permMgr = new PermissionManager(this.context);
const granted = await permMgr.requestLocation();
if (granted) {
  // 获取位置信息
} else {
  // 引导用户去设置页面开启权限
}
```

---

## 十四、常用系统能力（Kit）

### 14.1 SDK Kit 分类

HarmonyOS NEXT 将系统能力按功能域分为多个 Kit：

| Kit | 功能 | 常用 API |
|-----|------|---------|
| `@kit.ArkUI` | UI 框架 | router, window, font |
| `@kit.ArkTS` | 语言增强 | taskpool, worker, collections |
| `@kit.AbilityKit` | 应用框架 | UIAbility, Want, Context |
| `@kit.NetworkKit` | 网络 | http, socket, webSocket |
| `@kit.RemoteCommunicationKit` | 远程通信 | rcp (HTTP Client) |
| `@kit.ArkData` | 数据管理 | preferences, relationalStore |
| `@kit.MediaKit` | 媒体 | audio, video, image |
| `@kit.CameraKit` | 相机 | camera |
| `@kit.SensorServiceKit` | 传感器 | sensor |
| `@kit.LocationKit` | 定位 | geoLocationManager |
| `@kit.NotificationKit` | 通知 | notificationManager |
| `@kit.BackgroundTasksKit` | 后台任务 | backgroundTaskManager |
| `@kit.PerformanceAnalysisKit` | 性能 | hilog, hiTrace |
| `@kit.CoreFileKit` | 文件 | fileIo, fileUri |
| `@kit.MapKit` | 地图 | map, mapCommon |
| `@kit.ConnectivityKit` | 连接 | bluetooth, wifi |
| `@kit.ScanKit` | 扫码 | scanBarcode |
| `@kit.PushKit` | 推送 | pushService |
| `@kit.ShareKit` | 分享 | share |

### 14.2 导入方式

```typescript
// 推荐：按需导入
import { router } from '@kit.ArkUI';
import { http } from '@kit.NetworkKit';
import { preferences } from '@kit.ArkData';
import { common, UIAbility } from '@kit.AbilityKit';
import { taskpool } from '@kit.ArkTS';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { fileIo } from '@kit.CoreFileKit';

// ❌ 不推荐：全量导入（增大包体积）
import * as networkKit from '@kit.NetworkKit';
```


---

## 十五、编码规范与最佳实践

### 15.1 命名规范

| 类别 | 规范 | 示例 |
|------|------|------|
| 文件名 | PascalCase（组件）/ camelCase（工具） | `HomePage.ets`, `dateUtils.ets` |
| 类名 | PascalCase | `UserManager`, `HttpClient` |
| 接口名 | PascalCase（I 前缀可选） | `UserModel`, `IRepository` |
| 函数名 | camelCase | `getUserInfo()`, `formatDate()` |
| 变量名 | camelCase | `userName`, `isLoading` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| 组件名 | PascalCase | `CustomButton`, `UserCard` |
| 装饰器变量 | camelCase | `@State userName: string` |
| 枚举名 | PascalCase | `enum UserStatus { Active, Inactive }` |

### 15.2 项目组织最佳实践

```
entry/src/main/ets/
├── entryability/
│   └── EntryAbility.ets        # 应用入口
├── pages/                       # 页面（路由目标）
│   ├── Index.ets
│   ├── DetailPage.ets
│   └── SettingsPage.ets
├── components/                  # 可复用组件
│   ├── common/                  # 通用基础组件
│   │   ├── LoadingView.ets
│   │   └── EmptyView.ets
│   └── business/                # 业务组件
│       ├── UserCard.ets
│       └── ArticleItem.ets
├── model/                       # 数据模型（接口定义）
│   ├── UserModel.ets
│   └── ArticleModel.ets
├── viewmodel/                   # 视图模型（业务逻辑）
│   ├── HomeViewModel.ets
│   └── UserViewModel.ets
├── services/                    # 服务层（API 调用）
│   ├── UserService.ets
│   └── ArticleService.ets
├── utils/                       # 工具函数
│   ├── HttpClient.ets
│   ├── DateUtils.ets
│   └── Logger.ets
├── constants/                   # 常量定义
│   ├── AppConfig.ets
│   └── RouterPaths.ets
└── workers/                     # Worker 线程文件
    └── DataSyncWorker.ets
```

### 15.3 组件开发规范

```typescript
/**
 * 用户信息卡片组件
 * 展示用户头像、昵称和简介
 */
@Component
struct UserCard {
  // 1. 装饰器变量放在最前面，按类型分组
  @Prop userName: string = '';
  @Prop avatarUrl: string = '';
  @Prop bio: string = '';
  @Link isFollowing: boolean;

  // 2. 普通成员变量
  private readonly defaultAvatar: Resource = $r('app.media.default_avatar');

  // 3. 生命周期回调
  aboutToAppear(): void {
    // 初始化逻辑
  }

  // 4. 事件处理方法
  private handleFollow(): void {
    this.isFollowing = !this.isFollowing;
  }

  // 5. Builder 方法
  @Builder
  private avatarBuilder() {
    Image(this.avatarUrl || this.defaultAvatar)
      .width(48)
      .height(48)
      .borderRadius(24)
  }

  // 6. build 方法放在最后
  build() {
    Row({ space: 12 }) {
      this.avatarBuilder()
      Column({ space: 4 }) {
        Text(this.userName).fontSize(16).fontWeight(FontWeight.Medium)
        Text(this.bio).fontSize(12).fontColor('#999').maxLines(1)
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)

      Button(this.isFollowing ? '已关注' : '关注')
        .type(ButtonType.Capsule)
        .height(32)
        .onClick(() => this.handleFollow())
    }
    .width('100%')
    .padding(16)
    .backgroundColor(Color.White)
    .borderRadius(12)
  }
}
```

### 15.4 性能优化要点

1. **列表优化**
```typescript
// 使用 LazyForEach 替代 ForEach 处理长列表
class MyDataSource implements IDataSource {
  private dataArray: ItemModel[] = [];
  // ... 实现 totalCount(), getData(), registerDataChangeListener() 等
}

List() {
  LazyForEach(this.dataSource, (item: ItemModel) => {
    ListItem() { ItemView({ item: item }) }
  }, (item: ItemModel) => item.id.toString()) // 提供唯一 key
}
.cachedCount(5) // 预加载数量
```

2. **避免不必要的重绘**
```typescript
// ❌ 在 build 中创建对象（每次重绘都会新建）
build() {
  Text('hello').fontColor(new Color(255, 0, 0))
}

// ✅ 提取为常量或状态
private readonly redColor: ResourceColor = '#FF0000';
build() {
  Text('hello').fontColor(this.redColor)
}
```

3. **条件渲染优化**
```typescript
// 使用 visibility 替代 if/else（避免组件反复创建销毁）
Column() {
  Text('Loading...')
    .visibility(this.isLoading ? Visibility.Visible : Visibility.None)
  List() { /* 内容 */ }
    .visibility(this.isLoading ? Visibility.None : Visibility.Visible)
}
```

4. **图片优化**
```typescript
Image(imageUrl)
  .width(200).height(200)
  .objectFit(ImageFit.Cover)
  .autoResize(true)          // 自动缩放到组件大小
  .interpolation(ImageInterpolation.Medium) // 适中的插值质量
```

### 15.5 日志规范

```typescript
import { hilog } from '@kit.PerformanceAnalysisKit';

// 定义日志域和标签
const DOMAIN = 0x0001;
const TAG = 'MyApp';

// 不同级别的日志
hilog.debug(DOMAIN, TAG, 'Debug message: %{public}s', 'details');
hilog.info(DOMAIN, TAG, 'Info message: userId=%{public}d', userId);
hilog.warn(DOMAIN, TAG, 'Warning: low memory');
hilog.error(DOMAIN, TAG, 'Error: %{public}s', err.message);

// %{public} 表示可在发布日志中显示
// %{private} 表示隐私数据（默认），发布日志中会脱敏
```

---

## 十六、测试

### 16.1 单元测试

HarmonyOS 使用 `@ohos/hypium` 测试框架：

```typescript
import { describe, it, expect } from '@ohos/hypium';

export default function DateUtilsTest() {
  describe('DateUtils', () => {
    it('formatDate should format timestamp correctly', 0, () => {
      const timestamp = 1704067200000; // 2024-01-01
      const result = DateUtils.formatDate(timestamp, 'YYYY-MM-DD');
      expect(result).assertEqual('2024-01-01');
    });

    it('isToday should return true for today', 0, () => {
      const now = Date.now();
      expect(DateUtils.isToday(now)).assertTrue();
    });

    it('isToday should return false for yesterday', 0, () => {
      const yesterday = Date.now() - 86400000;
      expect(DateUtils.isToday(yesterday)).assertFalse();
    });
  });
}
```

### 16.2 UI 测试

```typescript
import { Driver, ON, Component } from '@ohos.UiTest';

export default function IndexPageTest() {
  describe('IndexPage UI Test', () => {
    it('should display welcome text', 0, async () => {
      const driver = Driver.create();
      await driver.delayMs(1000);

      const text = await driver.findComponent(ON.text('Hello World'));
      expect(text).not().assertNull();
    });

    it('should navigate on button click', 0, async () => {
      const driver = Driver.create();
      const button = await driver.findComponent(ON.text('进入详情'));
      await button.click();
      await driver.delayMs(500);

      const detailText = await driver.findComponent(ON.text('详情页'));
      expect(detailText).not().assertNull();
    });
  });
}
```

---

## 十七、构建与发布

### 17.1 构建命令

```bash
# 使用 hvigorw 构建（类似 Gradle）
hvigorw assembleHap          # 构建 HAP 包
hvigorw assembleApp          # 构建 APP 包（用于上架）
hvigorw clean                # 清理构建产物

# ohpm 依赖管理
ohpm install                 # 安装依赖
ohpm update                  # 更新依赖
```

### 17.2 签名与发布

1. **开发调试**：DevEco Studio 自动签名
2. **上架发布**：需要在 AGC (AppGallery Connect) 申请发布证书和 Profile
3. **打包格式**：`.app` 文件（包含一个或多个 HAP）

### 17.3 多设备适配

```typescript
import { deviceInfo } from '@kit.BasicServicesKit';

// 获取设备类型
const deviceType = deviceInfo.deviceType; // 'phone' | 'tablet' | '2in1' | 'tv'

// 响应式布局
@Entry
@Component
struct AdaptivePage {
  @StorageProp('currentBreakpoint') currentBp: string = 'sm';

  build() {
    GridRow({ columns: { sm: 4, md: 8, lg: 12 } }) {
      GridCol({ span: { sm: 4, md: 4, lg: 6 } }) {
        // 内容区域，根据断点自适应列数
        Text('自适应内容')
      }
    }
  }
}
```

---

## 十八、开发资源与参考

### 官方资源
- [华为开发者文档](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/arkts)
- [ArkTS API 参考](https://developer.huawei.com/consumer/cn/doc/harmonyos-references)
- [ArkTS Specification 1.1.0](https://docs.asprain.cn/ArkTSSpec/)
- [Codelabs 示例](https://developer.huawei.com/consumer/cn/codelabs)
- [Gitee 官方 Samples](https://gitee.com/harmonyos_samples)

### 社区资源
- [OpenHarmony Gitee](https://gitee.com/openharmony)
- [ArkUI Engine 源码](https://gitee.com/openharmony/arkui_ace_engine)
- [HarmonyOS 开发者社区](https://devpress.csdn.net/)

### 开发工具
- DevEco Studio（官方 IDE）
- ohpm（包管理器）
- hvigorw（构建工具）
- hdc（设备连接调试工具）

---

> **文档说明**：本指南基于 HarmonyOS NEXT (API 12+) 编写，涵盖 ArkTS 语言特性、ArkUI 框架、状态管理、路由导航、网络通信、数据持久化、并发编程、分布式能力、动画系统、模块化开发等核心开发领域。随着 API 版本迭代，部分 API 可能有变更，请以官方最新文档为准。
