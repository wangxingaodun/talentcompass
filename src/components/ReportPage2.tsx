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
    <div className="report-page-content">
      {/* 想象力评估详情 */}
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
                  <div className="artwork-overlay">
                    <div className="artwork-title">{childName}的创意作品</div>
                  </div>
                </div>
                <div className="artwork-meta-grid">
                  <div className="artwork-meta">
                    <span className="meta-label">🎯 作品类型</span>
                    <span className="meta-value">自由创作</span>
                  </div>
                  <div className="artwork-meta">
                    <span className="meta-label">⏱️ 创作时间</span>
                    <span className="meta-value">
                      {typeof metrics.creativity === 'object' && 'totalMs' in metrics.creativity 
                        ? `${Math.round(metrics.creativity.totalMs / 1000)}秒`
                        : '未知'}
                    </span>
                  </div>
                  <div className="artwork-meta">
                    <span className="meta-label">🎨 使用颜色</span>
                    <span className="meta-value">
                      {typeof metrics.creativity === 'object' && 'colorsUsed' in metrics.creativity 
                        ? `${metrics.creativity.colorsUsed}种`
                        : '未知'}
                    </span>
                  </div>
                  <div className="artwork-meta">
                    <span className="meta-label">🖌️ 绘画工具</span>
                    <span className="meta-value">
                      {typeof metrics.creativity === 'object' && 'toolVariety' in metrics.creativity 
                        ? `${metrics.creativity.toolVariety}种`
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
                  {imaginationAssessment.level === 'excellent' ? '🌟 优秀' : 
                   imaginationAssessment.level === 'good' ? '👍 良好' : '💪 待提升'}
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

          {imaginationAssessment.subscores && (
            <div className="subscores-section" style={{ marginTop: 16 }}>
              <h3>🔹 多维度评分</h3>
              <div className="subscore-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="subscore-item">
                  <div className="subscore-label">内容</div>
                  <div className="subscore-bar" style={{ background: '#eee', borderRadius: 8, overflow: 'hidden' }}>
                    <div className="subscore-fill" style={{ width: `${imaginationAssessment.subscores.content}%`, height: 8, background: '#4caf50' }}></div>
                  </div>
                  <div className="subscore-value" style={{ marginTop: 4 }}>{imaginationAssessment.subscores.content}</div>
                </div>
                <div className="subscore-item">
                  <div className="subscore-label">想象力</div>
                  <div className="subscore-bar" style={{ background: '#eee', borderRadius: 8, overflow: 'hidden' }}>
                    <div className="subscore-fill" style={{ width: `${imaginationAssessment.subscores.imagination}%`, height: 8, background: '#ff9800' }}></div>
                  </div>
                  <div className="subscore-value" style={{ marginTop: 4 }}>{imaginationAssessment.subscores.imagination}</div>
                </div>
                <div className="subscore-item">
                  <div className="subscore-label">切题程度</div>
                  <div className="subscore-bar" style={{ background: '#eee', borderRadius: 8, overflow: 'hidden' }}>
                    <div className="subscore-fill" style={{ width: `${imaginationAssessment.subscores.relevance}%`, height: 8, background: '#2196f3' }}></div>
                  </div>
                  <div className="subscore-value" style={{ marginTop: 4 }}>{imaginationAssessment.subscores.relevance}</div>
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

        {/* 想象力报告（文本回答） */}
        <div className="imagination-text-report" style={{ marginTop: 24 }}>
          <h3>🧠 想象力报告</h3>
          <div className="prompt-answer" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
            {metrics.imagination && (metrics.imagination as any).prompt && (
              <div className="prompt-line" style={{ display: 'flex', gap: 8 }}>
                <span className="label" style={{ fontWeight: 600 }}>题目：</span>
                <span className="value">{(metrics.imagination as any).prompt}</span>
              </div>
            )}
            {metrics.imagination && (metrics.imagination as any).answerText && (
              <div className="answer-line" style={{ display: 'flex', gap: 8 }}>
                <span className="label" style={{ fontWeight: 600 }}>回答：</span>
                <span className="value">{(metrics.imagination as any).answerText}</span>
              </div>
            )}
          </div>

          {imaginationAssessment.subscores && (
            <div className="subscore-summary" style={{ marginTop: 8, color: '#555' }}>
              <span>内容 {imaginationAssessment.subscores.content} · 想象力 {imaginationAssessment.subscores.imagination} · 切题 {imaginationAssessment.subscores.relevance}</span>
            </div>
          )}

          <div className="report-body" style={{ marginTop: 12 }}>
            <p style={{ lineHeight: 1.6 }}>
              {imaginationAssessment.report || '暂无报告文本'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage2;