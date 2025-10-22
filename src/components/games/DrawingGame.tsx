import React from 'react';
import type { GameStageProps, GameStageResult } from './types';

const DrawingGame: React.FC<GameStageProps> = ({ setPrompt, onComplete }) => {
  const [timeLeft, setTimeLeft] = React.useState(60);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const intervalRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    setPrompt('发挥你的想象力，画出你喜欢的东西吧！');
    setTimeLeft(60);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          const result: GameStageResult = {
            dimension: 'creativity',
            metrics: { activeMs: 60000, colorsUsed: 0, shapesUsed: 0 }
          };
          onComplete(result);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [setPrompt, onComplete]);

  return (
    <div className="drawing-game">
      <div className="drawing-toolbar">
        <button className="tool-button">✏️ 铅笔</button>
        <button className="tool-button">⭕ 圆形</button>
        <button className="tool-button">⬜ 方形</button>
        <div className="color-palette">
          <button className="color-swatch red"></button>
          <button className="color-swatch blue"></button>
          <button className="color-swatch yellow"></button>
        </div>
      </div>
      <div className="drawing-canvas-container">
        <canvas ref={canvasRef} className="drawing-canvas" width={400} height={300}></canvas>
      </div>
      <div className="drawing-timer">剩余时间：{timeLeft}秒</div>
    </div>
  );
};

export default DrawingGame;