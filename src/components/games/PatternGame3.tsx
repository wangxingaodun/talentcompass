import React from 'react';
import type { GameStageProps, GameStageResult } from './types';
import '../../styles/pattern.css';

// 题目三：分类能力
// 物品：苹果, 香蕉, 胡萝卜, 橙子
// 规律：苹果、香蕉和橙子都是水果，而胡萝卜是蔬菜
// 正确答案：C. 胡萝卜

const PatternGame3: React.FC<GameStageProps> = ({ childName, setPrompt, onComplete }) => {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<'correct' | 'incorrect' | null>(null);
  const startTimeRef = React.useRef<number>(Date.now());

  React.useEffect(() => {
    setPrompt(`${childName}，请观察下面的物品，找出哪一个与其他三个不属于同一类？`);
    startTimeRef.current = Date.now();
  }, [setPrompt, childName]);

  const select = (option: string) => {
    if (result) return;
    setSelected(option);
    const isCorrect = option === 'C';
    setResult(isCorrect ? 'correct' : 'incorrect');

    const latencyMs = Date.now() - startTimeRef.current;
    const stageResult: GameStageResult = {
      dimension: 'logic',
      metrics: { correct: isCorrect ? 1 : 0, attempts: 1, avgLatencyMs: latencyMs }
    };
    
    setTimeout(() => onComplete(stageResult), isCorrect ? 1000 : 1500);
  };

  return (
    <div className="pattern-game">
      <h2 className="game-title">分类能力</h2>
      
      <p className="game-instruction">观察下面四个物品，找出哪一个与其他三个不属于同一类</p>
      
      <div className="items-display" style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
        <div className="item-card-square">
          <div className="item-emoji">🍎</div>
          <span className="item-name">苹果</span>
        </div>
        <div className="item-card-square">
          <div className="item-emoji">🍌</div>
          <span className="item-name">香蕉</span>
        </div>
        <div className="item-card-square">
          <div className="item-emoji">🥕</div>
          <span className="item-name">胡萝卜</span>
        </div>
        <div className="item-card-square">
          <div className="item-emoji">🍊</div>
          <span className="item-name">橙子</span>
        </div>
      </div>
      
      <div className="pattern-options-new classification-options" style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
        <button 
          className={`shape-option-square ${selected === 'A' ? 'selected' : ''}`} 
          onClick={() => select('A')}
          disabled={result !== null}
        >
          <div className="item-emoji-small">🍎</div>
          <span className="option-label">A. 苹果</span>
        </button>
        <button 
          className={`shape-option-square ${selected === 'B' ? 'selected' : ''}`} 
          onClick={() => select('B')}
          disabled={result !== null}
        >
          <div className="item-emoji-small">🍌</div>
          <span className="option-label">B. 香蕉</span>
        </button>
        <button 
          className={`shape-option-square ${selected === 'C' ? 'selected' : ''}`} 
          onClick={() => select('C')}
          disabled={result !== null}
        >
          <div className="item-emoji-small">🥕</div>
          <span className="option-label">C. 胡萝卜</span>
        </button>
        <button 
          className={`shape-option-square ${selected === 'D' ? 'selected' : ''}`} 
          onClick={() => select('D')}
          disabled={result !== null}
        >
          <div className="item-emoji-small">🍊</div>
          <span className="option-label">D. 橙子</span>
        </button>
      </div>
      
      {result === 'correct' && <p className="pattern-feedback correct">太棒了！你找到了不同：苹果、香蕉和橙子都是水果，而胡萝卜是蔬菜！</p>}
      {result === 'incorrect' && <p className="pattern-feedback incorrect">没关系，让我们继续探索吧！</p>}
    </div>
  );
};

export default PatternGame3;