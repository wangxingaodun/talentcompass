import React from 'react';
import type { GameStageProps, GameStageResult } from './types';
import '../../styles/pattern.css';

// 题目二：颜色序列模式识别
// 序列：红, 红, 蓝, 蓝, 红, 红, 蓝, ?
// 规律：每两个颜色相同，顺序为"红红蓝蓝"重复
// 正确答案：B. 蓝

const PatternGame2: React.FC<GameStageProps> = ({ childName, setPrompt, onComplete }) => {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<'correct' | 'incorrect' | null>(null);
  const startTimeRef = React.useRef<number>(Date.now());

  React.useEffect(() => {
    setPrompt(`${childName}，请观察下面的颜色序列，找出规律并选择下一个颜色应该是什么？`);
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

  // 颜色序列数据
  const colorSequence = ['红', '红', '蓝', '蓝', '红', '红', '蓝', '?'];
  const colorClasses = ['red', 'red', 'blue', 'blue', 'red', 'red', 'blue', 'question'];

  return (
    <div className="pattern-game">
      <h3 className="game-title">题目二：颜色序列模式识别</h3>
      <div className="color-sequence">
        {colorSequence.map((color, index) => (
          <div key={index} className="color-item">
            <div className={`color-circle ${colorClasses[index]}`}>
              {color === '?' && <span className="question-text">?</span>}
            </div>
            <span className="color-label">{color}</span>
          </div>
        ))}
      </div>
      
      <div className="pattern-options-new">
        <button 
          className={`shape-option ${selected === 'A' ? 'selected' : ''}`} 
          onClick={() => select('A')}
          disabled={result !== null}
        >
          <div className="color-circle red"></div>
          <span className="option-label">A. 红</span>
        </button>
        <button 
          className={`shape-option ${selected === 'B' ? 'selected' : ''}`} 
          onClick={() => select('B')}
          disabled={result !== null}
        >
          <div className="color-circle blue"></div>
          <span className="option-label">B. 蓝</span>
        </button>
        <button 
          className={`shape-option ${selected === 'C' ? 'selected' : ''}`} 
          onClick={() => select('C')}
          disabled={result !== null}
        >
          <div className="color-circle green"></div>
          <span className="option-label">C. 绿</span>
        </button>
      </div>
      
      {result === 'correct' && <p className="pattern-feedback correct">太棒了！你找到了规律：每两个颜色相同，"红红蓝蓝"重复循环！</p>}
      {result === 'incorrect' && <p className="pattern-feedback incorrect">没关系，让我们继续探索吧！</p>}
    </div>
  );
};

export default PatternGame2;