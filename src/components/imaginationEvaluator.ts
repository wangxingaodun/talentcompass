import type { DrawingMetrics, ImaginationAssessment } from './games/types';

// 想象力评估的量表维度
interface EvaluationRubric {
  originality: number; // 原创性 1-5
  diversity: number; // 多样性 1-5
  narrative: number; // 叙事性 1-5
  composition: number; // 构图复杂度 1-5
  color: number; // 色彩表达 1-5
  engagement: number; // 投入度 1-5
}

// API配置接口
interface APIConfig {
  provider: 'openai' | 'anthropic' | 'local';
  apiKey?: string;
  baseUrl?: string;
}

// 获取API配置
function getAPIConfig(): APIConfig {
  // 优先使用环境变量，然后是localStorage，最后回退到本地
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_api_key');
  const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY || localStorage.getItem('anthropic_api_key');
  
  if (openaiKey) {
    return {
      provider: 'openai',
      apiKey: openaiKey,
      baseUrl: 'https://api.openai.com/v1'
    };
  } else if (anthropicKey) {
    return {
      provider: 'anthropic',
      apiKey: anthropicKey,
      baseUrl: 'https://api.anthropic.com/v1'
    };
  } else {
    return { provider: 'local' };
  }
}

// OpenAI GPT-4 Vision API调用
async function callOpenAIVisionAPI(
  imageDataUrl: string,
  prompt: string,
  apiKey: string,
  baseUrl: string
): Promise<any> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o', // 使用最新的GPT-4o模型，支持视觉
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: imageDataUrl,
                detail: 'low' // 使用低分辨率以降低成本
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.2,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API错误 ${response.status}: ${errorData.error?.message || '未知错误'}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

// Anthropic Claude 3 Vision API调用
async function callAnthropicVisionAPI(
  imageDataUrl: string,
  prompt: string,
  apiKey: string,
  baseUrl: string
): Promise<any> {
  // 提取base64数据和媒体类型
  const [mediaInfo, base64Data] = imageDataUrl.split(',');
  const mediaType = mediaInfo.match(/data:([^;]+)/)?.[1] || 'image/png';

  const response = await fetch(`${baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229', // 使用Claude 3 Sonnet
      max_tokens: 1000,
      temperature: 0.2,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data
              }
            },
            {
              type: 'text',
              text: prompt + '\n\n请确保返回有效的JSON格式。'
            }
          ]
        }
      ]
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Anthropic API错误 ${response.status}: ${errorData.error?.message || '未知错误'}`);
  }

  const data = await response.json();
  const content = data.content[0].text;
  
  // 尝试提取JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  } else {
    throw new Error('无法从Claude响应中提取JSON');
  }
}

// 大模型API调用函数
export async function evaluateImaginationWithLLM(
  imageDataUrl: string,
  metrics: DrawingMetrics,
  childAge?: string
): Promise<ImaginationAssessment> {
  const prompt = `你是一名专业的儿童创意评估专家。请根据以下量表对这幅${childAge || '儿童'}绘画作品进行评估：

评估维度（每项1-5分）：
1. 原创性与象征性：是否有独特元素、隐喻或自创角色
2. 元素多样性：颜色、形状、工具的丰富程度
3. 叙事性与主题：是否能看出故事或主题
4. 构图复杂度：布局是否丰富，有层次感
5. 色彩与情感：色彩搭配是否有意图，能否传达情绪
6. 投入度：基于绘画时长和笔触数判断专注程度

绘画元数据：
- 绘画时长：${Math.round(metrics.totalMs / 1000)}秒
- 使用颜色：${metrics.usedColors.join(', ')} (共${metrics.colorsUsed}种)
- 笔画数：${metrics.strokeCount}
- 形状统计：铅笔${metrics.shapeBreakdown.pencil}次，圆形${metrics.shapeBreakdown.circle}个，方形${metrics.shapeBreakdown.rect}个
- 工具多样性：${metrics.toolVariety}种工具

请返回JSON格式：
{
  "score": 0-100的总分,
  "level": "excellent" | "good" | "needs_improvement",
  "reasons": ["评分要点1", "评分要点2", "评分要点3"],
  "suggestions": ["提升建议1", "提升建议2"],
  "confidence": 0-1的置信度
}

要求：
- 评分要考虑儿童年龄特点，鼓励创意表达
- 每个维度给出具体理由
- 建议要具体可执行
- 保持评估的一致性和公平性`;

  const config = getAPIConfig();

  try {
    let result: any;

    if (config.provider === 'openai' && config.apiKey) {
      console.log('使用OpenAI GPT-4 Vision API进行评估...');
      result = await callOpenAIVisionAPI(imageDataUrl, prompt, config.apiKey, config.baseUrl!);
    } else if (config.provider === 'anthropic' && config.apiKey) {
      console.log('使用Anthropic Claude 3 Vision API进行评估...');
      result = await callAnthropicVisionAPI(imageDataUrl, prompt, config.apiKey, config.baseUrl!);
    } else {
      // 回退到本地mock API
      console.log('使用本地mock API进行评估...');
      const response = await fetch('/api/imagination-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          image: imageDataUrl,
          metadata: metrics,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        throw new Error(`本地API调用失败: ${response.status}`);
      }

      result = await response.json();
    }
    
    // 验证返回结果的格式
    if (typeof result.score !== 'number' || !result.level || !Array.isArray(result.reasons)) {
      throw new Error('API返回格式不正确');
    }

    return {
      score: Math.max(0, Math.min(100, result.score)),
      level: result.level,
      reasons: result.reasons || [],
      suggestions: result.suggestions || [],
      confidence: Math.max(0, Math.min(1, result.confidence || 0.8)),
    };
  } catch (error) {
    console.warn('多模态API评估失败，使用本地兜底算法:', error);
    return heuristicImaginationEvaluation(metrics);
  }
}

