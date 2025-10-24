import React from 'react';
import type { GameStageProps, GameStageResult } from './types';
import '../../styles/pattern.css';
import { callChatJSON } from './llm';

// 题目四：类比推理（由大模型生成题干与选项，并保留本地兜底）

interface StemItem {
  shape: 'triangle' | 'circle' | 'square' | 'rectangle' | 'heart' | 'star';
  label: string; // 如 "三角形"
}

interface AnalogyStem {
  pair1: { left: StemItem; right: StemItem };
  pair2: { left: StemItem };
}

interface AnalogyOption {
  key: 'A' | 'B' | 'C';
  shape: 'triangle' | 'circle' | 'square' | 'rectangle' | 'heart' | 'star';
  text: string; // 如 "A. 长方形"
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
    title: '题目四：类比推理 - 请观察前两个图形的关系，然后从选项中选择一个图形，使它和第三个图形具有同样的关系。',
    stem: {
      pair1: { left: { shape: 'triangle', label: '三角形' }, right: { shape: 'circle', label: '圆形' } },
      pair2: { left: { shape: 'square', label: '正方形' } }
    },
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
      setPrompt(`${childName}，请观察前两个图形（或事物）的关系，然后选择一个选项，使它与第三个图形（或事物）具有同样的关系。`);
      startTimeRef.current = Date.now();
      try {
        const seed = Math.floor(Math.random() * 100000).toString();
        const prompt = `请为“类比推理”题生成题干（两个类比项与待推理项）以及选项与答案，严格返回 JSON：\n{
  "title": string,
  "stem": {
    "pair1": { "left": { "shape": "triangle"|"circle"|"square"|"rectangle"|"heart"|"star", "label": string }, "right": { "shape": "triangle"|"circle"|"square"|"rectangle"|"heart"|"star", "label": string } },
    "pair2": { "left": { "shape": "triangle"|"circle"|"square"|"rectangle"|"heart"|"star", "label": string } }
  },
  "options": [
    { "key": "A"|"B"|"C", "shape": "triangle"|"circle"|"square"|"rectangle"|"heart"|"star", "text": string },
    { "key": "A"|"B"|"C", "shape": "triangle"|"circle"|"square"|"rectangle"|"heart"|"star", "text": string },
    { "key": "A"|"B"|"C", "shape": "triangle"|"circle"|"square"|"rectangle"|"heart"|"star", "text": string }
  ],
  "correct": "A"|"B"|"C",
  "explanation": string
}\n要求：\n- 题干与选项仅使用以下形状：triangle/circle/square/rectangle/heart/star，中文 label 友好适龄；\n- 只有一个正确答案；\n- 选项顺序可随机；\n- 标题与解释为中文且适龄友好；\n- 仅输出 JSON；\n- 随机种子：${seed}`;
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
    const isCorrect = option === (question?.correct || 'B');
    setResult(isCorrect ? 'correct' : 'incorrect');

    const latencyMs = Date.now() - startTimeRef.current;
    const stageResult: GameStageResult = {
      dimension: 'logic',
      metrics: { correct: isCorrect ? 1 : 0, attempts: 1, avgLatencyMs: latencyMs }
    };
    
    setTimeout(() => onComplete(stageResult), isCorrect ? 1000 : 1500);
  };

  const renderShape = (shape?: StemItem | AnalogyOption) => {
    if (!shape) return null;
    const shapeName = 'shape' in shape ? shape.shape : undefined;
    const label = 'label' in shape ? shape.label : ('text' in shape ? shape.text.replace(/^([ABC]\.)\s*/, '') : '');
    return (
      <div className="analogy-item">
        <div className={`shape ${shapeName}`}></div>
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
            {renderShape(question.stem.pair1.left)}
            <span className="analogy-arrow">→</span>
            {renderShape(question.stem.pair1.right)}
          </div>
          
          <div className="analogy-separator">同样的关系：</div>
          
          <div className="analogy-pair">
            {renderShape(question.stem.pair2.left)}
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