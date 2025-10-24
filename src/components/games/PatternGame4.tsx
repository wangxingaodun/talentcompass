import React from 'react';
import type { GameStageProps, GameStageResult } from './types';
import '../../styles/pattern.css';
import { callChatJSON } from './llm';

// 题目四：类比推理（改为使用大模型生成选项与答案，并保留本地兜底）

interface AnalogyOption {
  key: 'A' | 'B' | 'C';
  shape: 'rectangle' | 'heart' | 'star';
  text: string; // 如 "A. 长方形"
}

interface AnalogyQuestion {
  title: string;
  options: AnalogyOption[];
  correct: 'A' | 'B' | 'C';
  explanation: string;
}

function localFallbackQuestion(): AnalogyQuestion {
  return {
    title: '题目四：类比推理 - 请观察前两个图形的关系，然后从选项中选择一个图形，使它和第三个图形具有同样的关系。',
    options: [
      { key: 'A', shape: 'rectangle', text: 'A. 长方形' },
      { key: 'B', shape: 'heart', text: 'B. 爱心' },
      { key: 'C', shape: 'star', text: 'C. 星形' },
    ],
    correct: 'B',
    explanation: '三角形→圆形表现为尖角对应圆润；同理正方形对应爱心（圆润）。'
  };
}

const PatternGame4: React.FC<GameStageProps> = ({ childName, setPrompt, onComplete }) => {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<'correct' | 'incorrect' | null>(null);
  const startTimeRef = React.useRef<number>(Date.now());

  const [question, setQuestion] = React.useState<AnalogyQuestion | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchQuestion = async () => {
      setLoading(true);
      setError(null);
      setPrompt(`${childName}，请观察前两个图形的关系，然后选择一个图形，使它和第三个图形具有同样的关系。`);
      startTimeRef.current = Date.now();
      try {
        const seed = Math.floor(Math.random() * 100000).toString();
        const prompt = `请为类比推理题生成选项与答案，严格返回 JSON：\n{
  "title": string,
  "options": [
    { "key": "A"|"B"|"C", "shape": "rectangle"|"heart"|"star", "text": string },
    { "key": "A"|"B"|"C", "shape": "rectangle"|"heart"|"star", "text": string },
    { "key": "A"|"B"|"C", "shape": "rectangle"|"heart"|"star", "text": string }
  ],
  "correct": "A"|"B"|"C",
  "explanation": string
}\n题干固定为：三角形→圆形；正方形→？\n约束：\n- 选项形状仅为 rectangle/heart/star；\n- 只有一个正确答案，应为 heart；\n- 选项顺序可随机；\n- 标题与解释中文且适龄友好；\n- 仅输出 JSON；\n- 随机种子：${seed}`;
        const q = await callChatJSON(prompt);
        if (!q || !q.options?.length || !q.correct) {
          setQuestion(localFallbackQuestion());
        } else {
          setQuestion(q);
        }
      } catch (e) {
        setError('生成题目失败，已使用本地题目');
        setQuestion(localFallbackQuestion());
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [setPrompt, childName]);

  const select = (option: string) => {
    if (result) return;
    setSelected(option);
    const isCorrect = option === (question?.correct || 'B');
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
      <h3 className="game-title">{question?.title || '题目四：类比推理 - 请观察前两个图形的关系，然后从选项中选择一个图形，使它和第三个图形具有同样的关系。'}</h3>
      {loading && <p className="pattern-feedback">正在生成题目…</p>}
      {error && <p className="pattern-feedback incorrect">{error}</p>}
      
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
      
      {question && (
        <div className="pattern-options-new analogy-options">
          {question.options.map((opt) => (
            <button 
              key={opt.key}
              className={`shape-option ${selected === opt.key ? 'selected' : ''}`} 
              onClick={() => select(opt.key)}
              disabled={result !== null}
            >
              <div className={`shape ${opt.shape}`}></div>
              <span className="option-label">{opt.text}</span>
            </button>
          ))}
        </div>
      )}
      
      {result === 'correct' && <p className="pattern-feedback correct">太棒了！{question?.explanation || '你找到了规律：有尖角的形状对应圆润的形状！'}</p>}
      {result === 'incorrect' && <p className="pattern-feedback incorrect">没关系，让我们继续探索吧！</p>}
    </div>
  );
};

export default PatternGame4;