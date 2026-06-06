import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { BluetoothManager } from '../utils/bluetooth';

interface Device {
  id: string;
  name: string;
  signalStrength: number;
  address: string;
}

export default function HomeScreen({ navigation }: any) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const btManager = BluetoothManager.getInstance();

  useEffect(() => {
    // 检查是否已有连接的设备
    const device = btManager.getConnectedDevice();
    if (device) {
      setConnectedDevice(device);
    }
  }, []);

  const startScan = async () => {
    setIsScanning(true);
    setDevices([]);
    try {
      const foundDevices = await btManager.startScan();
      setDevices(foundDevices);
    } catch (error) {
      Alert.alert('扫描失败', '无法扫描蓝牙设备');
    } finally {
      setIsScanning(false);
    }
  };

  const connectDevice = async (device: Device) => {
    try {
      const success = await btManager.connect(device);
      if (success) {
        setConnectedDevice(device);
        Alert.alert('连接成功', `已连接到 ${device.name}`);
      }
    } catch (error) {
      Alert.alert('连接失败', '无法连接到设备');
    }
  };

  const disconnectDevice = async () => {
    await btManager.disconnect();
    setConnectedDevice(null);
    Alert.alert('断开连接', '已断开与设备的连接');
  };

  const getSignalStrengthColor = (strength: number) => {
    if (strength > -50) return '#22c55e';
    if (strength > -70) return '#eab308';
    return '#ef4444';
  };

  const renderDevice = ({ item }: { item: Device }) => (
    <TouchableOpacity
      style={[
        styles.deviceItem,
        connectedDevice?.id === item.id && styles.deviceItemConnected,
      ]}
      onPress={() => connectDevice(item)}
    >
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name}</Text>
        <Text style={styles.deviceAddress}>{item.address}</Text>
      </View>
      <View style={styles.deviceSignal}>
        <View
          style={[
            styles.signalDot,
            { backgroundColor: getSignalStrengthColor(item.signalStrength) },
          ]}
        />
        <Text style={styles.signalText}>{item.signalStrength}dBm</Text>
      </View>
      {connectedDevice?.id === item.id && (
        <View style={styles.connectedBadge}>
          <Text style={styles.connectedText}>已连接</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 连接状态卡片 */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>连接状态</Text>
        {connectedDevice ? (
          <View style={styles.connectedStatus}>
            <View style={styles.statusIndicator} />
            <View>
              <Text style={styles.connectedDeviceName}>{connectedDevice.name}</Text>
              <Text style={styles.connectedDeviceAddress}>{connectedDevice.address}</Text>
            </View>
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={disconnectDevice}
            >
              <Text style={styles.disconnectButtonText}>断开</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.disconnectedStatus}>
            <View style={[styles.statusIndicator, styles.statusIndicatorOff]} />
            <Text style={styles.disconnectedText}>未连接设备</Text>
          </View>
        )}
      </View>

      {/* 扫描按钮 */}
      <TouchableOpacity
        style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
        onPress={startScan}
        disabled={isScanning}
      >
        {isScanning ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.scanButtonText}>扫描设备</Text>
        )}
      </TouchableOpacity>

      {/* 设备列表 */}
      <FlatList
        data={devices}
        renderItem={renderDevice}
        keyExtractor={(item) => item.id}
        style={styles.deviceList}
        ListEmptyComponent={
          !isScanning && (
            <View style={styles.emptyList}>
              <Text style={styles.emptyText}>点击扫描按钮查找设备</Text>
            </View>
          )
        }
      />

      {/* 模式选择 */}
      <View style={styles.modeContainer}>
        <Text style={styles.modeTitle}>选择模式</Text>
        <View style={styles.modeButtons}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              styles.keyboardButton,
              !connectedDevice && styles.modeButtonDisabled,
            ]}
            onPress={() => navigation.navigate('Keyboard')}
            disabled={!connectedDevice}
          >
            <Text style={styles.modeButtonText}>键盘</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              styles.mouseButton,
              !connectedDevice && styles.modeButtonDisabled,
            ]}
            onPress={() => navigation.navigate('Mouse')}
            disabled={!connectedDevice}
          >
            <Text style={styles.modeButtonText}>鼠标</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              styles.gamepadButton,
              !connectedDevice && styles.modeButtonDisabled,
            ]}
            onPress={() => navigation.navigate('Gamepad')}
            disabled={!connectedDevice}
          >
            <Text style={styles.modeButtonText}>手柄</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  connectedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disconnectedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    marginRight: 12,
  },
  statusIndicatorOff: {
    backgroundColor: '#9ca3af',
  },
  connectedDeviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  connectedDeviceAddress: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  disconnectedText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  disconnectButton: {
    marginLeft: 'auto',
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  disconnectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scanButton: {
    backgroundColor: '#1E40AF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  scanButtonDisabled: {
    opacity: 0.7,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deviceList: {
    flex: 1,
    marginBottom: 16,
  },
  deviceItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  deviceItemConnected: {
    borderWidth: 2,
    borderColor: '#1E40AF',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deviceAddress: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deviceSignal: {
    alignItems: 'center',
    marginRight: 12,
  },
  signalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  signalText: {
    fontSize: 10,
    color: '#666',
  },
  connectedBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  connectedText: {
    color: '#1E40AF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyList: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  modeContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  modeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  keyboardButton: {
    backgroundColor: '#dbeafe',
  },
  mouseButton: {
    backgroundColor: '#dcfce7',
  },
  gamepadButton: {
    backgroundColor: '#f3e8ff',
  },
  modeButtonDisabled: {
    opacity: 0.5,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});