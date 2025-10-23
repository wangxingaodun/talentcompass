import React from 'react';
import { useAppContext } from './AppContext';
import type { ImaginationAssessment } from './games/types';

interface ReportPageProps {
  childName: string;
  testDate: string;
  scores: {
    expression: number;
    logic: number;
    creativity: number;
    imagination: number;
    reaction: number;
  };
  talentType: string;
  talentDescription: string;
  tips: string[];
  resources: {
    name: string;
    url: string;
  }[];
  imaginationAssessment?: ImaginationAssessment;
}

const ReportPage: React.FC<ReportPageProps> = ({
  childName,
  testDate,
  scores,
  talentType,
  talentDescription,
  tips,
  resources,
  imaginationAssessment
}) => {
  const { state } = useAppContext();
  const metrics = state.metrics;
  // 生成五维雷达图的路径
  const generateRadarPath = () => {
    const centerX = 150;
    const centerY = 150;
    const radius = 100;
    const dims = [
      scores.expression,
      scores.logic,
      scores.creativity,
      scores.imagination,
      scores.reaction,
    ];
    // 五个角度（度）：0, 72, 144, 216, 288
    const angles = [0, 72, 144, 216, 288].map(a => (a * Math.PI) / 180);
    const points = angles.map((angle, i) => ({
      x: centerX + radius * Math.cos(angle) * (dims[i] / 10),
      y: centerY - radius * Math.sin(angle) * (dims[i] / 10),
    }));
    const path = `M ${points[0].x},${points[0].y} ` + points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ') + ' Z';
    return path;
  };

  // 获取天赋类型对应的卡通形象
  const getTalentImage = () => {
    switch (talentType.toLowerCase()) {
      case 'inventor':
        return (
          <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="75" cy="50" r="30" fill="#FFD700" />
            <rect x="50" y="80" width="50" height="40" rx="10" fill="#708090" />
            <circle cx="60" cy="100" r="5" fill="#2F4F4F" />
            <circle cx="90" cy="100" r="5" fill="#2F4F4F" />
            <path d="M55 120 Q75 130 95 120" stroke="#2F4F4F" strokeWidth="3" fill="none" />
            <path d="M75 20 L75 30" stroke="#FF4500" strokeWidth="4" />
            <path d="M65 30 L85 30" stroke="#FF4500" strokeWidth="4" />
          </svg>
        );
      case 'artist':
        return (
          <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="75" cy="50" r="30" fill="#FF69B4" />
            <rect x="50" y="80" width="50" height="40" rx="10" fill="#8A2BE2" />
            <circle cx="60" cy="100" r="5" fill="#2F4F4F" />
            <circle cx="90" cy="100" r="5" fill="#2F4F4F" />
            <path d="M60 120 Q75 135 90 120" stroke="#2F4F4F" strokeWidth="3" fill="none" />
            <path d="M40 90 Q110 70 110 120" stroke="#FFD700" strokeWidth="3" fill="none" />
          </svg>
        );
      case 'scientist':
        return (
          <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="75" cy="50" r="30" fill="#6495ED" />
            <rect x="50" y="80" width="50" height="40" rx="10" fill="#2F4F4F" />
            <circle cx="60" cy="100" r="5" fill="#2F4F4F" />
            <circle cx="90" cy="100" r="5" fill="#2F4F4F" />
            <path d="M60 120 L90 120" stroke="#2F4F4F" strokeWidth="3" fill="none" />
            <rect x="65" y="10" width="20" height="30" rx="5" fill="#4CAF50" />
            <circle cx="75" cy="5" r="5" fill="#FFEB3B" />
          </svg>
        );
      case 'explorer':
        return (
          <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="75" cy="50" r="30" fill="#CD5C5C" />
            <rect x="50" y="80" width="50" height="40" rx="10" fill="#8B4513" />
            <circle cx="60" cy="100" r="5" fill="#2F4F4F" />
            <circle cx="90" cy="100" r="5" fill="#2F4F4F" />
            <path d="M65 120 Q75 130 85 120" stroke="#2F4F4F" strokeWidth="3" fill="none" />
            <path d="M40 70 L70 40 L100 70 L70 100 Z" fill="#A0522D" />
          </svg>
        );
      case 'storyteller':
        return (
          <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="75" cy="50" r="30" fill="#87CEFA" />
            <rect x="45" y="80" width="60" height="40" rx="10" fill="#FFA500" />
            <circle cx="60" cy="100" r="5" fill="#2F4F4F" />
            <circle cx="90" cy="100" r="5" fill="#2F4F4F" />
            <path d="M55 120 Q75 135 95 120" stroke="#2F4F4F" strokeWidth="3" fill="none" />
            <path d="M30 70 Q75 40 120 70" stroke="#FFD700" strokeWidth="3" fill="none" />
          </svg>
        );
      default:
        return (
          <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="75" cy="75" r="50" fill="#98FB98" />
            <circle cx="60" cy="65" r="10" fill="#2F4F4F" />
            <circle cx="90" cy="65" r="10" fill="#2F4F4F" />
            <path d="M55 95 Q75 115 95 95" stroke="#2F4F4F" strokeWidth="4" fill="none" />
          </svg>
        );
    }
  };
  
  return (
    <div className="report-page">
      <div className="report-container">
        {/* 报告封面 */}
        <div className="report-cover">
          <h1 className="report-title">{childName} 的天赋探索报告</h1>
          <p className="report-subtitle">由高小吉老师生成 · {testDate}</p>
        </div>
        
        {/* 天赋类型 */}
        <div className="talent-section">
          <h2>你是哪种小天才？</h2>
          <div className="talent-content">
            <div className="talent-image">
              {getTalentImage()}
            </div>
            <div className="talent-description">
              <p>{talentDescription}</p>
            </div>
          </div>
        </div>
        
        {/* 兴趣能量图 */}
        <div className="energy-section">
          <h2>兴趣能量图</h2>
          <div className="radar-chart">
            <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* 简单五边形网格 */}
              <path d="M 250 150 L 181.4 90.5 L 118.6 109.5 L 118.6 190.5 L 181.4 209.5 Z" stroke="#E0E0E0" strokeWidth="2" fill="none" />
              <path d="M 225 150 L 190.0 116.2 L 150.0 125.0 L 150.0 175.0 L 190.0 183.8 Z" stroke="#E0E0E0" strokeWidth="2" fill="none" />
              
              {/* 数据区域 */}
              <path d={generateRadarPath()} fill="rgba(33, 150, 243, 0.3)" stroke="#2196F3" strokeWidth="3" />
              
              {/* 维度标签 */}
              <text x="270" y="155" textAnchor="middle" fill="#2F4F4F" fontSize="14">表达</text>
              <text x="215" y="75" textAnchor="middle" fill="#2F4F4F" fontSize="14">逻辑</text>
              <text x="95" y="75" textAnchor="middle" fill="#2F4F4F" fontSize="14">创造</text>
              <text x="35" y="155" textAnchor="middle" fill="#2F4F4F" fontSize="14">想象</text>
              <text x="150" y="265" textAnchor="middle" fill="#2F4F4F" fontSize="14">反应</text>
            </svg>
          </div>
          <p className="chart-note">每个维度满分10分，数值越高，兴趣倾向越强。</p>
        </div>
        

        
        {/* 想象力评估详情 */}
        {imaginationAssessment && (
          <div className="imagination-assessment-section">
            <h2>🎨 创意绘画分析</h2>
            <div className="assessment-content">
              {/* 绘画作品展示 */}
              {typeof metrics.creativity === 'object' && 'imageDataUrl' in metrics.creativity && metrics.creativity.imageDataUrl && (
                <div className="drawing-artwork">
                  <h3>📋 绘画作品</h3>
                  <div className="artwork-container">
                    <div className="artwork-image-wrapper">
                      <img 
                        src={metrics.creativity.imageDataUrl} 
                        alt="儿童绘画作品" 
                        className="artwork-image"
                      />
                    </div>
                    <div className="artwork-meta-grid">
                      <div className="artwork-meta">
                        <span className="meta-label">作品尺寸</span>
                        <span className="meta-value">画布绘制</span>
                      </div>
                      <div className="artwork-meta">
                        <span className="meta-label">创作时间</span>
                        <span className="meta-value">
                          {typeof metrics.creativity === 'object' && 'totalMs' in metrics.creativity 
                            ? `${Math.round(metrics.creativity.totalMs / 1000)}秒`
                            : '未知'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="assessment-score-section">
                <div className="assessment-score">
                  <div className="score-circle">
                    <div className="score-value">{imaginationAssessment.score}</div>
                    <div className="score-label">分</div>
                  </div>
                  <div className="score-level">
                    <span className={`level-badge level-${imaginationAssessment.level}`}>
                      {imaginationAssessment.level === 'excellent' ? '优秀' : 
                       imaginationAssessment.level === 'good' ? '良好' : '待提升'}
                    </span>
                  </div>
                </div>
                <div className="confidence-display">
                  <div className="confidence-label">评估置信度</div>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill" 
                      style={{ width: `${(imaginationAssessment.confidence * 100)}%` }}
                    ></div>
                  </div>
                  <div className="confidence-value">
                    {(imaginationAssessment.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
              
              <div className="assessment-details">
                {/* 绘画数据详情 */}
                <div className="drawing-metrics">
                  <h3>📊 绘画数据详情</h3>
                  <div className="metrics-grid">
                    <div className="metric-item">
                      <span className="metric-label">绘画时长</span>
                      <span className="metric-value">
                        {typeof metrics.creativity === 'object' && 'totalMs' in metrics.creativity 
                          ? `${Math.round(metrics.creativity.totalMs / 1000)}秒`
                          : typeof metrics.creativity === 'object' && 'activeMs' in metrics.creativity
                          ? `${Math.round(metrics.creativity.activeMs / 1000)}秒`
                          : '未知'}
                      </span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">使用颜色数</span>
                      <span className="metric-value">
                        {typeof metrics.creativity === 'object' && 'colorsUsed' in metrics.creativity 
                          ? `${metrics.creativity.colorsUsed}种`
                          : '未知'}
                      </span>
                    </div>
                    {typeof metrics.creativity === 'object' && 'strokeCount' in metrics.creativity && (
                      <div className="metric-item">
                        <span className="metric-label">笔画数量</span>
                        <span className="metric-value">{metrics.creativity.strokeCount}笔</span>
                      </div>
                    )}
                    {typeof metrics.creativity === 'object' && 'toolVariety' in metrics.creativity && (
                      <div className="metric-item">
                        <span className="metric-label">工具多样性</span>
                        <span className="metric-value">{metrics.creativity.toolVariety}种</span>
                      </div>
                    )}
                    {typeof metrics.creativity === 'object' && 'shapesUsed' in metrics.creativity && (
                      <div className="metric-item">
                        <span className="metric-label">形状种类</span>
                        <span className="metric-value">{metrics.creativity.shapesUsed}种</span>
                      </div>
                    )}
                  </div>
                  
                  {/* 颜色使用详情 */}
                  {typeof metrics.creativity === 'object' && 'usedColors' in metrics.creativity && metrics.creativity.usedColors.length > 0 && (
                    <div className="color-details">
                      <h4>🎨 使用的颜色</h4>
                      <div className="color-palette">
                        {metrics.creativity.usedColors.map((color, index) => (
                          <div 
                            key={index} 
                            className="color-swatch" 
                            style={{ backgroundColor: color }}
                            title={color}
                          ></div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* 形状分布 */}
                  {typeof metrics.creativity === 'object' && 'shapeBreakdown' in metrics.creativity && (
                    <div className="shape-breakdown">
                      <h4>📐 形状分布</h4>
                      <div className="shape-stats">
                        <div className="shape-stat">
                          <span className="shape-label">✏️ 自由绘画</span>
                          <span className="shape-count">{metrics.creativity.shapeBreakdown.pencil}</span>
                        </div>
                        <div className="shape-stat">
                          <span className="shape-label">⭕ 圆形</span>
                          <span className="shape-count">{metrics.creativity.shapeBreakdown.circle}</span>
                        </div>
                        <div className="shape-stat">
                          <span className="shape-label">⬜ 矩形</span>
                          <span className="shape-count">{metrics.creativity.shapeBreakdown.rect}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="assessment-reasons">
                  <h3>✨ 亮点表现</h3>
                  <ul>
                    {imaginationAssessment.reasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
                
                {imaginationAssessment.suggestions && imaginationAssessment.suggestions.length > 0 && (
                  <div className="assessment-suggestions">
                    <h3>🚀 提升建议</h3>
                    <ul>
                      {imaginationAssessment.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <div className="assessment-note">
              <p>
                <strong>评估说明：</strong>
                这个分析基于{childName}的绘画作品，从原创性、多样性、叙事性、构图、色彩和投入度等维度进行专业评估。
                每个孩子都有独特的创意表达方式，这个评估旨在帮助发现和培养孩子的艺术潜能。
              </p>
            </div>
          </div>
        )}
        
        {/* 小贴士 */}
        <div className="tips-section">
          <h2>给爸爸妈妈的小贴士</h2>
          <ul className="tips-list">
            {tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
        
        {/* 下一步探索 */}
        <div className="resources-section">
          <h2>下一步探索</h2>
          <div className="resources-list">
            {resources.map((resource, index) => (
              <a key={index} href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                {resource.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;