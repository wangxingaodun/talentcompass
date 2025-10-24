import React from 'react';
import type { GameStageProps, GameStageResult } from './types';

// 读取现有的 API 配置（优先 env，再读 localStorage）
function getAPIConfig() {
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_api_key');
  const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY || localStorage.getItem('anthropic_api_key');
  const openaiBase = import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const anthropicBase = import.meta.env.VITE_ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1';

  if (openaiKey) {
    return { provider: 'openai' as const, apiKey: openaiKey, baseUrl: openaiBase };
  }
  if (anthropicKey) {
    return { provider: 'anthropic' as const, apiKey: anthropicKey, baseUrl: anthropicBase };
  }
  return { provider: 'openai' as const, apiKey: '', baseUrl: 'https://api.openxs.top' };
}

// 生成“奇异组合”题目（带描述词，示例：把`云+鞋`组合起来，会发生什么有趣的事情呢？）
async function generateImaginationPrompt(childName?: string): Promise<string> {
  const cfg = getAPIConfig();
  // 强制使用提供的配置
  cfg.provider = 'openai';
  cfg.apiKey = 'sk-vrgalFUAhsHRsYV4j3PdnDWEc0LK7MGaUckl7vKrhGmfnyvW';
  cfg.baseUrl = 'https://api.openxs.top';

  // 构造系统提示词和用户提示词
  const system = '你是一位面向儿童的创意题目出题专家，生成简短、安全、有趣的中文题目。';
  const user = `${childName ? childName + '，' : ''}请生成一个“奇异组合”的问题：要求格式包含反引号组合，例如：把\`云+鞋\`组合起来，会发生什么有趣的事情呢？题目需至少包含一个描述词（如“有趣/奇妙/特别/神奇”等），贴近生活、积极向上，不涉及敏感内容，只输出题目文本，长度不超过30字。`;

  try {
    if (cfg.provider === 'openai') {
      const normalized = cfg.baseUrl.replace(/\/+$/, '');
      const endpoint = normalized.endsWith('/v1') ? `${normalized}/chat/completions` : `${normalized}/v1/chat/completions`;

      const body = {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        temperature: 0.8,
        max_tokens: 64
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {})
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`OpenAI 响应错误 ${res.status}: ${txt}`);
      }
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content?.trim();
      if (content) return content.replace(/^"|"$/g, '');
      throw new Error('未获取到题目内容');
    }

    // 未命中支持的 provider
    throw new Error('未配置有效的模型与密钥');
  } catch (err) {
    console.error('生成题目失败：', err);
    return '题目生成失败，请检查API配置后重试';
  }
}

const ImaginationGame: React.FC<GameStageProps> = ({ childName, setPrompt, onComplete }) => {
  const [input, setInput] = React.useState('');
  const [question, setQuestion] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const startRef = React.useRef<number>(Date.now());

  // 初次进入自动生成题目
  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    generateImaginationPrompt(childName)
      .then((q) => {
        if (!mounted) return;
        setQuestion(q);
        setPrompt(q);
        startRef.current = Date.now();
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = () => {
    const text = input.trim();
    if (!text) return;
    const charCount = text.length;
    const uniqueCharCount = new Set(text.split('')).size;
    const noveltyScore = Math.min(10, (uniqueCharCount / Math.max(1, charCount)) * 10);
    const consistencyScore = Math.min(10, Math.max(3, text.includes('因为') ? 8 : 6));
    const latencyMs = Date.now() - startRef.current;
    const result: GameStageResult = {
      dimension: 'imagination',
      metrics: { charCount, noveltyScore, consistencyScore, latencyMs }
    };
    onComplete(result);
  };

  return (
    <div className="storytelling-game">
      <p className="story-prompt" style={{ minHeight: 24 }}>
        {question || (loading ? '题目生成中…' : '题目生成失败，请检查API配置')}
      </p>
      <input
        type="text"
        className="story-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="试着描述一个有趣的答案…"
      />
      <button className="submit-button" onClick={submit} disabled={!input.trim()}>
        提交
      </button>
    </div>
  );
};

export default ImaginationGame;