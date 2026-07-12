package com.example.bluetoothhid

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothProfile
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.example.bluetoothhid.databinding.ActivityMainBinding

/**
 * 主界面：负责权限申请、绑定 [BluetoothHidService]、提供键盘/鼠标/手柄演示按钮。
 */
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private var hidService: BluetoothHidService? = null
    private var bound = false

    /** 蓝牙连接权限（Android 12+ 需运行时申请） */
    private val connectPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { result ->
        val granted = result.values.all { it }
        if (granted) {
            startAndBindService()
        } else {
            toast("需要蓝牙连接权限才能使用 HID 功能")
        }
    }

    /** 蓝牙开启请求 */
    private val enableBluetoothLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            initService()
        } else {
            toast("蓝牙未开启")
        }
    }

    private val serviceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            val binder = service as? BluetoothHidService.LocalBinder ?: return
            hidService = binder.service()
            bound = true
            binder.service().setListener(object : BluetoothHidService.StateListener {
                override fun onProxyReady() = runOnUiThread { updateStatus("代理就绪，正在注册应用…") }
                override fun onAppRegistered() = runOnUiThread { updateStatus("HID 应用已注册，可连接主机") }
                override fun onConnectionStateChanged(device: BluetoothDevice, state: Int) {
                    runOnUiThread {
                        val text = when (state) {
                            BluetoothProfile.STATE_CONNECTED -> "已连接: ${device.address}"
                            BluetoothProfile.STATE_CONNECTING -> "连接中…"
                            BluetoothProfile.STATE_DISCONNECTED -> "已断开"
                            BluetoothProfile.STATE_DISCONNECTING -> "断开中…"
                            else -> "状态: $state"
                        }
                        updateStatus(text)
                        binding.btnConnect.isEnabled = state == BluetoothProfile.STATE_DISCONNECTED
                    }
                }
                override fun onError(message: String) = runOnUiThread { toast(message) }
            })
            initService()
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            hidService = null
            bound = false
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // 权限检查 -> 启动服务 -> 初始化
        if (hasBluetoothConnectPermission()) {
            startAndBindService()
        } else {
            connectPermissionLauncher.launch(arrayOf(
                Manifest.permission.BLUETOOTH_CONNECT,
                Manifest.permission.BLUETOOTH_SCAN
            ))
        }

        setupButtons()
    }

    private fun setupButtons() {
        // ===== 连接 =====
        binding.btnConnect.setOnClickListener { pickAndConnect() }
        binding.btnDisconnect.setOnClickListener { hidService?.disconnect() }

        // ===== 键盘 =====
        binding.btnKeyA.setOnClickListener {
            // HID usage 0x04 = a/A
            hidService?.tapKey(0x04)
        }
        binding.btnKeyEnter.setOnClickListener {
            // HID usage 0x28 = Enter
            hidService?.tapKey(0x28)
        }
        binding.btnKeyShiftA.setOnClickListener {
            // 左 Shift + A -> 大写 A
            hidService?.tapKey(0x04, HidDescriptors.KeyboardModifier.LEFT_SHIFT)
        }
        binding.btnKeySpace.setOnClickListener {
            // HID usage 0x2C = Space
            hidService?.tapKey(0x2C)
        }

        // ===== 鼠标 =====
        binding.btnMouseLeft.setOnClickListener { hidService?.leftClick() }
        binding.btnMouseRight.setOnClickListener {
            hidService?.sendMouse(HidDescriptors.MouseButton.RIGHT)
            hidService?.sendMouse(0)
        }
        binding.btnMouseMove.setOnClickListener {
            // 向右下移动一小段
            hidService?.sendMouse(0, 20, 20)
        }

        // ===== 手柄 =====
        binding.btnGamepadA.setOnClickListener {
            hidService?.sendGamepad(HidDescriptors.GamepadButton.A)
            hidService?.sendGamepad(0)
        }
        binding.btnGamepadUp.setOnClickListener {
            // hat=0 表示正上方
            hidService?.sendGamepad(hat = 0)
            hidService?.sendGamepad()
        }
        binding.btnGamepadStick.setOnClickListener {
            // 摇杆向右上推一下
            hidService?.sendGamepad(xX = 60, yY = -60)
            hidService?.sendGamepad()
        }
    }

    /** 启动并绑定服务 */
    private fun startAndBindService() {
        val intent = Intent(this, BluetoothHidService::class.java)
        startService(intent)
        bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE)
    }

    /** 调用服务初始化（确保蓝牙已开启） */
    @SuppressLint("MissingPermission")
    private fun initService() {
        val mgr = getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
        val adapter = mgr?.adapter
        if (adapter == null) {
            toast("设备不支持蓝牙")
            return
        }
        if (!adapter.isEnabled) {
            enableBluetoothLauncher.launch(Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE))
            return
        }
        hidService?.init()
    }

    /** 弹出蓝牙设备选择，连接第一个已配对设备（演示用，可扩展为列表选择） */
    @SuppressLint("MissingPermission")
    private fun pickAndConnect() {
        val mgr = getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
        val adapter = mgr?.adapter ?: return
        val paired: Set<BluetoothDevice> = adapter.bondedDevices
        if (paired.isEmpty()) {
            toast("没有已配对设备，请先在系统设置中配对主机")
            return
        }
        // 简单策略：连接第一个已配对设备
        val target = paired.first()
        toast("正在连接 ${target.name ?: target.address}")
        hidService?.connect(target)
    }

    private fun hasBluetoothConnectPermission(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            ContextCompat.checkSelfPermission(
                this, Manifest.permission.BLUETOOTH_CONNECT
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            true
        }
    }

    private fun updateStatus(text: String) {
        binding.tvStatus.text = "状态：$text"
    }

    private fun toast(msg: String) {
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
    }

    override fun onDestroy() {
        super.onDestroy()
        hidService?.setListener(null)
        if (bound) {
            unbindService(serviceConnection)
            bound = false
        }
    }
}
