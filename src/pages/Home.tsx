import React from 'react';
import { Search, Bluetooth, Keyboard, Mouse, Gamepad2, CheckCircle, Wifi } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { clsx } from 'clsx';

export default function Home() {
  const { 
    connectedDevice, 
    availableDevices, 
    isScanning, 
    startScan, 
    setConnectedDevice,
    setCurrentMode 
  } = useAppStore();

  const getSignalStrengthIcon = (strength: number) => {
    if (strength > -50) return 'text-green-500';
    if (strength > -70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-6 pb-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-2">蓝牙键鼠</h1>
          <p className="text-blue-100">将手机变成蓝牙输入设备</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-10 space-y-6">
        {/* 连接状态卡片 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">连接状态</h2>
            <div className={clsx(
              "w-3 h-3 rounded-full",
              connectedDevice ? "bg-green-500 animate-pulse" : "bg-gray-300"
            )} />
          </div>
          
          {connectedDevice ? (
            <div className="flex items-center gap-3 bg-green-50 p-4 rounded-xl">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="font-medium text-gray-800">{connectedDevice.name}</p>
                <p className="text-sm text-green-600">已连接</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
              <Bluetooth className="w-8 h-8 text-gray-400" />
              <p className="text-gray-500">未连接设备</p>
            </div>
          )}
        </div>

        {/* 设备扫描 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">可用设备</h2>
            <button
              onClick={startScan}
              disabled={isScanning}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Search className={clsx("w-4 h-4", isScanning && "animate-spin")} />
              {isScanning ? '扫描中...' : '扫描'}
            </button>
          </div>

          <div className="space-y-3">
            {availableDevices.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Wifi className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>点击扫描按钮查找设备</p>
              </div>
            ) : (
              availableDevices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => setConnectedDevice(device)}
                  className={clsx(
                    "w-full flex items-center justify-between p-4 rounded-xl transition-all",
                    connectedDevice?.id === device.id 
                      ? "bg-blue-50 border-2 border-blue-500"
                      : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Bluetooth className={clsx(
                      "w-6 h-6",
                      connectedDevice?.id === device.id ? "text-blue-600" : "text-gray-500"
                    )} />
                    <span className="font-medium text-gray-800">{device.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={getSignalStrengthIcon(device.signalStrength)}>
                      <Wifi className="w-4 h-4" />
                    </div>
                    {connectedDevice?.id === device.id && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* 功能选择 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">选择模式</h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setCurrentMode('keyboard')}
              disabled={!connectedDevice}
              className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Keyboard className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">键盘</span>
            </button>
            <button
              onClick={() => setCurrentMode('mouse')}
              disabled={!connectedDevice}
              className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mouse className="w-8 h-8 text-green-600" />
              <span className="text-sm font-medium text-gray-700">鼠标</span>
            </button>
            <button
              onClick={() => setCurrentMode('gamepad')}
              disabled={!connectedDevice}
              className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Gamepad2 className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">手柄</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
