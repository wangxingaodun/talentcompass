import React from 'react';
import type { GameStageProps, GameStageResult } from './types';
import '../../styles/pattern.css';

// 题目一：图形序列模式识别
// 红色圆形 -> 蓝色正方形 -> 红色三角形 -> ?
// 规律：颜色红蓝交替，形状按圆形、正方形、三角形顺序循环
// 正确答案：A. 蓝色圆形

// 使用大模型生成题目所需的配置与调用（参考 imaginationEvaluator.ts 的配置方式）
interface APIConfig {
  provider: 'openai' | 'anthropic' | 'local';
  apiKey?: string;
  baseUrl?: string;
}

function getAPIConfig(): APIConfig {
  // 直接使用与 imaginationEvaluator.ts 一致的配置，不从环境或 localStorage 读取
  return {
    provider: 'openai',
    apiKey: 'sk-vrgalFUAhsHRsYV4j3PdnDWEc0LK7MGaUckl7vKrhGmfnyvW',
    baseUrl: 'https://api.openxs.top',
  };
}

// 期望的题目 JSON 结构
interface PatternOption {
  key: string; // e.g. 'A'
  shape: 'circle' | 'square' | 'triangle';
  color: 'red' | 'blue';
  text: string; // 展示文案，如 "A. 蓝色圆形"
}

interface PatternStep {
  shape?: 'circle' | 'square' | 'triangle';
  color?: 'red' | 'blue';
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

async function callOpenAIChatJSON(prompt: string, apiKey: string, baseUrl: string): Promise<PatternQuestion> {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const endpoint = normalizedBaseUrl.endsWith('/v1')
    ? `${normalizedBaseUrl}/chat/completions`
    : `${normalizedBaseUrl}/v1/chat/completions`;

  console.log('PatternGame1 调用OpenAI接口:', { endpoint, hasApiKey: !!apiKey });

  const body = {
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt }
        ]
      }
    ],
    max_tokens: 800,
    temperature: 0.2,
    response_format: { type: 'json_object' }
  };

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error('OpenAI 请求失败:', { status: resp.status, text });
    throw new Error(`OpenAI API错误 ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content ?? '';
  try {
    return JSON.parse(content);
  } catch {
    const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleaned);
  }
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
        const seed = Math.floor(Math.random() * 100000).toString();
        const prompt = `你是一名儿童逻辑训练专家。请生成一个“随机”的图形序列模式识别题目。

规则集合（可任选其一或在明确可行的情况下组合，但需保证唯一正确答案）：
- 颜色红蓝交替
- 形状按三形随机循环（在“圆形/正方形/三角形”中随机确定起点与顺序，例如：圆→方→三角 或 方→三角→圆）
- 颜色成对重复（如：红红蓝蓝）
- 前两项→第三项的变化映射（仅允许：颜色翻转、形状沿循环前进一步）
- 组合规则：同时满足“颜色红蓝交替”和“形状循环”

分布要求（权重总和=100，供你随机采样时参考）：
- 颜色红蓝交替：30
- 形状循环：30
- 颜色成对重复：15
- 组合规则（颜色交替+形状循环）：15
- 变化映射（受限变换集）：10
若采样到组合/映射但无法保证唯一正确答案，请回退到权重次高的可行规则。

其他生成要求：
- 选项顺序与正确答案位置（A/B/C）需随机化。
- 限定元素仅为形状("circle"|"square"|"triangle")与颜色("red"|"blue")。
- 序列的前三项应清晰体现所选规律，使第4项唯一确定。

请严格以 JSON 返回，字段为：
{
  "title": string,
  "sequence": [
    { "shape": "circle"|"square"|"triangle", "color": "red"|"blue", "label": string },
    { "shape": "circle"|"square"|"triangle", "color": "red"|"blue", "label": string },
    { "shape": "circle"|"square"|"triangle", "color": "red"|"blue", "label": string },
    { "label": "4. ?", "question": true }
  ],
  "options": [
    { "key": "A"|"B"|"C", "shape": "circle"|"square"|"triangle", "color": "red"|"blue", "text": string },
    { "key": "A"|"B"|"C", "shape": "circle"|"square"|"triangle", "color": "red"|"blue", "text": string },
    { "key": "A"|"B"|"C", "shape": "circle"|"square"|"triangle", "color": "red"|"blue", "text": string }
  ],
  "correct": "A"|"B"|"C",
  "explanation": string
}

附加约束：
- 题目用中文且适龄友好。
- 选项不可重复，且只有唯一正确答案。
- 解释需清楚描述所用规律并与序列一致。
- 仅输出 JSON，不要额外文字。
- 随机种子（用于增加不可预测性）：${seed}`;

        if (config.provider === 'openai' && config.apiKey) {
          q = await callOpenAIChatJSON(prompt, config.apiKey, config.baseUrl!);
        } else {
          q = localFallbackQuestion();
        }

        if (!q || !q.options?.length || !q.sequence?.length || !q.correct) {
          q = localFallbackQuestion();
        }
        setQuestion(q);
        setPrompt(`${childName}，请观察下面的图形序列，找出规律并选择第四个图形应该是什么？`);
        startTimeRef.current = Date.now();
      } catch (e) {
        console.error('生成题目失败，使用本地兜底：', e);
        const q = localFallbackQuestion();
        setQuestion(q);
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