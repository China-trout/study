package com.example.bluetoothhid

/**
 * HID 报表描述符。
 *
 * 使用 Report ID 区分三种设备：
 *  - Report ID 1: 键盘（8 字节：1 modifier + 1 reserved + 6 keycodes）
 *  - Report ID 2: 鼠标（3 字节：1 buttons + 1 X + 1 Y，相对位移）
 *  - Report ID 3: 手柄（6 字节：1 buttons + 1 hat + 2 X + 2 Y，绝对摇杆）
 *
 * 描述符按照 USB HID 规范编写，Usage Page 切换以区分通用桌面与游戏手柄。
 */
object HidDescriptors {

    /** 复合设备描述符：键盘 + 鼠标 + 手柄 */
    val COMPOSITE: ByteArray = byteArrayOf(
        // 0x05, 0x01        Usage Page (Generic Desktop Ctrls)
        0x05, 0x01,
        // 0x09, 0x00        Usage (Undefined) -> 用作应用集合根
        0x09, 0x00,
        // 0xA1, 0x01        Collection (Application)
        0xA1, 0x01,

        // ===== Report ID 1: 键盘 =====
        // 0x85, 0x01        Report ID (1)
        0x85, 0x01,
        // 0x05, 0x07        Usage Page (Keyboard/Keypad)
        0x05, 0x07,
        // 0x19, 0xE0        Usage Minimum (0xE0)  左 Ctrl
        0x19, 0xE0,
        // 0x29, 0xE7        Usage Maximum (0xE7)  右 GUI
        0x29, 0xE7,
        // 0x15, 0x00        Logical Minimum (0)
        0x15, 0x00,
        // 0x25, 0x01        Logical Maximum (1)
        0x25, 0x01,
        // 0x75, 0x01        Report Size (1)
        0x75, 0x01,
        // 0x95, 0x08        Report Count (8)     8 个修饰键
        0x95, 0x08,
        // 0x81, 0x02        Input (Data,Var,Abs)
        0x81, 0x02,
        // 0x95, 0x01        Report Count (1)     保留字节
        0x95, 0x01,
        // 0x75, 0x08        Report Size (8)
        0x75, 0x08,
        // 0x81, 0x01        Input (Cnst,Arr,Abs)
        0x81, 0x01,
        // 0x95, 0x05        Report Count (5)     按键数组
        0x95, 0x05,
        // 0x75, 0x08        Report Size (8)
        0x75, 0x08,
        // 0x15, 0x00        Logical Minimum (0)
        0x15, 0x00,
        // 0x25, 0x65        Logical Maximum (101)
        0x25, 0x65,
        // 0x05, 0x07        Usage Page (Keyboard/Keypad)
        0x05, 0x07,
        // 0x19, 0x00        Usage Minimum (0x00)
        0x19, 0x00,
        // 0x29, 0x65        Usage Maximum (0x65)
        0x29, 0x65,
        // 0x81, 0x00        Input (Data,Array,Abs)
        0x81, 0x00,
        // 0x95, 0x01        Report Count (1)     填充
        0x95, 0x01,
        // 0x75, 0x03        Report Size (3)
        0x75, 0x03,
        // 0x91, 0x01        Output (Cnst,Arr,Abs)  LED 状态
        0x91, 0x01,
        // 0x95, 0x06        Report Count (6)
        0x95, 0x06,
        // 0x75, 0x08        Report Size (8)
        0x75, 0x08,
        // 0x81, 0x01        Input (Cnst,Arr,Abs)  按键填充
        0x81, 0x01,

        // ===== Report ID 2: 鼠标 =====
        // 0x85, 0x02        Report ID (2)
        0x85, 0x02,
        // 0x05, 0x01        Usage Page (Generic Desktop)
        0x05, 0x01,
        // 0x09, 0x02        Usage (Mouse)
        0x09, 0x02,
        // 0xA1, 0x01        Collection (Application)
        0xA1, 0x01,
        // 0x09, 0x01        Usage (Pointer)
        0x09, 0x01,
        // 0xA1, 0x00        Collection (Physical)
        0xA1, 0x00,
        // 0x05, 0x09        Usage Page (Button)
        0x05, 0x09,
        // 0x19, 0x01        Usage Minimum (0x01)
        0x19, 0x01,
        // 0x29, 0x03        Usage Maximum (0x03)
        0x29, 0x03,
        // 0x15, 0x00        Logical Minimum (0)
        0x15, 0x00,
        // 0x25, 0x01        Logical Maximum (1)
        0x25, 0x01,
        // 0x95, 0x03        Report Count (3)
        0x95, 0x03,
        // 0x75, 0x01        Report Size (1)
        0x75, 0x01,
        // 0x81, 0x02        Input (Data,Var,Abs)
        0x81, 0x02,
        // 0x95, 0x01        Report Count (1)     填充 5 位
        0x95, 0x01,
        // 0x75, 0x05        Report Size (5)
        0x75, 0x05,
        // 0x81, 0x01        Input (Cnst,Arr,Abs)
        0x81, 0x01,
        // 0x05, 0x01        Usage Page (Generic Desktop)
        0x05, 0x01,
        // 0x09, 0x30        Usage (X)
        0x09, 0x30,
        // 0x09, 0x31        Usage (Y)
        0x09, 0x31,
        // 0x15, 0x81        Logical Minimum (-127)
        0x15, 0x81.toByte(),
        // 0x25, 0x7F        Logical Maximum (127)
        0x25, 0x7F,
        // 0x75, 0x08        Report Size (8)
        0x75, 0x08,
        // 0x95, 0x02        Report Count (2)
        0x95, 0x02,
        // 0x81, 0x06        Input (Data,Var,Rel)
        0x81, 0x06,
        // 0xC0              End Collection
        0xC0,
        // 0xC0              End Collection
        0xC0,

        // ===== Report ID 3: 手柄 =====
        // 0x85, 0x03        Report ID (3)
        0x85, 0x03,
        // 0x05, 0x01        Usage Page (Generic Desktop)
        0x05, 0x01,
        // 0x09, 0x05        Usage (Game Pad)
        0x09, 0x05,
        // 0xA1, 0x01        Collection (Application)
        0xA1, 0x01,
        // 0x05, 0x09        Usage Page (Button)
        0x05, 0x09,
        // 0x19, 0x01        Usage Minimum (0x01)
        0x19, 0x01,
        // 0x29, 0x08        Usage Maximum (0x08)
        0x29, 0x08,
        // 0x15, 0x00        Logical Minimum (0)
        0x15, 0x00,
        // 0x25, 0x01        Logical Maximum (1)
        0x25, 0x01,
        // 0x75, 0x01        Report Size (1)
        0x75, 0x01,
        // 0x95, 0x08        Report Count (8)
        0x95, 0x08,
        // 0x81, 0x02        Input (Data,Var,Abs)
        0x81, 0x02,
        // 0x05, 0x01        Usage Page (Generic Desktop)
        0x05, 0x01,
        // 0x09, 0x39        Usage (Hat switch)
        0x09, 0x39,
        // 0x15, 0x00        Logical Minimum (0)
        0x15, 0x00,
        // 0x25, 0x07        Logical Maximum (7)
        0x25, 0x07,
        // 0x35, 0x00        Physical Minimum (0)
        0x35, 0x00,
        // 0x46, 0x3B, 0x01  Physical Maximum (315)
        0x46, 0x3B, 0x01,
        // 0x65, 0x14        Unit (Eng Rot:Deg)
        0x65, 0x14,
        // 0x75, 0x04        Report Size (4)
        0x75, 0x04,
        // 0x95, 0x01        Report Count (1)
        0x95, 0x01,
        // 0x81, 0x42        Input (Data,Var,Abs,Null)
        0x81, 0x42,
        // 0x75, 0x04        Report Size (4)     填充 4 位
        0x75, 0x04,
        // 0x95, 0x01        Report Count (1)
        0x95, 0x01,
        // 0x81, 0x01        Input (Cnst,Arr,Abs)
        0x81, 0x01,
        // 0x05, 0x01        Usage Page (Generic Desktop)
        0x05, 0x01,
        // 0x09, 0x30        Usage (X)
        0x09, 0x30,
        // 0x09, 0x31        Usage (Y)
        0x09, 0x31,
        // 0x15, 0x81        Logical Minimum (-127)
        0x15, 0x81.toByte(),
        // 0x25, 0x7F        Logical Maximum (127)
        0x25, 0x7F,
        // 0x75, 0x08        Report Size (8)
        0x75, 0x08,
        // 0x95, 0x02        Report Count (2)
        0x95, 0x02,
        // 0x81, 0x02        Input (Data,Var,Abs)
        0x81, 0x02,

        // 0xC0              End Collection (Game Pad)
        0xC0,

        // 0xC0              End Collection (Application root)
        0xC0
    )

    /** 键盘修饰键位掩码 */
    object KeyboardModifier {
        const val LEFT_CTRL: Byte = 0x01
        const val LEFT_SHIFT: Byte = 0x02
        const val LEFT_ALT: Byte = 0x04
        const val LEFT_GUI: Byte = 0x08
        const val RIGHT_CTRL: Byte = 0x10
        const val RIGHT_SHIFT: Byte = 0x20
        const val RIGHT_ALT: Byte = 0x40
        const val RIGHT_GUI: Byte = 0x80.toByte()
    }

    /** 鼠标按键位掩码 */
    object MouseButton {
        const val LEFT: Byte = 0x01
        const val RIGHT: Byte = 0x02
        const val MIDDLE: Byte = 0x04
    }

    /** 手柄按键位掩码 */
    object GamepadButton {
        const val A: Byte = 0x01
        const val B: Byte = 0x02
        const val X: Byte = 0x04
        const val Y: Byte = 0x08
        const val LB: Byte = 0x10
        const val RB: Byte = 0x20
        const val SELECT: Byte = 0x40
        const val START: Byte = 0x80.toByte()
    }
}
