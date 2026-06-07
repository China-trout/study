package com.bluetoothhid

import android.Manifest
import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothHidDevice
import android.bluetooth.BluetoothHidDeviceAppSdpSettings
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothProfile
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import androidx.core.app.ActivityCompat
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

data class BluetoothDeviceRecord(
    @Field val id: String,
    @Field val name: String,
    @Field val address: String,
    @Field val signalStrength: Int
) : Record

data class KeyboardReportRecord(
    @Field val modifiers: Int,
    @Field val keyCodes: List<Int>
) : Record

data class MouseReportRecord(
    @Field val buttons: Int,
    @Field val x: Int,
    @Field val y: Int,
    @Field val wheel: Int
) : Record

data class GamepadReportRecord(
    @Field val buttons: Int,
    @Field val hat: Int,
    @Field val leftStickX: Int,
    @Field val leftStickY: Int,
    @Field val rightStickX: Int,
    @Field val rightStickY: Int
) : Record

class BluetoothHidModule : Module() {
    private val context: Context
        get() = requireNotNull(appContext.reactContext) { "React context is unavailable" }
    
    private val bluetoothAdapter: BluetoothAdapter? by lazy {
        val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        bluetoothManager.adapter
    }
    
    private var bluetoothHidDevice: BluetoothHidDevice? = null
    private var connectedDevice: BluetoothDevice? = null
    private val handler = Handler(Looper.getMainLooper())
    private val scannedDevices = mutableListOf<BluetoothDevice>()
    private val deviceFoundCallback: ((BluetoothDevice) -> Unit)? = null
    
    // HID Report Descriptor for composite device (Keyboard + Mouse + Gamepad)
    private val hidReportDescriptor = byteArrayOf(
        0x05, 0x01, // Usage Page (Generic Desktop)
        0x09, 0x06, // Usage (Keyboard)
        0xA1, 0x01, // Collection (Application)
        0x05, 0x07, //   Usage Page (Key Codes)
        0x19, 0xE0, //   Usage Minimum (224)
        0x29, 0xE7, //   Usage Maximum (231)
        0x15, 0x00, //   Logical Minimum (0)
        0x25, 0x01, //   Logical Maximum (1)
        0x75, 0x01, //   Report Size (1)
        0x95, 0x08, //   Report Count (8)
        0x81, 0x02, //   Input (Data, Var, Abs)
        0x95, 0x01, //   Report Count (1)
        0x75, 0x08, //   Report Size (8)
        0x81, 0x03, //   Input (Const, Var, Abs)
        0x95, 0x06, //   Report Count (6)
        0x75, 0x08, //   Report Size (8)
        0x15, 0x00, //   Logical Minimum (0)
        0x25, 0x65, //   Logical Maximum (101)
        0x05, 0x07, //   Usage Page (Key Codes)
        0x19, 0x00, //   Usage Minimum (0)
        0x29, 0x65, //   Usage Maximum (101)
        0x81, 0x00, //   Input (Data, Array)
        0xC0,       // End Collection
        
        0x05, 0x01, // Usage Page (Generic Desktop)
        0x09, 0x02, // Usage (Mouse)
        0xA1, 0x01, // Collection (Application)
        0x09, 0x01, //   Usage (Pointer)
        0xA1, 0x00, //   Collection (Physical)
        0x05, 0x09, //     Usage Page (Button)
        0x19, 0x01, //     Usage Minimum (1)
        0x29, 0x03, //     Usage Maximum (3)
        0x15, 0x00, //     Logical Minimum (0)
        0x25, 0x01, //     Logical Maximum (1)
        0x95, 0x03, //     Report Count (3)
        0x75, 0x01, //     Report Size (1)
        0x81, 0x02, //     Input (Data, Var, Abs)
        0x95, 0x01, //     Report Count (1)
        0x75, 0x05, //     Report Size (5)
        0x81, 0x03, //     Input (Const, Var, Abs)
        0x05, 0x01, //     Usage Page (Generic Desktop)
        0x09, 0x30, //     Usage (X)
        0x09, 0x31, //     Usage (Y)
        0x15, 0x81.toByte(), // Logical Minimum (-127)
        0x25, 0x7F, //     Logical Maximum (127)
        0x75, 0x08, //     Report Size (8)
        0x95, 0x02, //     Report Count (2)
        0x81, 0x06, //     Input (Data, Var, Rel)
        0x09, 0x38, //     Usage (Wheel)
        0x15, 0x81.toByte(), // Logical Minimum (-127)
        0x25, 0x7F, //     Logical Maximum (127)
        0x75, 0x08, //     Report Size (8)
        0x95, 0x01, //     Report Count (1)
        0x81, 0x06, //     Input (Data, Var, Rel)
        0xC0,       //   End Collection
        0xC0,       // End Collection
        
        0x05, 0x01, // Usage Page (Generic Desktop)
        0x09, 0x05, // Usage (Game Pad)
        0xA1, 0x01, // Collection (Application)
        0x05, 0x01, //   Usage Page (Generic Desktop)
        0x09, 0x30, //   Usage (X)
        0x09, 0x31, //   Usage (Y)
        0x09, 0x32, //   Usage (Z)
        0x09, 0x35, //   Usage (Rz)
        0x15, 0x00, //   Logical Minimum (0)
        0x26, 0xFF.toByte(), 0x00, // Logical Maximum (255)
        0x75, 0x08, //   Report Size (8)
        0x95, 0x04, //   Report Count (4)
        0x81, 0x02, //   Input (Data, Var, Abs)
        0x05, 0x09, //   Usage Page (Button)
        0x19, 0x01, //   Usage Minimum (Button 1)
        0x29, 0x10, //   Usage Maximum (Button 16)
        0x15, 0x00, //   Logical Minimum (0)
        0x25, 0x01, //   Logical Maximum (1)
        0x75, 0x01, //   Report Size (1)
        0x95, 0x10, //   Report Count (16)
        0x81, 0x02, //   Input (Data, Var, Abs)
        0xC0        // End Collection
    )
    
