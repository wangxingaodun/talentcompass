import React from 'react';
import { useAppContext } from './AppContext';
import type { ImaginationAssessment } from './games/types';
import '../styles/report.css';

interface ReportPage4Props {
  childName: string;
  imaginationAssessment?: ImaginationAssessment;
}

function clamp(val: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, val));
}

const ReportPage4: React.FC<ReportPage4Props> = ({ childName, imaginationAssessment }) => {
  const { state } = useAppContext();

  const reaction = state.metrics?.reaction || { hits: 0, mistakes: 0, avgLatencyMs: 0, totalMs: 0 };
  const hits = reaction.hits || 0;
  const mistakes = reaction.mistakes || 0;
  const avgLatencyMs = reaction.avgLatencyMs || 0;
  const totalMs = reaction.totalMs || 0;
  const totalAttempts = hits + mistakes;
  const accuracy = totalAttempts > 0 ? hits / totalAttempts : 0;
  const accuracyPct = Math.round(accuracy * 100);
  const hitRatePct = accuracyPct;
  const hitsPerMinute = totalMs > 0 ? Math.round((hits * 60000) / totalMs) : 0;

  // 维度评分
  const speedScore = clamp(Math.round(((1200 - avgLatencyMs) / 1200) * 100)); // 1200ms 基线
  const accuracyScore = clamp(Math.round(accuracy * 100));
  const attentionScore = clamp(Math.round(
    // 专注度：60%来自准确率，40%来自稳定节奏（以每分钟命中为 proxy）
    (accuracy * 100) * 0.6 + Math.min(100, hitsPerMinute * 3) * 0.4
  ));
  const overallScore = clamp(Math.round(speedScore * 0.4 + accuracyScore * 0.4 + attentionScore * 0.2));

  const levelText = overallScore >= 80 ? '优秀' : overallScore >= 60 ? '良好' : '有待提升';

  const highlights: string[] = [];
  if (accuracyPct >= 85) highlights.push('点击准确度高');
  if (speedScore >= 70) highlights.push('反应迅速');
  if (mistakes <= 3 && totalAttempts > 0) highlights.push('失误较少');
  if (hitsPerMinute >= 25) highlights.push('节奏良好');

  const suggestions: string[] = [];
  if (speedScore < 60) suggestions.push('进行反应速度训练：缩短判断时间，尝试节拍练习');
  if (accuracyScore < 70) suggestions.push('减少误击：点击前短暂停顿，优先稳定再提速');
  if (attentionScore < 65) suggestions.push('提升专注：分段练习，每次1–2分钟，逐步延长时长');
  if (highlights.length >= 2) suggestions.push('保持优势并提升挑战：提高难度或缩短出现间隔');

  // 想象力评估（来自上下文或作为props传入）
  const imag = imaginationAssessment || state.imaginationAssessment;

  return (
    <div className="report-page-content report-page4-enhanced">
      {/* 综合结果：打地鼠+想象力 */}
      <div className="comprehensive-analysis-section-enhanced">
        <div className="section-intro">
          <div className="intro-icon">🎯</div>
          <div className="intro-content">
            <h2>综合结果报告</h2>
            <p>深度分析{childName}的反应力与想象力表现，提供全面的能力评估</p>
          </div>
        </div>
        
        <div className="analysis-content">
          {/* 反应力报告 */}
          <div className="reaction-report-enhanced">
            <div className="report-header">
              <div className="report-icon">🐹</div>
              <h3>打地鼠反应力报告</h3>
            </div>
            <div className="assessment-score-section-enhanced">
              <div className="score-header">
                <div className="score-icon">📊</div>
                <h4>评估结果</h4>
              </div>
              <div className="assessment-score-enhanced">
                <div className="main-score-card">
                  <div className="score-circle-enhanced">
                    <div className="score-value">{overallScore}</div>
                  </div>
                  <div className="score-details">
                    <div className={`level-badge-enhanced level-${levelText === '优秀' ? 'excellent' : levelText === '良好' ? 'good' : 'needs_improvement'}`}>
                      {levelText === '优秀' ? '🌟 优秀' : levelText === '良好' ? '👍 良好' : '💪 待提升'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 维度评分 */}
            <div className="subscores-enhanced">
              <div className="subscores-header">
                <div className="subscores-icon">📈</div>
                <h4>详细评分</h4>
              </div>
              <div className="subscore-grid-enhanced">
                <div className="subscore-card">
                  <div className="subscore-icon">⚡</div>
                  <div className="subscore-content">
                    <span className="subscore-label">反应速度</span>
                    <div className="subscore-progress">
                      <div className="subscore-bar">
                        <div className="subscore-fill speed" style={{ width: `${speedScore}%` }}></div>
                      </div>
                      <span className="subscore-value">{speedScore}分</span>
                    </div>
                  </div>
                </div>
                <div className="subscore-card">
                  <div className="subscore-icon">🎯</div>
                  <div className="subscore-content">
                    <span className="subscore-label">正确率</span>
                    <div className="subscore-progress">
                      <div className="subscore-bar">
                        <div className="subscore-fill accuracy" style={{ width: `${accuracyScore}%` }}></div>
                      </div>
                      <span className="subscore-value">{accuracyScore}分</span>
                    </div>
                  </div>
                </div>
                <div className="subscore-card">
                  <div className="subscore-icon">🧠</div>
                  <div className="subscore-content">
                    <span className="subscore-label">专注度</span>
                    <div className="subscore-progress">
                      <div className="subscore-bar">
                        <div className="subscore-fill attention" style={{ width: `${attentionScore}%` }}></div>
                      </div>
                      <span className="subscore-value">{attentionScore}分</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 数据概览 */}
            <div className="reaction-metrics-enhanced">
              <div className="metrics-header">
                <div className="metrics-icon">📊</div>
                <h4>数据概览</h4>
              </div>
              <div className="metrics-grid-enhanced">
                <div className="metric-card">
                  <div className="metric-icon">✅</div>
                  <div className="metric-content">
                    <div className="metric-label">命中数</div>
                    <div className="metric-value">{hits}</div>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">❌</div>
                  <div className="metric-content">
                    <div className="metric-label">误击数</div>
                    <div className="metric-value">{mistakes}</div>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">🎯</div>
                  <div className="metric-content">
                    <div className="metric-label">命中率</div>
                    <div className="metric-value">{hitRatePct}%</div>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">⏱️</div>
                  <div className="metric-content">
                    <div className="metric-label">平均反应时</div>
                    <div className="metric-value">{avgLatencyMs} ms</div>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">⏰</div>
                  <div className="metric-content">
                    <div className="metric-label">总时长</div>
                    <div className="metric-value">{Math.round(totalMs / 1000)} s</div>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">🚀</div>
                  <div className="metric-content">
                    <div className="metric-label">每分钟命中</div>
                    <div className="metric-value">{hitsPerMinute}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 亮点与建议 */}
            <div className="assessment-details-enhanced">
              {highlights.length > 0 && (
                <div className="assessment-reasons-enhanced">
                  <div className="reasons-header">
                    <div className="reasons-icon">✨</div>
                    <h4>亮点表现</h4>
                  </div>
                  <ul className="reasons-list-enhanced">
                    {highlights.map((r, idx) => (
                      <li key={idx} className="reason-item-enhanced">
                        <span className="reason-icon">🌟</span>
                        <span className="reason-text">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="assessment-suggestions-enhanced">
                <div className="suggestions-header">
                  <div className="suggestions-icon">🚀</div>
                  <h4>提升建议</h4>
                </div>
                <ul className="suggestions-list-enhanced">
                  {suggestions.map((s, idx) => (
                    <li key={idx} className="suggestion-item-enhanced">
                      <span className="suggestion-icon">✅</span>
                      <span className="suggestion-text">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="assessment-note-enhanced">
                <div className="note-header">
                  <div className="note-icon">📝</div>
                  <h4>综合说明</h4>
                </div>
                <div className="note-content">
                  综合评定为：{levelText}；主要依据：{[
                    accuracyPct >= 80 ? '正确率较高' : '正确率有提升空间',
                    speedScore >= 70 ? '反应速度较快' : '反应速度偏慢',
                    attentionScore >= 65 ? '专注表现较稳定' : '专注度需加强'
                  ].join('；')}。建议根据短板进行针对性训练。
                </div>
              </div>
            </div>
          </div>

          {/* 想象力报告摘要 */}
          <div className="imagination-summary-enhanced">
            <div className="summary-header">
              <div className="summary-icon">🎨</div>
              <h3>想象力报告摘要</h3>
            </div>
            {state.metrics?.imagination?.prompt && (
              <div className="report-prompt" style={{ marginBottom: 8 }}>
                <div className="prompt-label">题目</div>
                <div className="prompt-value">{String(state.metrics.imagination.prompt)}</div>
              </div>
            )}
            {state.metrics?.imagination?.answerText && (
              <div className="report-answer" style={{ marginBottom: 8 }}>
                <div className="answer-label">孩子的回答</div>
                <div className="answer-value">{String(state.metrics.imagination.answerText)}</div>
              </div>
            )}

            {imag ? (
              <>
                <div className="text-overall" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
                  <div className="overall-score">
                    <div className="overall-label">综合评分</div>
                    <div className="overall-value" style={{ fontSize: 24, fontWeight: 600 }}>{imag.score} 分</div>
                    <div className="score-level" style={{ marginTop: 6 }}>
                      <span className={`level-badge level-${imag.level}`}>
                        {imag.level === 'excellent' ? '🌟 优秀' : imag.level === 'good' ? '👍 良好' : '💪 待提升'}
                      </span>
                    </div>
                  </div>
                  <div className="overall-summary">
                    <div className="overall-label">综合说明</div>
                    <div className="overall-text">
                      {(imag.report && imag.report.trim())
                        ? imag.report
                        : `综合评定为：${imag.level === 'excellent' ? '【优秀】' : imag.level === 'good' ? '【良好】' : '【有待提升】'}；主要依据：${(imag.reasons || []).join('；') || '综合表现'}；建议：${(imag.suggestions || []).join('；') || '继续保持与优化表达'}`}
                    </div>
                  </div>
                </div>

                {(() => {
                  const subs = imag.subscores || {
                    content: Math.round(imag.score),
                    imagination: Math.round(imag.score),
                    relevance: Math.round(Math.max(0, Math.min(100, imag.score)))
                  };
                  return (
                    <div className="dimension-breakdown" style={{ marginTop: 12 }}>
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
                          综合评定为：{imag.level === 'excellent' ? '【优秀】' : imag.level === 'good' ? '【良好】' : '【有待提升】'}；主要依据：{(imag.reasons || []).join('；') || '综合表现'}；建议：{(imag.suggestions || []).join('；') || '持续保持并多加练习'}。
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </>
            ) : (
              <div className="no-assessment" style={{ marginTop: 8 }}>
                暂无想象力评估结果
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage4;