// 本地兜底评分算法
export function heuristicImaginationEvaluation(metrics: DrawingMetrics): ImaginationAssessment {
  const rubric: EvaluationRubric = {
    originality: 3, // 基础分
    diversity: 0,
    narrative: 0,
    composition: 0,
    color: 0,
    engagement: 0,
  };

  // 多样性评分：基于颜色和工具种类
  rubric.diversity = Math.min(5, 1 + metrics.colorsUsed * 0.8 + metrics.toolVariety * 0.6);

  // 色彩表达：颜色数量和搭配
  if (metrics.colorsUsed >= 3) {
    rubric.color = 4;
  } else if (metrics.colorsUsed >= 2) {
    rubric.color = 3;
  } else {
    rubric.color = 2;
  }

  // 构图复杂度：基于形状数量和分布
  const totalShapes = metrics.shapeBreakdown.pencil + metrics.shapeBreakdown.circle + metrics.shapeBreakdown.rect;
  if (totalShapes >= 15) {
    rubric.composition = 4;
  } else if (totalShapes >= 8) {
    rubric.composition = 3;
  } else if (totalShapes >= 3) {
    rubric.composition = 2;
  } else {
    rubric.composition = 1;
  }

  // 投入度：基于绘画时长和笔画密度
  const drawingTimeSeconds = metrics.totalMs / 1000;
  const strokeDensity = metrics.strokeCount / Math.max(1, drawingTimeSeconds);
  
  if (drawingTimeSeconds >= 45 && strokeDensity >= 0.5) {
    rubric.engagement = 5;
  } else if (drawingTimeSeconds >= 30 && strokeDensity >= 0.3) {
    rubric.engagement = 4;
  } else if (drawingTimeSeconds >= 20) {
    rubric.engagement = 3;
  } else {
    rubric.engagement = 2;
  }

  // 叙事性：基于工具多样性和形状组合
  if (metrics.toolVariety >= 3 && totalShapes >= 10) {
    rubric.narrative = 4;
  } else if (metrics.toolVariety >= 2 && totalShapes >= 5) {
    rubric.narrative = 3;
  } else if (totalShapes >= 3) {
    rubric.narrative = 2;
  } else {
    rubric.narrative = 1;
  }

  // 计算总分 (0-100)
  const totalScore = Object.values(rubric).reduce((sum, score) => sum + score, 0);
  const normalizedScore = Math.round((totalScore / 30) * 100); // 30是满分(6维度×5分)

  // 确定等级
  let level: 'excellent' | 'good' | 'needs_improvement';
  if (normalizedScore >= 85) {
    level = 'excellent';
  } else if (normalizedScore >= 60) {
    level = 'good';
  } else {
    level = 'needs_improvement';
  }

  // 生成评分要点
  const reasons: string[] = [];
  if (rubric.diversity >= 4) reasons.push('色彩和工具使用丰富多样');
  if (rubric.engagement >= 4) reasons.push('绘画投入度很高，专注认真');
  if (rubric.composition >= 3) reasons.push('画面构图有一定复杂度');
  if (rubric.color >= 3) reasons.push('色彩搭配有想法');
  if (rubric.narrative >= 3) reasons.push('作品有一定的故事性');

  // 生成提升建议
  const suggestions: string[] = [];
  if (rubric.diversity < 3) suggestions.push('尝试使用更多颜色和绘画工具');
  if (rubric.composition < 3) suggestions.push('可以画更多元素，让画面更丰富');
  if (rubric.narrative < 3) suggestions.push('试着画一个完整的故事或场景');
  if (rubric.color < 3) suggestions.push('大胆尝试不同颜色的组合');

  return {
    score: normalizedScore,
    level,
    reasons: reasons.length > 0 ? reasons : ['展现了基础的创意表达能力'],
    suggestions: suggestions.length > 0 ? suggestions : ['继续保持创作热情，多多练习'],
    confidence: 0.7, // 本地算法置信度较低
  };
}

// 辅助函数：将评估结果转换为旧格式的指标
export function convertAssessmentToMetrics(assessment: ImaginationAssessment): {
  noveltyScore: number;
  consistencyScore: number;
  latencyMs: number;
} {
  return {
    noveltyScore: assessment.score / 10, // 转换为0-10分
    consistencyScore: assessment.confidence * 10, // 置信度转换为一致性分数
    latencyMs: 0, // 评估不涉及反应时间
  };
}