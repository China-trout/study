import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { BluetoothManager, HID_KEYCODES, MODIFIERS } from '../utils/bluetooth';

export default function KeyboardScreen() {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const btManager = BluetoothManager.getInstance();

  const keyboardRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ];

  const handleKeyPress = async (key: string) => {
    setPressedKeys(prev => new Set([...prev, key]));
    
    try {
      const keyCode = HID_KEYCODES[key.toLowerCase()] || 0;
      await btManager.sendKeyboardReport({
        modifiers: 0,
        keyCodes: [keyCode, 0, 0, 0, 0, 0],
      });
      
      // 发送释放报告
      setTimeout(async () => {
        await btManager.sendKeyboardReport({
          modifiers: 0,
          keyCodes: [0, 0, 0, 0, 0, 0],
        });
      }, 50);
    } catch (error) {
      console.error('发送键盘报告失败:', error);
    }
  };

  const handleKeyRelease = (key: string) => {
    setPressedKeys(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const handleShortcut = async (type: string) => {
    try {
      let modifiers = 0;
      let keyCode = 0;

      switch (type) {
        case 'copy':
          modifiers = MODIFIERS.LEFT_CTRL;
          keyCode = HID_KEYCODES['c'];
          break;
        case 'paste':
          modifiers = MODIFIERS.LEFT_CTRL;
          keyCode = HID_KEYCODES['v'];
          break;
        case 'undo':
          modifiers = MODIFIERS.LEFT_CTRL;
          keyCode = HID_KEYCODES['z'];
          break;
        case 'cut':
          modifiers = MODIFIERS.LEFT_CTRL;
          keyCode = HID_KEYCODES['x'];
          break;
        case 'selectAll':
          modifiers = MODIFIERS.LEFT_CTRL;
          keyCode = HID_KEYCODES['a'];
          break;
      }

      await btManager.sendKeyboardReport({
        modifiers,
        keyCodes: [keyCode, 0, 0, 0, 0, 0],
      });

      setTimeout(async () => {
        await btManager.sendKeyboardReport({
          modifiers: 0,
          keyCodes: [0, 0, 0, 0, 0, 0],
        });
      }, 50);
    } catch (error) {
      console.error('发送快捷键失败:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* 快捷键区域 */}
      <View style={styles.shortcutsContainer}>
        <TouchableOpacity
          style={styles.shortcutButton}
          onPress={() => handleShortcut('copy')}
        >
          <Text style={styles.shortcutText}>复制</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shortcutButton}
          onPress={() => handleShortcut('paste')}
        >
          <Text style={styles.shortcutText}>粘贴</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shortcutButton}
          onPress={() => handleShortcut('undo')}
        >
          <Text style={styles.shortcutText}>撤销</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shortcutButton}
          onPress={() => handleShortcut('cut')}
        >
          <Text style={styles.shortcutText}>剪切</Text>
        </TouchableOpacity>
      </View>

      {/* 键盘区域 */}
      <View style={styles.keyboardContainer}>
        {keyboardRows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyboardRow}>
            {row.map((key) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.keyButton,
                  pressedKeys.has(key) && styles.keyButtonPressed,
                ]}
                onPressIn={() => handleKeyPress(key)}
                onPressOut={() => handleKeyRelease(key)}
              >
                <Text style={styles.keyText}>{key.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* 底部行 */}
        <View style={styles.keyboardRow}>
          <TouchableOpacity
            style={[styles.keyButton, styles.keyButtonWide]}
            onPressIn={() => handleKeyPress('shift')}
            onPressOut={() => handleKeyRelease('shift')}
          >
            <Text style={styles.keyText}>Shift</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.keyButton, styles.keyButtonSpace]}
            onPressIn={() => handleKeyPress('space')}
            onPressOut={() => handleKeyRelease('space')}
          >
            <Text style={styles.keyText}>Space</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.keyButton, styles.keyButtonWide]}
            onPressIn={() => handleKeyPress('enter')}
            onPressOut={() => handleKeyRelease('enter')}
          >
            <Text style={styles.keyText}>Enter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 8,
  },
  shortcutsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginBottom: 8,
  },
  shortcutButton: {
    backgroundColor: '#16213e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  shortcutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 6,
  },
  keyButton: {
    backgroundColor: '#16213e',
    minWidth: 32,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    paddingHorizontal: 8,
  },
  keyButtonPressed: {
    backgroundColor: '#1E40AF',
  },
  keyButtonWide: {
    minWidth: 70,
  },
  keyButtonSpace: {
    flex: 1,
    maxWidth: 200,
  },
  keyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});