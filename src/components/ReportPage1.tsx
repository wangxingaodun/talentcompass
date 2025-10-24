import React from 'react';
import { useAppContext } from './AppContext';
import type { StoryAssessment } from './games/types';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';

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
  storyAssessment?: StoryAssessment;
}

const ReportPage1: React.FC<ReportPage1Props> = ({
  childName,
  testDate,
  scores,
  talentType,
  talentDescription,
  storyAssessment
}) => {
  const { state } = useAppContext();
  
  // 计算反应速度游戏的综合评分（与ReportPage4中的计算逻辑一致）
  const clamp = (value: number, min: number = 0, max: number = 100) => Math.max(min, Math.min(max, value));
  
  const reactionMetrics = state.metrics.reaction;
  const hitCountScore = clamp(Math.min(reactionMetrics.hits / 15 * 100, 100));
  const avgReactionTime = reactionMetrics.avgLatencyMs;
  const speedScore = clamp(Math.max(0, 100 - avgReactionTime / 15));
  const totalAttempts = reactionMetrics.hits + reactionMetrics.mistakes;
  const accuracy = totalAttempts > 0 ? reactionMetrics.hits / totalAttempts : 0;
  const accuracyScore = clamp(accuracy * 100);
  const attentionScore = clamp(hitCountScore * 0.6 + accuracyScore * 0.4);
  
  const overallScore = clamp(Math.round(speedScore * 0.4 + accuracyScore * 0.4 + attentionScore * 0.2));
  
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
  
  // 获取想象力评估分数
  const imaginationScore = state.imaginationAssessment?.score || normalizedScores.imagination;
  
  // 计算逻辑思维分数（与StoryReportPage中的计算逻辑一致）
  const logicScorePercent = Math.round(Math.max(0, Math.min(100, (state.scores?.logic || 0) * 10)));

  // 雷达图数据
  const radarData = [
    {
      subject: '表达能力',
      A: storyAssessment?.score || normalizedScores.expression,
      fullMark: 100
    },
    {
      subject: '逻辑思维',
      A: logicScorePercent,
      fullMark: 100
    },
    {
      subject: '创造力',
      A: normalizedScores.creativity,
      fullMark: 100
    },
    {
      subject: '想象力',
      A: imaginationScore,
      fullMark: 100
    },
    {
      subject: '反应速度',
      A: overallScore,
      fullMark: 100
    }
  ];



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
          <div className="radar-chart" style={{ width: '100%', height: '500px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 20, right: 60, bottom: 20, left: 60 }}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#667eea" stopOpacity={0.8}/>
                    <stop offset="50%" stopColor="#764ba2" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="#f093fb" stopOpacity={0.4}/>
                  </linearGradient>
                  <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#667eea" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="#f093fb" stopOpacity={0.1}/>
                  </radialGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <PolarGrid 
                  stroke="#e2e8f0" 
                  strokeWidth={1.5}
                  radialLines={true}
                  gridType="polygon"
                />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ 
                    fontSize: 14, 
                    fontWeight: '600',
                    fill: '#475569',
                    textAnchor: 'middle'
                  }}
                  tickFormatter={(value) => value}
                  radius={120}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ 
                    fontSize: 12, 
                    fill: '#94a3b8',
                    fontWeight: '500'
                  }}
                  tickCount={5}
                  axisLine={false}
                />
                <Radar
                  name="能力值"
                  dataKey="A"
                  stroke="#667eea"
                  fill="url(#radarFill)"
                  strokeWidth={5}
                  dot={{ 
                    fill: '#667eea', 
                    strokeWidth: 4, 
                    stroke: '#ffffff',
                    r: 10,
                    filter: 'url(#glow)'
                  }}
                  fillOpacity={0.5}
                  animationBegin={0}
                  animationDuration={1500}
                  isAnimationActive={true}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-legend">
            <p className="chart-note">每个维度满分100分，数值越高，兴趣倾向越强。</p>
            <div className="score-summary">
              <div className="score-item">
                <div className="score-header">
                  <span className="score-label">🗣️ 表达能力</span>
                  <span className="score-value">{storyAssessment?.score}/100</span>
                </div>
                <div className="score-bar">
                  <div 
                    className="score-fill" 
                    style={{ 
                      width: `${storyAssessment?.score}%`,
                      backgroundColor: normalizedScores.expression >= 80 ? '#4CAF50' : 
                                     normalizedScores.expression >= 60 ? '#FF9800' : '#F44336'
                    }}
                  ></div>
                </div>
              </div>
              <div className="score-item">
                <div className="score-header">
                  <span className="score-label">🧠 逻辑思维</span>
                  <span className="score-value">{logicScorePercent}/100</span>
                </div>
                <div className="score-bar">
                  <div 
                    className="score-fill" 
                    style={{ 
                      width: `${logicScorePercent}%`,
                      backgroundColor: logicScorePercent >= 80 ? '#4CAF50' : 
                                     logicScorePercent >= 60 ? '#FF9800' : '#F44336'
                    }}
                  ></div>
                </div>
              </div>

              <div className="score-item">
                <div className="score-header">
                  <span className="score-label">💭 想象力</span>
                  <span className="score-value">{imaginationScore}/100</span>
                </div>
                <div className="score-bar">
                  <div 
                    className="score-fill" 
                    style={{ 
                      width: `${imaginationScore}%`,
                      backgroundColor: imaginationScore >= 80 ? '#4CAF50' : 
                                     imaginationScore >= 60 ? '#FF9800' : '#F44336'
                    }}
                  ></div>
                </div>
              </div>
              <div className="score-item">
                <div className="score-header">
                  <span className="score-label">⚡ 反应速度</span>
                  <span className="score-value">{overallScore}/100</span>
                </div>
                <div className="score-bar">
                  <div 
                    className="score-fill" 
                    style={{ 
                      width: `${overallScore}%`,
                      backgroundColor: overallScore >= 80 ? '#4CAF50' : 
                                     overallScore >= 60 ? '#FF9800' : '#F44336'
                    }}
                  ></div>
                </div>
              </div>

               <div className="score-item">
                              <div className="score-header">
                                <span className="score-label">🎨 创造力</span>
                                <span className="score-value">{imaginationScore}/100</span>
                              </div>
                              <div className="score-bar">
                                <div
                                  className="score-fill"
                                  style={{
                                    width: `${imaginationScore}%`,
                                    backgroundColor: imaginationScore >= 80 ? '#4CAF50' :
                                                   imaginationScore >= 60 ? '#FF9800' : '#F44336'
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