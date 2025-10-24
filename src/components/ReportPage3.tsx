import React from 'react';
import LearningResourceAgent from './LearningResourceAgent';

interface ReportPage3Props {
  childName: string;
  scores: {
    expression: number;
    logic: number;
    creativity: number;
    imagination: number;
    reaction: number;
  };
}

const ReportPage3: React.FC<ReportPage3Props> = ({ childName, scores }) => {
  return (
    <div className="report-page-content report-page3-enhanced">
      {/* AI推荐区域 */}
      <div className="ai-recommendations-section-enhanced">
        <div className="section-intro">
          <div className="intro-icon">🎯</div>
          <div className="intro-content">
            <h2>智能推荐引擎</h2>
            <p>基于{childName}的能力特点，AI为您精选最适合的学习资源</p>
          </div>
        </div>
        
        <div className="recommendations-container">
          <LearningResourceAgent 
            childName={childName}
            scores={scores}
            ageBand="7-8"
            onResourcesGenerated={(resources) => {
              console.log('AI推荐的学习资源:', resources);
            }}
          />
        </div>
      </div>

      {/* 底部提示 */}
      <div className="page-footer-enhanced">
        <div className="footer-card">
          <div className="footer-icon">💡</div>
          <div className="footer-content">
            <h4>温馨提示</h4>
            <p>学习是一个持续的过程，建议定期重新评估{childName}的能力发展，以获得更精准的推荐。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage3;