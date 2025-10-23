import React from 'react';
import type { GameStageProps, GameStageResult } from './types';
import moleSvg from '../../assets/mole.svg';

const GRID_SIZE = 3; // 3x3 地鼠洞
const VISIBLE_MS = 1200; // 地鼠露头时长 - 增加时间让体验更好
const SPAWN_MS = 800; // 地鼠刷新频率 - 稍微降低频率
const GAME_DURATION = 20; // 游戏时长（秒）- 延长游戏时间

const AnimalClickGame: React.FC<GameStageProps> = ({ childName, setPrompt, onComplete }) => {
  const [hits, setHits] = React.useState(0);
  const [mistakes, setMistakes] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(GAME_DURATION);
  const [holes, setHoles] = React.useState<Array<{ up: boolean; hit: boolean; pending: boolean; id: number }>>(  
    Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({ up: false, hit: false, pending: false, id: i }))
  );
  const [gameStarted, setGameStarted] = React.useState(false);
  const [countdown, setCountdown] = React.useState(3); // 3秒倒计时
  const timerRef = React.useRef<number | null>(null);
  const spawnRef = React.useRef<number | null>(null);
  const startRef = React.useRef<number>(Date.now());
  const activeIndexRef = React.useRef<number | null>(null);
  const appearStartRef = React.useRef<number | null>(null);
  const latencySumRef = React.useRef<number>(0);
  const countdownRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    setPrompt(`${childName ? childName + '，' : ''}准备好！在限定时间内打更多的地鼠！`);
    startRef.current = Date.now();
    
    // 开始倒计时
    countdownRef.current = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (countdownRef.current) window.clearInterval(countdownRef.current);
          setGameStarted(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    
    return () => {
      if (countdownRef.current) window.clearInterval(countdownRef.current);
    };
  }, [childName, setPrompt]);

  // 游戏完成处理逻辑
  const handleGameComplete = React.useCallback(() => {
    const totalMs = Date.now() - startRef.current;
    const avgLatencyMs = hits > 0 ? Math.floor(latencySumRef.current / hits) : 0;
    const result: GameStageResult = {
      dimension: 'reaction',
      metrics: { hits, mistakes, avgLatencyMs, totalMs }
    };
    onComplete(result);
  }, [onComplete, hits, mistakes]);

  // 倒计时控制
  React.useEffect(() => {
    if (!gameStarted) return;
    
    setTimeLeft(GAME_DURATION);
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          if (spawnRef.current) window.clearInterval(spawnRef.current);
          handleGameComplete();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [gameStarted, handleGameComplete]);

  // 地鼠刷新逻辑
  React.useEffect(() => {
    if (!gameStarted) return;
    
    if (spawnRef.current) window.clearInterval(spawnRef.current);
    spawnRef.current = window.setInterval(() => {
      // 复制当前状态
      const currentHoles = [...holes];
      
      // 重置所有地洞状态
      const updatedHoles = currentHoles.map(h => ({ ...h, up: false, pending: false }));
      
      // 随机选择一个地洞出现地鼠
      const availableHoles = updatedHoles.map((_, i) => i).filter(i => i !== activeIndexRef.current);
      if (availableHoles.length === 0) return;
      
      const idx = availableHoles[Math.floor(Math.random() * availableHoles.length)];
      
      // 先设置地洞为pending状态，产生地面动效
      updatedHoles[idx].pending = true;
      setHoles(updatedHoles);
      
      // 延迟一小段时间后，让地鼠出现
      window.setTimeout(() => {
        setHoles(prev => {
          const next = [...prev];
          next[idx].up = true;
          next[idx].hit = false;
          next[idx].pending = false; // 清除pending状态
          
          activeIndexRef.current = idx;
          appearStartRef.current = Date.now();
          
          // 自动下钻
          window.setTimeout(() => {
            setHoles(hs => hs.map((h, i) => i === idx ? { ...h, up: false } : h));
            if (activeIndexRef.current === idx) {
              activeIndexRef.current = null;
              appearStartRef.current = null;
            }
          }, VISIBLE_MS);
          
          return next;
        });
      }, 300); // 地面动效持续时间
    }, SPAWN_MS);
    
    return () => {
      if (spawnRef.current) window.clearInterval(spawnRef.current);
    };
  }, [gameStarted, holes]);

  const clickHole = (index: number) => {
    if (!gameStarted) return; // 游戏未开始时不响应点击
    
    const active = activeIndexRef.current;
    const appearedAt = appearStartRef.current;
    
    // 检查是否点击的是活跃的地鼠
    if (active !== null && index === active) {
      // 命中地鼠
      setHits(h => h + 1);
      setHoles(prev => prev.map((h, i) => 
        i === index ? { ...h, up: false, hit: true, pending: false } : h
      ));
      
      if (appearedAt) latencySumRef.current += (Date.now() - appearedAt);
      
      // 命中动画结束后复原
      window.setTimeout(() => {
        setHoles(prev => prev.map((h, i) => 
          i === index ? { ...h, hit: false } : h
        ));
      }, 300);
      
      activeIndexRef.current = null;
      appearStartRef.current = null;
      
      // 更新提示语给予鼓励
      if (hits % 5 === 0) {
        const encouragements = [
          '太棒了！继续保持！',
          '真厉害！你眼疾手快！',
          '加油！你是打地鼠高手！'
        ];
        const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
        setPrompt(randomEncouragement);
      }
    } else {
      // 失误（点击空洞或错误洞）
      setMistakes(m => m + 1);
      // 空洞抖动效果通过 CSS 动画实现
      setHoles(prev => prev.map((h, i) => 
        i === index ? { ...h, hit: true, pending: false } : h
      ));
      
      window.setTimeout(() => {
        setHoles(prev => prev.map((h, i) => 
          i === index ? { ...h, hit: false } : h
        ));
      }, 200);
    }
  };

  // 清理定时器
  React.useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (spawnRef.current) window.clearInterval(spawnRef.current);
      if (countdownRef.current) window.clearInterval(countdownRef.current);
    };
  }, []);

  return (
    <div className="whack-game">
      <div className="whack-header">
        <div className="teacher-meta"><span>⏱️</span><span>剩余 {timeLeft} 秒</span></div>
        <div className="teacher-meta"><span>🎯</span><span>命中 {hits}</span></div>
        <div className="teacher-meta"><span>⚠️</span><span>失误 {mistakes}</span></div>
      </div>

      {countdown > 0 && (
        <div className="game-countdown">
          <div className="countdown-number">{countdown}</div>
          <div className="countdown-text">准备开始！</div>
        </div>
      )}

      <div className="whack-grid">
        {holes.map((hole, i) => (
          <div 
            key={i} 
            className={`whack-hole ${hole.hit ? 'hit' : ''} ${hole.pending ? 'pending' : ''}`}
            onClick={() => clickHole(i)}
          >
            <div className="hole-cover"></div>
            <div 
              className={`whack-mole ${hole.up ? 'up' : ''} ${hole.hit && hole.up ? 'hit' : ''}`}
            >
              {/* 使用SVG地鼠形象 */}
              <img 
                src={moleSvg} 
                alt="地鼠" 
                className={`mole-image ${hole.hit ? 'hit' : ''}`} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain', 
                  transition: hole.hit ? 'all 0.3s ease' : 'none', 
                  transform: hole.hit ? 'scale(1.2) rotate(10deg)' : 'none'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="game-instructions">
        <p>点击出现的地鼠！争取获得更高分数！</p>
      </div>
    </div>
  );
};

export default AnimalClickGame;