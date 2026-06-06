import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { BluetoothManager } from '../utils/bluetooth';

export default function GamepadScreen() {
  const [pressedButtons, setPressedButtons] = useState<Set<string>>(new Set());
  const btManager = BluetoothManager.getInstance();

  const handleButtonPress = async (button: string) => {
    setPressedButtons(prev => new Set([...prev, button]));
    
    try {
      let buttons = 0;
      switch (button) {
        case 'A': buttons = 0x01; break;
        case 'B': buttons = 0x02; break;
        case 'X': buttons = 0x04; break;
        case 'Y': buttons = 0x08; break;
        case 'L1': buttons = 0x10; break;
        case 'R1': buttons = 0x20; break;
        case 'L2': buttons = 0x40; break;
        case 'R2': buttons = 0x80; break;
        case 'select': buttons = 0x100; break;
        case 'start': buttons = 0x200; break;
        case 'up': buttons = 0x400; break;
        case 'down': buttons = 0x800; break;
        case 'left': buttons = 0x1000; break;
        case 'right': buttons = 0x2000; break;
      }

      await btManager.sendGamepadReport({
        buttons,
        hat: 0,
        leftStickX: 128,
        leftStickY: 128,
        rightStickX: 128,
        rightStickY: 128,
      });
    } catch (error) {
      console.error('发送手柄报告失败:', error);
    }
  };

  const handleButtonRelease = async (button: string) => {
    setPressedButtons(prev => {
      const next = new Set(prev);
      next.delete(button);
      return next;
    });

    try {
      await btManager.sendGamepadReport({
        buttons: 0,
        hat: 0,
        leftStickX: 128,
        leftStickY: 128,
        rightStickX: 128,
        rightStickY: 128,
      });
    } catch (error) {
      console.error('发送手柄释放报告失败:', error);
    }
  };

  const ActionButton = ({ label, color }: { label: string; color: string }) => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        { backgroundColor: color },
        pressedButtons.has(label) && styles.actionButtonPressed,
      ]}
      onPressIn={() => handleButtonPress(label)}
      onPressOut={() => handleButtonRelease(label)}
    >
      <Text style={styles.actionButtonText}>{label}</Text>
    </TouchableOpacity>
  );

  const DPadButton = ({ direction, label }: { direction: string; label: string }) => (
    <TouchableOpacity
      style={[
        styles.dpadButton,
        pressedButtons.has(direction) && styles.dpadButtonPressed,
      ]}
      onPressIn={() => handleButtonPress(direction)}
      onPressOut={() => handleButtonRelease(direction)}
    >
      <Text style={styles.dpadButtonText}>{label}</Text>
    </TouchableOpacity>
  );

  const ShoulderButton = ({ label }: { label: string }) => (
    <TouchableOpacity
      style={[
        styles.shoulderButton,
        pressedButtons.has(label) && styles.shoulderButtonPressed,
      ]}
      onPressIn={() => handleButtonPress(label)}
      onPressOut={() => handleButtonRelease(label)}
    >
      <Text style={styles.shoulderButtonText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 肩键 */}
      <View style={styles.shoulderContainer}>
        <View style={styles.shoulderRow}>
          <ShoulderButton label="L1" />
          <ShoulderButton label="L2" />
        </View>
        <View style={styles.shoulderRow}>
          <ShoulderButton label="R1" />
          <ShoulderButton label="R2" />
        </View>
      </View>

      {/* 主控制区域 */}
      <View style={styles.mainControls}>
        {/* 方向键 */}
        <View style={styles.dpadContainer}>
          <View style={styles.dpadRow}>
            <View style={styles.dpadEmpty} />
            <DPadButton direction="up" label="↑" />
            <View style={styles.dpadEmpty} />
          </View>
          <View style={styles.dpadRow}>
            <DPadButton direction="left" label="←" />
            <View style={styles.dpadCenter} />
            <DPadButton direction="right" label="→" />
          </View>
          <View style={styles.dpadRow}>
            <View style={styles.dpadEmpty} />
            <DPadButton direction="down" label="↓" />
            <View style={styles.dpadEmpty} />
          </View>
        </View>

        {/* 选择/开始 */}
        <View style={styles.middleButtons}>
          <TouchableOpacity
            style={[
              styles.middleButton,
              pressedButtons.has('select') && styles.middleButtonPressed,
            ]}
            onPressIn={() => handleButtonPress('select')}
            onPressOut={() => handleButtonRelease('select')}
          >
            <Text style={styles.middleButtonText}>SELECT</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.middleButton,
              pressedButtons.has('start') && styles.middleButtonPressed,
            ]}
            onPressIn={() => handleButtonPress('start')}
            onPressOut={() => handleButtonRelease('start')}
          >
            <Text style={styles.middleButtonText}>START</Text>
          </TouchableOpacity>
        </View>

        {/* 动作键 */}
        <View style={styles.actionButtonsContainer}>
          <View style={styles.actionRow}>
            <View style={styles.actionEmpty} />
            <ActionButton label="Y" color="#3b82f6" />
            <View style={styles.actionEmpty} />
          </View>
          <View style={styles.actionRow}>
            <ActionButton label="X" color="#3b82f6" />
            <View style={styles.actionEmpty} />
            <ActionButton label="B" color="#ef4444" />
          </View>
          <View style={styles.actionRow}>
            <View style={styles.actionEmpty} />
            <ActionButton label="A" color="#22c55e" />
            <View style={styles.actionEmpty} />
          </View>
        </View>
      </View>

      {/* 摇杆 */}
      <View style={styles.joysticksContainer}>
        <View style={styles.joystick}>
          <View style={styles.joystickBase}>
            <View style={styles.joystickStick} />
          </View>
          <Text style={styles.joystickLabel}>LEFT</Text>
        </View>
        <View style={styles.joystick}>
          <View style={styles.joystickBase}>
            <View style={styles.joystickStick} />
          </View>
          <Text style={styles.joystickLabel}>RIGHT</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 16,
  },
  shoulderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  shoulderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  shoulderButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  shoulderButtonPressed: {
    backgroundColor: '#6b7280',
  },
  shoulderButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  mainControls: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dpadContainer: {
    alignItems: 'center',
  },
  dpadRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dpadButton: {
    width: 50,
    height: 50,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 8,
  },
  dpadButtonPressed: {
    backgroundColor: '#6b7280',
  },
  dpadButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dpadEmpty: {
    width: 50,
    height: 50,
    margin: 2,
  },
  dpadCenter: {
    width: 50,
    height: 50,
    backgroundColor: '#1f2937',
    margin: 2,
    borderRadius: 8,
  },
  middleButtons: {
    alignItems: 'center',
    gap: 8,
  },
  middleButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 70,
    alignItems: 'center',
  },
  middleButtonPressed: {
    backgroundColor: '#6b7280',
  },
  middleButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButtonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionEmpty: {
    width: 60,
    height: 60,
    margin: 4,
  },
  joysticksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    marginTop: 16,
  },
  joystick: {
    alignItems: 'center',
  },
  joystickBase: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joystickStick: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6b7280',
  },
  joystickLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 8,
  },
});