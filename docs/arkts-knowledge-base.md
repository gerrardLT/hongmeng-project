---
inclusion: manual
---

# ArkTS 语言知识库

> 来源：[华为官方文档 - ArkTS语言介绍 V5](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/introduction-to-arkts-V5)  
> 整理日期：2026-06-04

---

## 一、ArkTS 概述

ArkTS 是 HarmonyOS 应用开发的**主力编程语言**，基于 TypeScript 的超集。

**核心特性：**
- 继承 TypeScript 的静态类型检查语法
- 对动态类型施加更严格限制，减少运行时开销
- 编译期可深度优化，实现更快的应用启动和更低的功耗
- 原生支持 ArkUI 声明式 UI 和状态管理
- 与 JavaScript/TypeScript 无缝互通，可复用已有代码库

---

## 二、基础语法

### 变量与常量声明

```typescript
// 变量：可修改
let hi: string = 'hello';
hi = 'hello, world';

// 常量：只读，只能赋值一次
const hello: string = 'hello';

// 自动类型推断（无需显式指定类型）
let hi1: string = 'hello';
let hi2 = 'hello, world'; // 自动推断为 string
```

### 基本类型

#### number
```typescript
let n1 = 3.14;         // 浮点
let n2 = 0x1123;       // 十六进制
let n3 = 0o777;        // 八进制
let n4 = 0b11;         // 二进制
let n5 = 1e2;          // 科学计数法

// 大整数用 BigInt，避免精度丢失
let bigInt: BigInt = BigInt('999999999999999999999999999999');
```

#### boolean
```typescript
let isDone: boolean = false;
if (isDone) {
  console.log('Done!');
}
```

#### string
```typescript
let s1 = 'Hello, world!\n';   // 单引号
let s2 = "this is a string";  // 双引号
let a = 'Success';
let s3 = `The result is ${a}`; // 模板字符串
```

#### void
```typescript
// 用于标注函数无返回值
function greet(): void {
  console.log('hello');
}
```

#### Object
所有引用类型的基类，任何值（包括基本类型装箱后）都可赋给 Object 类型变量。

#### array
```typescript
let names: string[] = ['Alice', 'Bob', 'Carol'];
```

#### enum（枚举）
```typescript
enum ColorSet { Red, Green, Blue }
let c: ColorSet = ColorSet.Red;

// 自定义枚举值
enum ColorSet2 { White = 0xFF, Grey = 0x7F, Black = 0x00 }
```

#### union（联合类型）
```typescript
type Animal = Cat | Dog | Frog | number;
let animal: Animal = new Cat();
animal = 42; // 合法

// 配合 instanceof 做类型收窄
function foo(animal: Animal) {
  if (animal instanceof Frog) {
    animal.leap(); // 此处 animal 确定是 Frog 类型
  }
  animal.sleep();
}
```

#### Aliases（类型别名）
```typescript
type Matrix = number[][];
type Handler = (s: string, no: number) => string;
type Predicate<T> = (x: T) => boolean;
type NullableObject = Object | null;
```

#### Record
```typescript
let map: Record<string, number> = {
  'John': 25,
  'Mary': 21,
};
map['John']; // 25
```

---

## 三、运算符

### 赋值运算符
- 基本赋值：`=`
- 复合赋值：`+=`、`-=`、`*=`、`/=`、`%=`、`<<=`、`>>=`、`>>>=`、`&=`、`|=`、`^=`

### 比较运算符
| 运算符 | 说明 |
|--------|------|
| `===` | 严格相等（类型和值都相等） |
| `!==` | 严格不相等 |
| `==` | 相等 |
| `!=` | 不相等 |
| `>`、`>=`、`<`、`<=` | 大小比较 |

### 算术运算符
- 一元：`-`、`+`、`--`、`++`
- 二元：`+`、`-`、`*`、`/`、`%`

