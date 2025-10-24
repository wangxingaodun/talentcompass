import React from 'react';
import type { GameStageProps, GameStageResult, DrawingMetrics, DrawingTool } from './types';
import './DrawingGame.css';

const DRAWING_DURATION = 15; // 绘画游戏时长（秒）- 增加时间以适应更多功能

const DrawingGame: React.FC<GameStageProps> = ({ childName, setPrompt, onComplete }) => {
  const [timeLeft, setTimeLeft] = React.useState(DRAWING_DURATION);
  const [tool, setTool] = React.useState<DrawingTool>('pencil');
  const [color, setColor] = React.useState<string>('#3498db');
  const [brushSize, setBrushSize] = React.useState<number>(4);
  const [backgroundTemplate, setBackgroundTemplate] = React.useState<'none' | 'grid' | 'sky'>('none');
  
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = React.useRef(false);
  const lastPosRef = React.useRef<{ x: number; y: number } | null>(null);
  const intervalRef = React.useRef<number | null>(null);
  const usedColorsRef = React.useRef<Set<string>>(new Set());
  const shapesCountRef = React.useRef<{ pencil: number; circle: number; rect: number; triangle: number; star: number; line: number; brush: number }>({ 
    pencil: 0, circle: 0, rect: 0, triangle: 0, star: 0, line: 0, brush: 0 
  });
  const strokeCountRef = React.useRef<number>(0);
  const startTimeRef = React.useRef<number>(Date.now());
  const undoStackRef = React.useRef<ImageData[]>([]);
  const redoStackRef = React.useRef<ImageData[]>([]);
  const undoCountRef = React.useRef<number>(0);
  const clearCountRef = React.useRef<number>(0);
  const brushSizeChangesRef = React.useRef<number>(0);

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

  // 保存画布状态到撤销栈
  const saveCanvasState = React.useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStackRef.current.push(imageData);
    
    // 限制撤销栈大小
    if (undoStackRef.current.length > 20) {
      undoStackRef.current.shift();
    }
    
    // 清空重做栈
    redoStackRef.current = [];
  }, []);

  // 撤销功能
  const undo = React.useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx || undoStackRef.current.length === 0) return;
    
    // 保存当前状态到重做栈
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    redoStackRef.current.push(currentState);
    
    // 恢复上一个状态
    const previousState = undoStackRef.current.pop()!;
    ctx.putImageData(previousState, 0, 0);
    
    undoCountRef.current += 1;
  }, []);

  // 重做功能
  const redo = React.useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx || redoStackRef.current.length === 0) return;
    
    // 保存当前状态到撤销栈
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStackRef.current.push(currentState);
    
    // 恢复重做状态
    const redoState = redoStackRef.current.pop()!;
    ctx.putImageData(redoState, 0, 0);
  }, []);

  // 清空画布
  const clearCanvas = React.useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    
    // 保存当前状态
    saveCanvasState();
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 重新应用背景模板
    if (backgroundTemplate === 'grid') {
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }
    } else if (backgroundTemplate === 'sky') {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#E0F6FF');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    clearCountRef.current += 1;
  }, [backgroundTemplate]);

  // 应用背景模板
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    
    if (backgroundTemplate === 'grid') {
      // 绘制网格背景
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      
      // 垂直线
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      
      // 水平线
      for (let i = 0; i < canvas.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }
    } else if (backgroundTemplate === 'sky') {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#E0F6FF');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [backgroundTemplate]);

  // 使用useCallback确保onComplete函数引用稳定
  const handleGameComplete = React.useCallback(() => {
    // 导出画布图像
    const canvas = canvasRef.current;
    const imageDataUrl = canvas ? canvas.toDataURL('image/webp', 0.9) : '';
    
    const totalShapes = Object.values(shapesCountRef.current).reduce((sum, count) => sum + count, 0);
    
    const result: GameStageResult = {
      dimension: 'creativity',
      metrics: {
        totalMs: Date.now() - startTimeRef.current,
        colorsUsed: usedColorsRef.current.size,
        shapesUsed: totalShapes,
        strokeCount: strokeCountRef.current,
        toolVariety: Object.values(shapesCountRef.current).filter(count => count > 0).length,
        usedColors: Array.from(usedColorsRef.current),
        shapeBreakdown: { ...shapesCountRef.current },
        imageDataUrl,
        undoCount: undoCountRef.current,
        clearCount: clearCountRef.current,
        brushSizeChanges: brushSizeChangesRef.current,
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
    shapesCountRef.current = { pencil: 0, circle: 0, rect: 0, triangle: 0, star: 0, line: 0, brush: 0 };
    strokeCountRef.current = 0;
    undoStackRef.current = [];
    redoStackRef.current = [];
    undoCountRef.current = 0;
    clearCountRef.current = 0;
    brushSizeChangesRef.current = 0;
    
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

  // 绘制三角形
  const drawTriangle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - size, y + size);
    ctx.lineTo(x + size, y + size);
    ctx.closePath();
    ctx.fill();
  };

  // 绘制星形
  const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.4;
    
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fill();
  };

  const startDraw = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    const ctx = ctxRef.current; 
    if (!ctx) return;
    
    // 保存画布状态（用于撤销功能）
    saveCanvasState();
    
    const pos = getPos(e);
    usedColorsRef.current.add(color);
    
    if (tool === 'pencil' || tool === 'brush') {
      isDrawingRef.current = true;
      lastPosRef.current = pos;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = tool === 'brush' ? brushSize * 2 : brushSize;
      ctx.lineCap = tool === 'brush' ? 'round' : 'round';
      ctx.moveTo(pos.x, pos.y);
      if (tool in shapesCountRef.current) {
        (shapesCountRef.current as any)[tool] += 1;
      }
      strokeCountRef.current += 1;
    } else if (tool === 'eraser') {
      isDrawingRef.current = true;
      lastPosRef.current = pos;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.lineWidth = brushSize * 2;
      ctx.moveTo(pos.x, pos.y);
      strokeCountRef.current += 1;
    } else if (tool === 'line') {
      isDrawingRef.current = true;
      lastPosRef.current = pos;
    } else if (tool === 'circle') {
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(pos.x, pos.y, brushSize * 3, 0, Math.PI * 2);
      ctx.fill();
      shapesCountRef.current.circle += 1;
      strokeCountRef.current += 1;
    } else if (tool === 'rect') {
      ctx.beginPath();
      ctx.fillStyle = color;
      const size = brushSize * 3;
      ctx.fillRect(pos.x - size, pos.y - size, size * 2, size * 2);
      shapesCountRef.current.rect += 1;
      strokeCountRef.current += 1;
    } else if (tool === 'triangle') {
      ctx.fillStyle = color;
      drawTriangle(ctx, pos.x, pos.y, brushSize * 3);
      shapesCountRef.current.triangle += 1;
      strokeCountRef.current += 1;
    } else if (tool === 'star') {
      ctx.fillStyle = color;
      drawStar(ctx, pos.x, pos.y, brushSize * 3);
      shapesCountRef.current.star += 1;
      strokeCountRef.current += 1;
    }
  };

  const moveDraw = (e: MouseEvent | TouchEvent) => {
    const ctx = ctxRef.current; 
    if (!ctx) return;
    if (!isDrawingRef.current) return;
    
    const pos = getPos(e);
    const last = lastPosRef.current;
    if (!last) return;
    
    if (tool === 'pencil' || tool === 'brush') {
      ctx.strokeStyle = color;
      ctx.lineWidth = tool === 'brush' ? brushSize * 2 : brushSize;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastPosRef.current = pos;
    } else if (tool === 'eraser') {
      ctx.lineWidth = brushSize * 2;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastPosRef.current = pos;
    }
  };

  const endDraw = (e?: MouseEvent | TouchEvent) => {
    const ctx = ctxRef.current; 
    if (!ctx) return;
    
    if (isDrawingRef.current) {
      if (tool === 'line' && lastPosRef.current && e) {
        // 绘制直线
        const pos = getPos(e);
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        shapesCountRef.current.line += 1;
        strokeCountRef.current += 1;
      }
      
      ctx.closePath();
      
      // 重置合成操作（橡皮擦后）
      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'source-over';
      }
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
    const mup = (ev: MouseEvent) => endDraw(ev);
    const mleave = () => endDraw();
    const tstart = (ev: TouchEvent) => startDraw(ev);
    const tmove = (ev: TouchEvent) => moveDraw(ev);
    const tend = (ev: TouchEvent) => endDraw(ev);
    canvas.addEventListener('mousedown', mdown);
    canvas.addEventListener('mousemove', mmove);
    canvas.addEventListener('mouseup', mup);
    canvas.addEventListener('mouseleave', mleave);
    canvas.addEventListener('touchstart', tstart, { passive: false });
    canvas.addEventListener('touchmove', tmove, { passive: false });
    canvas.addEventListener('touchend', tend, { passive: false });
    return () => {
      canvas.removeEventListener('mousedown', mdown);
      canvas.removeEventListener('mousemove', mmove);
      canvas.removeEventListener('mouseup', mup);
      canvas.removeEventListener('mouseleave', mleave);
      canvas.removeEventListener('touchstart', tstart);
      canvas.removeEventListener('touchmove', tmove);
      canvas.removeEventListener('touchend', tend);
    };
  }, [tool, color, brushSize]);

  return (
    <div className="drawing-game">
      <div className="drawing-header">
        <h3>绘画创作</h3>
        <div className="drawing-timer">
          剩余时间: {timeLeft}秒
        </div>
      </div>
      
      <div className="drawing-tools">
        {/* 绘画工具 */}
        <div className="tool-group">
          <button 
            className={`tool-btn ${tool === 'pencil' ? 'active' : ''}`}
            onClick={() => setTool('pencil')}
            title="铅笔"
          >
            ✏️
          </button>
          <button 
            className={`tool-btn ${tool === 'brush' ? 'active' : ''}`}
            onClick={() => setTool('brush')}
            title="画笔"
          >
            🖌️
          </button>
          <button 
            className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
            onClick={() => setTool('eraser')}
            title="橡皮擦"
          >
            🧽
          </button>
          <button 
            className={`tool-btn ${tool === 'line' ? 'active' : ''}`}
            onClick={() => setTool('line')}
            title="直线"
          >
            📏
          </button>
          <button 
            className={`tool-btn ${tool === 'circle' ? 'active' : ''}`}
            onClick={() => setTool('circle')}
            title="圆形"
          >
            ⭕
          </button>
          <button 
            className={`tool-btn ${tool === 'rect' ? 'active' : ''}`}
            onClick={() => setTool('rect')}
            title="矩形"
          >
            ⬜
          </button>
          <button 
            className={`tool-btn ${tool === 'triangle' ? 'active' : ''}`}
            onClick={() => setTool('triangle')}
            title="三角形"
          >
            🔺
          </button>
          <button 
            className={`tool-btn ${tool === 'star' ? 'active' : ''}`}
            onClick={() => setTool('star')}
            title="星形"
          >
            ⭐
          </button>
        </div>
        
        {/* 颜色选择 */}
        <div className="color-group">
          {[
            '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', 
            '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
            '#ffc0cb', '#a52a2a', '#808080', '#90ee90', '#87ceeb'
          ].map(c => (
            <button
              key={c}
              className={`color-btn ${color === c ? 'active' : ''}`}
              style={{ backgroundColor: c, border: c === '#ffffff' ? '2px solid #ccc' : 'none' }}
              onClick={() => setColor(c)}
              title={`颜色: ${c}`}
            />
          ))}
        </div>
        
        {/* 画笔大小 */}
        <div className="brush-size-group">
          <label>画笔大小:</label>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => {
               setBrushSize(Number(e.target.value));
               brushSizeChangesRef.current += 1;
             }}
            className="brush-size-slider"
          />
          <span className="brush-size-value">{brushSize}px</span>
        </div>
        
        {/* 功能按钮 */}
        <div className="action-group">
          <button 
            className="action-btn"
            onClick={undo}
            disabled={undoStackRef.current.length === 0}
            title="撤销"
          >
            ↶ 撤销
          </button>
          <button 
            className="action-btn"
            onClick={redo}
            disabled={redoStackRef.current.length === 0}
            title="重做"
          >
            ↷ 重做
          </button>
          <button 
            className="action-btn clear-btn"
            onClick={clearCanvas}
            title="清空画布"
          >
            🗑️ 清空
          </button>
        </div>
        
        {/* 背景模板 */}
        <div className="template-group">
          <label>背景:</label>
          <select 
             value={backgroundTemplate}
             onChange={(e) => setBackgroundTemplate(e.target.value as 'none' | 'grid' | 'sky')}
             className="template-select"
           >
             <option value="none">无背景</option>
             <option value="grid">网格</option>
             <option value="sky">天空</option>
           </select>
        </div>
      </div>
      
      <div className="drawing-canvas-container">
        <canvas
          ref={canvasRef}
          className="drawing-canvas"
          width={800}
          height={600}
        />
      </div>
    </div>
  );
};

export default DrawingGame;