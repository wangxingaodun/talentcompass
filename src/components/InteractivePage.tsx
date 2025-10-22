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
  const { recordMetric } = useAppContext();
  // 游戏状态管理
  const [currentGame, setCurrentGame] = useState<GameState>({
    type: 'storytelling',
    currentStep: 1,
    isCompleted: false
  });
  const [storyInput, setStoryInput] = useState('');
  const [patternAnswer, setPatternAnswer] = useState<string | null>(null);
  const [patternResult, setPatternResult] = useState<'correct' | 'incorrect' | null>(null);
  const [animalCount, setAnimalCount] = useState(0);
  // 移除绘画本地计时，统一由 DrawingGame 控制
  // const [drawingTime, setDrawingTime] = useState(60);
  const [animalClickTime, setAnimalClickTime] = useState(10);
  const [imaginationInput, setImaginationInput] = useState('');
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [prompt, setPrompt] = useState('准备好了吗？让我们开始吧！');
  
  // AI小老师相关状态
  const [gameProgress, setGameProgress] = useState(0);
  const [lastPerformance, setLastPerformance] = useState<'excellent' | 'good' | 'needs_improvement' | undefined>(undefined);
  
  // 录音功能相关状态
  const [recognitionActive, setRecognitionActive] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingIntervalRef = useRef<number | null>(null);
  const animalIntervalRef = useRef<number | null>(null);
  
  const [storyStartTime, setStoryStartTime] = useState<number>(Date.now());
  const [patternStartTime, setPatternStartTime] = useState<number>(0);
  const [imaginationStartTime, setImaginationStartTime] = useState<number>(0);
  
  // 获取当前游戏的提示信息
  const getTeacherMessage = () => {
    switch (currentGame.type) {
      case 'storytelling':
        return `${childName}，小兔子遇到了谁呢？用一句话告诉我！`;
      case 'pattern':
        return "你能找出规律，选出正确的颜色吗？";
      case 'drawing':
        return "发挥你的想象力，画出你喜欢的东西吧！";
      case 'animalClick':
        return `在${animalClickTime}秒内，尽可能多地点击小动物！`;
      case 'imagination':
        return "把‘云+鞋’组合起来，会发生什么有趣的事情呢？";
      default:
        return "准备好了吗？让我们开始吧！";
    }
  };
  
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
        setRecognitionActive(true);
      };
      
      newRecognition.onend = () => {
        setRecognitionActive(false);
        // 自动提交如果有内容
        if (storyInput.trim()) {
          setTimeout(() => {
            handleStorySubmit();
          }, 1000);
        }
      };
      
      setRecognition(newRecognition);
    }
  }, [storyInput]);
  
  // 开始语音识别
  const startVoiceRecognition = () => {
    if (recognition) {
      try {
        recognition.start();
      } catch (error) {
        console.error('语音识别启动失败:', error);
      }
    }
  };
  
  // 停止语音识别
  const stopVoiceRecognition = () => {
    if (recognition) {
      recognition.stop();
    }
  };
  
  // 语音播放功能
  const playVoiceStory = () => {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance();
      speech.text = `从前，有一只小兔子...${childName}，小兔子遇到了谁呢？`;
      speech.lang = 'zh-CN';
      speech.volume = 1;
      speech.rate = 1;
      speech.pitch = 1;
      
      speech.onstart = () => {
        setIsPlayingVoice(true);
      };
      
      speech.onend = () => {
        setIsPlayingVoice(false);
      };
      
      speechSynthesis.speak(speech);
    }
  };
  
  // 进入不同关卡时记录起始时间
  React.useEffect(() => {
    if (currentGame.type === 'storytelling') {
      setStoryStartTime(Date.now());
    } else if (currentGame.type === 'pattern') {
      setPatternStartTime(Date.now());
    } else if (currentGame.type === 'imagination') {
      setImaginationStartTime(Date.now());
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
  
  // 选择图形密码答案
  const handlePatternSelect = (color: string) => {
    setPatternAnswer(color);
    const isCorrect = color === 'blue';
    setPatternResult(isCorrect ? 'correct' : 'incorrect');
    const latencyMs = Date.now() - patternStartTime;
    recordMetric('logic', { correct: isCorrect ? 1 : 0, attempts: 1, avgLatencyMs: latencyMs });
    if (isCorrect) {
      setCurrentGame(prev => ({ ...prev, isCompleted: true }));
      setTimeout(() => {
        setCurrentGame({ type: 'drawing', currentStep: 3, isCompleted: false });
        setPatternAnswer(null);
        setPatternResult(null);
        // 移除 startDrawingTimer，改由 DrawingGame 内部完成倒计时与完成回调
      }, 1600);
    }
  };
  
  // 开始绘画计时器（已废弃）
  // const startDrawingTimer = () => {
  //   setDrawingTime(60);
  //   if (drawingIntervalRef.current) {
  //     clearInterval(drawingIntervalRef.current);
  //   }
  //   drawingIntervalRef.current = setInterval(() => {
  //     setDrawingTime(prevTime => {
  //       if (prevTime <= 1) {
  //         if (drawingIntervalRef.current) {
  //           clearInterval(drawingIntervalRef.current);
  //         }
  //         setCurrentGame(prev => ({ ...prev, isCompleted: true }));
  //         recordMetric('creativity', { activeMs: 60000, colorsUsed: 0, shapesUsed: 0 });
  //         setTimeout(() => {
  //           setCurrentGame({ type: 'animalClick', currentStep: 4, isCompleted: false });
  //           startAnimalClickGame();
  //         }, 1000);
  //         return 0;
  //       }
  //       return prevTime - 1;
  //     });
  //   }, 1000);
  // };
  
  // 开始小动物点击游戏
  const startAnimalClickGame = () => {
    setAnimalCount(0);
    setAnimalClickTime(10);
    
    if (animalIntervalRef.current) {
      clearInterval(animalIntervalRef.current);
    }
    
    const start = Date.now();
    
    animalIntervalRef.current = setInterval(() => {
      setAnimalClickTime(prevTime => {
        if (prevTime <= 1) {
          if (animalIntervalRef.current) {
            clearInterval(animalIntervalRef.current);
          }
          const totalMs = Date.now() - start;
          const avgLatencyMs = animalCount > 0 ? Math.floor(totalMs / animalCount) : 0;
          // 记录反应指标
          recordMetric('reaction', { hits: animalCount, mistakes: 0, avgLatencyMs, totalMs });
          // 跳转到第5关
          setTimeout(() => {
            setCurrentGame({ type: 'imagination', currentStep: 5, isCompleted: false });
          }, 1200);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };
  
  // 处理动物点击
  const handleAnimalClick = () => {
    setAnimalCount(prevCount => prevCount + 1);
  };
  
  // 提交想象关卡
  const handleImaginationSubmit = () => {
    const text = imaginationInput.trim();
    if (!text) return;
    const charCount = text.length;
    const uniqueCharCount = new Set(text.split('')).size;
    const noveltyScore = Math.min(10, (uniqueCharCount / Math.max(1, charCount)) * 10);
    const consistencyScore = Math.min(10, Math.max(3, text.includes('因为') ? 8 : 6));
    const latencyMs = Date.now() - imaginationStartTime;
    recordMetric('imagination', { charCount, noveltyScore, consistencyScore, latencyMs });

    setCurrentGame(prev => ({ ...prev, isCompleted: true }));
    setTimeout(() => {
      onComplete();
    }, 1200);
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
        'storytelling': 20,
        'pattern': 40,
        'drawing': 60,
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
            setCurrentGame({ type: 'animalClick', currentStep: 4, isCompleted: false });
            break;
          case 'animalClick':
            setCurrentGame({ type: 'imagination', currentStep: 5, isCompleted: false });
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
        <div className="panel padded gradient-border">
          <div className="fade-switch">
            {renderCurrentGame()}
          </div>
        </div>
        
        {/* AI小老师区域 */}
        <div>
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