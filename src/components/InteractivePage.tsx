import React, { useState, useRef } from 'react';

interface InteractivePageProps {
  onComplete: () => void;
  childName: string;
}

// 定义游戏类型和当前游戏状态
type GameType = 'storytelling' | 'pattern' | 'drawing' | 'animalClick';
interface GameState {
  type: GameType;
  currentStep: number;
  isCompleted: boolean;
}

const InteractivePage: React.FC<InteractivePageProps> = ({ onComplete }) => {
  // 游戏状态管理
  const [currentGame, setCurrentGame] = useState<GameState>({
    type: 'storytelling',
    currentStep: 1,
    isCompleted: false
  });
  const [storyInput, setStoryInput] = useState('');
  const [patternAnswer, setPatternAnswer] = useState<string | null>(null);
  const [patternResult, setPatternResult] = useState<'correct' | 'incorrect' | null>(null);
  // 可以在后续版本中使用这个状态来存储绘画名称
  const [animalCount, setAnimalCount] = useState(0);
  const [drawingTime, setDrawingTime] = useState(60);
  const [animalClickTime, setAnimalClickTime] = useState(10);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingIntervalRef = useRef<number | null>(null);
  const animalIntervalRef = useRef<number | null>(null);
  
  // 获取当前游戏的提示信息
  const getTeacherMessage = () => {
    switch (currentGame.type) {
      case 'storytelling':
        return "小兔子遇到了谁呢？用一句话告诉我！";
      case 'pattern':
        return "你能找出规律，选出正确的颜色吗？";
      case 'drawing':
        return "发挥你的想象力，画出你喜欢的东西吧！";
      case 'animalClick':
        return `在${animalClickTime}秒内，尽可能多地点击小动物！`;
      default:
        return "准备好了吗？让我们开始吧！";
    }
  };
  
  // 提交故事接龙
  const handleStorySubmit = () => {
    if (storyInput.trim()) {
      setCurrentGame(prev => ({ ...prev, isCompleted: true }));
      // 延迟跳转到下一个游戏
      setTimeout(() => {
        setCurrentGame({ type: 'pattern', currentStep: 2, isCompleted: false });
        setStoryInput('');
      }, 1500);
    }
  };
  
  // 选择图形密码答案
  const handlePatternSelect = (color: string) => {
    setPatternAnswer(color);
    // 模拟正确答案判断（实际应用中应该有真实的答案验证）
    const isCorrect = color === 'blue';
    setPatternResult(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
      setCurrentGame(prev => ({ ...prev, isCompleted: true }));
      // 延迟跳转到下一个游戏
      setTimeout(() => {
        setCurrentGame({ type: 'drawing', currentStep: 3, isCompleted: false });
        setPatternAnswer(null);
        setPatternResult(null);
        startDrawingTimer();
      }, 2000);
    }
  };
  
  // 开始绘画计时器
  const startDrawingTimer = () => {
    setDrawingTime(60);
    if (drawingIntervalRef.current) {
      clearInterval(drawingIntervalRef.current);
    }
    
    drawingIntervalRef.current = setInterval(() => {
      setDrawingTime(prevTime => {
        if (prevTime <= 1) {
          if (drawingIntervalRef.current) {
            clearInterval(drawingIntervalRef.current);
          }
          setCurrentGame(prev => ({ ...prev, isCompleted: true }));
          // 显示绘画名称输入框
          setTimeout(() => {
            setCurrentGame({ type: 'animalClick', currentStep: 4, isCompleted: false });
            startAnimalClickGame();
          }, 1000);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };
  
  // 开始小动物点击游戏
  const startAnimalClickGame = () => {
    setAnimalCount(0);
    setAnimalClickTime(10);
    
    if (animalIntervalRef.current) {
      clearInterval(animalIntervalRef.current);
    }
    
    animalIntervalRef.current = setInterval(() => {
      setAnimalClickTime(prevTime => {
        if (prevTime <= 1) {
          if (animalIntervalRef.current) {
            clearInterval(animalIntervalRef.current);
          }
          // 判断是否达到目标（10秒内点中5个）
          if (animalCount >= 5) {
            setCurrentGame(prev => ({ ...prev, isCompleted: true }));
            // 延迟跳转到报告页
            setTimeout(() => {
              onComplete();
            }, 1500);
          } else {
            // 重新开始此游戏
            setAnimalCount(0);
            setAnimalClickTime(10);
          }
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
  
  // 渲染当前游戏
  const renderCurrentGame = () => {
    switch (currentGame.type) {
      case 'storytelling':
        return (
          <div className="storytelling-game">
            <p className="story-prompt">从前，有一只小兔子...</p>
            <input
              type="text"
              className="story-input"
              value={storyInput}
              onChange={(e) => setStoryInput(e.target.value)}
              placeholder="请继续讲述这个故事..."
            />
            <button 
              className="submit-button"
              onClick={handleStorySubmit}
              disabled={!storyInput.trim()}
            >
              提交
            </button>
          </div>
        );
        
      case 'pattern':
        return (
          <div className="pattern-game">
            <div className="pattern-grid">
              <div className="pattern-cell red"></div>
              <div className="pattern-cell blue"></div>
              <div className="pattern-cell red"></div>
              <div className="pattern-cell blue"></div>
              <div className="pattern-cell question">?</div>
            </div>
            <div className="pattern-options">
              <button 
                className={`color-option red ${patternAnswer === 'red' ? 'selected' : ''}`}
                onClick={() => handlePatternSelect('red')}
                disabled={patternResult !== null}
              ></button>
              <button 
                className={`color-option blue ${patternAnswer === 'blue' ? 'selected' : ''}`}
                onClick={() => handlePatternSelect('blue')}
                disabled={patternResult !== null}
              ></button>
              <button 
                className={`color-option yellow ${patternAnswer === 'yellow' ? 'selected' : ''}`}
                onClick={() => handlePatternSelect('yellow')}
                disabled={patternResult !== null}
              ></button>
            </div>
            {patternResult === 'correct' && <p className="pattern-feedback correct">太棒了！</p>}
            {patternResult === 'incorrect' && <p className="pattern-feedback incorrect">再试一次！</p>}
          </div>
        );
        
      case 'drawing':
        return (
          <div className="drawing-game">
            <div className="drawing-toolbar">
              <button className="tool-button">✏️ 铅笔</button>
              <button className="tool-button">⭕ 圆形</button>
              <button className="tool-button">⬜ 方形</button>
              <div className="color-palette">
                <button className="color-swatch red"></button>
                <button className="color-swatch blue"></button>
                <button className="color-swatch yellow"></button>
              </div>
            </div>
            <div className="drawing-canvas-container">
              <canvas 
                ref={canvasRef}
                className="drawing-canvas"
                width={400}
                height={300}
              ></canvas>
            </div>
            <div className="drawing-timer">剩余时间：{drawingTime}秒</div>
          </div>
        );
        
      case 'animalClick':
        return (
          <div className="animal-click-game">
            <div className="animal-field">
              {/* 随机生成的动物元素 - 这里简单模拟 */}
              <div className="animal-item" onClick={handleAnimalClick}></div>
              <div className="animal-item" onClick={handleAnimalClick}></div>
              <div className="animal-item" onClick={handleAnimalClick}></div>
            </div>
            <div className="animal-stats">
              <p>已点击：{animalCount}/5 个小动物</p>
              <p>剩余时间：{animalClickTime}秒</p>
            </div>
          </div>
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
    <div className="interactive-page">
      <div className="game-area">
        {renderCurrentGame()}
      </div>
      <div className="teacher-area">
        <div className="teacher-character">
          {/* 虚拟老师形象 - 使用占位图 */}
          <svg width="150" height="180" viewBox="0 0 150 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="75" cy="60" r="40" fill="#FFA07A" />
            <path d="M40 140 Q75 80 110 140" stroke="#2F4F4F" strokeWidth="6" fill="none" />
            <path d="M45 140 L35 180" stroke="#2F4F4F" strokeWidth="4" />
            <path d="M105 140 L115 180" stroke="#2F4F4F" strokeWidth="4" />
            <circle cx="60" cy="50" r="5" fill="#2F4F4F" />
            <circle cx="90" cy="50" r="5" fill="#2F4F4F" />
            <path d="M60 70 Q75 80 90 70" stroke="#2F4F4F" strokeWidth="3" fill="none" />
          </svg>
        </div>
        <div className="teacher-dialogue">
          <p>{getTeacherMessage()}</p>
        </div>
      </div>
    </div>
  );
};

export default InteractivePage;