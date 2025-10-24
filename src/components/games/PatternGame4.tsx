import React from 'react';
import type { GameStageProps, GameStageResult } from './types';
import '../../styles/pattern.css';

// 题目四：类比推理
// 类比关系：三角形在圆形里面，就像正方形在（?）里面
// 规律：从一个由直线组成的、有尖角的"规则图形"（三角形），指向一个柔软的、由曲线组成的"非规则图形"（圆形）
// 同样，由直线组成的、有尖角的"规则图形"（正方形），应该对应一个柔软的、由曲线组成的"非规则图形"（爱心）
// 正确答案：B. 爱心

const PatternGame4: React.FC<GameStageProps> = ({ childName, setPrompt, onComplete }) => {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<'correct' | 'incorrect' | null>(null);
  const startTimeRef = React.useRef<number>(Date.now());

  React.useEffect(() => {
    setPrompt(`${childName}，请观察前两个图形的关系，然后选择一个图形，使它和第三个图形具有同样的关系。`);
    startTimeRef.current = Date.now();
  }, [setPrompt, childName]);

  const select = (option: string) => {
    if (result) return;
    setSelected(option);
    const isCorrect = option === 'B';
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
      <h3 className="game-title">题目四：类比推理 - 请观察前两个图形的关系，然后从选项中选择一个图形，使它和第三个图形具有同样的关系。</h3>
      
      <div className="analogy-display" style={{ flexDirection: 'row', alignItems: 'center', gap: '24px' }}>
        <div className="analogy-pair">
          <div className="analogy-item">
            <div className="shape triangle"></div>
            <span className="shape-label">三角形</span>
          </div>
          <span className="analogy-arrow">→</span>
          <div className="analogy-item">
            <div className="shape circle"></div>
            <span className="shape-label">圆形</span>
          </div>
        </div>
        
        <div className="analogy-separator">同样的关系：</div>
        
        <div className="analogy-pair">
          <div className="analogy-item">
            <div className="shape square" style={{ borderRadius: '0px' }}></div>
            <span className="shape-label">正方形</span>
          </div>
          <span className="analogy-arrow">→</span>
          <div className="analogy-item question">
            <span className="question-mark">?</span>
          </div>
        </div>
      </div>
      
      <div className="pattern-options-new analogy-options">
        <button 
          className={`shape-option ${selected === 'A' ? 'selected' : ''}`} 
          onClick={() => select('A')}
          disabled={result !== null}
        >
          <div className="shape rectangle"></div>
          <span className="option-label">A. 长方形</span>
        </button>
        <button 
          className={`shape-option ${selected === 'B' ? 'selected' : ''}`} 
          onClick={() => select('B')}
          disabled={result !== null}
        >
          <div className="shape heart"></div>
          <span className="option-label">B. 爱心</span>
        </button>
        <button 
          className={`shape-option ${selected === 'C' ? 'selected' : ''}`} 
          onClick={() => select('C')}
          disabled={result !== null}
        >
          <div className="shape star"></div>
          <span className="option-label">C. 星形</span>
        </button>
      </div>
      
      {result === 'correct' && <p className="pattern-feedback correct">太棒了！你找到了规律：有尖角的形状对应圆润的形状！</p>}
      {result === 'incorrect' && <p className="pattern-feedback incorrect">没关系，让我们继续探索吧！</p>}
    </div>
  );
};

export default PatternGame4;