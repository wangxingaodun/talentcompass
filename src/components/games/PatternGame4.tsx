import React from 'react';
import type { GameStageProps, GameStageResult } from './types';
import '../../styles/pattern.css';
import { callChatJSON } from './llm';

// 题目四：类比推理（由大模型生成题干与选项，并保留本地兜底）

interface StemItem {
  emoji: string; // 如 "🐣"
  label: string; // 如 "小鸡"
}

interface AnalogyStem {
  pair1: { left: StemItem; right: StemItem };
  pair2: { left: StemItem };
}

interface AnalogyOption {
  key: 'A' | 'B' | 'C';
  emoji: string; // 如 "🐔"
  text: string; // 如 "A. 公鸡"
}

interface AnalogyQuestion {
  title: string;
  stem: AnalogyStem;
  options: AnalogyOption[];
  correct: 'A' | 'B' | 'C';
  explanation: string;
}

function localFallbackQuestion(): AnalogyQuestion {
  return {
    title: '题目四：类比推理 - 请观察前两个事物的关系，然后从选项中选择一个，使它与第三个事物具有同样的关系。',
    stem: {
      pair1: { left: { emoji: '🌱', label: '幼苗' }, right: { emoji: '🌳', label: '大树' } },
      pair2: { left: { emoji: '🐣', label: '小鸡' } }
    },
    options: [
      { key: 'A', emoji: '🐔', text: 'A. 公鸡' },
      { key: 'B', emoji: '🦋', text: 'B. 蝴蝶' },
      { key: 'C', emoji: '🐟', text: 'C. 小鱼' },
    ],
    correct: 'A',
    explanation: '幼苗→大树表示从幼体到成体；同理小鸡→公鸡（成体）。'
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
      setPrompt(`${childName}，请观察前两个事物的关系，然后选择一个选项，使它与第三个事物具有同样的关系（使用表情符号展示）。`);
      startTimeRef.current = Date.now();
      try {
        const seed = Math.floor(Math.random() * 100000).toString();
        const prompt = `请为“类比推理”题生成题干（两个类比项与待推理项）以及选项与答案，严格返回 JSON：\n{
  "title": string,
  "stem": {
    "pair1": { "left": { "emoji": string, "label": string }, "right": { "emoji": string, "label": string } },
    "pair2": { "left": { "emoji": string, "label": string } }
  },
  "options": [
    { "key": "A"|"B"|"C", "emoji": string, "text": string },
    { "key": "A"|"B"|"C", "emoji": string, "text": string },
    { "key": "A"|"B"|"C", "emoji": string, "text": string }
  ],
  "correct": "A"|"B"|"C",
  "explanation": string
}\n要求：\n- 题干与选项使用常见且适龄友好的 emoji 表达，不使用几何图形；\n- 只有一个正确答案；\n- 选项顺序可随机；\n- 标题与解释为中文且适龄友好；\n- 仅输出 JSON；\n- 随机种子：${seed}`;
        const q = await callChatJSON(prompt);
        if (!q || !q.options?.length || !q.correct || !q.stem?.pair1?.left || !q.stem?.pair1?.right || !q.stem?.pair2?.left) {
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
    const isCorrect = option === (question?.correct || 'A');
    setResult(isCorrect ? 'correct' : 'incorrect');

    const latencyMs = Date.now() - startTimeRef.current;
    const stageResult: GameStageResult = {
      dimension: 'logic',
      metrics: { correct: isCorrect ? 1 : 0, attempts: 1, avgLatencyMs: latencyMs }
    };
    
    setTimeout(() => onComplete(stageResult), isCorrect ? 1000 : 1500);
  };

  const renderEmoji = (item?: StemItem | AnalogyOption) => {
    if (!item) return null;
    const emoji = 'emoji' in item ? (item as StemItem | AnalogyOption).emoji : '';
    const label = 'label' in item ? (item as StemItem).label : ('text' in item ? (item as AnalogyOption).text.replace(/^([ABC]\.)\s*/, '') : '');
    return (
      <div className="analogy-item">
        <div className="item-emoji">{emoji}</div>
        <span className="shape-label">{label}</span>
      </div>
    );
  };

  return (
    <div className="pattern-game">
      <h3 className="game-title">{loading ? '正在生成题目…' : (question ? question.title : '')}</h3>
      {loading && <p className="pattern-feedback">正在生成题目…</p>}
      {error && <p className="pattern-feedback incorrect">{error}</p>}
      
      {question && (
        <div className="analogy-display" style={{ flexDirection: 'row', alignItems: 'center', gap: '24px' }}>
          <div className="analogy-pair">
            {renderEmoji(question.stem.pair1.left)}
            <span className="analogy-arrow">→</span>
            {renderEmoji(question.stem.pair1.right)}
          </div>
          
          <div className="analogy-separator">同样的关系：</div>
          
          <div className="analogy-pair">
            {renderEmoji(question.stem.pair2.left)}
            <span className="analogy-arrow">→</span>
            <div className="analogy-item question">
              <span className="question-mark">?</span>
            </div>
          </div>
        </div>
      )}
      
      {question && (
        <div className="pattern-options-new analogy-options">
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
      
      {result === 'correct' && <p className="pattern-feedback correct">太棒了！{question?.explanation || '你找到了规律：从幼体到成体的关系！'}</p>}
      {result === 'incorrect' && <p className="pattern-feedback incorrect">没关系，让我们继续探索吧！</p>}
    </div>
  );
};

export default PatternGame4;