import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import KeyboardScreen from './src/screens/KeyboardScreen';
import MouseScreen from './src/screens/MouseScreen';
import GamepadScreen from './src/screens/GamepadScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1E40AF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: '蓝牙键鼠' }}
        />
        <Stack.Screen 
          name="Keyboard" 
          component={KeyboardScreen} 
          options={{ title: '键盘模式' }}
        />
        <Stack.Screen 
          name="Mouse" 
          component={MouseScreen} 
          options={{ title: '鼠标模式' }}
        />
        <Stack.Screen 
          name="Gamepad" 
          component={GamepadScreen} 
          options={{ title: '手柄模式' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}