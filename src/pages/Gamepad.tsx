import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { clsx } from 'clsx';

export default function Gamepad() {
  const { setCurrentMode, connectedDevice } = useAppStore();
  const [pressedButtons, setPressedButtons] = useState<Set<string>>(new Set());

  const handleButtonPress = (button: string) => {
    setPressedButtons(prev => new Set([...prev, button]));
    console.log('Button pressed:', button);
  };

  const handleButtonRelease = (button: string) => {
    setPressedButtons(prev => {
      const next = new Set(prev);
      next.delete(button);
      return next;
    });
  };

  const Button = ({ label, color, position }: { label: string; color: string; position: string }) => (
    <button
      onMouseDown={() => handleButtonPress(label)}
      onMouseUp={() => handleButtonRelease(label)}
      onMouseLeave={() => handleButtonRelease(label)}
      onTouchStart={(e) => { e.preventDefault(); handleButtonPress(label); }}
      onTouchEnd={() => handleButtonRelease(label)}
      className={clsx(
        "w-16 h-16 rounded-full font-bold text-white shadow-lg transition-all active:scale-90",
        color,
        pressedButtons.has(label) && "scale-95 brightness-110",
        position
      )}
    >
      {label}
    </button>
  );

  const DPad = ({ direction }: { direction: string }) => (
    <button
      onMouseDown={() => handleButtonPress(direction)}
      onMouseUp={() => handleButtonRelease(direction)}
      onMouseLeave={() => handleButtonRelease(direction)}
      onTouchStart={(e) => { e.preventDefault(); handleButtonPress(direction); }}
      onTouchEnd={() => handleButtonRelease(direction)}
      className={clsx(
        "w-14 h-14 bg-gray-700 rounded-lg flex items-center justify-center text-white font-bold transition-all",
        pressedButtons.has(direction) ? "bg-gray-500 scale-95" : "hover:bg-gray-600"
      )}
    >
      {direction === 'up' && '↑'}
      {direction === 'down' && '↓'}
      {direction === 'left' && '←'}
      {direction === 'right' && '→'}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
      {/* 头部 */}
      <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
        <button
          onClick={() => setCurrentMode('home')}
          className="flex items-center gap-2 text-gray-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-300">{connectedDevice?.name}</span>
        </div>
      </div>

      {/* 肩键 */}
      <div className="flex justify-between px-8 pt-4">
        <div className="flex gap-4">
          <button
            onMouseDown={() => handleButtonPress('L1')}
            onMouseUp={() => handleButtonRelease('L1')}
            onTouchStart={(e) => { e.preventDefault(); handleButtonPress('L1'); }}
            onTouchEnd={() => handleButtonRelease('L1')}
            className={clsx(
              "w-20 h-10 bg-gray-600 rounded-t-xl font-semibold transition-all",
              pressedButtons.has('L1') ? "bg-gray-400" : "hover:bg-gray-500"
            )}
          >
            L1
          </button>
          <button
            onMouseDown={() => handleButtonPress('L2')}
            onMouseUp={() => handleButtonRelease('L2')}
            onTouchStart={(e) => { e.preventDefault(); handleButtonPress('L2'); }}
            onTouchEnd={() => handleButtonRelease('L2')}
            className={clsx(
              "w-20 h-10 bg-gray-500 rounded-t-xl font-semibold transition-all",
              pressedButtons.has('L2') ? "bg-gray-300" : "hover:bg-gray-400"
            )}
          >
            L2
          </button>
        </div>
        <div className="flex gap-4">
          <button
            onMouseDown={() => handleButtonPress('R1')}
            onMouseUp={() => handleButtonRelease('R1')}
            onTouchStart={(e) => { e.preventDefault(); handleButtonPress('R1'); }}
            onTouchEnd={() => handleButtonRelease('R1')}
            className={clsx(
              "w-20 h-10 bg-gray-600 rounded-t-xl font-semibold transition-all",
              pressedButtons.has('R1') ? "bg-gray-400" : "hover:bg-gray-500"
            )}
          >
            R1
          </button>
          <button
            onMouseDown={() => handleButtonPress('R2')}
            onMouseUp={() => handleButtonRelease('R2')}
            onTouchStart={(e) => { e.preventDefault(); handleButtonPress('R2'); }}
            onTouchEnd={() => handleButtonRelease('R2')}
            className={clsx(
              "w-20 h-10 bg-gray-500 rounded-t-xl font-semibold transition-all",
              pressedButtons.has('R2') ? "bg-gray-300" : "hover:bg-gray-400"
            )}
          >
            R2
          </button>
        </div>
      </div>

      {/* 主控制区域 */}
      <div className="flex-1 flex items-center justify-between px-6">
        {/* 左侧 - 方向键 */}
        <div className="relative">
          <div className="grid grid-cols-3 gap-1">
            <div />
            <DPad direction="up" />
            <div />
            <DPad direction="left" />
            <div className="w-14 h-14 bg-gray-800" />
            <DPad direction="right" />
            <div />
            <DPad direction="down" />
            <div />
          </div>
        </div>

        {/* 中间 - 选择/开始 */}
        <div className="flex flex-col gap-4">
          <button
            onMouseDown={() => handleButtonPress('select')}
            onMouseUp={() => handleButtonRelease('select')}
            onTouchStart={(e) => { e.preventDefault(); handleButtonPress('select'); }}
            onTouchEnd={() => handleButtonRelease('select')}
            className={clsx(
              "w-16 h-8 bg-gray-600 rounded-full text-xs font-semibold transition-all",
              pressedButtons.has('select') ? "bg-gray-400" : "hover:bg-gray-500"
            )}
          >
            SELECT
          </button>
          <button
            onMouseDown={() => handleButtonPress('start')}
            onMouseUp={() => handleButtonRelease('start')}
            onTouchStart={(e) => { e.preventDefault(); handleButtonPress('start'); }}
            onTouchEnd={() => handleButtonRelease('start')}
            className={clsx(
              "w-16 h-8 bg-gray-600 rounded-full text-xs font-semibold transition-all",
              pressedButtons.has('start') ? "bg-gray-400" : "hover:bg-gray-500"
            )}
          >
            START
          </button>
        </div>

        {/* 右侧 - 动作键 */}
        <div className="relative">
          <div className="grid grid-cols-3 gap-2">
            <div />
            <Button label="Y" color="bg-blue-500 hover:bg-blue-400" position="" />
            <div />
            <Button label="X" color="bg-blue-500 hover:bg-blue-400" position="" />
            <div className="w-16 h-16" />
            <Button label="B" color="bg-red-500 hover:bg-red-400" position="" />
            <div />
            <Button label="A" color="bg-green-500 hover:bg-green-400" position="" />
            <div />
          </div>
        </div>
      </div>

      {/* 摇杆区域 */}
      <div className="flex justify-between px-12 pb-8">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-gray-500 rounded-full shadow-inner" />
          </div>
          <span className="text-xs text-gray-400 mt-2">LEFT</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-gray-500 rounded-full shadow-inner" />
          </div>
          <span className="text-xs text-gray-400 mt-2">RIGHT</span>
        </div>
      </div>

      {/* 按下的按钮显示 */}
      {pressedButtons.size > 0 && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-purple-600 px-4 py-2 rounded-full text-sm font-semibold">
          {Array.from(pressedButtons).join(' + ')}
        </div>
      )}
    </div>
  );
}
