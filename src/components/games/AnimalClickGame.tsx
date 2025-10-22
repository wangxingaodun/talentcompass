import React from 'react';
import type { GameStageProps, GameStageResult } from './types';

const GRID_SIZE = 3; // 3x3 地鼠洞
const VISIBLE_MS = 700; // 地鼠露头时长
const SPAWN_MS = 600; // 地鼠刷新频率

const AnimalClickGame: React.FC<GameStageProps> = ({ childName, setPrompt, onComplete }) => {
  const [hits, setHits] = React.useState(0);
  const [mistakes, setMistakes] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(12);
  const [holes, setHoles] = React.useState<Array<{ up: boolean; hit: boolean }>>(
    Array.from({ length: GRID_SIZE * GRID_SIZE }, () => ({ up: false, hit: false }))
  );
  const timerRef = React.useRef<number | null>(null);
  const spawnRef = React.useRef<number | null>(null);
  const startRef = React.useRef<number>(Date.now());
  const activeIndexRef = React.useRef<number | null>(null);
  const appearStartRef = React.useRef<number | null>(null);
  const latencySumRef = React.useRef<number>(0);

  React.useEffect(() => {
    setPrompt(`${childName ? childName + '，' : ''}准备好！在限定时间内打更多的地鼠！`);
    startRef.current = Date.now();
  }, [childName, setPrompt]);

  // 倒计时控制
  React.useEffect(() => {
    setTimeLeft(12);
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          if (spawnRef.current) window.clearInterval(spawnRef.current);
          const totalMs = Date.now() - startRef.current;
          const avgLatencyMs = hits > 0 ? Math.floor(latencySumRef.current / hits) : 0;
          const result: GameStageResult = {
            dimension: 'reaction',
            metrics: { hits, mistakes, avgLatencyMs, totalMs }
          };
          onComplete(result);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [onComplete, hits, mistakes]);

  // 地鼠刷新逻辑
  React.useEffect(() => {
    if (spawnRef.current) window.clearInterval(spawnRef.current);
    spawnRef.current = window.setInterval(() => {
      setHoles(prev => {
        const next = prev.map(() => ({ up: false, hit: false }));
        const idx = Math.floor(Math.random() * next.length);
        next[idx].up = true;
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
    }, SPAWN_MS);
    return () => {
      if (spawnRef.current) window.clearInterval(spawnRef.current);
    };
  }, []);

  const clickHole = (index: number) => {
    const active = activeIndexRef.current;
    const appearedAt = appearStartRef.current;
    if (active !== null && index === active) {
      // 命中地鼠
      setHits(h => h + 1);
      setHoles(prev => prev.map((h, i) => i === index ? { up: false, hit: true } : { ...h, hit: false }));
      if (appearedAt) latencySumRef.current += (Date.now() - appearedAt);
      // 命中动画结束后复原
      window.setTimeout(() => {
        setHoles(prev => prev.map((h, i) => i === index ? { up: false, hit: false } : h));
      }, 260);
      activeIndexRef.current = null;
      appearStartRef.current = null;
    } else {
      // 失误（点击空洞或错误洞）
      setMistakes(m => m + 1);
      // 可选：空洞抖动效果通过 CSS 动画实现
    }
  };

  return (
    <div className="whack-game" style={{ padding: 12 }}>
      <div className="whack-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div className="teacher-meta"><span>⏱️</span><span>剩余 {timeLeft} 秒</span></div>
        <div className="teacher-meta"><span>🎯</span><span>命中 {hits}</span></div>
        <div className="teacher-meta"><span>⚠️</span><span>失误 {mistakes}</span></div>
      </div>

      <div className="whack-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gap: 12 }}>
        {holes.map((hole, i) => (
          <div key={i} className="whack-hole" onClick={() => clickHole(i)}>
            <div
              className={`whack-mole ${hole.up ? 'up' : ''} ${hole.hit ? 'hit' : ''}`}
              style={{
                position: 'absolute',
                left: '50%',
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#8b5e3c',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ position: 'absolute', top: 12, left: 12, width: 8, height: 8, borderRadius: '50%', background: '#333' }} />
              <div style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: '50%', background: '#333' }} />
              <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 16, height: 6, borderRadius: 8, background: '#552', opacity: 0.8 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimalClickGame;