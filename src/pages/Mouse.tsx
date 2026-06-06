import React, { useRef, useState } from 'react';
import { ArrowLeft, MousePointer2, Scroll } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function Mouse() {
  const { setCurrentMode, connectedDevice } = useAppStore();
  const touchpadRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastPosition = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const pos = 'touches' in e 
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX, y: e.clientY };
    lastPosition.current = pos;
  };

  const handleTouchMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const pos = 'touches' in e 
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX, y: e.clientY };
    
    const deltaX = pos.x - lastPosition.current.x;
    const deltaY = pos.y - lastPosition.current.y;
    
    console.log('Mouse move:', deltaX, deltaY);
    
    lastPosition.current = pos;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleClick = (button: 'left' | 'right') => {
    console.log(`${button} click`);
  };

  const handleScroll = (direction: 'up' | 'down') => {
    console.log(`Scroll ${direction}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white p-4 flex items-center justify-between">
        <button
          onClick={() => setCurrentMode('home')}
          className="flex items-center gap-2 hover:text-green-100"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-200 rounded-full animate-pulse" />
          <span className="text-sm">{connectedDevice?.name}</span>
        </div>
      </div>

      {/* 触摸板区域 */}
      <div className="flex-1 p-4 flex flex-col gap-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">鼠标模式</h2>
          <p className="text-sm text-gray-500">滑动控制光标</p>
        </div>

        {/* 触摸板 */}
        <div
          ref={touchpadRef}
          className="flex-1 bg-gray-200 rounded-2xl relative overflow-hidden cursor-none"
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <MousePointer2 className="w-16 h-16 mx-auto mb-2 opacity-30" />
              <p className="text-sm">触摸区域</p>
            </div>
          </div>
          
          {/* 点击指示器 */}
          {isDragging && (
            <div className="absolute w-6 h-6 bg-green-500 rounded-full opacity-50 animate-ping" 
              style={{ left: lastPosition.current.x - 12, top: lastPosition.current.y - 12 }} 
            />
          )}
        </div>

        {/* 滚轮控制 */}
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-200 rounded-xl h-16 flex flex-col">
            <button
              onClick={() => handleScroll('up')}
              className="flex-1 flex items-center justify-center hover:bg-gray-300 rounded-t-xl active:bg-gray-400"
            >
              <Scroll className="w-6 h-6 text-gray-600 rotate-0" />
            </button>
            <div className="h-px bg-gray-300" />
            <button
              onClick={() => handleScroll('down')}
              className="flex-1 flex items-center justify-center hover:bg-gray-300 rounded-b-xl active:bg-gray-400"
            >
              <Scroll className="w-6 h-6 text-gray-600 rotate-180" />
            </button>
          </div>
        </div>

        {/* 鼠标按钮 */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleClick('left')}
            className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md active:bg-gray-100 active:scale-95 transition-all"
          >
            <div className="text-center">
              <p className="font-semibold text-gray-800">左键</p>
              <p className="text-xs text-gray-400 mt-1">单击</p>
            </div>
          </button>
          <button
            onClick={() => handleClick('right')}
            className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md active:bg-gray-100 active:scale-95 transition-all"
          >
            <div className="text-center">
              <p className="font-semibold text-gray-800">右键</p>
              <p className="text-xs text-gray-400 mt-1">菜单</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
