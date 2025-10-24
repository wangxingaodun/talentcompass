import React from 'react';

interface ReportPage1Props {
  childName: string;
  testDate: string;
  scores: {
    expression: number;
    logic: number;
    creativity: number;
    imagination: number;
    reaction: number;
  };
  talentType: string;
  talentDescription: string;
}

const ReportPage1: React.FC<ReportPage1Props> = ({
  childName,
  testDate,
  scores,
  talentType,
  talentDescription
}) => {
  // 确保评分在0-100范围内
  const normalizeScore = (score: number): number => {
    return Math.max(0, Math.min(100, score));
  };

  // 获取标准化后的评分
  const normalizedScores = {
    expression: normalizeScore(scores.expression),
    logic: normalizeScore(scores.logic),
    creativity: normalizeScore(scores.creativity),
    imagination: normalizeScore(scores.imagination),
    reaction: normalizeScore(scores.reaction),
  };

  // 生成五维雷达图的路径
  const generateRadarPath = () => {
    const centerX = 150;
    const centerY = 150;
    const radius = 100;
    const dims = [
      normalizedScores.expression,
      normalizedScores.logic,
      normalizedScores.creativity,
      normalizedScores.imagination,
      normalizedScores.reaction,
    ];
    // 五个角度（度）：0, 72, 144, 216, 288
    const angles = [0, 72, 144, 216, 288].map(a => (a * Math.PI) / 180);
    const points = angles.map((angle, i) => ({
      x: centerX + radius * Math.cos(angle) * (dims[i] / 100), // 改为百分制
      y: centerY - radius * Math.sin(angle) * (dims[i] / 100), // 改为百分制
    }));
    const path = `M ${points[0].x},${points[0].y} ` + points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ') + ' Z';
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
      case 'storyteller':
        return (
          <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="75" cy="50" r="30" fill="#87CEFA" />
            <rect x="45" y="80" width="60" height="40" rx="10" fill="#FFA500" />
            <circle cx="60" cy="100" r="5" fill="#2F4F4F" />
            <circle cx="90" cy="100" r="5" fill="#2F4F4F" />
            <path d="M55 120 Q75 135 95 120" stroke="#2F4F4F" strokeWidth="3" fill="none" />
            <path d="M30 70 Q75 40 120 70" stroke="#FFD700" strokeWidth="3" fill="none" />
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
    <div className="report-page-content">
      {/* 报告封面 */}
      <div className="report-cover">
        <h1 className="report-title">{childName} 的天赋探索报告</h1>
        <p className="report-subtitle">由高小吉老师生成 · {testDate}</p>
      </div>
      
      {/* 天赋类型 */}
      <div className="talent-section">
        <h2>🎯 你是哪种小天才？</h2>
        <div className="talent-content">
          <div className="talent-image">
            {getTalentImage()}
          </div>
          <div className="talent-description">
            <div className="talent-type-badge">
              {talentType === 'inventor' && '🔧 发明家'}
              {talentType === 'artist' && '🎨 艺术家'}
              {talentType === 'scientist' && '🔬 科学家'}
              {talentType === 'explorer' && '🗺️ 探险家'}
              {talentType === 'storyteller' && '📚 故事家'}
              {!['inventor', 'artist', 'scientist', 'explorer', 'storyteller'].includes(talentType) && '🌟 小天才'}
            </div>
            <p className="talent-desc-text">{talentDescription}</p>
          </div>
        </div>
      </div>
      
      {/* 兴趣能量图 */}
      <div className="energy-section">
        <h2>⚡ 天赋雷达图</h2>
        <div className="radar-chart-container">
          <div className="radar-chart">
            <svg width="400" height="400" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* 网格线 */}
              <g className="radar-grid">
                <path d="M 250 150 L 181.4 90.5 L 118.6 109.5 L 118.6 190.5 L 181.4 209.5 Z" stroke="#E0E0E0" strokeWidth="2" fill="none" />
                <path d="M 225 150 L 190.0 116.2 L 150.0 125.0 L 150.0 175.0 L 190.0 183.8 Z" stroke="#E0E0E0" strokeWidth="2" fill="none" />
                <path d="M 200 150 L 172.1 129.4 L 137.5 137.5 L 137.5 162.5 L 172.1 170.6 Z" stroke="#E0E0E0" strokeWidth="2" fill="none" />
              </g>
              
              {/* 数据区域 */}
              <path d={generateRadarPath()} fill="rgba(33, 150, 243, 0.3)" stroke="#2196F3" strokeWidth="3" />
              
              {/* 维度标签 */}
              <text x="270" y="155" textAnchor="middle" fill="#2F4F4F" fontSize="14" fontWeight="bold">表达</text>
              <text x="215" y="75" textAnchor="middle" fill="#2F4F4F" fontSize="14" fontWeight="bold">逻辑</text>
              <text x="95" y="75" textAnchor="middle" fill="#2F4F4F" fontSize="14" fontWeight="bold">创造</text>
              <text x="35" y="155" textAnchor="middle" fill="#2F4F4F" fontSize="14" fontWeight="bold">想象</text>
              <text x="150" y="265" textAnchor="middle" fill="#2F4F4F" fontSize="14" fontWeight="bold">反应</text>
              
              {/* 分数显示 */}
              <circle cx="250" cy="150" r="18" fill="#2196F3" opacity="0.9" />
              <text x="250" y="155" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">{normalizedScores.expression}</text>
              
              <circle cx="181.4" cy="90.5" r="18" fill="#2196F3" opacity="0.9" />
              <text x="181.4" y="95.5" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">{normalizedScores.logic}</text>
              
              <circle cx="118.6" cy="109.5" r="18" fill="#2196F3" opacity="0.9" />
              <text x="118.6" y="114.5" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">{normalizedScores.creativity}</text>
              
              <circle cx="118.6" cy="190.5" r="18" fill="#2196F3" opacity="0.9" />
              <text x="118.6" y="195.5" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">{normalizedScores.imagination}</text>
              
              <circle cx="181.4" cy="209.5" r="18" fill="#2196F3" opacity="0.9" />
              <text x="181.4" y="214.5" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">{normalizedScores.reaction}</text>
            </svg>
          </div>
          <div className="chart-legend">
            <p className="chart-note">每个维度满分100分，数值越高，兴趣倾向越强。</p>
            <div className="score-summary">
              <div className="score-item">
                <div className="score-header">
                  <span className="score-label">🗣️ 表达能力</span>
                  <span className="score-value">{normalizedScores.expression}/100</span>
                </div>
                <div className="score-bar">
                  <div 
                    className="score-fill" 
                    style={{ 
                      width: `${normalizedScores.expression}%`,
                      backgroundColor: normalizedScores.expression >= 80 ? '#4CAF50' : 
                                     normalizedScores.expression >= 60 ? '#FF9800' : '#F44336'
                    }}
                  ></div>
                </div>
              </div>
              <div className="score-item">
                <div className="score-header">
                  <span className="score-label">🧠 逻辑思维</span>
                  <span className="score-value">{normalizedScores.logic}/100</span>
                </div>
                <div className="score-bar">
                  <div 
                    className="score-fill" 
                    style={{ 
                      width: `${normalizedScores.logic}%`,
                      backgroundColor: normalizedScores.logic >= 80 ? '#4CAF50' : 
                                     normalizedScores.logic >= 60 ? '#FF9800' : '#F44336'
                    }}
                  ></div>
                </div>
              </div>
              <div className="score-item">
                <div className="score-header">
                  <span className="score-label">🎨 创造力</span>
                  <span className="score-value">{normalizedScores.creativity}/100</span>
                </div>
                <div className="score-bar">
                  <div 
                    className="score-fill" 
                    style={{ 
                      width: `${normalizedScores.creativity}%`,
                      backgroundColor: normalizedScores.creativity >= 80 ? '#4CAF50' : 
                                     normalizedScores.creativity >= 60 ? '#FF9800' : '#F44336'
                    }}
                  ></div>
                </div>
              </div>
              <div className="score-item">
                <div className="score-header">
                  <span className="score-label">💭 想象力</span>
                  <span className="score-value">{normalizedScores.imagination}/100</span>
                </div>
                <div className="score-bar">
                  <div 
                    className="score-fill" 
                    style={{ 
                      width: `${normalizedScores.imagination}%`,
                      backgroundColor: normalizedScores.imagination >= 80 ? '#4CAF50' : 
                                     normalizedScores.imagination >= 60 ? '#FF9800' : '#F44336'
                    }}
                  ></div>
                </div>
              </div>
              <div className="score-item">
                <div className="score-header">
                  <span className="score-label">⚡ 反应速度</span>
                  <span className="score-value">{normalizedScores.reaction}/100</span>
                </div>
                <div className="score-bar">
                  <div 
                    className="score-fill" 
                    style={{ 
                      width: `${normalizedScores.reaction}%`,
                      backgroundColor: normalizedScores.reaction >= 80 ? '#4CAF50' : 
                                     normalizedScores.reaction >= 60 ? '#FF9800' : '#F44336'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage1;