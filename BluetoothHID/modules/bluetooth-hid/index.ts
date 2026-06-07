import { requireNativeModule } from 'expo-modules-core';

export interface BluetoothDevice {
  id: string;
  name: string;
  address: string;
  signalStrength: number;
}

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

interface BluetoothHidModuleInterface {
  startScan(): Promise<BluetoothDevice[]>;
  stopScan(): Promise<void>;
  connect(deviceId: string): Promise<boolean>;
  disconnect(): Promise<void>;
  isConnected(): Promise<boolean>;
  getConnectedDevice(): Promise<BluetoothDevice | null>;
  sendKeyboardReport(report: KeyboardReport): Promise<void>;
  sendMouseReport(report: MouseReport): Promise<void>;
  sendGamepadReport(report: GamepadReport): Promise<void>;
}

const BluetoothHidModule = requireNativeModule<BluetoothHidModuleInterface>('BluetoothHid');

export default BluetoothHidModule;
