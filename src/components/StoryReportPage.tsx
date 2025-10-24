import React, { useState } from 'react';
import type { StoryAssessment } from './games/types';
import { useAppContext } from './AppContext';

interface StoryReportPageProps {
  childName: string;
  storyAssessment?: StoryAssessment;
}

const StoryReportPage: React.FC<StoryReportPageProps> = ({ childName, storyAssessment }) => {
  const { state } = useAppContext();
  const originalText = (state.metrics.expression as any)?.text || '';
  const [showText, setShowText] = useState(false);
  // 逻辑力评估相关数据与计算
  const logic = state.metrics?.logic || { correct: 0, attempts: 0, avgLatencyMs: 0 };
  const logicCorrect = Number(logic.correct || 0);
  const logicAttempts = Number(logic.attempts || 0);
  const logicAvgLatencyMs = Number(logic.avgLatencyMs || 0);
  const logicAccuracy = logicAttempts > 0 ? logicCorrect / logicAttempts : 0;
  const logicAccuracyPercent = Math.round(logicAccuracy * 100);
  const logicSpeedPercent = Math.round(Math.max(0, Math.min(100, (10 - logicAvgLatencyMs / 4000 * 4) * 10)));
  const logicScorePercent = Math.round(Math.max(0, Math.min(100, (state.scores?.logic || 0) * 10)));
  const logicLevel = logicAccuracy >= 0.75 && logicAvgLatencyMs < 6000 ? 'excellent' : logicAccuracy >= 0.5 ? 'good' : 'needs_improvement';
  const logicLevelText = logicLevel === 'excellent' ? '🌟 优秀' : logicLevel === 'good' ? '👍 良好' : '💪 待提升';
  const logicHighlights: string[] = [];
  const logicSuggestions: string[] = [];
  if (logicCorrect === 4) logicHighlights.push('规律识别稳定，推理准确性高');
  if (logicAccuracy >= 0.75) logicHighlights.push('逻辑判断较为准确');
  if (logicAvgLatencyMs > 0 && logicAvgLatencyMs < 3000) logicHighlights.push('反应速度较快');
  if (logicCorrect >= 2 && logicHighlights.length === 0) logicHighlights.push('具备一定规律识别能力');
  if (logicAccuracy < 0.5) logicSuggestions.push('多练习找规律、类比推理等题型');
  if (logicAvgLatencyMs > 6000) logicSuggestions.push('练习时保持专注，提升解题速度');
  logicSuggestions.push('可尝试模式识别游戏，如连连看或数独入门');

  return (
    <div className="report-page-enhanced">
      {/* 故事表达评估 */}
      <div className="story-analysis-section-enhanced">
        <div className="analysis-header">
          <div className="analysis-icon">📖</div>
          <h3>故事表达分析</h3>
        </div>

        {/* 你的故事：可折叠文本预览 */}
        {originalText && originalText.trim() && (
          <div className="story-preview-enhanced">
            <div className="story-header" onClick={() => setShowText((prev) => !prev)}>
              <div className="story-icon">📝</div>
              <h4>你的故事</h4>
              <div className="expand-icon">{showText ? '▼' : '▶'}</div>
            </div>
            {showText && (
              <div className="story-text-enhanced">
                <div className="story-content">
                  {originalText}
                </div>
              </div>
            )}
          </div>
        )}

        {!storyAssessment ? (
          <div className="no-assessment"><p>暂无故事文本数据</p></div>
        ) : (
          <div className="assessment-content">
            <div className="assessment-score-section-enhanced">
              <div className="score-header">
                <div className="score-icon">🎯</div>
                <h4>评估结果</h4>
              </div>
              <div className="score-display-enhanced">
                <div className="score-circle-enhanced">
                  <div className="score-number">{storyAssessment.score}</div>
                  <div className="score-label">综合得分</div>
                </div>
                <div className="level-badge-enhanced">
                  <span className="level-text">{storyAssessment.level === 'excellent' ? '🌟 优秀' : storyAssessment.level === 'good' ? '👍 良好' : '💪 待提升'}</span>
                </div>
              </div>
              <div className="confidence-display-enhanced">
                 <div className="confidence-header">
                   <div className="confidence-icon">📊</div>
                   <span className="confidence-label">评估置信度</span>
                 </div>
                 <div className="confidence-bar-enhanced">
                   <div className="confidence-fill" style={{ width: `${(storyAssessment.confidence * 100)}%` }}></div>
                 </div>
                 <div className="confidence-value">{(storyAssessment.confidence * 100).toFixed(0)}%</div>
               </div>
            </div>

            {storyAssessment.subscores && (
              <div className="subscores-enhanced">
                <div className="subscores-header">
                  <div className="subscores-icon">📊</div>
                  <h4>详细评分</h4>
                </div>
                <div className="subscore-item-enhanced">
                  <div className="subscore-info">
                    <span className="subscore-icon">📚</span>
                    <span className="subscore-label">词汇丰富度</span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar-enhanced">
                      <div className="progress-fill" style={{ width: `${storyAssessment.subscores.vocabulary}%` }}></div>
                    </div>
                    <span className="subscore-value">{storyAssessment.subscores.vocabulary}%</span>
                  </div>
                </div>
                <div className="subscore-item-enhanced">
                  <div className="subscore-info">
                    <span className="subscore-icon">📝</span>
                    <span className="subscore-label">句子长度</span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar-enhanced">
                      <div className="progress-fill" style={{ width: `${storyAssessment.subscores.sentenceLength}%` }}></div>
                    </div>
                    <span className="subscore-value">{storyAssessment.subscores.sentenceLength}%</span>
                  </div>
                </div>
                <div className="subscore-item-enhanced">
                  <div className="subscore-info">
                    <span className="subscore-icon">🎨</span>
                    <span className="subscore-label">创意性</span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar-enhanced">
                      <div className="progress-fill" style={{ width: `${storyAssessment.subscores.creativity}%` }}></div>
                    </div>
                    <span className="subscore-value">{storyAssessment.subscores.creativity}%</span>
                  </div>
                </div>
                <div className="subscore-item-enhanced">
                  <div className="subscore-info">
                    <span className="subscore-icon">💡</span>
                    <span className="subscore-label">表达清晰度</span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar-enhanced">
                      <div className="progress-fill" style={{ width: `${storyAssessment.subscores.clarity}%` }}></div>
                    </div>
                    <span className="subscore-value">{storyAssessment.subscores.clarity}%</span>
                  </div>
                </div>
                <div className="subscore-item-enhanced">
                  <div className="subscore-info">
                    <span className="subscore-icon">🔗</span>
                    <span className="subscore-label">故事完整性</span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar-enhanced">
                      <div className="progress-fill" style={{ width: `${storyAssessment.subscores.completeness}%` }}></div>
                    </div>
                    <span className="subscore-value">{storyAssessment.subscores.completeness}%</span>
                  </div>
                </div>
                <div className="subscore-item-enhanced">
                  <div className="subscore-info">
                    <span className="subscore-icon">🧩</span>
                    <span className="subscore-label">逻辑连贯性</span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar-enhanced">
                      <div className="progress-fill" style={{ width: `${storyAssessment.subscores.coherence}%` }}></div>
                    </div>
                    <span className="subscore-value">{storyAssessment.subscores.coherence}%</span>
                  </div>
                </div>
              </div>
            )}

            <div className="assessment-details">
              {/* 亮点 */}
               {storyAssessment.reasons && storyAssessment.reasons.length > 0 && (
                 <div className="assessment-reasons-enhanced">
                   <div className="reasons-header">
                     <div className="reasons-icon">✨</div>
                     <h4>表现分析</h4>
                   </div>
                   <ul className="reasons-list-enhanced">
                     {storyAssessment.reasons.map((reason, idx) => (
                       <li key={idx} className="reason-item-enhanced">
                         <span className="reason-icon">🌟</span>
                         <span className="reason-text">{reason}</span>
                       </li>
                     ))}
                   </ul>
                 </div>
               )}

              {/* 建议 */}
              {storyAssessment.suggestions && storyAssessment.suggestions.length > 0 && (
                <div className="assessment-suggestions-enhanced">
                  <div className="suggestions-header">
                    <div className="suggestions-icon">🚀</div>
                    <h4>提升建议</h4>
                  </div>
                  <ul className="suggestions-list-enhanced">
                    {storyAssessment.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="suggestion-item-enhanced">
                        <span className="suggestion-icon">✅</span>
                        <span className="suggestion-text">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* 逻辑力评估报告 */}
      <div className="logic-analysis-section-enhanced">
        <div className="logic-header">
          <div className="logic-icon">🧠</div>
          <h3>逻辑力评估报告</h3>
        </div>
        {logicAttempts === 0 ? (
          <div className="no-assessment"><p>暂无逻辑题数据</p></div>
        ) : (
          <div className="assessment-content">
            <div className="assessment-score-section-enhanced">
              <div className="score-header">
                <div className="score-icon">🎯</div>
                <h4>评估结果</h4>
              </div>
              <div className="score-display-enhanced">
                <div className="score-circle-enhanced">
                  <div className="score-number">{logicScorePercent}</div>
                  <div className="score-label">综合得分</div>
                </div>
                <div className="level-badge-enhanced">
                  <span className="level-text">{logicLevelText}</span>
                </div>
              </div>
              <div className="logic-summary">
                <div className="summary-item">题目数：{logicAttempts}</div>
                <div className="summary-item">答对：{logicCorrect}</div>
                <div className="summary-item">正确率：{logicAccuracyPercent}%</div>
                <div className="summary-item">平均反应时：{Math.round(logicAvgLatencyMs / 1000)}秒</div>
              </div>
            </div>

            <div className="subscores-enhanced">
              <div className="subscores-header">
                <div className="subscores-icon">📈</div>
                <h4>维度评分</h4>
              </div>
              <div className="subscore-item-enhanced">
                <div className="subscore-info">
                  <span className="subscore-icon">✅</span>
                  <span className="subscore-label">正确率</span>
                </div>
                <div className="progress-container">
                  <div className="progress-bar-enhanced">
                    <div className="progress-fill" style={{ width: `${logicAccuracyPercent}%` }}></div>
                  </div>
                  <span className="subscore-value">{logicAccuracyPercent}%</span>
                </div>
              </div>
              <div className="subscore-item-enhanced">
                <div className="subscore-info">
                  <span className="subscore-icon">⏱️</span>
                  <span className="subscore-label">速度</span>
                </div>
                <div className="progress-container">
                  <div className="progress-bar-enhanced">
                    <div className="progress-fill" style={{ width: `${logicSpeedPercent}%` }}></div>
                  </div>
                  <span className="subscore-value">{logicSpeedPercent}%</span>
                </div>
              </div>
            </div>

            {logicHighlights.length > 0 && (
              <div className="assessment-reasons-enhanced">
                <div className="reasons-header">
                  <div className="reasons-icon">✨</div>
                  <h4>亮点表现</h4>
                </div>
                <ul className="reasons-list-enhanced">
                  {logicHighlights.map((reason, idx) => (
                    <li key={idx} className="reason-item-enhanced">
                      <span className="reason-icon">🌟</span>
                      <span className="reason-text">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {logicSuggestions.length > 0 && (
              <div className="assessment-suggestions-enhanced">
                <div className="suggestions-header">
                  <div className="suggestions-icon">🚀</div>
                  <h4>提升建议</h4>
                </div>
                <ul className="suggestions-list-enhanced">
                  {logicSuggestions.map((suggestion, idx) => (
                    <li key={idx} className="suggestion-item-enhanced">
                      <span className="suggestion-icon">✅</span>
                      <span className="suggestion-text">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryReportPage;