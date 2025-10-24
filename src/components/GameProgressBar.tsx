import React from 'react';

interface GameProgressBarProps {
  currentPage: 'welcome' | 'interactive' | 'report';
  currentGameType?: 'storytelling' | 'pattern' | 'drawing' | 'animalClick' | 'imagination';
  isGameCompleted?: boolean;
}

const GameProgressBar: React.FC<GameProgressBarProps> = ({ 
  currentPage, 
  currentGameType, 
  isGameCompleted 
}) => {
  // 定义游戏阶段
  const gameStages = [
    { key: 'storytelling', name: '故事创作', icon: '📖' },
    { key: 'pattern', name: '逻辑推理', icon: '🧩' },
    { key: 'animalClick', name: '反应测试', icon: '🐾' },
    { key: 'imagination', name: '想象力', icon: '✨' },
    { key: 'drawing', name: '创意绘画', icon: '🎨' }
  ];

  // 计算当前进度
  const getCurrentProgress = () => {
    if (currentPage === 'welcome') return 0;
    if (currentPage === 'report') return 100;
    
    if (currentPage === 'interactive' && currentGameType) {
      const currentIndex = gameStages.findIndex(stage => stage.key === currentGameType);
      if (currentIndex === -1) return 0;
      
      // 如果当前游戏已完成，进度为下一个阶段的起始点
      if (isGameCompleted) {
        return ((currentIndex + 1) / gameStages.length) * 100;
      }
      
      // 如果当前游戏进行中，进度为当前阶段的中点
      return ((currentIndex + 0.5) / gameStages.length) * 100;
    }
    
    return 0;
  };

  const progress = getCurrentProgress();

  // 获取当前阶段状态
  const getStageStatus = (stageKey: string) => {
    if (currentPage === 'welcome') return 'pending';
    if (currentPage === 'report') return 'completed';
    
    if (currentPage === 'interactive' && currentGameType) {
      const currentIndex = gameStages.findIndex(stage => stage.key === currentGameType);
      const stageIndex = gameStages.findIndex(stage => stage.key === stageKey);
      
      if (stageIndex < currentIndex) return 'completed';
      if (stageIndex === currentIndex) {
        return isGameCompleted ? 'completed' : 'active';
      }
      return 'pending';
    }
    
    return 'pending';
  };

  return (
    <div className="game-progress-bar">
      <div className="progress-header">
        <h3 className="progress-title">🎯 天赋探索之旅</h3>
        <div className="progress-percentage">{Math.round(progress)}%</div>
      </div>
      
      <div className="progress-track">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="progress-stages">
        {gameStages.map((stage, index) => {
          const status = getStageStatus(stage.key);
          return (
            <div 
              key={stage.key} 
              className={`progress-stage ${status}`}
              style={{ left: `${(index / (gameStages.length - 1)) * 100}%` }}
            >
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameProgressBar;