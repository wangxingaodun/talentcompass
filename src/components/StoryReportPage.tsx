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
    <div className="report-page-content">
      {/* 故事表达评估 */}
      <div className="story-assessment-section">
        <h2>故事表达分析</h2>

        {/* 你的故事：可折叠文本预览 */}
        {originalText && originalText.trim() && (
          <div className="text-preview-card">
            <div className="text-preview-header">
              <h3 className="text-preview-title">你的故事</h3>
              <button
                className="text-preview-toggle"
                aria-expanded={showText}
                onClick={() => setShowText((prev) => !prev)}
              >
                {showText ? '收起原文' : '展开原文'}
              </button>
            </div>
            {showText && (
              <div className="text-preview-content">
                {originalText}
              </div>
            )}
          </div>
        )}

        {!storyAssessment ? (
          <div className="no-assessment"><p>暂无故事文本数据</p></div>
        ) : (
          <div className="assessment-content">
            <div className="assessment-score-section">
              <div className="assessment-score">
                <div className="score-circle"><div className="score-value">{storyAssessment.score}</div><div className="score-label">分</div></div>
                <div className="score-level"><span className={`level-badge level-${storyAssessment.level}`}>{storyAssessment.level === 'excellent' ? '🌟 优秀' : storyAssessment.level === 'good' ? '👍 良好' : '💪 待提升'}</span></div>
              </div>
              <div className="confidence-display"><div className="confidence-label">评估置信度</div><div className="confidence-bar"><div className="confidence-fill" style={{ width: `${(storyAssessment.confidence * 100)}%` }}></div></div><div className="confidence-value">{(storyAssessment.confidence * 100).toFixed(0)}%</div></div>
            </div>

            {storyAssessment.subscores && (
              <div className="subscores-section">
                <h3>🔹 多维度评分</h3>
                <div className="subscore-grid">
                  <div className="subscore-item"><div className="subscore-label">词汇多样性</div><div className="subscore-bar"><div className="subscore-fill" style={{ width: `${storyAssessment.subscores.vocabulary}%` }}></div></div><div className="subscore-value">{storyAssessment.subscores.vocabulary}</div></div>
                  <div className="subscore-item"><div className="subscore-label">句子长度</div><div className="subscore-bar"><div className="subscore-fill" style={{ width: `${storyAssessment.subscores.sentenceLength}%` }}></div></div><div className="subscore-value">{storyAssessment.subscores.sentenceLength}</div></div>
                  <div className="subscore-item"><div className="subscore-label">创意度</div><div className="subscore-bar"><div className="subscore-fill" style={{ width: `${storyAssessment.subscores.creativity}%` }}></div></div><div className="subscore-value">{storyAssessment.subscores.creativity}</div></div>
                  <div className="subscore-item"><div className="subscore-label">清晰度</div><div className="subscore-bar"><div className="subscore-fill" style={{ width: `${storyAssessment.subscores.clarity}%` }}></div></div><div className="subscore-value">{storyAssessment.subscores.clarity}</div></div>
                  <div className="subscore-item"><div className="subscore-label">完整度</div><div className="subscore-bar"><div className="subscore-fill" style={{ width: `${storyAssessment.subscores.completeness}%` }}></div></div><div className="subscore-value">{storyAssessment.subscores.completeness}</div></div>
                  <div className="subscore-item"><div className="subscore-label">连贯性</div><div className="subscore-bar"><div className="subscore-fill" style={{ width: `${storyAssessment.subscores.coherence}%` }}></div></div><div className="subscore-value">{storyAssessment.subscores.coherence}</div></div>
                </div>
              </div>
            )}

            <div className="assessment-details">
              <div className="assessment-reasons"><h3>✨ 亮点表现</h3><ul className="reasons-list">{storyAssessment.reasons.map((reason, index) => (<li key={index} className="reason-item"><span className="reason-icon">🌟</span><span className="reason-text">{reason}</span></li>))}</ul></div>
              {storyAssessment.suggestions && storyAssessment.suggestions.length > 0 && (
                <div className="assessment-suggestions"><h3>🚀 提升建议</h3><ul className="suggestions-list">{storyAssessment.suggestions.map((sug, index) => (<li key={index} className="suggestion-item"><span className="suggestion-icon">✅</span><span className="suggestion-text">{sug}</span></li>))}</ul></div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryReportPage;