import React, { useState, useRef } from 'react';
import { useAppContext } from './AppContext';
import SmartTeacher from './SmartTeacher';
import StorytellingGame from './games/StorytellingGame';
import PatternGame from './games/PatternGame';
import DrawingGame from './games/DrawingGame';
import AnimalClickGame from './games/AnimalClickGame';
import ImaginationGame from './games/ImaginationGame';
import type { GameStageResult } from './games/types';

// 确保TypeScript识别浏览器API
declare const speechSynthesis: SpeechSynthesis;
declare const MediaRecorder: any;
declare const webkitSpeechRecognition: any;
declare const SpeechRecognition: any;

interface InteractivePageProps {
  onComplete: () => void;
  childName: string;
}

// 定义游戏类型和当前游戏状态
type GameType = 'storytelling' | 'pattern' | 'drawing' | 'animalClick' | 'imagination';
interface GameState {
  type: GameType;
  currentStep: number;
  isCompleted: boolean;
}

const InteractivePage: React.FC<InteractivePageProps> = ({ onComplete, childName }) => {
  const { recordMetric, setCurrentGameType, setGameCompleted } = useAppContext();
  // 游戏状态管理
  const [currentGame, setCurrentGame] = useState<GameState>({
    type: 'storytelling',
    currentStep: 1,
    isCompleted: false
  });
  const [storyInput, setStoryInput] = useState('');
  // 下面这些变量暂时未使用，添加下划线前缀避免TypeScript报错
  const [_patternAnswer, _setPatternAnswer] = useState<string | null>(null);
  const [_patternResult, _setPatternResult] = useState<'correct' | 'incorrect' | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_animalCount, _setAnimalCount] = useState(0);
  // 移除绘画本地计时，统一由 DrawingGame 控制
  // const [drawingTime, setDrawingTime] = useState(60);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_animalClickTime, _setAnimalClickTime] = useState(10);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_imaginationInput, _setImaginationInput] = useState('');
  const [_isPlayingVoice, _setIsPlayingVoice] = useState(false);
  const [prompt, setPrompt] = useState('准备好了吗？让我们开始吧！');
  
  // AI小老师相关状态
  const [gameProgress, setGameProgress] = useState(0);

  // 同步游戏状态到AppContext
  React.useEffect(() => {
    setCurrentGameType(currentGame.type);
    setGameCompleted(currentGame.isCompleted);
  }, [currentGame, setCurrentGameType, setGameCompleted]);
  const [lastPerformance, setLastPerformance] = useState<'excellent' | 'good' | 'needs_improvement' | undefined>(undefined);
  
  // 录音功能相关状态
  const [_recognitionActive, _setRecognitionActive] = useState(false);
  const [_recognition, _setRecognition] = useState<any>(null);
  const drawingIntervalRef = useRef<number | null>(null);
  const animalIntervalRef = useRef<number | null>(null);
  
  const [storyStartTime, setStoryStartTime] = useState<number>(Date.now());
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_patternStartTime, _setPatternStartTime] = useState<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_imaginationStartTime, _setImaginationStartTime] = useState<number>(0);
  

  
  // 初始化语音识别
  React.useEffect(() => {
    // 正确检测并访问SpeechRecognition API
    const browserWindow = window as any;
    const Recognition = browserWindow.webkitSpeechRecognition || browserWindow.SpeechRecognition;
    
    if (Recognition) {
      const newRecognition = new Recognition();
      newRecognition.continuous = false;
      newRecognition.interimResults = true;
      newRecognition.lang = 'zh-CN';
      
      newRecognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setStoryInput(transcript);
      };
      
      newRecognition.onstart = () => {
        _setRecognitionActive(true);
      };
      
      newRecognition.onend = () => {
        _setRecognitionActive(false);
        // 自动提交如果有内容 - 使用ref来避免依赖问题
        setTimeout(() => {
          const currentInput = document.querySelector('input[type="text"]') as HTMLInputElement;
          if (currentInput && currentInput.value.trim()) {
            handleStorySubmit();
          }
        }, 1000);
      };
      
      _setRecognition(newRecognition);
    }
  }, []); // 移除storyInput依赖，只在组件挂载时初始化一次
  
  // 进入不同关卡时记录起始时间
  React.useEffect(() => {
    if (currentGame.type === 'storytelling') {
      setStoryStartTime(Date.now());
    } else if (currentGame.type === 'pattern') {
      _setPatternStartTime(Date.now());
    } else if (currentGame.type === 'imagination') {
      _setImaginationStartTime(Date.now());
    }
  }, [currentGame.type]);
  
  // 提交故事接龙
  const handleStorySubmit = () => {
    if (storyInput.trim()) {
      // 记录表达指标
      const text = storyInput.trim();
      const charCount = text.length;
      const uniqueCharCount = new Set(text.split('')).size;
      const latencyMs = Date.now() - storyStartTime;
      recordMetric('expression', { charCount, uniqueCharCount, latencyMs });

      setCurrentGame(prev => ({ ...prev, isCompleted: true }));
      // 延迟跳转到下一个游戏
      setTimeout(() => {
        setCurrentGame({ type: 'pattern', currentStep: 2, isCompleted: false });
        setStoryInput('');
      }, 1200);
    }
  };
  
  // 渲染当前游戏（组件化）
  const renderCurrentGame = () => {
    const handleStageComplete = (result: GameStageResult) => {
      recordMetric(result.dimension as any, result.metrics);
      
      // AI小老师智能评估表现
      const evaluatePerformance = (metrics: any): 'excellent' | 'good' | 'needs_improvement' => {
        // 根据不同维度的指标进行智能评估
        switch (result.dimension) {
          case 'expression':
            const charCount = metrics.charCount || 0;
            const uniqueCharCount = metrics.uniqueCharCount || 0;
            if (charCount > 50 && uniqueCharCount > 20) return 'excellent';
            if (charCount > 20 && uniqueCharCount > 10) return 'good';
            return 'needs_improvement';
          
          case 'logic':
            const correct = metrics.correct || 0;
            const latency = metrics.avgLatencyMs || 10000;
            if (correct && latency < 5000) return 'excellent';
            if (correct && latency < 10000) return 'good';
            return 'needs_improvement';
          
          case 'creativity':
            const colorsUsed = metrics.colorsUsed || 0;
            const shapesUsed = metrics.shapesUsed || 0;
            if (colorsUsed > 3 && shapesUsed > 2) return 'excellent';
            if (colorsUsed > 1 && shapesUsed > 1) return 'good';
            return 'needs_improvement';
          
          case 'reaction':
            const hits = metrics.hits || 0;
            const avgLatency = metrics.avgLatencyMs || 2000;
            if (hits > 8 && avgLatency < 800) return 'excellent';
            if (hits > 5 && avgLatency < 1200) return 'good';
            return 'needs_improvement';
          
          case 'imagination':
            const noveltyScore = metrics.noveltyScore || 0;
            const consistencyScore = metrics.consistencyScore || 0;
            if (noveltyScore > 7 && consistencyScore > 7) return 'excellent';
            if (noveltyScore > 5 && consistencyScore > 5) return 'good';
            return 'needs_improvement';
          
          default:
            return 'good';
        }
      };
      
      // 设置表现反馈
      const performance = evaluatePerformance(result.metrics);
      setLastPerformance(performance);
      
      // 更新游戏进度
      const progressMap = {
        'storytelling': 12,
        'pattern': 36,
        'drawing': 64,
        'animalClick': 80,
        'imagination': 100
      };
      setGameProgress(progressMap[currentGame.type]);
      
      // 延迟关卡流转，给AI小老师时间反馈
      setTimeout(() => {
        setLastPerformance(undefined); // 清除表现状态
        
        // 关卡流转
        switch (currentGame.type) {
          case 'storytelling':
            setCurrentGame({ type: 'pattern', currentStep: 2, isCompleted: false });
            break;
          case 'pattern':
            setCurrentGame({ type: 'drawing', currentStep: 3, isCompleted: false });
            break;
          case 'drawing':
            setCurrentGame({ type: 'animalClick', currentStep: 6, isCompleted: false });
            break;
          case 'animalClick':
            setCurrentGame({ type: 'imagination', currentStep: 7, isCompleted: false });
            break;
          case 'imagination':
            onComplete();
            break;
          default:
            break;
        }
      }, 3000); // 给AI小老师3秒时间进行反馈
    };

    switch (currentGame.type) {
      case 'storytelling':
        return (
          <StorytellingGame childName={childName} setPrompt={setPrompt} onComplete={handleStageComplete} />
        );
      case 'pattern':
        return (
          <PatternGame childName={childName} setPrompt={setPrompt} onComplete={handleStageComplete} />
        );
      case 'drawing':
        return (
          <DrawingGame childName={childName} setPrompt={setPrompt} onComplete={handleStageComplete} />
        );
      case 'animalClick':
        return (
          <AnimalClickGame childName={childName} setPrompt={setPrompt} onComplete={handleStageComplete} />
        );
      case 'imagination':
        return (
          <ImaginationGame childName={childName} setPrompt={setPrompt} onComplete={handleStageComplete} />
        );
      default:
        return null;
    }
  };
  
  // 清理定时器
  React.useEffect(() => {
    return () => {
      if (drawingIntervalRef.current) {
        clearInterval(drawingIntervalRef.current);
      }
      if (animalIntervalRef.current) {
        clearInterval(animalIntervalRef.current);
      }
    };
  }, []);
  
  return (
    <div className="page-shell">
      <div className="page-grid">
        {/* 游戏区域 */}
        <div className="panel padded seamless">
          <div className="fade-switch">
            {renderCurrentGame()}
          </div>
        </div>
        
        {/* AI小老师区域 */}
        <div className="panel padded seamless">
          <SmartTeacher
            childName={childName}
            currentDimension={currentGame.type === 'storytelling' ? 'expression' : 
                            currentGame.type === 'pattern' ? 'logic' :
                            currentGame.type === 'drawing' ? 'creativity' :
                            currentGame.type === 'animalClick' ? 'reaction' : 'imagination'}
            prompt={prompt}
            onPromptChange={setPrompt}
            gameProgress={gameProgress}
            lastPerformance={lastPerformance}
          />
        </div>
      </div>
    </div>
  );
};

export default InteractivePage;