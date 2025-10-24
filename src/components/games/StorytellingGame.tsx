import React from 'react';
import type { GameStageProps, GameStageResult } from './types';
import '../../styles/pattern.css';

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new(): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new(): SpeechRecognition;
    };
  }
}

const StorytellingGame: React.FC<GameStageProps> = ({ childName, setPrompt, onComplete }) => {
  const [input, setInput] = React.useState('');
  const [isListening, setIsListening] = React.useState(false);
  const [speechSupported, setSpeechSupported] = React.useState(false);
  const startTimeRef = React.useRef<number>(Date.now());
  const recognitionRef = React.useRef<SpeechRecognition | null>(null);
  // 提示Toast（非遮挡）
  const [showToast, setShowToast] = React.useState(false);
  const toastTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    setPrompt(`${childName}，小兔子遇到了谁呢？请用一句话讲一讲！`);
    startTimeRef.current = Date.now();

    // Check if browser supports speech recognition
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'zh-CN';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [childName, setPrompt]);

  // 清理Toast定时器
  React.useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = () => {
    const text = input.trim();
    if (!text) return;

    // 如果在听，先停止识别
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    // 显示动效Toast
    setShowToast(true);
    
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

    // 3秒后淡出Toast
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="storytelling-game" style={{ position: 'relative' }}>
      <p className="story-prompt">请用一句话讲一讲：小兔子遇到了谁？</p>
      
      <textarea
        className="story-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="在此输入文字，或点击下方麦克风按钮使用语音输入..."
      />
      
      <div className="input-controls">
        {speechSupported && (
          <button 
            onClick={toggleListening} 
            className={`voice-button ${isListening ? 'listening' : ''}`}
            type="button"
          >
            {isListening ? '🛑 停止' : '🎤 语音输入'}
          </button>
        )}
        <button 
          onClick={handleSubmit} 
          className="submit-button"
          disabled={!input.trim()}
        >
          提交
        </button>
      </div>
      
      {isListening && (
        <div className="listening-indicator">
          <span className="pulse"></span>
          <span>正在听您说话...</span>
        </div>
      )}

      {/* 已移除遮挡加载，改为底部Toast */}
        {/* 底部Toast：非遮挡，带动效 */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 10,
            transform: `translateX(-50%) translateY(${showToast ? '0px' : '12px'})`,
            opacity: showToast ? 1 : 0,
            transition: 'opacity 280ms ease, transform 280ms ease',
            pointerEvents: 'none'
          }}
        >
          {/* 复用 PatternGame 的结果提示样式 */}
          <div className="pattern-feedback correct" style={{ marginTop: 0, whiteSpace: 'nowrap' }}>
            <span>👏 讲的太好了，我很喜欢呢</span>
          </div>
      </div>
    </div>
  );
};

export default StorytellingGame;