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
        // 更智能的中文标点恢复
        const last = event.results[event.results.length - 1];
        const isFinal = !!(last && last.isFinal);
        let t = transcript.trim();
        // 统一中英文标点
        t = t.replace(/,/g, '，')
             .replace(/\?/g, '？')
             .replace(/!/g, '！')
             .replace(/;/g, '；');
        // 去除中文之间的多余空格，但保留英数两侧空格
        t = t.replace(/([\u4e00-\u9fa5])\s+([\u4e00-\u9fa5])/g, '$1$2');
        // 连接词前自动加逗号（时间、转折、因果、条件等更全面）
        const connectors = [
          // 时间/顺序
          '首先','其次','再次','最后','后来','随后','之后','之前','当时','此时','那时','这时','同时','与此同时','一开始','不久','很快','突然','忽然','立刻','立即','接着','然后',
          // 转折
          '但是','然而','不过','却','只是','不过',
          // 因果
          '因为','所以','因此','于是','因而','从而','由于','故','以致','以至于',
          // 条件/假设
          '如果','只要','除非','无论','既然','假如','假设','要是','一旦'
        ];
        connectors.forEach(w => {
          t = t.replace(new RegExp(`([^，。！？；：\\s])(${w})`, 'g'), '$1，$2');
        });
        // 成对短语规则：在第二个连接词前/关键处智能补逗号
        // 因果
        t = t.replace(/因为([^。！？；]*?)所以/g, (m, clause) => `因为${clause.replace(/^，*/, '')}，所以`);
        t = t.replace(/由于([^。！？；]*?)(因此|所以|从而)/g, (m, clause, second) => `由于${clause.replace(/^，*/, '')}，${second}`);
        // 转折
        t = t.replace(/虽然([^。！？；]*?)但是/g, (m, clause) => `虽然${clause.replace(/^，*/, '')}，但是`);
        t = t.replace(/尽管([^。！？；]*?)但是/g, (m, clause) => `尽管${clause.replace(/^，*/, '')}，但是`);
        // 条件
        t = t.replace(/如果([^。！？；]*?)(那么|就|则)/g, (m, clause, second) => `如果${clause.replace(/^，*/, '')}，${second}`);
        t = t.replace(/只要([^。！？；]*?)就/g, (m, clause) => `只要${clause.replace(/^，*/, '')}，就`);
        t = t.replace(/除非([^。！？；]*?)否则/g, (m, clause) => `除非${clause.replace(/^，*/, '')}，否则`);
        t = t.replace(/无论([^。！？；]*?)都/g, (m, clause) => `无论${clause.replace(/^，*/, '')}，都`);
        // 时间结构：当...时，...
        t = t.replace(/当([^。！？；]*?)时(?![，。！？；])/g, (m, clause) => `当${clause}时，`);
        // 长句拆分：超过24个未遇标点的字符，智能插入逗号
        const insertCommaInLongRun = (s: string) => {
          const parts = s.split(/([。！？；])/);
          const candidate = /[的了过着就也都还又再而把被与和及或并]/g;
          for (let i = 0; i < parts.length; i += 2) {
            const seg = parts[i];
            if (seg && seg.length >= 24) {
              const mid = Math.floor(seg.length / 2);
              let insertPos = -1;
              let m;
              while ((m = candidate.exec(seg)) !== null) {
                if (insertPos === -1 || Math.abs(m.index - mid) < Math.abs(insertPos - mid)) {
                  insertPos = m.index;
                }
              }
              parts[i] = insertPos !== -1
                ? seg.slice(0, insertPos + 1) + '，' + seg.slice(insertPos + 1)
                : seg.slice(0, mid) + '，' + seg.slice(mid);
            }
          }
          return parts.join('');
        };
        t = insertCommaInLongRun(t);
        // 仅在最终结果时补句末标点
        if (isFinal && !/[。！？？！]$/.test(t)) {
          const isQuestion = /(?:吗|呢|是否|么|哪|谁|几|可不可以|可以吗|为什么|如何|怎么|多少|哪里)/.test(t);
          const isExclaim = /(?:太.+了|真棒|太棒了|好厉害|太开心|真好|好喜欢)/.test(t);
          t += isQuestion ? '？' : (isExclaim ? '！' : '。');
        }
        // 去重连续标点
        t = t.replace(/([。！？？，；、])\1+/g, '$1');
        setInput(t);
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
    let text = input.trim();
    if (!text) return;

    // 如果在听，先停止识别
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    // 句末自动补足标点：优先问号，其次感叹号，默认句号
    if (!/[。！？?!]$/.test(text)) {
      const hasQuestion = /[吗呢?？]/.test(text);
      const hasExclaim = /[啊呀哇！!]/.test(text);
      text = text + (hasQuestion ? '？' : (hasExclaim ? '！' : '。'));
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