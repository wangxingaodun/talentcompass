export type Dimension = 'expression' | 'logic' | 'creativity' | 'imagination' | 'reaction';

export interface GameStageResult {
  dimension: Dimension;
  metrics: Record<string, number>;
}

export interface GameStageProps {
  childName: string;
  setPrompt: (text: string) => void;
  onComplete: (result: GameStageResult) => void;
}