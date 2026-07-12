# 蓝牙键鼠

## 说明
这是基于蓝牙 HID 协议从而将安卓手机模拟成蓝牙键盘，鼠标以及手柄。

## 工程结构
```
.
├── settings.gradle.kts
├── build.gradle.kts
├── gradle.properties
├── gradle/wrapper/gradle-wrapper.properties
└── app/
    ├── build.gradle.kts
    ├── proguard-rules.pro
    └── src/main/
        ├── AndroidManifest.xml
        ├── java/com/example/bluetoothhid/
        │   ├── HidDescriptors.kt        # 复合 HID 报表描述符（键盘+鼠标+手柄）
        │   ├── BluetoothHidService.kt   # 蓝牙 HID Device 服务（代理/注册/发送）
        │   └── MainActivity.kt          # 主界面与演示按钮
        └── res/
            ├── layout/activity_main.xml
            └── values/{strings,themes,colors}.xml
```

## 关键技术点
- 使用 `BluetoothProfile.HID_DEVICE` 获取 `BluetoothHidDevice` 代理。
- 通过 `registerApp()` 注册 HID 应用，传入 SDP 记录、QoS 设置与复合报表描述符。
- 复合描述符使用 Report ID 区分三种设备：
  - Report ID 1：键盘（8 字节：modifier + reserved + 6 keycodes）
  - Report ID 2：鼠标（3 字节：buttons + X + Y，相对位移）
  - Report ID 3：手柄（5 字节：buttons + hat + X + Y）
- 通过 `sendReport(device, reportId, data)` 向主机发送输入报表。

## 环境要求
- `minSdk = 30`（Android 11）。`BluetoothHidDevice` 公共 API 在 API 33（Android 13）转正，
  API 30–32 上类已存在于框架中但属隐藏 API，实际可用性视设备而定。
- `compileSdk = 34`，Kotlin 1.9，AGP 8.5，Gradle 8.7。

## 构建与运行
```bash
# 生成 Debug APK
./gradlew assembleDebug

# 安装到已连接设备
./gradlew installDebug
```
> 项目未内置 `gradlew` 脚本与 wrapper jar，请用本机 Gradle 8.7 执行 `gradle wrapper` 生成，
> 或在 Android Studio 中打开工程自动补齐。

## 使用流程
1. 打开蓝牙；
2. 在系统设置中先把手机与目标主机（电脑/平板）配对；
3. 打开 App，授权 `BLUETOOTH_CONNECT`；
4. 点击「连接主机」，选择已配对设备；
5. 连接成功后用各按钮测试键盘 / 鼠标 / 手柄输入。

## 贡献
欢迎提交 issues 或 PR。请在 PR 描述中说明变更内容与测试方法。
