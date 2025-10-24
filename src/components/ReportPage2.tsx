import React from 'react';
import { useAppContext } from './AppContext';
import type { ImaginationAssessment } from './games/types';

interface ReportPage2Props {
  childName: string;
  imaginationAssessment?: ImaginationAssessment;
}

const ReportPage2: React.FC<ReportPage2Props> = ({
  childName,
  imaginationAssessment
}) => {
  const { state } = useAppContext();
  const metrics = state.metrics;

  if (!imaginationAssessment) {
    return (
      <div className="report-page-content">
        <div className="no-assessment">
          <h2>🎨 创意绘画分析</h2>
          <p>暂无绘画作品数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="report-page-content report-page2-enhanced">
      {/* 创意绘画分析区域 */}
      <div className="creativity-analysis-section-enhanced">
        <div className="section-intro">
          <div className="intro-icon">🎨</div>
          <div className="intro-content">
            <h2>创意绘画分析</h2>
            <p>深度解析{childName}的艺术创作能力，发现独特的创意表达方式</p>
          </div>
        </div>
        
        <div className="analysis-content">
          {/* 绘画作品展示 */}
          {typeof metrics.creativity === 'object' && 'imageDataUrl' in metrics.creativity && metrics.creativity.imageDataUrl && (
            <div className="artwork-display-enhanced">
              <div className="artwork-header">
                <div className="artwork-icon">🖼️</div>
                <h3>作品展示</h3>
              </div>
              <div className="artwork-container-enhanced">
                <div className="artwork-image-wrapper">
                  <img 
                    src={metrics.creativity.imageDataUrl} 
                    alt={`${childName}的绘画作品`}
                    className="artwork-image-enhanced"
                  />
                  <div className="image-overlay">
                    <div className="overlay-content">
                      <span className="view-icon">👁️</span>
                      <span>查看详情</span>
                    </div>
                  </div>
                </div>
                <div className="artwork-metadata-enhanced">
                  <div className="metadata-item">
                     <span className="metadata-icon">🎨</span>
                     <div className="metadata-content">
                       <span className="metadata-label">作品类型</span>
                       <span className="metadata-value">自由创作</span>
                     </div>
                   </div>
                   <div className="metadata-item">
                     <span className="metadata-icon">⏰</span>
                     <div className="metadata-content">
                       <span className="metadata-label">创作时长</span>
                       <span className="metadata-value">{Math.round(metrics.creativity.totalMs / 1000)}秒</span>
                     </div>
                   </div>
                   <div className="metadata-item">
                     <span className="metadata-icon">🌈</span>
                     <div className="metadata-content">
                       <span className="metadata-label">使用颜色</span>
                       <span className="metadata-value">{metrics.creativity.colorsUsed}种</span>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="assessment-score-section-enhanced">
            <div className="score-header">
              <div className="score-icon">📊</div>
              <h3>评估结果</h3>
            </div>
            <div className="assessment-score-enhanced">
              <div className="main-score-card">
                <div className="score-circle-enhanced">
                  <div className="score-value">{imaginationAssessment.score}</div>
                </div>
                <div className="score-details">
                  <div className={`level-badge-enhanced level-${imaginationAssessment.level}`}>
                    {imaginationAssessment.level === 'excellent' ? '🌟 优秀' : 
                     imaginationAssessment.level === 'good' ? '👍 良好' : '💪 待提升'}
                  </div>
                  <div className="confidence-display-enhanced">
                    <span className="confidence-icon">🎯</span>
                    <div className="confidence-content">
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
                </div>
              </div>
            </div>
          </div>

          {imaginationAssessment.subscores && (
            <div className="subscores-enhanced">
              <div className="subscores-header">
                <div className="subscores-icon">📈</div>
                <h3>详细评分</h3>
              </div>
              <div className="subscore-grid-enhanced">
                <div className="subscore-card">
                  <div className="subscore-icon">📝</div>
                  <div className="subscore-content">
                    <span className="subscore-label">内容丰富度</span>
                    <div className="subscore-progress">
                      <div className="subscore-bar">
                        <div 
                          className="subscore-fill content" 
                          style={{ width: `${imaginationAssessment.subscores.content}%` }}
                        ></div>
                      </div>
                      <span className="subscore-value">{imaginationAssessment.subscores.content}分</span>
                    </div>
                  </div>
                </div>
                <div className="subscore-card">
                  <div className="subscore-icon">🌟</div>
                  <div className="subscore-content">
                    <span className="subscore-label">想象力表现</span>
                    <div className="subscore-progress">
                      <div className="subscore-bar">
                        <div 
                          className="subscore-fill imagination" 
                          style={{ width: `${imaginationAssessment.subscores.imagination}%` }}
                        ></div>
                      </div>
                      <span className="subscore-value">{imaginationAssessment.subscores.imagination}分</span>
                    </div>
                  </div>
                </div>
                <div className="subscore-card">
                  <div className="subscore-icon">🎯</div>
                  <div className="subscore-content">
                    <span className="subscore-label">主题相关性</span>
                    <div className="subscore-progress">
                      <div className="subscore-bar">
                        <div 
                          className="subscore-fill relevance" 
                          style={{ width: `${imaginationAssessment.subscores.relevance}%` }}
                        ></div>
                      </div>
                      <span className="subscore-value">{imaginationAssessment.subscores.relevance}分</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="assessment-details">
            {/* 绘画数据详情 */}
            <div className="drawing-metrics">
              <h3>📊 绘画数据详情</h3>
              <div className="metrics-grid">
                <div className="metric-item">
                  <div className="metric-icon">⏱️</div>
                  <div className="metric-content">
                    <span className="metric-label">绘画时长</span>
                    <span className="metric-value">
                      {typeof metrics.creativity === 'object' && 'totalMs' in metrics.creativity 
                        ? `${Math.round(metrics.creativity.totalMs / 1000)}秒`
                        : typeof metrics.creativity === 'object' && 'activeMs' in metrics.creativity
                        ? `${Math.round(metrics.creativity.activeMs / 1000)}秒`
                        : '未知'}
                    </span>
                  </div>
                </div>
                <div className="metric-item">
                  <div className="metric-icon">🎨</div>
                  <div className="metric-content">
                    <span className="metric-label">使用颜色数</span>
                    <span className="metric-value">
                      {typeof metrics.creativity === 'object' && 'colorsUsed' in metrics.creativity 
                        ? `${metrics.creativity.colorsUsed}种`
                        : '未知'}
                    </span>
                  </div>
                </div>
                {typeof metrics.creativity === 'object' && 'strokeCount' in metrics.creativity && (
                  <div className="metric-item">
                    <div className="metric-icon">✏️</div>
                    <div className="metric-content">
                      <span className="metric-label">笔画数量</span>
                      <span className="metric-value">{metrics.creativity.strokeCount}笔</span>
                    </div>
                  </div>
                )}
                {typeof metrics.creativity === 'object' && 'toolVariety' in metrics.creativity && (
                  <div className="metric-item">
                    <div className="metric-icon">🛠️</div>
                    <div className="metric-content">
                      <span className="metric-label">工具多样性</span>
                      <span className="metric-value">{metrics.creativity.toolVariety}种</span>
                    </div>
                  </div>
                )}
                {typeof metrics.creativity === 'object' && 'shapesUsed' in metrics.creativity && (
                  <div className="metric-item">
                    <div className="metric-icon">📐</div>
                    <div className="metric-content">
                      <span className="metric-label">形状种类</span>
                      <span className="metric-value">{metrics.creativity.shapesUsed}种</span>
                    </div>
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
              <ul className="reasons-list">
                {imaginationAssessment.reasons.map((reason, index) => (
                  <li key={index} className="reason-item">
                    <span className="reason-icon">🌟</span>
                    <span className="reason-text">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {imaginationAssessment.suggestions && imaginationAssessment.suggestions.length > 0 && (
              <div className="assessment-suggestions">
                <h3>🚀 提升建议</h3>
                <ul className="suggestions-list">
                  {imaginationAssessment.suggestions.map((suggestion, index) => (
                    <li key={index} className="suggestion-item">
                      <span className="suggestion-icon">💡</span>
                      <span className="suggestion-text">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        <div className="assessment-note">
          <div className="note-icon">📝</div>
          <div className="note-content">
            <p>
              <strong>评估说明：</strong>
              这个分析基于{childName}的绘画作品，从原创性、多样性、叙事性、构图、色彩和投入度等维度进行专业评估。
              每个孩子都有独特的创意表达方式，这个评估旨在帮助发现和培养孩子的艺术潜能。
            </p>
          </div>
        </div>
      </div>
      
      {/* 页面底部提示 */}
      <div className="page-footer-enhanced">
        <div className="footer-card">
          <div className="footer-icon">🎨</div>
          <div className="footer-content">
            <h4>创意发现之旅</h4>
            <p>每一幅画都是{childName}内心世界的独特表达，让我们一起发现更多可能性！</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage2;