# 蓝牙键鼠 (Bluetooth HID) - Android App

## 项目简介

这是一个基于 React Native + Expo 开发的 Android 应用，将您的 Android 手机变成蓝牙键盘、鼠标和游戏手柄！

## 功能特性

### 核心功能
- ✅ **设备扫描** - 快速扫描附近的蓝牙设备
- ✅ **设备连接** - 一键连接到您的目标设备
- ✅ **键盘模式** - 完整的虚拟键盘，支持按键输入
- ✅ **鼠标模式** - 触控板、左右键、滚轮功能
- ✅ **游戏手柄** - 虚拟摇杆和游戏按键
- ✅ **模拟功能** - 包含完整的模拟实现，确保应用可以正常运行

### 技术特性
- 🛠️ **React Native + Expo** - 现代化跨平台开发
- 📱 **Android 深度优化** - 专为 Android 平台设计
- 🔒 **安全权限配置** - 完整的蓝牙权限配置
- 🎨 **Material Design** - 美观的用户界面
- 💾 **状态管理** - 统一的应用状态管理

## 项目结构

```
BluetoothHID/
├── android/                     # Android 原生项目
│   ├── app/
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── AndroidManifest.xml  # 应用清单和权限
│   │   │       └── java/com/bluetoothhid/app/
│   │   └── build.gradle
│   └── gradle/wrapper/
├── assets/                      # 应用资源文件
├── src/                         # React Native 源代码
│   ├── screens/                 # 应用页面
│   │   ├── HomeScreen.tsx       # 首页 (设备连接)
│   │   ├── KeyboardScreen.tsx   # 键盘模式
│   │   ├── MouseScreen.tsx      # 鼠标模式
│   │   └── GamepadScreen.tsx    # 游戏手柄模式
│   └── utils/
│       └── bluetooth.ts         # 蓝牙管理工具
├── modules/                     # 自定义 Expo 模块
│   └── bluetooth-hid/           # 蓝牙 HID 原生模块
│       ├── android/             # Android 原生代码
│       ├── index.ts             # TypeScript 接口
│       └── package.json
├── App.tsx                      # 应用入口
├── app.json                     # Expo 配置
├── package.json                 # 项目依赖
└── PROJECT_README.md            # 本文档
```

## 本地构建 APK

### 前置要求

1. **Node.js** (推荐 v18 或更高)
2. **Java 17** (Android 开发的标准版本)
3. **Android Studio** (包含 Android SDK)
4. **Git** (可选，用于版本控制)

### 构建步骤

#### 1. 安装依赖

```bash
cd BluetoothHID
npm install
```

#### 2. 设置环境变量

确保设置正确的 Java 和 Android 环境变量：

```bash
# Linux/Mac
export JAVA_HOME=/path/to/java-17
export ANDROID_HOME=/path/to/android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator

# Windows (PowerShell)
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:ANDROID_HOME = "C:\Users\YourName\AppData\Local\Android\Sdk"
```

#### 3. 使用 Expo 构建 (推荐)

```bash
# 构建调试 APK
npx expo run:android

# 或者使用 Gradle 直接构建
cd android
./gradlew assembleDebug
```

#### 4. 构建发布版本 APK

```bash
cd android
./gradlew assembleRelease
```

APK 文件位置：
- 调试版本：`android/app/build/outputs/apk/debug/app-debug.apk`
- 发布版本：`android/app/build/outputs/apk/release/app-release.apk`

## 使用说明

### 首次使用

1. 安装并打开应用
2. 确保手机蓝牙已开启
3. 点击「扫描设备」按钮
4. 从列表中选择要连接的设备
5. 连接成功后，选择输入模式（键盘/鼠标/手柄）

### 键盘模式

- 使用虚拟键盘输入文本
- 支持常用的快捷键
- 适合在需要快速输入时使用

### 鼠标模式

- 在触控区域滑动移动光标
- 点击左键/右键按钮
- 滑动滚轮区域滚动页面

### 游戏手柄模式

- 使用虚拟摇杆控制方向
- 使用右侧按钮进行游戏操作
- 适合在电视或平板上玩游戏

## 权限说明

应用需要以下 Android 权限：

- `BLUETOOTH` - 基础蓝牙功能
- `BLUETOOTH_ADMIN` - 蓝牙设备管理
- `BLUETOOTH_CONNECT` (Android 12+) - 连接蓝牙设备
- `BLUETOOTH_SCAN` (Android 12+) - 扫描蓝牙设备
- `ACCESS_FINE_LOCATION` - 蓝牙扫描需要位置权限

## 开发计划

- [ ] 完成蓝牙 HID 原生模块实现
- [ ] 支持更多键盘快捷键
- [ ] 添加自定义按键映射
- [ ] 支持多设备连接切换
- [ ] 添加深色/浅色主题切换

## 技术栈

- **React Native 0.85** - 移动应用框架
- **Expo 56** - 开发平台
- **TypeScript** - 类型安全
- **React Navigation** - 路由导航
- **Gradle** - Android 构建系统

## 常见问题

### 构建失败？

1. 确保 Java 17 是默认版本
2. 检查 ANDROID_HOME 环境变量
3. 运行 `npm install` 确保依赖正确
4. 清理构建缓存：`cd android && ./gradlew clean`

### 蓝牙无法连接？

1. 确保目标设备已开启蓝牙并可被发现
2. 检查应用是否有必要的权限
3. 尝试重启应用和蓝牙

## 许可证

本项目采用 MIT 许可证。

---

**注意**：目前蓝牙 HID 功能包含模拟实现，完整的原生模块需要进一步开发和测试。
