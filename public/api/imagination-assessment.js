// 模拟想象力评估API端点
// 在实际部署中，这应该是一个真正的后端服务

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, image, metadata, temperature } = req.body;
    
    // 模拟API处理延迟
    setTimeout(() => {
      // 基于元数据生成模拟评估结果
      const { colorsUsed, strokeCount, totalMs, toolVariety, shapeBreakdown } = metadata;
      
      // 简单的启发式评分算法（模拟大模型输出）
      let score = 50; // 基础分
      
      // 颜色多样性加分
      score += Math.min(20, colorsUsed * 4);
      
      // 笔画数量和密度
      const strokeDensity = strokeCount / Math.max(1, totalMs / 1000);
      score += Math.min(15, strokeDensity * 10);
      
      // 工具多样性
      score += Math.min(10, toolVariety * 3);
      
      // 形状复杂度
      const totalShapes = shapeBreakdown.pencil + shapeBreakdown.circle + shapeBreakdown.rect;
      score += Math.min(15, totalShapes * 1.5);
      
      // 确保分数在合理范围内
      score = Math.max(30, Math.min(95, score));
      
      let level;
      if (score >= 80) level = 'excellent';
      else if (score >= 60) level = 'good';
      else level = 'needs_improvement';
      
      const reasons = [];
      if (colorsUsed >= 3) reasons.push('色彩运用丰富多样');
      if (strokeCount >= 20) reasons.push('绘画投入度很高');
      if (toolVariety >= 2) reasons.push('善于使用多种绘画工具');
      if (totalShapes >= 10) reasons.push('画面元素丰富有层次');
      
      const suggestions = [];
      if (colorsUsed < 3) suggestions.push('尝试使用更多颜色表达情感');
      if (totalShapes < 5) suggestions.push('可以画更多有趣的元素');
      if (toolVariety < 2) suggestions.push('试试不同的绘画工具');
      
      const result = {
        score: Math.round(score),
        level,
        reasons: reasons.length > 0 ? reasons : ['展现了基础的创意表达能力'],
        suggestions: suggestions.length > 0 ? suggestions : ['继续保持创作热情'],
        confidence: 0.85
      };
      
      res.status(200).json(result);
    }, 1000); // 1秒延迟模拟API调用
    
  } catch (error) {
    console.error('想象力评估API错误:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}