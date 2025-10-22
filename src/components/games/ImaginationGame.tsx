import React from 'react';
import type { GameStageProps, GameStageResult } from './types';

const ImaginationGame: React.FC<GameStageProps> = ({ setPrompt, onComplete }) => {
  const [input, setInput] = React.useState('');
  const startRef = React.useRef<number>(Date.now());

  React.useEffect(() => {
    setPrompt('把“云+鞋”组合起来，会发生什么有趣的事情呢？');
    startRef.current = Date.now();
  }, [setPrompt]);

  const submit = () => {
    const text = input.trim();
    if (!text) return;
    const charCount = text.length;
    const uniqueCharCount = new Set(text.split('')).size;
    const noveltyScore = Math.min(10, (uniqueCharCount / Math.max(1, charCount)) * 10);
    const consistencyScore = Math.min(10, Math.max(3, text.includes('因为') ? 8 : 6));
    const latencyMs = Date.now() - startRef.current;
    const result: GameStageResult = {
      dimension: 'imagination',
      metrics: { charCount, noveltyScore, consistencyScore, latencyMs }
    };
    onComplete(result);
  };

  return (
    <div className="storytelling-game">
      <p className="story-prompt">把“云+鞋”组合起来，会发生什么？</p>
      <input
        type="text"
        className="story-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="试着描述一个有趣的结果..."
      />
      <button className="submit-button" onClick={submit} disabled={!input.trim()}>
        提交
      </button>
    </div>
  );
};

export default ImaginationGame;