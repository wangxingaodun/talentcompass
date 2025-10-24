import type { StoryAssessment } from './games/types';

interface APIConfig {
  provider: 'openai' | 'anthropic' | 'local';
  apiKey?: string;
  baseUrl?: string;
}

function getAPIConfig(): APIConfig {
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_api_key');
  const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY || localStorage.getItem('anthropic_api_key');
  if (openaiKey) {
    return { provider: 'openai', apiKey: openaiKey, baseUrl: 'https://api.openai.com/v1' };
  } else if (anthropicKey) {
    return { provider: 'anthropic', apiKey: anthropicKey, baseUrl: 'https://api.anthropic.com/v1' };
  } else {
    return { provider: 'local' };
  }
}

export async function evaluateStoryTextWithLLM(answerText: string, childAge?: string): Promise<StoryAssessment> {
  const prompt = `你是一名儿童故事表达评估专家。以下是${childAge || '儿童'}的故事文本：\n\n${answerText}\n\n请根据以下维度评分：\n- 词汇多样性（vocabulary）0-100\n- 句子长度合理性（sentenceLength）0-100\n- 创意度（creativity）0-100\n- 信息清晰度（clarity）0-100\n- 完整度（completeness）0-100\n- 连贯性（coherence）0-100\n并计算总体score（0-100）与等级level（excellent/good/needs_improvement）。\n严格仅输出JSON：\n{\n  "score": 85,\n  "level": "excellent",\n  "subscores": { "vocabulary": 80, "sentenceLength": 78, "creativity": 88, "clarity": 82, "completeness": 80, "coherence": 84 },\n  "reasons": ["评分要点1","评分要点2"],\n  "suggestions": ["提升建议1","提升建议2"],\n  "confidence": 0.9\n}\n不得包含额外文字或代码块。`;

  const config = getAPIConfig();
  try {
    // 与现有实现保持一致，优先使用 OpenAI 兼容代理
    (config as any).provider = 'openai';
    (config as any).apiKey = 'sk-vrgalFUAhsHRsYV4j3PdnDWEc0LK7MGaUckl7vKrhGmfnyvW';
    (config as any).baseUrl = 'https://api.openxs.top';

    if ((config as any).provider === 'openai' && config.apiKey) {
      const normalizedBaseUrl = (config.baseUrl || '').replace(/\/+$/, '');
      const endpoint = normalizedBaseUrl.endsWith('/v1') 
        ? `${normalizedBaseUrl}/chat/completions` 
        : `${normalizedBaseUrl}/v1/chat/completions`;

      const body = {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: '你是一名专业的儿童故事表达评估专家。仅输出严格的JSON，禁止额外文字、代码块或解释。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
        max_tokens: 2000
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      console.log("故事表达评估专家输出结果:", response.ok)

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API错误 ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      const normalized = typeof content === 'string' ? content.trim() : JSON.stringify(content || {});
      return tryParseAssessment(normalized);
    }
  } catch (err) {
    console.warn('故事评估API调用失败，回退到启发式:', err);
  }
  return heuristicStoryEvaluation(answerText);
}

export function heuristicStoryEvaluation(answerText: string): StoryAssessment {
  const text = (answerText || '').trim();
  const length = text.length;
  const sentences = segmentSentences(text);
  const words = extractWords(text);
  const uniqueWords = new Set(words);

  // 词汇多样性：独特词/总词，结合汉字独特度
  const chars = text.replace(/[^\p{Script=Han}A-Za-z0-9]/ug, '');
  const uniqueChars = new Set(chars.split(''));
  const vocabRatio = words.length > 0 ? uniqueWords.size / words.length : 0;
  const charRatio = chars.length > 0 ? uniqueChars.size / chars.length : 0;
  const vocabularyScore = clamp100((vocabRatio * 0.6 + charRatio * 0.4) * 100);

  // 句子长度合理性：平均句长在 12-28 较优，过短/过长降分
  const avgLen = sentences.length ? sentences.reduce((a, s) => a + s.length, 0) / sentences.length : length;
  let sentenceLenScore = 100;
  if (avgLen < 10) sentenceLenScore -= (10 - avgLen) * 6;
  if (avgLen > 30) sentenceLenScore -= (avgLen - 30) * 2.5;
  sentenceLenScore = clamp100(sentenceLenScore);

  // 创意度：想象词、比喻词、情感词
  const creativeKeywords = ['魔法','精灵','龙','宇宙','星空','梦想','奇妙','冒险','神秘','远方','闪耀','彩虹','传说','城堡','飞翔','童话','勇士','怪兽','海洋','森林','机器人','外星','想象','如果','仿佛','好像','像'];
  const creativityHits = keywordHits(text, creativeKeywords);
  const creativityScore = clamp100(50 + Math.min(50, creativityHits * 8));

  // 清晰度：标点、连词、重复率
  const punctRatio = text ? (text.match(/[，。！？；,.!?]/g)?.length || 0) / Math.max(1, sentences.length) : 0;
  const connectors = ['因为','所以','因此','于是','然后','接着','最后','首先','不过','但是','然而','如果','那么','就','则'];
  const connectorHits = keywordHits(text, connectors);
  const repeatPenalty = calcRepeatPenalty(text);
  const clarityScore = clamp100(60 + Math.min(25, punctRatio * 20) + Math.min(25, connectorHits * 5) - repeatPenalty);

  // 完整度：是否出现“开端-发展-结尾”标志词
  const beginWords = ['从前','有一天','起初','首先'];
  const developWords = ['然后','接着','于是','后来','在这时'];
  const endWords = ['最后','终于','结果','因此','于是'];
  const completenessHits = (hasAny(text, beginWords) ? 1 : 0) + (hasAny(text, developWords) ? 1 : 0) + (hasAny(text, endWords) ? 1 : 0);
  const completenessScore = clamp100(50 + completenessHits * 20 + Math.min(30, sentences.length * 5));

  // 连贯性：成对结构与逻辑连词的覆盖
  const pairs = [['因为','所以'],['由于','因此'],['虽然','但是'],['尽管','但是'],['如果','那么'],['只要','就'],['除非','否则'],['无论','都']];
  const pairHits = pairs.reduce((sum, [a,b]) => sum + (text.includes(a) && text.includes(b) ? 1 : 0), 0);
  const coherenceScore = clamp100(55 + Math.min(25, connectorHits * 5) + pairHits * 8);

  const subscores = {
    vocabulary: Math.round(vocabularyScore),
    sentenceLength: Math.round(sentenceLenScore),
    creativity: Math.round(creativityScore),
    clarity: Math.round(clarityScore),
    completeness: Math.round(completenessScore),
    coherence: Math.round(coherenceScore)
  };

  const weighted = subscores.vocabulary * 0.2 + subscores.sentenceLength * 0.15 + subscores.creativity * 0.2 + subscores.clarity * 0.15 + subscores.completeness * 0.15 + subscores.coherence * 0.15;
  const score = Math.round(clamp100(weighted));
  const level: StoryAssessment['level'] = score >= 85 ? 'excellent' : score >= 60 ? 'good' : 'needs_improvement';

  const reasons: string[] = [];
  if (subscores.vocabulary >= 75) reasons.push('词汇较为丰富，多样性良好');
  if (subscores.creativity >= 75) reasons.push('故事富有想象力，具有新颖性');
  if (subscores.clarity >= 70) reasons.push('表达较清晰，信息传递顺畅');
  if (subscores.coherence >= 70) reasons.push('结构连贯，逻辑过渡自然');
  if (subscores.completeness >= 70) reasons.push('故事结构完整，起承转合明显');

  const suggestions: string[] = [];
  if (subscores.vocabulary < 70) suggestions.push('尝试使用更多具体的名词和动词，避免重复');
  if (subscores.sentenceLength < 70) suggestions.push('适当合并短句或拆分长句，让节奏更自然');
  if (subscores.creativity < 70) suggestions.push('加入富有想象力的元素或比喻，增强新颖度');
  if (subscores.clarity < 70) suggestions.push('使用标点和连接词，让表达更清晰');
  if (subscores.completeness < 70) suggestions.push('确保有“开头-发展-结尾”的完整结构');
  if (subscores.coherence < 70) suggestions.push('使用“因为/所以”“如果/那么”等结构增强逻辑');

  return {
    score,
    level,
    reasons,
    suggestions,
    confidence: 0.7,
    subscores,
    rawContent: text
  };
}

function tryParseAssessment(raw: string): StoryAssessment {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const payload = jsonMatch ? jsonMatch[0] : raw;
  const obj = JSON.parse(payload);
  return {
    score: obj.score ?? 75,
    level: obj.level ?? 'good',
    reasons: Array.isArray(obj.reasons) ? obj.reasons : [],
    suggestions: Array.isArray(obj.suggestions) ? obj.suggestions : [],
    confidence: obj.confidence ?? 0.6,
    subscores: obj.subscores ?? undefined,
    rawContent: raw
  };
}

function segmentSentences(text: string): string[] {
  return (text || '')
    .split(/[。！？!?；;]\s*/)
    .map(s => s.trim())
    .filter(Boolean);
}

function extractWords(text: string): string[] {
  const chineseWords = (text.match(/[\p{Script=Han}]{1}/ug) || []).map(x => x);
  const asciiWords = (text.match(/[A-Za-z0-9]+/g) || []);
  return [...chineseWords, ...asciiWords];
}

function keywordHits(text: string, dict: string[]): number {
  const lower = text.toLowerCase();
  return dict.reduce((sum, w) => sum + (lower.includes(w.toLowerCase()) ? 1 : 0), 0);
}

function hasAny(text: string, arr: string[]): boolean {
  const lower = text.toLowerCase();
  return arr.some(w => lower.includes(w.toLowerCase()));
}

function calcRepeatPenalty(text: string): number {
  const consecutive = (text.match(/(.)\1{2,}/g) || []).length; // 连续3次相同字符
  const overallRepeat = (() => {
    const chars = text.replace(/\s/g, '').split('');
    const freq: Record<string, number> = {};
    chars.forEach(c => freq[c] = (freq[c] || 0) + 1);
    const maxFreq = Math.max(0, ...Object.values(freq));
    const ratio = maxFreq / Math.max(1, chars.length);
    return ratio > 0.2 ? (ratio - 0.2) * 50 : 0; // 重复率降分
  })();
  return Math.min(20, consecutive * 5 + overallRepeat);
}

function clamp100(n: number): number {
  return Math.max(0, Math.min(100, n));
}