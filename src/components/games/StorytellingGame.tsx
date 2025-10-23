import React from 'react';
import type { GameStageProps, GameStageResult } from './types';
import VoiceInput from '../VoiceInput';

const StorytellingGame: React.FC<GameStageProps> = ({ childName, setPrompt, onComplete }) => {
  const [input, setInput] = React.useState('');
  const [inputMethod, setInputMethod] = React.useState<'voice' | 'text'>('voice');
  const [voiceError, setVoiceError] = React.useState<string>('');
  const startTimeRef = React.useRef<number>(Date.now());

  React.useEffect(() => {
    setPrompt(`${childName}，小兔子遇到了谁呢？你可以说话或者打字告诉我！`);
    startTimeRef.current = Date.now();
  }, [childName, setPrompt]);

  const handleSubmit = () => {
    const text = input.trim();
    if (!text) return;
    
    const latencyMs = Date.now() - startTimeRef.current;
    const uniqueChars = new Set(text.split('')).size;
    const result: GameStageResult = {
      dimension: 'expression',
      metrics: {
        charCount: text.length,
        uniqueCharCount: uniqueChars,
        latencyMs
      }
    };
    onComplete(result);
  };

  const handleVoiceResult = (text: string) => {
    setInput(text);
    setVoiceError('');
    // 语音输入完成后自动提交
    setTimeout(() => {
      if (text.trim()) {
        const latencyMs = Date.now() - startTimeRef.current;
        const uniqueChars = new Set(text.split('')).size;
        const result: GameStageResult = {
          dimension: 'expression',
          metrics: {
            charCount: text.length,
            uniqueCharCount: uniqueChars,
            latencyMs
          }
        };
        onComplete(result);
      }
    }, 1000);
  };

  const handleVoiceError = (error: string) => {
    setVoiceError(error);
  };

  return (
    <div className="storytelling-game">
      <p className="story-prompt">请用一句话讲一讲：小兔子遇到了谁？</p>
      
      {/* 输入方式切换 */}
      <div className="input-method-toggle">
        <button
          className={`method-button ${inputMethod === 'voice' ? 'active' : ''}`}
          onClick={() => setInputMethod('voice')}
        >
          🎤 语音输入
        </button>
        <button
          className={`method-button ${inputMethod === 'text' ? 'active' : ''}`}
          onClick={() => setInputMethod('text')}
        >
          ⌨️ 文字输入
        </button>
      </div>

      {/* 语音输入区域 */}
      {inputMethod === 'voice' && (
        <div className="voice-input-section">
          <VoiceInput
            onResult={handleVoiceResult}
            onError={handleVoiceError}
            placeholder="点击麦克风，说出你的故事..."
            className="story-voice-input"
          />
          {voiceError && (
            <div className="voice-error">
              <span className="error-icon">⚠️</span>
              <span>{voiceError}</span>
            </div>
          )}
          {input && (
            <div className="voice-result">
              <p className="result-label">你说的是：</p>
              <p className="result-text">"{input}"</p>
            </div>
          )}
        </div>
      )}

      {/* 文字输入区域 */}
      {inputMethod === 'text' && (
        <div className="text-input-section">
          <textarea
            className="story-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="例如：小兔子遇到了小熊，一起去森林散步。"
          />
          <button 
            onClick={handleSubmit} 
            className="submit-button"
            disabled={!input.trim()}
          >
            提交
          </button>
        </div>
      )}
    </div>
  );
};

export default StorytellingGame;