    private val sdpSettings = BluetoothHidDeviceAppSdpSettings(
        "Bluetooth HID",
        "Android Bluetooth HID Device",
        "Expo",
        BluetoothHidDevice.SUBCLASS1_COMBO,
        hidReportDescriptor
    )
    
    private val profileListener = object : BluetoothProfile.ServiceListener {
        override fun onServiceConnected(profile: Int, proxy: BluetoothProfile) {
            if (profile == BluetoothProfile.HID_DEVICE) {
                bluetoothHidDevice = proxy as BluetoothHidDevice
                bluetoothHidDevice?.registerApp(sdpSettings, null, null, { it.run() }, callback)
            }
        }
        
        override fun onServiceDisconnected(profile: Int) {
            if (profile == BluetoothProfile.HID_DEVICE) {
                bluetoothHidDevice = null
            }
        }
    }
    
    private val callback = object : BluetoothHidDevice.Callback() {
        override fun onAppStatusChanged(pluggedDevice: BluetoothDevice?, registered: Boolean) {
            // Handle app status change
        }
        
        override fun onConnectionStateChanged(device: BluetoothDevice?, state: Int) {
            if (state == BluetoothProfile.STATE_CONNECTED) {
                connectedDevice = device
            } else if (state == BluetoothProfile.STATE_DISCONNECTED) {
                connectedDevice = null
            }
        }
        
        override fun onGetReport(device: BluetoothDevice?, type: Byte, id: Byte, bufferSize: Int) {
            // Not needed for our use case
        }
        
        override fun onSetReport(device: BluetoothDevice?, type: Byte, id: Byte, data: ByteArray?) {
            // Not needed for our use case
        }
        
        override fun onSetProtocol(device: BluetoothDevice?, protocol: Byte) {
            // Not needed for our use case
        }
        
        override fun onInterruptData(device: BluetoothDevice?, reportId: Byte, data: ByteArray?) {
            // Not needed for our use case
        }
    }
    
    init {
        bluetoothAdapter?.getProfileProxy(context, profileListener, BluetoothProfile.HID_DEVICE)
    }
    