### 位运算符
| 运算符 | 说明 |
|--------|------|
| `a & b` | 按位与 |
| `a \| b` | 按位或 |
| `a ^ b` | 按位异或 |
| `~a` | 按位非 |
| `a << b` | 左移 |
| `a >> b` | 算术右移（带符号扩展） |
| `a >>> b` | 逻辑右移（左边补0） |

### 逻辑运算符
- `&&`（与）、`||`（或）、`!`（非）

---

## 四、控制流语句

### if / else if / else
```typescript
if (condition1) {
  // ...
} else if (condition2) {
  // ...
} else {
  // ...
}
```

### switch
```typescript
switch (expression) {
  case label1:
    // ...
    break;
  case label2:
  case label3:
    // ...
    break;
  default:
    // ...
}
```

### 条件（三元）表达式
```typescript
let message = Math.random() > 0.5 ? 'Valid' : 'Failed';
```

### for / for-of
```typescript
for (let i = 0; i < 10; i++) { /* ... */ }

for (let ch of 'a string object') { /* ... */ }
```

### while / do-while
```typescript
while (condition) { /* ... */ }

do { /* ... */ } while (condition);
```

### break / continue
```typescript
// break 可带标签跳出外层循环
label: while (true) {
  switch (x) {
    case 1: break label;
  }
}
```

### throw / try / catch / finally
```typescript
throw new Error('this error');

try {
  // 可能抛出异常的代码
} catch (e) {
  // 异常处理
} finally {
  // 必然执行的清理代码
}
```

---

## 五、函数

```typescript
// 函数声明
function add(a: number, b: number): number {
  return a + b;
}

// 可选参数
function greet(name?: string): string {
  return `Hello, ${name ?? 'World'}`;
}

// Rest 参数
function sum(...nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

// 箭头函数（Lambda）
const multiply = (a: number, b: number): number => a * b;

// 函数重载
function foo(x: number): void;
function foo(x: string): void;
function foo(x: number | string): void { /* 实现 */ }
```

---

## 六、类

### 字段与方法

```typescript
class Person {
  // 实例字段（必须初始化！）
  name: string = '';
  private _age: number = 0;
  static numberOfPersons = 0; // 静态字段

  // getter / setter
  get age(): number { return this._age; }
  set age(x: number) {
    if (x < 0) throw Error('Invalid age');
    this._age = x;
  }

  // 构造函数
  constructor(n: string, a: number) {
    this.name = n;
    this._age = a;
    Person.numberOfPersons++;
  }

  // 实例方法
  getName(): string { return this.name; }

  // 静态方法
  static create(n: string): Person { return new Person(n, 0); }
}
```

### 可见性修饰符
| 修饰符 | 可访问范围 |
|--------|-----------|
| `public` | 任何地方（默认） |
| `private` | 仅类内部 |
| `protected` | 类内部及子类 |

### 继承

```typescript
class Employee extends Person {
  salary: number = 0;

  constructor(n: string, a: number, s: number) {
    super(n, a); // 必须先调用父类构造函数
    this.salary = s;
  }

  calculateTaxes(): number {
    return this.salary * 0.42;
  }
}
```

### 抽象类

```typescript
abstract class Shape {
  abstract area(): number; // 抽象方法，子类必须实现
  draw() { /* 默认实现 */ }
}
```

### 接口

```typescript
interface DateInterface {
  now(): string;
}

class MyDate implements DateInterface {
  now(): string { return 'now'; }
}
```

### 方法重写与重载

```typescript
// 重写（override）：子类覆盖父类方法
class Square extends RectangleSize {
  private side: number = 0;
  area(): number { return this.side * this.side; } // 重写父类 area()
}

// 重载：同名方法，不同签名
class C {
  foo(x: number): void;
  foo(x: string): void;
  foo(x: number | string): void { /* 实现 */ }
}
```

---

## 七、空安全

ArkTS 严格要求处理 null/undefined，在编译期捕获潜在空指针错误。

