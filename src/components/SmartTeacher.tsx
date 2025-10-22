import React, { useState, useEffect, useRef } from 'react';
import TeacherAvatar, { type TeacherMood } from './TeacherAvatar';
import { type Dimension } from './games/types';
import { getEncouragement } from './encouragement';

interface SmartTeacherProps {
  childName: string;
  currentDimension?: Dimension;
  prompt: string;
  onPromptChange: (newPrompt: string) => void;
  gameProgress?: number; // 0-100
  lastPerformance?: 'excellent' | 'good' | 'needs_improvement';
}

const SmartTeacher: React.FC<SmartTeacherProps> = ({
  childName,
  currentDimension,
  prompt,
  onPromptChange,
  gameProgress = 0,
  lastPerformance
}) => {
  const [mood, setMood] = useState<TeacherMood>('happy');
  const [isAnimating, setIsAnimating] = useState(false);
  const [encouragementCount, setEncouragementCount] = useState(0);
  const autoSpeakOnNextPrompt = useRef(false);
  // 上一次鼓励，用于避免重复
  const lastEncouragementRef = useRef<string>('');
  // 自动语音播放控制：定义于上方，避免重复声明
  // 根据维度获取智能化提示
  const getSmartPrompt = (dimension: Dimension, progress: number): string => {
    const prompts = {
      expression: [
        `${childName}，让我们一起编个有趣的故事吧！🌟`,
        `${childName}，你的想象力一定很棒，告诉我你的故事！📚`,
        `${childName}，我很期待听到你独特的故事呢！✨`
      ],
      logic: [
        `${childName}，观察这些图案，你能发现规律吗？🧩`,
        `${childName}，动动小脑筋，答案就在眼前！🤔`,
        `${childName}，相信你的逻辑思维能力！💡`
      ],
      creativity: [
        `${childName}，发挥你的创造力，画出心中的世界！🎨`,
        `${childName}，没有标准答案，尽情创作吧！🌈`,
        `${childName}，你的每一笔都是独一无二的！✏️`
      ],
      reaction: [
        `${childName}，准备好了吗？考验反应速度的时候到了！⚡`,
        `${childName}，眼疾手快，点击可爱的小动物！🐱`,
        `${childName}，集中注意力，你一定可以的！🎯`
      ],
      imagination: [
        `${childName}，如果你有魔法，会发生什么呢？🪄`,
        `${childName}，让想象力自由飞翔吧！🦋`,
        `${childName}，告诉我你脑海中最奇妙的想法！💭`
      ]
    };

    const dimensionPrompts = prompts[dimension] || prompts.expression;
    return dimensionPrompts[Math.floor(Math.random() * dimensionPrompts.length)];
  };

  // 根据表现给出个性化鼓励
  // 已移除本地简单鼓励函数，使用维度化鼓励引擎 getEncouragement(dimension, performance, childName, exclude)


  // 根据表现更新心情 + 维度化鼓励
  useEffect(() => {
    if (lastPerformance) {
      switch (lastPerformance) {
        case 'excellent':
          setMood('excited');
          setIsAnimating(true);
          break;
        case 'good':
          setMood('happy');
          break;
        case 'needs_improvement':
          setMood('encouraging');
          break;
      }

      // 维度化鼓励（避免重复）
      const perfMsg = getEncouragement(
        currentDimension || 'expression',
        lastPerformance,
        childName,
        lastEncouragementRef.current,
      );
      lastEncouragementRef.current = perfMsg;
      onPromptChange(perfMsg);
      setEncouragementCount(prev => prev + 1);

      // 重置动画
      setTimeout(() => setIsAnimating(false), 1000);
    }
  }, [lastPerformance, childName, onPromptChange, currentDimension]);

  // 根据当前维度更新提示，并准备自动语音
  useEffect(() => {
    if (currentDimension && !lastPerformance) {
      setMood('thinking');
      // 标记在下一次提示文本变化时自动播报
      autoSpeakOnNextPrompt.current = true;
      setTimeout(() => {
        const smartPrompt = getSmartPrompt(currentDimension, gameProgress);
        onPromptChange(smartPrompt);
        setMood('gentle');
      }, 800);
    }
  }, [currentDimension, gameProgress, childName, onPromptChange, lastPerformance]);

  // 当提示文本更新且标记需要自动播报时，自动播放语音
  useEffect(() => {
    if (autoSpeakOnNextPrompt.current && prompt) {
      // 先取消正在播放的语音，避免重叠
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
      speakPrompt();
      autoSpeakOnNextPrompt.current = false;
    }
  }, [prompt]);

  // 语音播报功能
  const speakPrompt = () => {
    if ('speechSynthesis' in window) {
      // 取消之前的播报，确保干净的开始
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(prompt);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.86;
      utterance.pitch = 1.15;
      speechSynthesis.speak(utterance);
      
      setMood('excited');
      setIsAnimating(true);
      setTimeout(() => {
        setMood('happy');
        setIsAnimating(false);
      }, 1800);
    }
  };

  return (
    <div className="panel padded gradient-border">
      {/* AI小老师头像区域 */}
      <div className="teacher-card">
        <TeacherAvatar 
          mood={mood} 
          isAnimating={isAnimating}
          size="large"
        />
        
        <div style={{ position: 'relative', flex: 1 }}>
          {/* 对话气泡 */}
          <div className="prompt-bubble">
            {/* 提示文本，打字机效果 */}
            <p className="typing" style={{ fontSize: '18px', lineHeight: 1.6, fontWeight: 600 }}>
              {prompt}
            </p>
            
            {/* 进度条 */}
            {gameProgress > 0 && (
              <div className="progress">
                <div className="progress-row">
                  <span>游戏进度</span>
                  <span>{Math.round(gameProgress)}%</span>
                </div>
                <div className="progress-track">
                  <div 
                    className="progress-fill"
                    style={{ width: `${gameProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          {/* 控制按钮 */}
          <div className="controls">
            <button onClick={speakPrompt} className="voice-button">
              <span>🔊</span>
              <span>语音播报</span>
            </button>
          </div>

          {/* 反馈动画：优秀→彩带；良好→轻微脉冲；需改进→温暖光晕 */}
          {lastPerformance === 'excellent' && (
            <div className="confetti">
              {Array.from({ length: 16 }).map((_, i) => (
                <span key={i} style={{ left: `${(i + 1) * 6}%` }} />
              ))}
            </div>
          )}
          {lastPerformance === 'good' && (
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              borderRadius: 16, boxShadow: '0 0 0 6px rgba(91,141,251,0.15)',
              animation: 'fadeIn 350ms ease',
            }} />
          )}
          {lastPerformance === 'needs_improvement' && (
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              borderRadius: 16, boxShadow: '0 0 0 8px rgba(255,196,0,0.15)',
              animation: 'fadeIn 350ms ease',
            }} />
          )}
        </div>
      </div>
      
      {/* 星级奖励（根据表现） */}
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <div className="teacher-meta">
          <span>⭐</span>
          <span>
            奖励星星：{
              lastPerformance === 'excellent' ? 3 :
              lastPerformance === 'good' ? 2 : 1
            } / 3
          </span>
        </div>
      </div>

      {/* 鼓励统计 */}
      {encouragementCount > 0 && (
        <div style={{ marginTop: 10, textAlign: 'center' }}>
          <div className="teacher-meta">
            <span>💬</span>
            <span>已鼓励 {encouragementCount} 次</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartTeacher;