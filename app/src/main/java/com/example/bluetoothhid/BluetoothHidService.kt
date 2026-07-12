package com.example.bluetoothhid

import android.app.Service
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothHidDevice
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothProfile
import android.content.Context
import android.content.Intent
import android.os.Binder
import android.os.IBinder
import android.util.Log

/**
 * 蓝牙 HID Device 服务。
 *
 * 负责：
 *  1. 获取 BluetoothHidDevice 代理；
 *  2. 注册 HID 应用（SDP 记录 + 报表描述符）；
 *  3. 对外暴露键盘 / 鼠标 / 手柄报表发送接口；
 *  4. 通过 [StateListener] 把连接状态回调给调用方。
 *
 * 注意：调用方需自行保证已获取 BLUETOOTH_CONNECT 运行时权限。
 */
class BluetoothHidService : Service() {

    companion object {
        private const val TAG = "BluetoothHidService"

        /** 键盘报表 ID */
        const val REPORT_ID_KEYBOARD = 1
        /** 鼠标报表 ID */
        const val REPORT_ID_MOUSE = 2
        /** 手柄报表 ID */
        const val REPORT_ID_GAMEPAD = 3

        /** 键盘报表长度（不含 Report ID）：1 modifier + 1 reserved + 6 keycodes */
        private const val KEYBOARD_REPORT_LEN = 8
        /** 鼠标报表长度（不含 Report ID）：1 buttons + 1 X + 1 Y */
        private const val MOUSE_REPORT_LEN = 3
        /** 手柄报表长度（不含 Report ID）：1 buttons + 1 hat + 1 X + 1 Y */
        private const val GAMEPAD_REPORT_LEN = 5
    }

    /** 连接状态回调 */
    interface StateListener {
        fun onProxyReady()
        fun onAppRegistered()
        fun onConnectionStateChanged(device: BluetoothDevice, state: Int)
        fun onError(message: String)
    }

    private val binder = LocalBinder()
    private var hidDevice: BluetoothHidDevice? = null
    private var hostDevice: BluetoothDevice? = null
    private var listener: StateListener? = null
    private var appRegistered = false

    /** 当前连接状态：[BluetoothProfile.STATE_DISCONNECTED] 等等 */
    var connectionState: Int = BluetoothProfile.STATE_DISCONNECTED
        private set

    inner class LocalBinder : Binder() {
        fun service(): BluetoothHidService = this@BluetoothHidService
    }

    override fun onBind(intent: Intent?): IBinder = binder

    fun setListener(listener: StateListener?) {
        this.listener = listener
    }

    /**
     * 初始化：获取 BluetoothAdapter 并请求 HID_DEVICE profile 代理。
     * @return true 表示已发起请求，结果通过 [StateListener.onProxyReady] 回调。
     */
    fun init(): Boolean {
        val manager = getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
        val adapter = manager?.adapter ?: run {
            listener?.onError("设备不支持蓝牙")
            return false
        }
        if (!adapter.isEnabled) {
            listener?.onError("蓝牙未开启")
            return false
        }
        return adapter.getProfileProxy(this, proxyCallback, BluetoothProfile.HID_DEVICE)
    }

    private val proxyCallback = object : BluetoothProfile.ServiceListener {
        override fun onServiceConnected(profile: Int, proxy: BluetoothProfile) {
            if (profile != BluetoothProfile.HID_DEVICE) return
            hidDevice = proxy as? BluetoothHidDevice
            Log.i(TAG, "HID_DEVICE 代理就绪")
            listener?.onProxyReady()
            registerApp()
        }

        override fun onServiceDisconnected(profile: Int) {
            if (profile != BluetoothProfile.HID_DEVICE) return
            Log.w(TAG, "HID_DEVICE 代理断开")
            hidDevice = null
            appRegistered = false
        }
    }

    /** 注册 HID 应用，使用复合描述符 */
    private fun registerApp() {
        val hd = hidDevice ?: run {
            listener?.onError("代理未就绪")
            return
        }
        val sdp = BluetoothHidDeviceAppSdpRecord(
            "BluetoothHid",          // name
            "Android HID Keyboard/Mouse/Gamepad", // description
            "BluetoothHidProvider",  // provider
            BluetoothHidDevice.SUBCLASS1_KEYBOARD.toByte().toInt(),
            HidDescriptors.COMPOSITE
        )
        val qos = BluetoothHidDeviceAppQosSettings(
            BluetoothHidDevice.SERVICE_PRIORITY_HIGH,
            800,  // token rate
            9,    // token bucket size
            11250,// peak bandwidth
            11250,// latency
            11250 // delay variation
        )
        val ok = hd.registerApp(sdp, null, qos, mainExecutor) { device, state ->
            // 连接状态回调
            hostDevice = device
            connectionState = state
            Log.i(TAG, "连接状态变更: ${device?.address} -> $state")
            listener?.onConnectionStateChanged(device, state)
        }
        if (!ok) {
            listener?.onError("registerApp 失败")
        } else {
            appRegistered = true
            listener?.onAppRegistered()
        }
    }

