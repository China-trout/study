import { create } from 'zustand';

interface BluetoothDevice {
  id: string;
  name: string;
  signalStrength: number;
}

interface AppState {
  connectedDevice: BluetoothDevice | null;
  currentMode: 'home' | 'keyboard' | 'mouse' | 'gamepad';
  bluetoothEnabled: boolean;
  availableDevices: BluetoothDevice[];
  isScanning: boolean;
  setConnectedDevice: (device: BluetoothDevice | null) => void;
  setCurrentMode: (mode: 'home' | 'keyboard' | 'mouse' | 'gamepad') => void;
  setBluetoothEnabled: (enabled: boolean) => void;
  setAvailableDevices: (devices: BluetoothDevice[]) => void;
  setIsScanning: (scanning: boolean) => void;
  startScan: () => void;
  stopScan: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  connectedDevice: null,
  currentMode: 'home',
  bluetoothEnabled: true,
  availableDevices: [],
  isScanning: false,
  
  setConnectedDevice: (device) => set({ connectedDevice: device }),
  setCurrentMode: (mode) => set({ currentMode: mode }),
  setBluetoothEnabled: (enabled) => set({ bluetoothEnabled: enabled }),
  setAvailableDevices: (devices) => set({ availableDevices: devices }),
  setIsScanning: (scanning) => set({ isScanning: scanning }),
  
  startScan: () => {
    set({ isScanning: true, availableDevices: [] });
    // 模拟扫描设备
    setTimeout(() => {
      const mockDevices: BluetoothDevice[] = [
        { id: '1', name: 'MacBook Pro', signalStrength: -45 },
        { id: '2', name: 'Windows PC', signalStrength: -62 },
        { id: '3', name: 'iPad Pro', signalStrength: -58 },
      ];
      set({ availableDevices: mockDevices, isScanning: false });
    }, 2000);
  },
  
  stopScan: () => set({ isScanning: false }),
}));
