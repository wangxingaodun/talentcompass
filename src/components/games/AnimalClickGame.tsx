import React from 'react';
import type { GameStageProps, GameStageResult } from './types';
import moleSvg from '../../assets/mole.svg';
import burrowSvg from '../../assets/burrow.svg';
import backgroundSvg from '../../assets/background.svg';
import './AnimalClickGame.css';

const GRID_SIZE = 3; // 3x3 地鼠洞
const INITIAL_VISIBLE_MS = 1500; // 初始地鼠露头时长 - 开始慢一些
const INITIAL_SPAWN_MS = 1200; // 初始地鼠刷新频率 - 开始较慢
const MIN_VISIBLE_MS = 800; // 最小地鼠露头时长
const MIN_SPAWN_MS = 500; // 最小地鼠刷新频率
const DIFFICULTY_THRESHOLD = 3; // 连续命中多少次提升难度
const GAME_DURATION = 30; // 游戏时长（秒）- 延长游戏时间

const AnimalClickGame: React.FC<GameStageProps> = ({ childName, setPrompt, onComplete }) => {
  const [hits, setHits] = React.useState(0);
  const [mistakes, setMistakes] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(GAME_DURATION);
  const [holes, setHoles] = React.useState<Array<{ up: boolean; hit: boolean; pending: boolean; id: number }>>(  
    Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({ up: false, hit: false, pending: false, id: i }))
  );
  const [gameStarted, setGameStarted] = React.useState(false);
  const [countdown, setCountdown] = React.useState(3); // 3秒倒计时
  const [consecutiveHits, setConsecutiveHits] = React.useState(0); // 连续命中次数
  const [currentVisibleMs, setCurrentVisibleMs] = React.useState(INITIAL_VISIBLE_MS); // 当前地鼠露头时长
  const [currentSpawnMs, setCurrentSpawnMs] = React.useState(INITIAL_SPAWN_MS); // 当前刷新频率
  const timerRef = React.useRef<number | null>(null);
  const spawnRef = React.useRef<number | null>(null);
  const startRef = React.useRef<number>(Date.now());
  const activeIndexRef = React.useRef<number | null>(null);
  const appearStartRef = React.useRef<number | null>(null);
  const latencySumRef = React.useRef<number>(0);
  const countdownRef = React.useRef<number | null>(null);

  // 倒计时与开局
  React.useEffect(() => {
    // 初始化状态
    setGameStarted(false);
    setTimeLeft(GAME_DURATION);
    setHits(0);
    setMistakes(0);

    // 启动倒计时
    countdownRef.current = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (countdownRef.current) window.clearInterval(countdownRef.current);
          setGameStarted(true);
          startRef.current = Date.now(); // 游戏开始时设置开始时间
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    setPrompt(`${childName}，准备好了？游戏即将开始！`);

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
  }, [onComplete]);

  // 游戏完成处理逻辑引用
  const handleGameCompleteRef = React.useRef(handleGameComplete);
  React.useEffect(() => {
    handleGameCompleteRef.current = handleGameComplete;
  }, [handleGameComplete]);

  // 倒计时控制
  React.useEffect(() => {
    if (!gameStarted) return;
    
    timerRef.current = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          handleGameCompleteRef.current();
          setGameStarted(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [gameStarted]);

  // 地鼠刷新与出现
  React.useEffect(() => {
    if (!gameStarted) return;

    spawnRef.current = window.setInterval(() => {
      const idx = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));

      // 地面动效 pending
      setHoles(prev => prev.map((h, i) => i === idx ? { ...h, pending: true, up: false, hit: false } : { ...h, pending: false, up: false }));

      // 地鼠露头
      window.setTimeout(() => {
        setHoles(prev => prev.map((h, i) => i === idx ? { ...h, up: true, hit: false, pending: false } : h));
        activeIndexRef.current = idx;
        appearStartRef.current = Date.now();

        // 自动下钻
        window.setTimeout(() => {
          setHoles(prev => prev.map((h, i) => i === idx ? { ...h, up: false } : h));
          if (activeIndexRef.current === idx) {
            setMistakes(m => m + 1);
            setConsecutiveHits(0);
            activeIndexRef.current = null;
            appearStartRef.current = null;
          }
        }, currentVisibleMs);
      }, 300);
    }, currentSpawnMs);
    
    return () => {
      if (spawnRef.current) window.clearInterval(spawnRef.current);
    };
  }, [gameStarted, currentVisibleMs, currentSpawnMs]);

  const clickHole = (index: number) => {
    if (!gameStarted) return; // 游戏未开始时不响应点击
    
    const active = activeIndexRef.current;
    const appearedAt = appearStartRef.current;
    const hole = holes[index];
    
    // 只有当地鼠真正出现(up=true)时，点击才有效
    if (!hole.up) {
      return; // 地鼠未出现，点击无效果
    }
    
    // 检查是否点击的是活跃的地鼠
    if (active !== null && index === active) {
      // 命中地鼠
      const newHits = hits + 1;
      setHits(newHits);
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
      
      // 更新连续命中次数
      const newConsecutiveHits = consecutiveHits + 1;
      setConsecutiveHits(newConsecutiveHits);
      
      // 根据连续命中次数提升难度
      if (newConsecutiveHits % DIFFICULTY_THRESHOLD === 0) {
        // 缩短地鼠露头时间和刷新间隔
        const newVisibleMs = Math.max(MIN_VISIBLE_MS, currentVisibleMs - 100);
        const newSpawnMs = Math.max(MIN_SPAWN_MS, currentSpawnMs - 100);
        setCurrentVisibleMs(newVisibleMs);
        setCurrentSpawnMs(newSpawnMs);
        
        setPrompt(`太棒了！连续命中${newConsecutiveHits}次！难度提升！`);
      } else if (newHits % 5 === 0) {
        // 每5次命中给予鼓励
        const encouragements = [
          '太棒了！继续保持！',
          '真厉害！你眼疾手快！',
          '加油！你是打地鼠高手！'
        ];
        const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
        setPrompt(randomEncouragement);
      }
    } else {
      // 点击到地鼠但不是当前活跃的地鼠（理论上不应该发生）
      setMistakes(m => m + 1);
      // 重置连续命中次数
      setConsecutiveHits(0);
      
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

      <div className="whack-grid" style={{ backgroundImage: `url(${backgroundSvg})` }}>
        {holes.map((hole, i) => (
          <div 
            key={i} 
            className={`whack-hole ${hole.hit ? 'hit' : ''} ${hole.pending ? 'pending' : ''}`}
            onClick={() => clickHole(i)}
          >
            <img 
              src={burrowSvg} 
              alt="地洞" 
              className="hole-image"
            />
            {hole.up && (
              <div className={`whack-mole up ${hole.hit ? 'hit' : ''}`}>
                <img 
                  src={moleSvg} 
                  alt="地鼠" 
                  className="mole-image"
                />
              </div>
            )}
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