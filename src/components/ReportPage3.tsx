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
    <div className="report-page-content">
      {/* AI智能推荐学习资源 */}
      <div className="ai-recommendations-section">
        <h2 className="section-title">
          <span className="ai-badge">🤖 AI</span>
          智能推荐学习资源
        </h2>
        <p className="section-description">
          基于{childName}在五个维度的表现，AI为您推荐最适合的学习资源
        </p>
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
  );
};

export default ReportPage3;