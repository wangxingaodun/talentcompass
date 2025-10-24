import React from 'react';
import type { GameStageProps, GameStageResult } from './types';
import '../../styles/pattern.css';
import PatternGame1 from './PatternGame1';
import PatternGame2 from './PatternGame2';
import PatternGame3 from './PatternGame3';
import PatternGame4 from './PatternGame4';

// 逻辑题主组件，包含四个小题
const PatternGame: React.FC<GameStageProps> = ({ childName, setPrompt, onComplete }) => {
  const [currentSubStep, setCurrentSubStep] = React.useState<1 | 2 | 3 | 4>(1);
  const [subStepResults, setSubStepResults] = React.useState<GameStageResult[]>([]);

  // 处理单个小题完成
  const handleSubStepComplete = (result: GameStageResult) => {
    const newResults = [...subStepResults, result];
    setSubStepResults(newResults);

    if (currentSubStep < 4) {
      // 继续下一个小题
      setCurrentSubStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    } else {
      // 所有小题完成,汇总结果
      const totalCorrect = newResults.reduce((sum, r) => {
        const metrics = r.metrics as Record<string, number>;
        return sum + (metrics.correct || 0);
      }, 0);
      const totalAttempts = newResults.reduce((sum, r) => {
        const metrics = r.metrics as Record<string, number>;
        return sum + (metrics.attempts || 0);
      }, 0);
      const avgLatency = newResults.reduce((sum, r) => {
        const metrics = r.metrics as Record<string, number>;
        return sum + (metrics.avgLatencyMs || 0);
      }, 0) / newResults.length;

      const finalResult: GameStageResult = {
        dimension: 'logic',
        metrics: {
          correct: totalCorrect,
          attempts: totalAttempts,
          avgLatencyMs: avgLatency
        }
      };

      onComplete(finalResult);
    }
  };

  // 根据当前子步骤渲染对应的小题
  const renderCurrentSubStep = () => {
    switch (currentSubStep) {
      case 1:
        return <PatternGame1 childName={childName} setPrompt={setPrompt} onComplete={handleSubStepComplete} />;
      case 2:
        return <PatternGame2 childName={childName} setPrompt={setPrompt} onComplete={handleSubStepComplete} />;
      case 3:
        return <PatternGame3 childName={childName} setPrompt={setPrompt} onComplete={handleSubStepComplete} />;
      case 4:
        return <PatternGame4 childName={childName} setPrompt={setPrompt} onComplete={handleSubStepComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="pattern-game-container">
      <div className="substep-indicator">
        <span className="substep-text">逻辑题 - 第 {currentSubStep} 题/共 4 题</span>
      </div>
      {renderCurrentSubStep()}
    </div>
  );
};

export default PatternGame;