import React, { useState, useEffect } from 'react';

interface Scores {
  expression: number;
  logic: number;
  creativity: number;
  imagination: number;
  reaction: number;
}

interface LearningResource {
  name: string;
  url: string;
  type: 'course' | 'game' | 'book' | 'activity' | 'tool' | 'video';
  targetDimensions: string[];
  description: string;
  ageGroup: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface LearningResourceAgentProps {
  scores: Scores;
  childName: string;
  onResourcesGenerated: (resources: { name: string; url: string }[]) => void;
}

// API配置接口
interface APIConfig {
  provider: 'openai';
  apiKey: string;
  baseUrl: string;
}

// 获取API配置 - 直接使用硬编码的OpenAI配置
function getAPIConfig(): APIConfig {
  return {
    provider: 'openai',
    apiKey: 'sk-vrgalFUAhsHRsYV4j3PdnDWEc0LK7MGaUckl7vKrhGmfnyvW',
    baseUrl: 'https://api.openxs.top'
  };
}

// OpenAI GPT-4o API调用
async function callOpenAIAPI(
  prompt: string,
  apiKey: string,
  baseUrl: string
): Promise<any> {
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  const requestBody = {
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: '你是一名专业的儿童教育专家和学习资源推荐专家。请根据儿童的能力评估结果，推荐最适合的学习资源。'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 2000,
    temperature: 0.3,
    response_format: { type: 'json_object' }
  };

  console.log("API请求URL:", `${normalizedBaseUrl}/v1/chat/completions`);
  console.log("API请求体:", JSON.stringify(requestBody, null, 2));

  const response = await fetch(`${normalizedBaseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  console.log("API响应状态:", response.status);
  console.log("API响应头:", Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API错误响应:", errorText);
    throw new Error(`OpenAI API错误 ${response.status}: ${errorText}`);
  }

  const responseText = await response.text();
  console.log("API原始响应:", responseText);

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (parseError) {
    console.error('响应JSON解析失败:', parseError);
    console.error('响应内容:', responseText.substring(0, 500));
    throw new Error('API返回的不是有效的JSON格式');
  }

  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    console.error('API响应格式异常:', data);
    throw new Error('API响应格式不正确');
  }

  const content = data.choices[0].message.content;
  console.log('AI返回内容:', content);

  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('AI内容JSON解析错误:', error);
    console.error('AI返回的内容:', content);
    throw new Error('AI返回的内容不是有效的JSON格式');
  }
}

const LearningResourceAgent: React.FC<LearningResourceAgentProps> = ({
  scores,
  childName,
  onResourcesGenerated
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 分析用户强项和弱项
  const analyzeStrengthsAndWeaknesses = (scores: Scores) => {
    const dimensions = Object.entries(scores);
    const sorted = dimensions.sort((a, b) => b[1] - a[1]);
    
    const strengths = sorted.slice(0, 2).map(([dim]) => dim);
    const weaknesses = sorted.slice(-2).map(([dim]) => dim);
    
    return { strengths, weaknesses };
  };

  // 生成推荐提示词
  const generatePrompt = (scores: Scores, strengths: string[], weaknesses: string[]) => {
    const dimensionNames = {
      expression: '语言表达',
      logic: '逻辑思维',
      creativity: '创造力',
      imagination: '想象力',
      reaction: '反应能力'
    };

    return `请为7-8岁的儿童${childName}推荐学习资源。

能力评估结果（满分10分）：
- 语言表达: ${scores.expression.toFixed(1)}分
- 逻辑思维: ${scores.logic.toFixed(1)}分  
- 创造力: ${scores.creativity.toFixed(1)}分
- 想象力: ${scores.imagination.toFixed(1)}分
- 反应能力: ${scores.reaction.toFixed(1)}分

优势能力: ${strengths.map(s => dimensionNames[s as keyof typeof dimensionNames]).join('、')}
待提升能力: ${weaknesses.map(w => dimensionNames[w as keyof typeof dimensionNames]).join('、')}

请推荐8-10个学习资源，包括：
1. 巩固优势能力的资源（3-4个）
2. 提升弱项能力的资源（3-4个）  
3. 综合发展的资源（2-3个）

资源类型包括：在线课程、教育游戏、图书、实践活动、学习工具、视频等。

请严格按照以下JSON格式返回：
{
  "resources": [
    {
      "name": "资源名称",
      "url": "https://example.com",
      "type": "course|game|book|activity|tool|video",
      "targetDimensions": ["expression", "logic"],
      "description": "详细描述这个资源如何可以帮助孩子发展相关能力",
      "ageGroup": "4-6岁|7-8岁|9-10岁",
      "difficulty": "beginner|intermediate|advanced"
    }
  ],
  "summary": "推荐理由和使用建议的总结"
}

要求：
- 所有URL必须是真实可访问的中国大陆地区的教育资源网站
- 资源要适合7-8岁儿童的认知水平
- 优先推荐免费或低成本的优质资源
- 包含中文和英文资源
- 考虑家长陪伴和独立学习的平衡`;
  };

  // 本地兜底推荐算法
  const generateLocalRecommendations = (scores: Scores, strengths: string[], weaknesses: string[]): LearningResource[] => {
    const baseResources: LearningResource[] = [
      // 语言表达类
      {
        name: "小猪佩奇故事屋",
        url: "https://www.iqiyi.com/lib/m_200067014.html",
        type: "video",
        targetDimensions: ["expression"],
        description: "通过观看和复述故事提升语言表达能力",
        ageGroup: "7-8岁",
        difficulty: "beginner"
      },
      {
        name: "儿童口才训练营",
        url: "https://www.xueersi.com/",
        type: "course",
        targetDimensions: ["expression"],
        description: "系统性的口语表达训练课程",
        ageGroup: "7-8岁",
        difficulty: "intermediate"
      },
      // 逻辑思维类
      {
        name: "七巧板智力游戏",
        url: "https://www.4399.com/flash/146_1.htm",
        type: "game",
        targetDimensions: ["logic"],
        description: "通过拼图游戏锻炼空间逻辑思维",
        ageGroup: "7-8岁",
        difficulty: "beginner"
      },
      {
        name: "编程猫少儿编程",
        url: "https://www.codemao.cn/",
        type: "course",
        targetDimensions: ["logic", "creativity"],
        description: "图形化编程培养逻辑思维和创造力",
        ageGroup: "7-8岁",
        difficulty: "intermediate"
      },
      // 创造力类
      {
        name: "画世界儿童绘画",
        url: "https://www.huashi6.com/",
        type: "tool",
        targetDimensions: ["creativity", "imagination"],
        description: "数字绘画工具激发创意表达",
        ageGroup: "7-8岁",
        difficulty: "beginner"
      },
      {
        name: "乐高创意搭建指南",
        url: "https://www.lego.com/zh-cn/kids",
        type: "activity",
        targetDimensions: ["creativity", "logic"],
        description: "动手搭建培养创造力和空间思维",
        ageGroup: "7-8岁",
        difficulty: "intermediate"
      },
      // 想象力类
      {
        name: "神奇校车科学探索",
        url: "https://book.douban.com/series/954",
        type: "book",
        targetDimensions: ["imagination", "logic"],
        description: "科学绘本激发想象力和求知欲",
        ageGroup: "7-8岁",
        difficulty: "beginner"
      },
      {
        name: "创意写作小课堂",
        url: "https://www.xueersi.com/",
        type: "course",
        targetDimensions: ["imagination", "expression"],
        description: "引导孩子进行创意写作和故事创作",
        ageGroup: "7-8岁",
        difficulty: "intermediate"
      },
      {
        name: "七巧板智力拼图",
        url: "https://www.4399.com/flash/146_146.htm",
        type: "game",
        targetDimensions: ["logic"],
        description: "经典的逻辑思维训练游戏",
        ageGroup: "7-8岁",
        difficulty: "beginner"
      },
      {
        name: "数学思维训练营",
        url: "https://www.xueersi.com/",
        type: "course",
        targetDimensions: ["logic"],
        description: "系统性的数学逻辑思维培养",
        ageGroup: "7-8岁",
        difficulty: "intermediate"
      },
      {
        name: "创意绘画工坊",
        url: "https://www.artforkidshub.com/",
        type: "activity",
        targetDimensions: ["creativity"],
        description: "自由创作和艺术表达训练",
        ageGroup: "7-8岁",
        difficulty: "beginner"
      },
      {
        name: "乐高创意搭建",
        url: "https://www.lego.com/zh-cn/kids",
        type: "activity",
        targetDimensions: ["creativity", "logic"],
        description: "通过搭建培养创造力和空间思维",
        ageGroup: "7-8岁",
        difficulty: "intermediate"
      },
      {
        name: "想象力故事创作",
        url: "https://www.storylineonline.net/",
        type: "activity",
        targetDimensions: ["imagination", "expression"],
        description: "引导孩子创作属于自己的故事",
        ageGroup: "7-8岁",
        difficulty: "intermediate"
      },
      {
        name: "科学小实验",
        url: "https://www.stevespanglerscience.com/",
        type: "activity",
        targetDimensions: ["imagination", "logic"],
        description: "通过实验激发想象力和探索精神",
        ageGroup: "7-8岁",
        difficulty: "beginner"
      },
      {
        name: "反应力训练游戏",
        url: "https://www.lumosity.com/",
        type: "game",
        targetDimensions: ["reaction"],
        description: "专业的反应速度和注意力训练",
        ageGroup: "7-8岁",
        difficulty: "intermediate"
      },
      {
        name: "体感运动游戏",
        url: "https://www.nintendo.com/",
        type: "game",
        targetDimensions: ["reaction"],
        description: "通过体感游戏提升反应能力和协调性",
        ageGroup: "7-8岁",
        difficulty: "intermediate"
      },
      // 反应能力类
      {
        name: "反应力训练游戏",
        url: "https://www.4399.com/",
        type: "game",
        targetDimensions: ["reaction"],
        description: "通过小游戏提升反应速度和注意力",
        ageGroup: "7-8岁",
        difficulty: "beginner"
      },
      {
        name: "儿童专注力训练",
        url: "https://www.xueersi.com/",
        type: "course",
        targetDimensions: ["reaction", "logic"],
        description: "系统训练注意力和反应能力",
        ageGroup: "7-8岁",
        difficulty: "intermediate"
      }
    ];

    // 根据强项和弱项筛选推荐
    const recommendedResources: LearningResource[] = [];
    
    // 添加针对弱项的资源
    weaknesses.forEach(weakness => {
      const weaknessResources = baseResources.filter(r => 
        r.targetDimensions.includes(weakness)
      ).slice(0, 2);
      recommendedResources.push(...weaknessResources);
    });
    
    // 添加巩固强项的资源
    strengths.forEach(strength => {
      const strengthResources = baseResources.filter(r => 
        r.targetDimensions.includes(strength) && 
        !recommendedResources.includes(r)
      ).slice(0, 1);
      recommendedResources.push(...strengthResources);
    });
    
    // 添加综合发展资源
    const comprehensiveResources = baseResources.filter(r => 
      r.targetDimensions.length > 1 && 
      !recommendedResources.includes(r)
    ).slice(0, 2);
    recommendedResources.push(...comprehensiveResources);

    return recommendedResources.slice(0, 8);
  };

  // 生成学习资源推荐
  const generateRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { strengths, weaknesses } = analyzeStrengthsAndWeaknesses(scores);
      const config = getAPIConfig();
      
      let recommendedResources: LearningResource[] = [];

      // 使用OpenAI API生成推荐
      try {
        const prompt = generatePrompt(scores, strengths, weaknesses);
        console.log("AI Agent推荐prompt:", prompt);

        const result = await callOpenAIAPI(prompt, config.apiKey, config.baseUrl);
        console.log('AI API调用成功，结果:', result);

        if (result.resources && Array.isArray(result.resources)) {
          recommendedResources = result.resources;
          console.log('使用AI推荐资源，共', recommendedResources.length, '个');
        } else {
          throw new Error('API返回格式错误：缺少resources数组');
        }
      } catch (apiError) {
        console.warn('AI API调用失败，自动切换到本地推荐:', apiError);
        recommendedResources = generateLocalRecommendations(scores, strengths, weaknesses);
        console.log('使用本地推荐资源，共', recommendedResources.length, '个');
        
        // 设置一个友好的提示信息，但不显示为错误
        setError('当前使用本地推荐算法为您推荐学习资源');
      }

      setResources(recommendedResources);
      
      // 转换格式并传递给父组件
      const formattedResources = recommendedResources.map(r => ({
        name: r.name,
        url: r.url
      }));
      onResourcesGenerated(formattedResources);

    } catch (error) {
      console.error('生成推荐失败:', error);
      setError('推荐生成失败，请稍后重试');
      
      // 使用兜底推荐
      const { strengths, weaknesses } = analyzeStrengthsAndWeaknesses(scores);
      const fallbackResources = generateLocalRecommendations(scores, strengths, weaknesses);
      setResources(fallbackResources);
      
      const formattedResources = fallbackResources.map(r => ({
        name: r.name,
        url: r.url
      }));
      onResourcesGenerated(formattedResources);
    } finally {
      setIsLoading(false);
    }
  };

  // 组件挂载时自动生成推荐
  useEffect(() => {
    generateRecommendations();
  }, [scores, childName]);

  const getDimensionName = (dimension: string) => {
    const names = {
      expression: '语言表达',
      logic: '逻辑思维', 
      creativity: '创造力',
      imagination: '想象力',
      reaction: '反应能力'
    };
    return names[dimension as keyof typeof names] || dimension;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      course: '📚',
      game: '🎮',
      book: '📖',
      activity: '🎯',
      tool: '🛠️',
      video: '🎬'
    };
    return icons[type as keyof typeof icons] || '🌟';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: '#4CAF50',
      intermediate: '#FF9800', 
      advanced: '#F44336'
    };
    return colors[difficulty as keyof typeof colors] || '#2196F3';
  };

  return (
    <div className="learning-resource-agent">
      <div className="agent-header">
        <h3>🤖 AI学习资源推荐</h3>
        <p>基于{childName}的能力评估，为你智能推荐最适合的学习资源</p>
      </div>

      {isLoading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>AI正在分析{childName}的能力特点，生成个性化推荐...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>⚠️ {error}</p>
          <button onClick={generateRecommendations} className="retry-button">
            重新生成推荐
          </button>
        </div>
      )}

      {resources.length > 0 && !isLoading && (
        <div className="resources-container">
          <div className="resources-grid">
            {resources.map((resource, index) => (
              <div key={index} className="resource-card-detailed">
                <div className="resource-header">
                  <div className="resource-icon">
                    {getTypeIcon(resource.type)}
                  </div>
                  <div className="resource-meta">
                    <h4 className="resource-title">{resource.name}</h4>
                    <div className="resource-tags">
                      <span 
                        className="difficulty-tag"
                        style={{ backgroundColor: getDifficultyColor(resource.difficulty) }}
                      >
                        {resource.difficulty}
                      </span>
                      <span className="age-tag">{resource.ageGroup}</span>
                    </div>
                  </div>
                </div>
                
                <div className="resource-content">
                  <p className="resource-description">{resource.description}</p>
                  <div className="target-dimensions">
                    <span className="dimensions-label">重点培养：</span>
                    {resource.targetDimensions.map((dim, i) => (
                      <span key={i} className="dimension-tag">
                        {getDimensionName(dim)}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="resource-actions">
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="resource-link"
                  >
                    <span className="link-icon">🚀</span>
                    <span className="link-text">开始学习</span>
                    <span className="link-arrow">→</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          <div className="agent-footer">
            <button onClick={generateRecommendations} className="refresh-button">
              🔄 重新生成推荐
            </button>
            <p className="agent-note">
              💡 推荐会根据{childName}的学习进展动态调整，建议定期更新
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningResourceAgent;