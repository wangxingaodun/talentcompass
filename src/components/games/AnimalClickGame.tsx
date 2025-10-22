import React from 'react';
import type { GameStageProps, GameStageResult } from './types';

const AnimalClickGame: React.FC<GameStageProps> = ({ setPrompt, onComplete }) => {
  const [hits, setHits] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(10);
  const intervalRef = React.useRef<number | null>(null);
  const startRef = React.useRef<number>(Date.now());

  React.useEffect(() => {
    setPrompt(`在${timeLeft}秒内，尽可能多地点击小动物！`);
    startRef.current = Date.now();
  }, [setPrompt]);

  React.useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          const totalMs = Date.now() - startRef.current;
          const avgLatencyMs = hits > 0 ? Math.floor(totalMs / hits) : 0;
          const result: GameStageResult = {
            dimension: 'reaction',
            metrics: { hits, mistakes: 0, avgLatencyMs, totalMs }
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
  }, [onComplete]);

  const clickAnimal = () => setHits((h) => h + 1);

  return (
    <div className="animal-click-game">
      <div className="animal-field">
        <div className="animal-item" onClick={clickAnimal}></div>
        <div className="animal-item" onClick={clickAnimal}></div>
        <div className="animal-item" onClick={clickAnimal}></div>
      </div>
      <div className="animal-stats">
        <p>已点击：{hits} 个小动物</p>
        <p>剩余时间：{timeLeft}秒</p>
      </div>
    </div>
  );
};

export default AnimalClickGame;