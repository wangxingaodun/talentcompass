import React from 'react';
import type { GameStageProps, GameStageResult } from './types';
import '../../styles/pattern.css';
import { callChatJSON } from './llm';

// 题目二：颜色序列模式识别（改为使用大模型生成题目 JSON，并保留本地兜底）

interface ColorStep {
  color?: 'red' | 'blue' | 'green';
  label: string; // 如 "1. 红" 或 "8. ?"
  question?: boolean;
}

interface ColorOption {
  key: 'A' | 'B' | 'C';
  color: 'red' | 'blue' | 'green';
  text: string; // 如 "A. 红"
}

interface ColorQuestion {
  title: string;
  sequence: ColorStep[];
  options: ColorOption[];
  correct: 'A' | 'B' | 'C';
  explanation: string;
}

function localFallbackQuestion(): ColorQuestion {
  return {
    title: '题目二：颜色序列模式识别',
    sequence: [
      { color: 'red', label: '1. 红' },
      { color: 'red', label: '2. 红' },
      { color: 'blue', label: '3. 蓝' },
      { color: 'blue', label: '4. 蓝' },
      { color: 'red', label: '5. 红' },
      { color: 'red', label: '6. 红' },
      { color: 'blue', label: '7. 蓝' },
      { label: '8. ?', question: true },
    ],
    options: [
      { key: 'A', color: 'red', text: 'A. 红' },
      { key: 'B', color: 'blue', text: 'B. 蓝' },
      { key: 'C', color: 'green', text: 'C. 绿' },
    ],
    correct: 'B',
    explanation: '每两个颜色相同，序列按“红红蓝蓝”重复循环，因此第8个为蓝。'
  };
}

const PatternGame2: React.FC<GameStageProps> = ({ childName, setPrompt, onComplete }) => {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<'correct' | 'incorrect' | null>(null);
  const startTimeRef = React.useRef<number>(Date.now());

  const [question, setQuestion] = React.useState<ColorQuestion | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchQuestion = async () => {
      setLoading(true);
      setError(null);
      setPrompt(`${childName}，请观察下面的颜色序列，找出规律并选择下一个颜色应该是什么？`);
      startTimeRef.current = Date.now();
      try {
        const seed = Math.floor(Math.random() * 100000).toString();
        const prompt = `请生成颜色序列模式识别题目，严格返回 JSON：\n{
  "title": string,
  "sequence": [
    { "color": "red"|"blue"|"green", "label": string },
    { "color": "red"|"blue"|"green", "label": string },
    { "color": "red"|"blue"|"green", "label": string },
    { "color": "red"|"blue"|"green", "label": string },
    { "color": "red"|"blue"|"green", "label": string },
    { "color": "red"|"blue"|"green", "label": string },
    { "color": "red"|"blue"|"green", "label": string },
    { "label": "8. ?", "question": true }
  ],
  "options": [
    { "key": "A"|"B"|"C", "color": "red"|"blue"|"green", "text": string },
    { "key": "A"|"B"|"C", "color": "red"|"blue"|"green", "text": string },
    { "key": "A"|"B"|"C", "color": "red"|"blue"|"green", "text": string }
  ],
  "correct": "A"|"B"|"C",
  "explanation": string
}\n要求：\n- 元素仅为颜色 red/blue/green；\n- 采用可辨识的序列规律并确保唯一正确答案（推荐“红红蓝蓝”重复或“红蓝交替”）；\n- 选项不可重复，且包含正确颜色；\n- 标题与解释中文且适龄友好；\n- 仅输出 JSON；\n- 随机种子：${seed}`;
        const q = await callChatJSON(prompt);
        if (!q || !q.options?.length || !q.sequence?.length || !q.correct) {
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
      <h3 className="game-title">{question?.title || '题目二：颜色序列模式识别'}</h3>
      {loading && <p className="pattern-feedback">正在生成题目…</p>}
      {error && <p className="pattern-feedback incorrect">{error}</p>}

      <div className="color-sequence">
        {question && question.sequence.map((step, index) => (
          <div key={index} className="color-item">
            <div className={`color-circle ${step.question ? 'question' : step.color}`}> 
              {step.question && <span className="question-text">?</span>}
            </div>
            <span className="color-label">{step.label}</span>
          </div>
        ))}
      </div>

      {question && (
        <div className="pattern-options-new">
          {question.options.map((opt) => (
            <button 
              key={opt.key}
              className={`shape-option ${selected === opt.key ? 'selected' : ''}`}
              onClick={() => select(opt.key)}
              disabled={result !== null}
            >
              <div className={`color-circle ${opt.color}`}></div>
              <span className="option-label">{opt.text}</span>
            </button>
          ))}
        </div>
      )}
      
      {result === 'correct' && <p className="pattern-feedback correct">太棒了！{question?.explanation || '你找到了规律：每两个颜色相同，“红红蓝蓝”重复循环！'}</p>}
      {result === 'incorrect' && <p className="pattern-feedback incorrect">没关系，让我们继续探索吧！</p>}
    </div>
  );
};

export default PatternGame2;