import React from 'react';
import type { GameStageProps, GameStageResult } from './types';
import '../../styles/pattern.css';

// 题目一：图形序列模式识别
// 红色圆形 -> 蓝色正方形 -> 红色三角形 -> ?
// 规律：颜色红蓝交替，形状按圆形、正方形、三角形顺序循环
// 正确答案：A. 蓝色圆形

const PatternGame1: React.FC<GameStageProps> = ({ childName, setPrompt, onComplete }) => {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<'correct' | 'incorrect' | null>(null);
  const startTimeRef = React.useRef<number>(Date.now());

  React.useEffect(() => {
    setPrompt(`${childName}，请观察下面的图形序列，找出规律并选择第四个图形应该是什么？`);
    startTimeRef.current = Date.now();
  }, [setPrompt, childName]);

  const select = (option: string) => {
    if (result) return;
    setSelected(option);
    const isCorrect = option === 'A';
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
      <h3 className="game-title">题目一：图形序列模式识别</h3>
      <div className="shape-sequence">
        <div className="shape-item">
          <div className="shape circle red"></div>
          <span className="shape-label">1. 红色圆形</span>
        </div>
        <div className="shape-item">
          <div className="shape square blue"></div>
          <span className="shape-label">2. 蓝色正方形</span>
        </div>
        <div className="shape-item">
          <div className="shape triangle red"></div>
          <span className="shape-label">3. 红色三角形</span>
        </div>
        <div className="shape-item question-item">
          <div className="shape question-mark">?</div>
          <span className="shape-label">4. ?</span>
        </div>
      </div>
      
      <div className="pattern-options-new">
        <button 
          className={`shape-option ${selected === 'A' ? 'selected' : ''}`} 
          onClick={() => select('A')}
          disabled={result !== null}
        >
          <div className="shape circle blue"></div>
          <span className="option-label">A. 蓝色圆形</span>
        </button>
        <button 
          className={`shape-option ${selected === 'B' ? 'selected' : ''}`} 
          onClick={() => select('B')}
          disabled={result !== null}
        >
          <div className="shape square red"></div>
          <span className="option-label">B. 红色正方形</span>
        </button>
        <button 
          className={`shape-option ${selected === 'C' ? 'selected' : ''}`} 
          onClick={() => select('C')}
          disabled={result !== null}
        >
          <div className="shape triangle blue"></div>
          <span className="option-label">C. 蓝色三角形</span>
        </button>
      </div>
      
      {result === 'correct' && <p className="pattern-feedback correct">太棒了！你找到了规律：颜色红蓝交替，形状按圆形、正方形、三角形循环！</p>}
      {result === 'incorrect' && <p className="pattern-feedback incorrect">没关系，让我们继续探索吧！</p>}
    </div>
  );
};

export default PatternGame1;