import React from 'react';
import type { GameStageProps, GameStageResult, DrawingMetrics } from './types';

const DRAWING_DURATION = 10; // 绘画游戏时长（秒）

const DrawingGame: React.FC<GameStageProps> = ({ childName, setPrompt, onComplete }) => {
  const [timeLeft, setTimeLeft] = React.useState(DRAWING_DURATION);
  const [tool, setTool] = React.useState<'pencil' | 'circle' | 'rect'>('pencil');
  const [color, setColor] = React.useState<string>('#3498db');
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = React.useRef(false);
  const lastPosRef = React.useRef<{ x: number; y: number } | null>(null);
  const intervalRef = React.useRef<number | null>(null);
  const usedColorsRef = React.useRef<Set<string>>(new Set());
  const shapesCountRef = React.useRef<{ pencil: number; circle: number; rect: number }>({ pencil: 0, circle: 0, rect: 0 });
  const strokeCountRef = React.useRef<number>(0);
  const startTimeRef = React.useRef<number>(Date.now());

  // 初始化提示
  React.useEffect(() => {
    setPrompt(`${childName ? childName + '，' : ''}发挥你的想象力，画出你喜欢的东西吧！`);
  }, [setPrompt, childName]);

  // 初始化画布（支持高分屏）
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const width = 400;
    const height = 300;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 4;
    ctxRef.current = ctx;
  }, []);

  // 使用useCallback确保onComplete函数引用稳定
  const handleGameComplete = React.useCallback(() => {
    // 导出画布图像
    const canvas = canvasRef.current;
    const imageDataUrl = canvas ? canvas.toDataURL('image/webp', 0.9) : '';
    
    const result: GameStageResult = {
      dimension: 'creativity',
      metrics: {
        totalMs: Date.now() - startTimeRef.current,
        colorsUsed: usedColorsRef.current.size,
        shapesUsed: shapesCountRef.current.pencil + shapesCountRef.current.circle + shapesCountRef.current.rect,
        strokeCount: strokeCountRef.current,
        toolVariety: Object.values(shapesCountRef.current).filter(count => count > 0).length,
        usedColors: Array.from(usedColorsRef.current),
        shapeBreakdown: { ...shapesCountRef.current },
        imageDataUrl,
      } as DrawingMetrics,
    };
    onComplete(result);
  }, [onComplete]);

  // 计时器（统一由本组件控制）
  React.useEffect(() => {
    // 重置游戏状态
    setTimeLeft(DRAWING_DURATION);
    startTimeRef.current = Date.now();
    usedColorsRef.current.clear();
    shapesCountRef.current = { pencil: 0, circle: 0, rect: 0 };
    strokeCountRef.current = 0;
    
    // 清理之前的计时器
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // 启动新的计时器
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // 清理计时器
          if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          
          // 调用游戏完成处理
          handleGameComplete();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    
    // 清理函数
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []); // 移除依赖，确保只执行一次

  // 绘制工具
  const getPos = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    let clientX = 0, clientY = 0;
    if (e instanceof MouseEvent) {
      clientX = e.clientX; clientY = e.clientY;
    } else if (e instanceof TouchEvent) {
      const t = e.touches[0] || e.changedTouches[0];
      clientX = t.clientX; clientY = t.clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    const ctx = ctxRef.current; if (!ctx) return;
    const pos = getPos(e);
    usedColorsRef.current.add(color);
    if (tool === 'pencil') {
      isDrawingRef.current = true;
      lastPosRef.current = pos;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.moveTo(pos.x, pos.y);
      shapesCountRef.current.pencil += 1; // 每次按下算一次"笔画"形状
      strokeCountRef.current += 1;
    } else if (tool === 'circle') {
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
      ctx.fill();
      shapesCountRef.current.circle += 1;
      strokeCountRef.current += 1;
    } else if (tool === 'rect') {
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.fillRect(pos.x - 20, pos.y - 20, 40, 40);
      shapesCountRef.current.rect += 1;
      strokeCountRef.current += 1;
    }
  };

  const moveDraw = (e: MouseEvent | TouchEvent) => {
    const ctx = ctxRef.current; if (!ctx) return;
    if (!isDrawingRef.current || tool !== 'pencil') return;
    const pos = getPos(e);
    const last = lastPosRef.current;
    if (!last) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPosRef.current = pos;
  };

  const endDraw = () => {
    const ctx = ctxRef.current; if (!ctx) return;
    if (isDrawingRef.current) {
      ctx.closePath();
    }
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  // 绑定事件
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mdown = (ev: MouseEvent) => startDraw(ev);
    const mmove = (ev: MouseEvent) => moveDraw(ev);
    const mup = () => endDraw();
    const tstart = (ev: TouchEvent) => startDraw(ev);
    const tmove = (ev: TouchEvent) => moveDraw(ev);
    const tend = () => endDraw();
    canvas.addEventListener('mousedown', mdown);
    canvas.addEventListener('mousemove', mmove);
    canvas.addEventListener('mouseup', mup);
    canvas.addEventListener('mouseleave', mup);
    canvas.addEventListener('touchstart', tstart, { passive: false });
    canvas.addEventListener('touchmove', tmove, { passive: false });
    canvas.addEventListener('touchend', tend, { passive: false });
    return () => {
      canvas.removeEventListener('mousedown', mdown);
      canvas.removeEventListener('mousemove', mmove);
      canvas.removeEventListener('mouseup', mup);
      canvas.removeEventListener('mouseleave', mup);
      canvas.removeEventListener('touchstart', tstart);
      canvas.removeEventListener('touchmove', tmove);
      canvas.removeEventListener('touchend', tend);
    };
  }, [tool, color]);

  return (
    <div className="drawing-game">
      <div className="drawing-toolbar" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <button className="tool-button" onClick={() => setTool('pencil')} style={{ padding: '6px 10px', borderRadius: 8, border: tool==='pencil'? '2px solid #5b8dfb':'1px solid #e7ebf3', background: '#fff' }}>✏️ 铅笔</button>
        <button className="tool-button" onClick={() => setTool('circle')} style={{ padding: '6px 10px', borderRadius: 8, border: tool==='circle'? '2px solid #5b8dfb':'1px solid #e7ebf3', background: '#fff' }}>⭕ 圆形</button>
        <button className="tool-button" onClick={() => setTool('rect')} style={{ padding: '6px 10px', borderRadius: 8, border: tool==='rect'? '2px solid #5b8dfb':'1px solid #e7ebf3', background: '#fff' }}>⬜ 方形</button>
        <div className="color-palette" style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
          <button className="color-swatch" onClick={() => setColor('#e74c3c')} style={{ width: 22, height: 22, borderRadius: 6, background: '#e74c3c', border: color==='#e74c3c'? '2px solid #333':'1px solid #e7ebf3' }} />
          <button className="color-swatch" onClick={() => setColor('#3498db')} style={{ width: 22, height: 22, borderRadius: 6, background: '#3498db', border: color==='#3498db'? '2px solid #333':'1px solid #e7ebf3' }} />
          <button className="color-swatch" onClick={() => setColor('#f1c40f')} style={{ width: 22, height: 22, borderRadius: 6, background: '#f1c40f', border: color==='#f1c40f'? '2px solid #333':'1px solid #e7ebf3' }} />
        </div>
      </div>
      <div className="drawing-canvas-container" style={{ background: '#fff', border: '1px solid #eff2f7', borderRadius: 12, boxShadow: '0 6px 14px rgba(27,35,73,0.06)', padding: 8 }}>
        <canvas ref={canvasRef} className="drawing-canvas" width={400} height={300} style={{ display: 'block', borderRadius: 8 }}></canvas>
      </div>
      <div className="drawing-timer" style={{ marginTop: 8, color: '#5c6370', fontWeight: 600 }}>剩余时间：{timeLeft}秒</div>
    </div>
  );
};

export default DrawingGame;