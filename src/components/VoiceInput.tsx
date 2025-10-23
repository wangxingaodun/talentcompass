import React, { useState, useEffect, useRef } from 'react';

interface VoiceInputProps {
  onResult: (text: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

// 声明浏览器语音识别API类型
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onResult,
  onStart,
  onEnd,
  onError,
  disabled = false,
  placeholder = "点击麦克风开始说话...",
  className = ""
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  
  // 使用ref保存回调函数，确保语音识别能访问到最新的回调
  const onResultRef = useRef(onResult);
  const onStartRef = useRef(onStart);
  const onEndRef = useRef(onEnd);
  const onErrorRef = useRef(onError);
  
  // 更新回调函数引用
  useEffect(() => {
    onResultRef.current = onResult;
    onStartRef.current = onStart;
    onEndRef.current = onEnd;
    onErrorRef.current = onError;
  }, [onResult, onStart, onEnd, onError]);

  useEffect(() => {
    // 检查浏览器是否支持语音识别
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      // 创建语音识别实例
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'zh-CN';
      recognition.maxAlternatives = 1;

      // 识别结果处理
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // 更新实时转录文本
        setTranscript(finalTranscript || interimTranscript);
        
        // 如果有最终结果，调用回调
        if (finalTranscript) {
          onResultRef.current?.(finalTranscript);
        }
      };

      // 开始识别
      recognition.onstart = () => {
        setIsListening(true);
        onStartRef.current?.();
      };

      // 结束识别
      recognition.onend = () => {
        setIsListening(false);
        onEndRef.current?.();
      };

      // 错误处理
      recognition.onerror = (event: any) => {
        setIsListening(false);
        let errorMessage = '语音识别出错了';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = '没有检测到语音，请重试';
            break;
          case 'audio-capture':
            errorMessage = '无法访问麦克风，请检查权限';
            break;
          case 'not-allowed':
            errorMessage = '麦克风权限被拒绝，请允许使用麦克风';
            break;
          case 'network':
            errorMessage = '网络错误，请检查网络连接';
            break;
          default:
            errorMessage = `语音识别错误: ${event.error}`;
        }
        
        onErrorRef.current?.(errorMessage);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      onError?.('您的浏览器不支持语音识别功能');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []); // 移除依赖，只在组件挂载时初始化一次

  const startListening = () => {
    if (!isSupported || disabled || isListening) return;
    
    setTranscript('');
    recognitionRef.current?.start();
  };

  const stopListening = () => {
    if (!isListening) return;
    recognitionRef.current?.stop();
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className={`voice-input-container unsupported ${className}`}>
        <div className="voice-input-error">
          <span className="error-icon">⚠️</span>
          <span>您的浏览器不支持语音识别</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`voice-input-container ${className}`}>
      <div className="voice-input-wrapper">
        <button
          className={`voice-button ${isListening ? 'listening' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={toggleListening}
          disabled={disabled}
          type="button"
        >
          <span className="voice-icon">
            {isListening ? '🎤' : '🎙️'}
          </span>
          <span className="voice-text">
            {isListening ? '正在听...' : '点击说话'}
          </span>
        </button>
        
        {transcript && (
          <div className="voice-transcript">
            <span className="transcript-label">识别中:</span>
            <span className="transcript-text">{transcript}</span>
          </div>
        )}
        
        {!isListening && !transcript && (
          <div className="voice-placeholder">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceInput;