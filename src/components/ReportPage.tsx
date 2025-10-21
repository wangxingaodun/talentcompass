import React from 'react';

interface ReportPageProps {
  childName: string;
  testDate: string;
  scores: {
    expression: number;
    logic: number;
    creativity: number;
    reaction: number;
  };
  talentType: string;
  talentDescription: string;
  tips: string[];
  resources: {
    name: string;
    url: string;
  }[];
}

const ReportPage: React.FC<ReportPageProps> = ({
  childName,
  testDate,
  scores,
  talentType,
  talentDescription,
  tips,
  resources
}) => {
  // 生成雷达图的路径
  const generateRadarPath = () => {
    const centerX = 150;
    const centerY = 150;
    const radius = 100;
    
    // 计算四个维度的坐标
    const points = [
      { x: centerX + radius * (scores.expression / 10), y: centerY }, // 表达
      { x: centerX + radius * Math.cos(Math.PI/4) * (scores.logic / 10), y: centerY - radius * Math.sin(Math.PI/4) * (scores.logic / 10) }, // 逻辑
      { x: centerX, y: centerY - radius * (scores.creativity / 10) }, // 创造
      { x: centerX - radius * Math.cos(Math.PI/4) * (scores.reaction / 10), y: centerY - radius * Math.sin(Math.PI/4) * (scores.reaction / 10) } // 反应
    ];
    
    // 生成路径
    const path = `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y} L ${points[2].x},${points[2].y} L ${points[3].x},${points[3].y} Z`;
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
          <p className="report-subtitle">由AI小星老师生成 · {testDate}</p>
          <div className="report-cover-image">
            {/* 游戏截图占位 */}
            <div className="game-screenshots">
              <div className="screenshot-item"></div>
              <div className="screenshot-item"></div>
              <div className="screenshot-item"></div>
              <div className="screenshot-item"></div>
            </div>
          </div>
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
              {/* 背景网格 */}
              <path d="M 150 150 L 250 150 L 211.8 88.2 L 150 50 L 88.2 88.2 L 150 150" stroke="#E0E0E0" strokeWidth="2" fill="none" />
              <path d="M 150 150 L 200 150 L 180.9 116.1 L 150 100 L 119.1 116.1 L 150 150" stroke="#E0E0E0" strokeWidth="2" fill="none" />
              <path d="M 150 150 L 175 150 L 165.4 133 L 150 125 L 134.6 133 L 150 150" stroke="#E0E0E0" strokeWidth="2" fill="none" />
              
              {/* 数据区域 */}
              <path d={generateRadarPath()} fill="rgba(33, 150, 243, 0.3)" stroke="#2196F3" strokeWidth="3" />
              
              {/* 维度标签 */}
              <text x="270" y="155" textAnchor="middle" fill="#2F4F4F" fontSize="14">表达</text>
              <text x="221.8" y="70" textAnchor="middle" fill="#2F4F4F" fontSize="14">逻辑</text>
              <text x="150" y="30" textAnchor="middle" fill="#2F4F4F" fontSize="14">创造</text>
              <text x="78.2" y="70" textAnchor="middle" fill="#2F4F4F" fontSize="14">反应</text>
            </svg>
          </div>
          <p className="chart-note">每个维度满分10分，数值越高，兴趣倾向越强。</p>
        </div>
        
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