import React from 'react';
import type { GameStageProps, GameStageResult } from './types';
import '../../styles/pattern.css';
import { callChatJSON } from './llm';

// 题目三：分类能力（改为使用大模型生成题目 JSON，并保留本地兜底）

interface Item {
  name: string;
  emoji: string; // 如 "🍎"
}

interface ClassOption {
  key: 'A' | 'B' | 'C' | 'D';
  name: string;
  emoji: string;
  text: string; // 如 "A. 苹果"
}

interface ClassificationQuestion {
  title: string;
  instruction: string;
  items: Item[]; // 展示用
  options: ClassOption[]; // 选择用
  correct: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

function localFallbackQuestion(): ClassificationQuestion {
  return {
    title: '分类能力',
    instruction: '观察下面四个物品，找出哪一个与其他三个不属于同一类',
    items: [
      { name: '苹果', emoji: '🍎' },
      { name: '香蕉', emoji: '🍌' },
      { name: '胡萝卜', emoji: '🥕' },
      { name: '橙子', emoji: '🍊' },
    ],
    options: [
      { key: 'A', name: '苹果', emoji: '🍎', text: 'A. 苹果' },
      { key: 'B', name: '香蕉', emoji: '🍌', text: 'B. 香蕉' },
      { key: 'C', name: '胡萝卜', emoji: '🥕', text: 'C. 胡萝卜' },
      { key: 'D', name: '橙子', emoji: '🍊', text: 'D. 橙子' },
    ],
    correct: 'C',
    explanation: '苹果、香蕉和橙子是水果，而胡萝卜是蔬菜。'
  };
}

const PatternGame3: React.FC<GameStageProps> = ({ childName, setPrompt, onComplete }) => {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<'correct' | 'incorrect' | null>(null);
  const startTimeRef = React.useRef<number>(Date.now());

  const [question, setQuestion] = React.useState<ClassificationQuestion | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchQuestion = async () => {
      setLoading(true);
      setError(null);
      const seed = Math.floor(Math.random() * 100000).toString();
      setPrompt(`${childName}，请观察下面的物品，找出哪一个与其他三个不属于同一类？`);
      startTimeRef.current = Date.now();
      try {
        const prompt = `请生成一个儿童友好的分类题目，严格返回 JSON：\n{
  "title": string,
  "instruction": string,
  "items": [ { "name": string, "emoji": string }, ... (共4项) ],
  "options": [ { "key": "A"|"B"|"C"|"D", "name": string, "emoji": string, "text": string }, ... (4项) ],
  "correct": "A"|"B"|"C"|"D",
  "explanation": string
}\n要求：\n- 4个物品中有3个同类，1个不同类（如：3个水果 + 1个蔬菜）；\n- 选项与 items 一一对应；\n- 标题、说明与解释中文，适龄友好；\n- 仅输出 JSON；\n- 随机种子：${seed}`;
        const q = await callChatJSON(prompt);
        if (!q || !q.items?.length || !q.options?.length || !q.correct) {
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
    const isCorrect = option === (question?.correct || 'C');
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
      <h2 className="game-title">{question?.title || '分类能力'}</h2>
      {loading && <p className="pattern-feedback">正在生成题目…</p>}
      {error && <p className="pattern-feedback incorrect">{error}</p>}
      
      <p className="game-instruction">{question?.instruction || '观察下面四个物品，找出哪一个与其他三个不属于同一类'}</p>
      
      <div className="items-display" style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
        {question && question.items.map((item, idx) => (
          <div key={idx} className="item-card-square">
            <div className="item-emoji">{item.emoji}</div>
            <span className="item-name">{item.name}</span>
          </div>
        ))}
      </div>
      
      {question && (
        <div className="pattern-options-new classification-options" style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
          {question.options.map((opt) => (
            <button 
              key={opt.key}
              className={`shape-option-square ${selected === opt.key ? 'selected' : ''}`} 
              onClick={() => select(opt.key)}
              disabled={result !== null}
            >
              <div className="item-emoji-small">{opt.emoji}</div>
              <span className="option-label">{opt.text}</span>
            </button>
          ))}
        </div>
      )}
      
      {result === 'correct' && <p className="pattern-feedback correct">太棒了！{question?.explanation || '你找到了不同：苹果、香蕉和橙子都是水果，而胡萝卜是蔬菜！'}</p>}
      {result === 'incorrect' && <p className="pattern-feedback incorrect">没关系，让我们继续探索吧！</p>}
    </div>
  );
};

export default PatternGame3;