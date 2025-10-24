import React from 'react';
import { useAppContext } from './AppContext';
import type { ImaginationAssessment } from './games/types';
import '../styles/report.css';

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

               <div className="imagination-text-report">
          <h2>🧠 想象力报告</h2>
          <div className="text-report-content">
            {state.metrics?.imagination?.prompt && (
              <div className="report-prompt">
                <div className="prompt-label">题目</div>
                <div className="prompt-value">{String(state.metrics.imagination.prompt)}</div>
              </div>
            )}
            {state.metrics?.imagination?.answerText && (
              <div className="report-answer">
                <div className="answer-label">孩子的回答</div>
                <div className="answer-value">{String(state.metrics.imagination.answerText)}</div>
              </div>
            )}

            {/* 综合评分与评定 */}
            <div className="text-overall" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
              <div className="overall-score">
                <div className="overall-label">综合评分</div>
                <div className="overall-value" style={{ fontSize: 24, fontWeight: 600 }}>{imaginationAssessment.score} 分</div>
                <div className="confidence-bar" style={{ marginTop: 6 }}>
                  <div className="confidence-fill" style={{ width: `${imaginationAssessment.score}%` }}></div>
                </div>
              </div>
              <div className="overall-level">
                <div className="overall-label">综合评定</div>
                <span className={`level-badge level-${imaginationAssessment.level}`}>
                  {imaginationAssessment.level === 'excellent' ? '🌟 优秀' : imaginationAssessment.level === 'good' ? '👍 良好' : '💪 待提升'}
                </span>
                <div className="overall-confidence" style={{ marginTop: 8 }}>
                  <div className="confidence-label">评估置信度</div>
                  <div className="confidence-bar">
                    <div className="confidence-fill" style={{ width: `${(imaginationAssessment.confidence * 100)}%` }}></div>
                  </div>
                  <div className="confidence-value">{(imaginationAssessment.confidence * 100).toFixed(0)}%</div>
                </div>
              </div>
            </div>

            {imaginationAssessment.subscores && (
              <div className="report-subscores" style={{ marginTop: 12 }}>
                <h3>🔹 三个维度评分</h3>
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
            {/* 维度评估细化说明（始终显示，无subscores时使用评分作为近似） */}
            {(() => {
              const subs = imaginationAssessment.subscores || {
                content: Math.round(imaginationAssessment.score),
                imagination: Math.round(imaginationAssessment.score),
                relevance: Math.round(Math.max(0, Math.min(100, imaginationAssessment.score)))
              };
              return (
                <div className="dimension-breakdown">
                  <h3>📎 维度评估结果</h3>
                  <div className="dimension-grid">
                    <div className="dimension-item">
                      <div className="dimension-title">内容（{subs.content}）</div>
                      <div className="dimension-desc">
                        {state.metrics?.imagination?.charCount
                          ? `字数约${state.metrics.imagination.charCount}，${/因为|所以|因此|于是/.test(String(state.metrics?.imagination?.answerText || '')) ? '包含因果表述，较为连贯' : '因果表述较少，连贯性一般'}`
                          : '内容完整度已统计'}
                      </div>
                    </div>
                    <div className="dimension-item">
                      <div className="dimension-title">想象力（{subs.imagination}）</div>
                      <div className="dimension-desc">
                        {(() => {
                          const text = String(state.metrics?.imagination?.answerText || '');
                          const unique = new Set(text.split('')).size;
                          const ratio = text.length ? unique / text.length : 0;
                          const emotion = /开心|伤心|生气|紧张|兴奋|害怕/.test(text);
                          return `${ratio > 0.5 ? '原创性较强' : '原创性一般'}，${emotion ? '包含情绪表达' : '情绪表达较少'}`;
                        })()}
                      </div>
                    </div>
                    <div className="dimension-item">
                      <div className="dimension-title">切题程度（{subs.relevance}）</div>
                      <div className="dimension-desc">
                        {(() => {
                          const q = String(state.metrics?.imagination?.prompt || '').replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ');
                          const words = q.split(/\s+/).filter(Boolean);
                          const answer = String(state.metrics?.imagination?.answerText || '');
                          const overlap = words.filter(w => answer.includes(w)).length;
                          return `与题目关键词重合${overlap}处，整体${overlap >= Math.max(1, Math.ceil(words.length / 3)) ? '较为贴合' : '贴合度一般'}`;
                        })()}
                      </div>
                    </div>
                  </div>
                  <div className="dimension-summary">
                    <div className="summary-title">综合说明</div>
                    <div className="summary-text">
                      本评语基于 ImaginationGame 的文字回答。综合评定为：{imaginationAssessment.level === 'excellent' ? '【优秀】' : imaginationAssessment.level === 'good' ? '【良好】' : '【有待提升】'}；主要依据：{(imaginationAssessment.reasons || []).join('；') || '综合表现'}；建议：{(imaginationAssessment.suggestions || []).join('；') || '持续保持并多加练习'}。
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage2;