    override fun definition() = ModuleDefinition {
        Name("BluetoothHid")
        
        AsyncFunction("startScan") { promise: Promise ->
            if (!hasBluetoothPermissions()) {
                promise.reject("PERMISSION_ERROR", "Bluetooth permissions not granted")
                return@AsyncFunction
            }
            
            if (bluetoothAdapter == null) {
                promise.reject("BLUETOOTH_UNAVAILABLE", "Bluetooth is not available")
                return@AsyncFunction
            }
            
            if (!bluetoothAdapter!!.isEnabled) {
                promise.reject("BLUETOOTH_DISABLED", "Bluetooth is disabled")
                return@AsyncFunction
            }
            
            scannedDevices.clear()
            
            @Suppress("DEPRECATION")
            val discoveryStarted = bluetoothAdapter!!.startDiscovery()
            
            if (discoveryStarted) {
                handler.postDelayed({
                    @Suppress("DEPRECATION")
                    bluetoothAdapter?.cancelDiscovery()
                    val devices = scannedDevices.map { device ->
                        BluetoothDeviceRecord(
                            id = device.address,
                            name = device.name ?: "Unknown Device",
                            address = device.address,
                            signalStrength = -50 // Mock signal strength
                        )
                    }
                    promise.resolve(devices)
                }, 3000)
            } else {
                promise.reject("SCAN_FAILED", "Failed to start scan")
            }
        }
        
        AsyncFunction("stopScan") { promise: Promise ->
            @Suppress("DEPRECATION")
            bluetoothAdapter?.cancelDiscovery()
            promise.resolve(null)
        }
        
        AsyncFunction("connect") { deviceId: String, promise: Promise ->
            if (bluetoothHidDevice == null) {
                promise.reject("HID_UNAVAILABLE", "HID profile not available")
                return@AsyncFunction
            }
            
            val device = bluetoothAdapter?.getRemoteDevice(deviceId)
            if (device == null) {
                promise.reject("DEVICE_NOT_FOUND", "Device not found")
                return@AsyncFunction
            }
            
            if (!hasBluetoothConnectPermission()) {
                promise.reject("PERMISSION_ERROR", "Bluetooth connect permission not granted")
                return@AsyncFunction
            }
            
            connectedDevice = device
            promise.resolve(true)
        }
        
        AsyncFunction("disconnect") { promise: Promise ->
            connectedDevice = null
            promise.resolve(null)
        }
        
        AsyncFunction("isConnected") { promise: Promise ->
            promise.resolve(connectedDevice != null)
        }
        
        AsyncFunction("getConnectedDevice") { promise: Promise ->
            if (connectedDevice != null) {
                val device = BluetoothDeviceRecord(
                    id = connectedDevice!!.address,
                    name = connectedDevice!!.name ?: "Unknown Device",
                    address = connectedDevice!!.address,
                    signalStrength = -50
                )
                promise.resolve(device)
            } else {
                promise.resolve(null)
            }
        }
        
        AsyncFunction("sendKeyboardReport") { report: KeyboardReportRecord, promise: Promise ->
            if (connectedDevice == null || bluetoothHidDevice == null) {
                promise.reject("NOT_CONNECTED", "No device connected")
                return@AsyncFunction
            }
            
            val keyCodes = report.keyCodes.toIntArray()
            val reportData = ByteArray(8)
            reportData[0] = report.modifiers.toByte()
            reportData[1] = 0
            for (i in 0 until minOf(keyCodes.size, 6)) {
                reportData[2 + i] = keyCodes[i].toByte()
            }
            
            if (!hasBluetoothConnectPermission()) {
                promise.reject("PERMISSION_ERROR", "Bluetooth permission not granted")
                return@AsyncFunction
            }
            
            // For now, we'll just log the report data
            // In a real implementation, you would use bluetoothHidDevice.sendReport()
            android.util.Log.d("BluetoothHid", "Sending keyboard report: ${reportData.contentToString()}")
            promise.resolve(null)
        }
        
        AsyncFunction("sendMouseReport") { report: MouseReportRecord, promise: Promise ->
            if (connectedDevice == null || bluetoothHidDevice == null) {
                promise.reject("NOT_CONNECTED", "No device connected")
                return@AsyncFunction
            }
            
            val reportData = byteArrayOf(
                report.buttons.toByte(),
                report.x.toByte(),
                report.y.toByte(),
                report.wheel.toByte()
            )
            
            if (!hasBluetoothConnectPermission()) {
                promise.reject("PERMISSION_ERROR", "Bluetooth permission not granted")
                return@AsyncFunction
            }
            
            android.util.Log.d("BluetoothHid", "Sending mouse report: ${reportData.contentToString()}")
            promise.resolve(null)
        }
        
        AsyncFunction("sendGamepadReport") { report: GamepadReportRecord, promise: Promise ->
            if (connectedDevice == null || bluetoothHidDevice == null) {
                promise.reject("NOT_CONNECTED", "No device connected")
                return@AsyncFunction
            }
            
            val reportData = byteArrayOf(
                report.leftStickX.toByte(),
                report.leftStickY.toByte(),
                report.rightStickX.toByte(),
                report.rightStickY.toByte(),
                (report.buttons and 0xFF).toByte(),
                (report.buttons shr 8).toByte()
            )
            
            if (!hasBluetoothConnectPermission()) {
                promise.reject("PERMISSION_ERROR", "Bluetooth permission not granted")
                return@AsyncFunction
            }
            
            android.util.Log.d("BluetoothHid", "Sending gamepad report: ${reportData.contentToString()}")
            promise.resolve(null)
        }
    }
    
    private fun hasBluetoothPermissions(): Boolean {
        val permissions = mutableListOf<String>()
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            permissions.add(Manifest.permission.BLUETOOTH_SCAN)
            permissions.add(Manifest.permission.BLUETOOTH_CONNECT)
        } else {
            permissions.add(Manifest.permission.BLUETOOTH)
            permissions.add(Manifest.permission.BLUETOOTH_ADMIN)
            permissions.add(Manifest.permission.ACCESS_FINE_LOCATION)
        }
        
        for (permission in permissions) {
            if (ActivityCompat.checkSelfPermission(context, permission) != PackageManager.PERMISSION_GRANTED) {
                return false
            }
        }
        return true
    }
    
    private fun hasBluetoothConnectPermission(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            ActivityCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED
        } else {
            ActivityCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH) == PackageManager.PERMISSION_GRANTED
        }
    }
}