    /**
     * 主动连接到指定的主机设备（手机作为 HID 设备连到电脑/平板）。
     */
    fun connect(device: BluetoothDevice): Boolean {
        val hd = hidDevice
        if (hd == null || !appRegistered) {
            listener?.onError("HID 应用未注册")
            return false
        }
        return hd.connect(device)
    }

    /** 断开当前主机连接 */
    fun disconnect(): Boolean {
        val hd = hidDevice ?: return false
        val dev = hostDevice ?: return false
        return hd.disconnect(dev)
    }

    /** 取消注册并释放代理 */
    fun release() {
        val hd = hidDevice ?: return
        if (appRegistered) {
            hd.unregisterApp()
            appRegistered = false
        }
        val manager = getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
        manager?.adapter?.closeProfileProxy(BluetoothProfile.HID_DEVICE, hd)
        hidDevice = null
    }

    // ===== 键盘 =====

    /**
     * 发送键盘报表。
     * @param modifier 修饰键位掩码（见 [HidDescriptors.KeyboardModifier]）
     * @param keyCodes 同时按下的按键 HID usage，最多 6 个，0 表示无
     */
    fun sendKeyboard(modifier: Byte = 0, keyCodes: ByteArray = ByteArray(6)): Boolean {
        val hd = hidDevice ?: return false
        val report = ByteArray(KEYBOARD_REPORT_LEN).apply {
            this[0] = modifier
            this[1] = 0
            for (i in 0 until minOf(6, keyCodes.size)) {
                this[2 + i] = keyCodes[i]
            }
        }
        return hd.sendReport(hostDevice, REPORT_ID_KEYBOARD, report)
    }

    /** 单次按下并释放一个按键（带修饰键） */
    fun tapKey(keyCode: Byte, modifier: Byte = 0): Boolean {
        val keys = ByteArray(6).apply { this[0] = keyCode }
        val down = sendKeyboard(modifier, keys)
        sendKeyboard(0, ByteArray(6)) // 释放
        return down
    }

    // ===== 鼠标 =====

    /**
     * 发送鼠标报表。
     * @param buttons 按键位掩码（见 [HidDescriptors.MouseButton]）
     * @param dx X 方向相对位移 (-127..127)
     * @param dy Y 方向相对位移 (-127..127)
     */
    fun sendMouse(buttons: Byte = 0, dx: Byte = 0, dy: Byte = 0): Boolean {
        val hd = hidDevice ?: return false
        val report = ByteArray(MOUSE_REPORT_LEN).apply {
            this[0] = buttons
            this[1] = dx
            this[2] = dy
        }
        return hd.sendReport(hostDevice, REPORT_ID_MOUSE, report)
    }

    /** 单击鼠标左键 */
    fun leftClick(): Boolean {
        val a = sendMouse(HidDescriptors.MouseButton.LEFT)
        sendMouse(0)
        return a
    }

    // ===== 手柄 =====

    /**
     * 发送手柄报表。
     * @param buttons 按键位掩码（见 [HidDescriptors.GamepadButton]）
     * @param hat 方向键 0..7，8/15 表示松开（Null）
     * @param xX X 摇杆 (-127..127)
     * @param yY Y 摇杆 (-127..127)
     */
    fun sendGamepad(buttons: Byte = 0, hat: Byte = 0x08, xX: Byte = 0, yY: Byte = 0): Boolean {
        val hd = hidDevice ?: return false
        val report = ByteArray(GAMEPAD_REPORT_LEN).apply {
            this[0] = buttons
            this[1] = hat
            this[2] = xX
            this[3] = yY
        }
        // 描述符里手柄 X/Y 为 8 位（Logical -127..127），故总长度 5
        return hd.sendReport(hostDevice, REPORT_ID_GAMEPAD, report)
    }

    override fun onDestroy() {
        super.onDestroy()
        release()
    }
}
