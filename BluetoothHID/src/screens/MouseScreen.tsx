import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Animated,
} from 'react-native';
import { BluetoothManager } from '../utils/bluetooth';

export default function MouseScreen() {
  const [isLeftPressed, setIsLeftPressed] = useState(false);
  const [isRightPressed, setIsRightPressed] = useState(false);
  const btManager = BluetoothManager.getInstance();
  
  const pan = useRef(new Animated.ValueXY()).current;
  const lastPosition = useRef({ x: 0, y: 0 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        lastPosition.current = { x: 0, y: 0 };
      },
      onPanResponderMove: async (_, gestureState) => {
        const deltaX = Math.round(gestureState.dx - lastPosition.current.x);
        const deltaY = Math.round(gestureState.dy - lastPosition.current.y);
        
        if (deltaX !== 0 || deltaY !== 0) {
          try {
            await btManager.sendMouseReport({
              buttons: 0,
              x: deltaX,
              y: deltaY,
              wheel: 0,
            });
          } catch (error) {
            console.error('发送鼠标报告失败:', error);
          }
          
          lastPosition.current = { x: gestureState.dx, y: gestureState.dy };
        }
      },
      onPanResponderRelease: () => {
        lastPosition.current = { x: 0, y: 0 };
      },
    })
  ).current;

  const handleLeftClick = async () => {
    setIsLeftPressed(true);
    try {
      await btManager.sendMouseReport({
        buttons: 0x01,
        x: 0,
        y: 0,
        wheel: 0,
      });
      
      setTimeout(async () => {
        await btManager.sendMouseReport({
          buttons: 0,
          x: 0,
          y: 0,
          wheel: 0,
        });
        setIsLeftPressed(false);
      }, 50);
    } catch (error) {
      console.error('发送鼠标点击失败:', error);
      setIsLeftPressed(false);
    }
  };

  const handleRightClick = async () => {
    setIsRightPressed(true);
    try {
      await btManager.sendMouseReport({
        buttons: 0x02,
        x: 0,
        y: 0,
        wheel: 0,
      });
      
      setTimeout(async () => {
        await btManager.sendMouseReport({
          buttons: 0,
          x: 0,
          y: 0,
          wheel: 0,
        });
        setIsRightPressed(false);
      }, 50);
    } catch (error) {
      console.error('发送鼠标右键失败:', error);
      setIsRightPressed(false);
    }
  };

  const handleScroll = async (direction: number) => {
    try {
      await btManager.sendMouseReport({
        buttons: 0,
        x: 0,
        y: 0,
        wheel: direction,
      });
    } catch (error) {
      console.error('发送滚轮报告失败:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* 触摸板区域 */}
      <View style={styles.touchpadContainer}>
        <Animated.View
          style={styles.touchpad}
          {...panResponder.panHandlers}
        >
          <Text style={styles.touchpadText}>触摸区域</Text>
          <Text style={styles.touchpadSubtext}>滑动控制光标</Text>
        </Animated.View>
      </View>

      {/* 滚轮控制 */}
      <View style={styles.scrollContainer}>
        <TouchableOpacity
          style={styles.scrollButton}
          onPress={() => handleScroll(1)}
        >
          <Text style={styles.scrollButtonText}>↑</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.scrollButton}
          onPress={() => handleScroll(-1)}
        >
          <Text style={styles.scrollButtonText}>↓</Text>
        </TouchableOpacity>
      </View>

      {/* 鼠标按钮 */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[
            styles.mouseButton,
            isLeftPressed && styles.mouseButtonPressed,
          ]}
          onPress={handleLeftClick}
        >
          <Text style={styles.mouseButtonText}>左键</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.mouseButton,
            isRightPressed && styles.mouseButtonPressed,
          ]}
          onPress={handleRightClick}
        >
          <Text style={styles.mouseButtonText}>右键</Text>
        </TouchableOpacity>
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
  touchpadContainer: {
    flex: 1,
    marginBottom: 16,
  },
  touchpad: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  touchpadText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
  },
  touchpadSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  scrollContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 16,
  },
  scrollButton: {
    backgroundColor: '#fff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  mouseButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mouseButtonPressed: {
    backgroundColor: '#dbeafe',
  },
  mouseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});