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
    </div>
  );
};

export default StoryReportPage;