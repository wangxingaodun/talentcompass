import React from 'react';
import type { GameStageProps, GameStageResult } from './types';
import '../../styles/pattern.css';

// 题目一：图形序列模式识别
// 红色圆形 -> 蓝色正方形 -> 红色三角形 -> ?
// 规律：颜色红蓝交替，形状按圆形、正方形、三角形顺序循环
// 正确答案：A. 蓝色圆形

// 使用大模型生成题目所需的配置与调用（参考 imaginationEvaluator.ts 的配置方式）
import { getAPIConfig, callChatJSON } from './llm';

// 期望的题目 JSON 结构
interface PatternOption {
  key: string; // e.g. 'A'
  shape: 'circle' | 'square' | 'triangle' | 'rectangle' | 'star';
  color: 'red' | 'blue' | 'green' | 'yellow';
  text: string; // 展示文案，如 "A. 蓝色圆形"
}

interface PatternStep {
  shape?: 'circle' | 'square' | 'triangle' | 'rectangle' | 'star';
  color?: 'red' | 'blue' | 'green' | 'yellow';
  label: string; // 如 "1. 红色圆形" 或 "4. ?"
  question?: boolean; // true 表示问号位置
}

interface PatternQuestion {
  title: string;
  sequence: PatternStep[];
  options: PatternOption[];
  correct: string; // 正确选项 key，如 'A'
  explanation: string; // 规律说明
}

function localFallbackQuestion(): PatternQuestion {
  return {
    title: '题目一：图形序列模式识别',
    sequence: [
      { shape: 'circle', color: 'red', label: '1. 红色圆形' },
      { shape: 'square', color: 'blue', label: '2. 蓝色正方形' },
      { shape: 'triangle', color: 'red', label: '3. 红色三角形' },
      { label: '4. ?', question: true }
    ],
    options: [
      { key: 'A', shape: 'circle', color: 'blue', text: 'A. 蓝色圆形' },
      { key: 'B', shape: 'square', color: 'red', text: 'B. 红色正方形' },
      { key: 'C', shape: 'triangle', color: 'blue', text: 'C. 蓝色三角形' }
    ],
    correct: 'A',
    explanation: '颜色红蓝交替，形状按圆形、正方形、三角形循环'
  };
}

