export type Dimension = 'expression' | 'logic' | 'creativity' | 'imagination' | 'reaction';

// 绘画工具类型
export type DrawingTool = 'pencil' | 'eraser' | 'line' | 'circle' | 'rect' | 'triangle' | 'star' | 'brush';

// 扩展的绘画元数据接口
export interface DrawingMetrics {
  totalMs: number;
  colorsUsed: number;
  shapesUsed: number;
  strokeCount: number;
  toolVariety: number;
  usedColors: string[];
  shapeBreakdown: { pencil: number; circle: number; rect: number; triangle: number; star: number; line: number; brush: number };
  imageDataUrl: string;
  undoCount: number;
  clearCount: number;
  brushSizeChanges: number;
}

// 想象力评估结果接口
export interface ImaginationAssessment {
  score: number; // 0-100
  level: 'excellent' | 'good' | 'needs_improvement';
  reasons: string[];
  suggestions: string[];
  confidence: number; // 0-1
}

export interface GameStageResult {
  dimension: Dimension;
  metrics: Record<string, number> | DrawingMetrics;
}

export interface GameStageProps {
  childName: string;
  setPrompt: (text: string) => void;
  onComplete: (result: GameStageResult) => void;
}