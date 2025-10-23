import React from 'react';
import type { GameStageProps, GameStageResult } from './types';

const PatternGame: React.FC<GameStageProps> = ({ setPrompt, onComplete }) => {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<'correct' | 'incorrect' | null>(null);
  const startTimeRef = React.useRef<number>(Date.now());

  React.useEffect(() => {
    setPrompt('你能找出规律，选出正确的颜色吗？');
    startTimeRef.current = Date.now();
  }, [setPrompt]);

  const select = (color: string) => {
    if (result) return;
    setSelected(color);
    const isCorrect = color === 'blue';
    setResult(isCorrect ? 'correct' : 'incorrect');

    const latencyMs = Date.now() - startTimeRef.current;
    const stageResult: GameStageResult = {
      dimension: 'logic',
      metrics: { correct: isCorrect ? 1 : 0, attempts: 1, avgLatencyMs: latencyMs }
    };
    if (isCorrect) {
      setTimeout(() => onComplete(stageResult), 500);
    }
  };

  return (
    <div className="pattern-game">
      <div className="pattern-grid">
        <div className="pattern-cell red"></div>
        <div className="pattern-cell blue"></div>
        <div className="pattern-cell red"></div>
        <div className="pattern-cell blue"></div>
        <div className="pattern-cell question">?</div>
      </div>
      <div className="pattern-options">
        <button className={`color-option red ${selected === 'red' ? 'selected' : ''}`} onClick={() => select('red')}></button>
        <button className={`color-option blue ${selected === 'blue' ? 'selected' : ''}`} onClick={() => select('blue')}></button>
        <button className={`color-option yellow ${selected === 'yellow' ? 'selected' : ''}`} onClick={() => select('yellow')}></button>
      </div>
      {result === 'correct' && <p className="pattern-feedback correct">太棒了！</p>}
      {result === 'incorrect' && <p className="pattern-feedback incorrect">再试一次！</p>}
    </div>
  );
};

export default PatternGame;