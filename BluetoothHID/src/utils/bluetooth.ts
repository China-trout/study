// 蓝牙HID报告定义
export interface KeyboardReport {
  modifiers: number;
  keyCodes: number[];
}

export interface MouseReport {
  buttons: number;
  x: number;
  y: number;
  wheel: number;
}

export interface GamepadReport {
  buttons: number;
  hat: number;
  leftStickX: number;
  leftStickY: number;
  rightStickX: number;
  rightStickY: number;
}

// HID键码映射
export const HID_KEYCODES: { [key: string]: number } = {
  'a': 0x04, 'b': 0x05, 'c': 0x06, 'd': 0x07, 'e': 0x08,
  'f': 0x09, 'g': 0x0A, 'h': 0x0B, 'i': 0x0C, 'j': 0x0D,
  'k': 0x0E, 'l': 0x0F, 'm': 0x10, 'n': 0x11, 'o': 0x12,
  'p': 0x13, 'q': 0x14, 'r': 0x15, 's': 0x16, 't': 0x17,
  'u': 0x18, 'v': 0x19, 'w': 0x1A, 'x': 0x1B, 'y': 0x1C,
  'z': 0x1D, '1': 0x1E, '2': 0x1F, '3': 0x20, '4': 0x21,
  '5': 0x22, '6': 0x23, '7': 0x24, '8': 0x25, '9': 0x26,
  '0': 0x27, 'enter': 0x28, 'esc': 0x29, 'backspace': 0x2A,
  'tab': 0x2B, 'space': 0x2C, '-': 0x2D, '=': 0x2E, '[': 0x2F,
  ']': 0x30, '\\': 0x31, ';': 0x33, "'": 0x34, '`': 0x35,
  ',': 0x36, '.': 0x37, '/': 0x38,
};

// 修饰键
export const MODIFIERS = {
  LEFT_CTRL: 0x01,
  LEFT_SHIFT: 0x02,
  LEFT_ALT: 0x04,
  LEFT_GUI: 0x08,
  RIGHT_CTRL: 0x10,
  RIGHT_SHIFT: 0x20,
  RIGHT_ALT: 0x40,
  RIGHT_GUI: 0x80,
};

// 模拟蓝牙设备列表
export const mockDevices = [
  { id: '1', name: 'MacBook Pro', signalStrength: -45, address: 'AA:BB:CC:DD:EE:01' },
  { id: '2', name: 'Windows PC', signalStrength: -62, address: 'AA:BB:CC:DD:EE:02' },
  { id: '3', name: 'iPad Pro', signalStrength: -58, address: 'AA:BB:CC:DD:EE:03' },
  { id: '4', name: 'Linux Desktop', signalStrength: -70, address: 'AA:BB:CC:DD:EE:04' },
];

// 蓝牙管理类
export class BluetoothManager {
  private static instance: BluetoothManager;
  private connectedDevice: any = null;
  private isScanning: boolean = false;

  static getInstance(): BluetoothManager {
    if (!BluetoothManager.instance) {
      BluetoothManager.instance = new BluetoothManager();
    }
    return BluetoothManager.instance;
  }

  async startScan(): Promise<any[]> {
    this.isScanning = true;
    // 模拟扫描延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.isScanning = false;
    return mockDevices;
  }

  async connect(device: any): Promise<boolean> {
    // 模拟连接
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.connectedDevice = device;
    return true;
  }

  async disconnect(): Promise<void> {
    this.connectedDevice = null;
  }

  getConnectedDevice(): any {
    return this.connectedDevice;
  }

  isDeviceConnected(): boolean {
    return this.connectedDevice !== null;
  }

  // 发送键盘报告
  async sendKeyboardReport(report: KeyboardReport): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }
    console.log('Sending keyboard report:', report);
    // 这里实际实现会通过蓝牙HID发送报告
  }

  // 发送鼠标报告
  async sendMouseReport(report: MouseReport): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }
    console.log('Sending mouse report:', report);
    // 这里实际实现会通过蓝牙HID发送报告
  }

  // 发送手柄报告
  async sendGamepadReport(report: GamepadReport): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }
    console.log('Sending gamepad report:', report);
    // 这里实际实现会通过蓝牙HID发送报告
  }
}