```typescript
// 可选字段（可能为 undefined）
class Person {
  name?: string;
}

// 可选链：安全访问，不会抛出异常
let len = person.name?.length;

// 空值合并：为 null/undefined 时取默认值
let displayName = person.name ?? 'Anonymous';

// 非空断言：开发者保证此处不为 null/undefined
let len2 = person.name!.length;

// 错误示例（编译报错）
class Bad {
  name: string; // ❌ 未初始化，ArkTS 不允许
}

// 正确示例
class Good {
  name: string = ''; // ✅ 显式初始化
}
```

---

## 八、泛型

```typescript
// 泛型类
class Stack<T> {
  private items: T[] = [];
  push(item: T) { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
}

// 泛型接口
interface Repository<T> {
  findById(id: number): T;
  save(entity: T): void;
}

// 泛型函数
function identity<T>(x: T): T { return x; }

// 泛型约束
function getLength<T extends { length: number }>(x: T): number {
  return x.length;
}

// 泛型默认值
class Container<T = string> { value: T | null = null; }
```

---

## 九、模块系统

### 静态导入（编译时）

```typescript
// 导入全部并命名
import * as Utils from './utils';
Utils.X;

// 按名导入
import { X, Y } from './utils';

// 导入并重命名
import { X as Z } from './utils';

// 导入 HarmonyOS SDK（推荐方式）
import { UIAbility } from '@kit.AbilityKit';
import { UIAbility, Ability, Context } from '@kit.AbilityKit';
```

### 动态导入（运行时按需加载）

```typescript
// Promise 方式
import('./Calc').then((obj: ESObject) => {
  console.info(obj.add(3, 5));
}).catch((err: Error) => {
  console.error('Module import error:', err);
});

// async/await 方式
async function test() {
  let ns = await import('./say');
  ns.hi();
  ns.bye();
}
```

> ⚠️ 避免使用 `import * as module from '@kit.AbilityKit'` 导入整个 Kit，会导致 HAP 包体积过大。

---

## 十、ArkTS vs TypeScript 核心差异

| 特性 | TypeScript | ArkTS |
|------|-----------|-------|
| 动态类型 | 支持 | **受限**，编译期强制类型检查 |
| 字段初始化 | 可选（strictPropertyInitialization） | **必须**在声明或构造函数中初始化 |
| 运行时性能 | 一般 | **更高**，编译期深度优化 |
| UI 框架 | 无内置 | 内置 **ArkUI** 声明式语法 |
| 状态管理 | 无内置 | 内置装饰器（`@State`、`@Prop`、`@Link` 等） |
| 目标平台 | 通用 | 专为 **HarmonyOS 移动设备**优化 |

---

## 十一、ArkUI 状态管理装饰器（扩展）

ArkTS 通过装饰器实现响应式 UI，这是超出标准 TypeScript 的鸿蒙专属特性：

| 装饰器 | 作用 |
|--------|------|
| `@State` | 组件内部状态，变化时触发 UI 刷新 |
| `@Prop` | 父组件向子组件单向传递数据 |
| `@Link` | 父子组件双向数据绑定 |
| `@Observed` | 标记需要被观察的类 |
| `@ObjectLink` | 与 `@Observed` 配合，观察嵌套对象变化 |
| `@Provide` / `@Consume` | 跨层级组件数据共享 |

---

## 十二、开发注意事项

1. **字段必须初始化**：所有类字段在声明时或构造函数中必须赋值，否则编译报错。
2. **严格类型**：不要依赖隐式的 `any`，所有类型应明确声明。
3. **空安全**：使用 `?.`、`??`、`!` 处理可能为空的值，避免运行时崩溃。
4. **模块导入**：优先使用具名导入而非全量导入，减少包体积。
5. **大整数**：`number` 类型对超大整数有精度问题，使用 `BigInt` 替代。
6. **动态导入**：按需加载模块时使用动态 `import()`，提升启动性能。
