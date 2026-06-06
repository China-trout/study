import React, { useState } from 'react';
import { ArrowLeft, Copy, Clipboard, Undo2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { clsx } from 'clsx';

export default function Keyboard() {
  const { setCurrentMode, connectedDevice } = useAppStore();
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const keyboardRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ];

  const handleKeyPress = (key: string) => {
    setPressedKey(key);
    setTimeout(() => setPressedKey(null), 150);
    console.log('Key pressed:', key);
  };

  const handleShortcut = (action: string) => {
    console.log('Shortcut:', action);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 头部 */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <button
          onClick={() => setCurrentMode('home')}
          className="flex items-center gap-2 text-gray-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-300">{connectedDevice?.name}</span>
        </div>
      </div>

      {/* 快捷键区域 */}
      <div className="p-4 flex gap-3">
        <button
          onClick={() => handleShortcut('copy')}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-700 p-3 rounded-xl active:bg-gray-600"
        >
          <Copy className="w-5 h-5" />
          <span className="text-sm">复制</span>
        </button>
        <button
          onClick={() => handleShortcut('paste')}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-700 p-3 rounded-xl active:bg-gray-600"
        >
          <Clipboard className="w-5 h-5" />
          <span className="text-sm">粘贴</span>
        </button>
        <button
          onClick={() => handleShortcut('undo')}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-700 p-3 rounded-xl active:bg-gray-600"
        >
          <Undo2 className="w-5 h-5" />
          <span className="text-sm">撤销</span>
        </button>
      </div>

      {/* 键盘区域 */}
      <div className="flex-1 flex flex-col justify-end p-2">
        {keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 mb-1">
            {row.map((key) => (
              <button
                key={key}
                onMouseDown={() => handleKeyPress(key)}
                className={clsx(
                  "min-w-[32px] h-12 rounded-lg font-medium text-lg transition-all active:scale-95",
                  pressedKey === key 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-700 hover:bg-gray-600"
                )}
              >
                {key.toUpperCase()}
              </button>
            ))}
          </div>
        ))}

        {/* 底部行 */}
        <div className="flex justify-center gap-1 mb-1">
          <button className="flex-1 max-w-[80px] h-12 bg-gray-600 rounded-lg text-sm active:bg-gray-500">
            Shift
          </button>
          <div className="flex-1 flex gap-1">
            {[' ', ' ', ' '].map((_, i) => (
              <button
                key={i}
                onMouseDown={() => handleKeyPress(' ')}
                className={clsx(
                  "flex-1 h-12 rounded-lg transition-all active:scale-95",
                  pressedKey === ' ' ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                )}
              />
            ))}
          </div>
          <button className="flex-1 max-w-[80px] h-12 bg-gray-600 rounded-lg text-sm active:bg-gray-500">
            Enter
          </button>
        </div>

        <div className="flex justify-center gap-1">
          <button className="flex-1 h-12 bg-gray-600 rounded-lg text-sm active:bg-gray-500">
            123
          </button>
          <button className="flex-1 max-w-[60px] h-12 bg-gray-600 rounded-lg text-sm active:bg-gray-500">
            中
          </button>
          <button className="flex-[2] h-12 bg-gray-700 rounded-lg active:bg-gray-600" />
          <button className="flex-1 max-w-[60px] h-12 bg-gray-600 rounded-lg text-sm active:bg-gray-500">
            .
          </button>
          <button className="flex-1 h-12 bg-gray-600 rounded-lg text-sm active:bg-gray-500">
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}
