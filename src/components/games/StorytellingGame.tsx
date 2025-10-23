import React from 'react';
import type { GameStageProps, GameStageResult } from './types';

const StorytellingGame: React.FC<GameStageProps> = ({ childName, setPrompt, onComplete }) => {
  const [input, setInput] = React.useState('');
  const startTimeRef = React.useRef<number>(Date.now());

  React.useEffect(() => {
    setPrompt(`${childName}，小兔子遇到了谁呢？用一句话告诉我！`);
    startTimeRef.current = Date.now();
  }, [childName, setPrompt]);

  const handleSubmit = () => {
    const text = input.trim();
    const latencyMs = Date.now() - startTimeRef.current;
    const uniqueChars = new Set(text.split('')).size;
    const result: GameStageResult = {
      dimension: 'expression',
      metrics: {
        charCount: text.length,
        uniqueCharCount: uniqueChars,
        latencyMs
      }
    };
    onComplete(result);
  };

  return (
    <div className="storytelling-game">
      <p className="story-prompt">请用一句话讲一讲：小兔子遇到了谁？</p>
      <textarea
        className="story-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="例如：小兔子遇到了小熊，一起去森林散步。"
      />
      <button 
        onClick={handleSubmit} 
        className="submit-button"
        disabled={!input.trim()}
      >
        提交
      </button>
    </div>
  );
};

export default StorytellingGame;