const PatternGame1: React.FC<GameStageProps> = ({ childName, setPrompt, onComplete }) => {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<'correct' | 'incorrect' | null>(null);
  const startTimeRef = React.useRef<number>(Date.now());
  const [question, setQuestion] = React.useState<PatternQuestion | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchQuestion = async () => {
      setLoading(true);
      setError(null);
      const config = getAPIConfig();
      console.log('PatternGame1 使用配置:', config);
      try {
        let q: PatternQuestion;
        let questionSource: 'ai' | 'local' = 'local';
        const seed = Math.floor(Math.random() * 100000).toString();
        const prompt = `你是一名儿童逻辑训练专家。请生成一个“随机”的图形序列模式识别题目。

规则集合（可任选其一或在明确可行的情况下组合，但需保证唯一正确答案）：
- 颜色在“红/蓝/绿/黄”四种中，先随机抽取两种用于本题（例如：红+蓝 或 蓝+黄）。可采用这两种颜色交替或成对重复等模式。
- 形状在“圆形/正方形/三角形/长方形/星形”五种中，先随机抽取三种用于本题（例如：圆→方→三角 或 方→三角→星）。形状按选定的三形循环。
- 组合规则：同时满足“颜色（随机两色）规律”和“形状（随机三形）循环”。

分布要求（权重总和=100，供你随机采样时参考）：
- 颜色交替（在所选两色之间交替）：30
- 形状循环（在所选三形之间循环）：30
- 颜色成对重复（在所选两色上成对重复）：15
- 组合规则（两色交替 + 三形循环）：15
- 变化映射（受限变换集）：10
若采样到组合/映射但无法保证唯一正确答案，请回退到权重次高的可行规则。

其他生成要求：
- 选项顺序与正确答案位置（A/B/C）需随机化。
- 候选集合为形状("circle"|"square"|"triangle"|"rectangle"|"star")与颜色("red"|"blue"|"green"|"yellow")，但本题实际只使用“随机抽取的两种颜色”和“三种形状”；请确保题干和选项仅出现这两个子集中的元素。
- 序列的前三项应清晰体现所选规律，使第4项唯一确定。

请严格以 JSON 返回，字段为：
{
  "title": string,
  "sequence": [
    { "shape": "circle"|"square"|"triangle"|"rectangle"|"star", "color": "red"|"blue"|"green"|"yellow", "label": string },
    { "shape": "circle"|"square"|"triangle"|"rectangle"|"star", "color": "red"|"blue"|"green"|"yellow", "label": string },
    { "shape": "circle"|"square"|"triangle"|"rectangle"|"star", "color": "red"|"blue"|"green"|"yellow", "label": string },
    { "label": "4. ?", "question": true }
  ],
  "options": [
    { "key": "A"|"B"|"C", "shape": "circle"|"square"|"triangle"|"rectangle"|"star", "color": "red"|"blue"|"green"|"yellow", "text": string },
    { "key": "A"|"B"|"C", "shape": "circle"|"square"|"triangle"|"rectangle"|"star", "color": "red"|"blue"|"green"|"yellow", "text": string },
    { "key": "A"|"B"|"C", "shape": "circle"|"square"|"triangle"|"rectangle"|"star", "color": "red"|"blue"|"green"|"yellow", "text": string }
  ],
  "correct": "A"|"B"|"C",
  "explanation": string
}

附加约束：
- 题目用中文且适龄友好。
- 选项不可重复，且只有唯一正确答案。
- 解释需清楚描述所用规律并与序列一致，并在解释中明确本题选用的两种颜色与三种形状。
- 仅输出 JSON，不要额外文字。
- 随机种子（用于增加不可预测性）：${seed}`;

        if (config.provider === 'openai' && config.apiKey) {
          q = await callChatJSON(prompt);
          questionSource = 'ai';
        } else {
          q = localFallbackQuestion();
          questionSource = 'local';
        }

        if (!q || !q.options?.length || !q.sequence?.length || !q.correct) {
          q = localFallbackQuestion();
          questionSource = 'local';
        }
        setQuestion(q);
        console.log(`[PatternGame1] 题目来源: ${questionSource === 'ai' ? 'AI生成' : '本地题目'}`);
        setPrompt(`${childName}，请观察下面的图形序列，找出规律并选择第四个图形应该是什么？`);
        startTimeRef.current = Date.now();
      } catch (e) {
        console.error('生成题目失败，使用本地兜底：', e);
        const q = localFallbackQuestion();
        setQuestion(q);
        console.warn('[PatternGame1] 题目来源: 本地题目（生成失败兜底）');
        setError('生成题目失败，已使用本地题目');
        setPrompt(`${childName}，请观察下面的图形序列，找出规律并选择第四个图形应该是什么？`);
        startTimeRef.current = Date.now();
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

  return (
    <div className="pattern-game">
      <h3 className="game-title">{question?.title || '题目一：图形序列模式识别'}</h3>

      {loading && <p className="pattern-feedback">正在生成题目…</p>}
      {error && <p className="pattern-feedback incorrect">{error}</p>}

      <div className="shape-sequence">
        {question && question.sequence.map((step, idx) => (
          <div key={idx} className={`shape-item ${step.question ? 'question-item' : ''}`}>
            {step.question ? (
              <div className="shape question-mark">?</div>
            ) : (
              <div className={`shape ${step.shape} ${step.color}`}></div>
            )}
            <span className="shape-label">{step.label}</span>
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
              <div className={`shape ${opt.shape} ${opt.color}`}></div>
              <span className="option-label">{opt.text}</span>
            </button>
          ))}
        </div>
      )}

      {result === 'correct' && (
        <p className="pattern-feedback correct">
          太棒了！{question?.explanation || '你找到了规律：颜色红蓝交替，形状按圆形、正方形、三角形循环！'}
        </p>
      )}
      {result === 'incorrect' && <p className="pattern-feedback incorrect">没关系，让我们继续探索吧！</p>}
    </div>
  );
};

export default PatternGame1;