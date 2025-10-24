import React, { createContext, useState, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { DrawingMetrics, ImaginationAssessment } from './games/types';
import { evaluateImaginationWithLLM, evaluateImaginationTextWithLLM } from './imaginationEvaluator';

// 定义应用状态类型
interface AppState {
  currentPage: 'welcome' | 'interactive' | 'report';
  childName: string;
  testDate: string;
  ageBand: '4-6' | '7-8' | '9-10';
  scores: {
    expression: number;
    logic: number;
    creativity: number;
    imagination: number;
    reaction: number;
  };
  talentType: string;
  talentDescription: string;
  tips: string[];
  resources: {
    name: string;
    url: string;
  }[];
  metrics: {
    expression: { charCount: number; uniqueCharCount: number; latencyMs: number };
    logic: { correct: number; attempts: number; avgLatencyMs: number };
    creativity: DrawingMetrics | { activeMs: number; colorsUsed: number; shapesUsed: number };
    imagination: { charCount: number; noveltyScore: number; consistencyScore: number; latencyMs: number; answerText?: string };
    reaction: { hits: number; mistakes: number; avgLatencyMs: number; totalMs: number };
  };
  imaginationAssessment?: ImaginationAssessment;
  // 游戏进度相关状态
  currentGameType?: 'storytelling' | 'pattern' | 'drawing' | 'animalClick' | 'imagination';
  isCurrentGameCompleted: boolean;
}

// 定义Context类型
interface AppContextType {
  state: AppState;
  setCurrentPage: (page: 'welcome' | 'interactive' | 'report') => void;
  setChildName: (name: string) => void;
  setAgeBand: (age: '4-6' | '7-8' | '9-10') => void;
  recordMetric: (key: keyof AppState['metrics'], data: any) => void;
  generateReportData: () => Promise<void>;
  // 游戏进度管理方法
  setCurrentGameType: (gameType: 'storytelling' | 'pattern' | 'drawing' | 'animalClick' | 'imagination' | undefined) => void;
  setGameCompleted: (completed: boolean) => void;
}

// 创建Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// 定义Provider组件的props类型
interface AppProviderProps {
  children: ReactNode;
}

// 创建Provider组件
const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // 初始状态
  const [state, setState] = useState<AppState>({
    currentPage: 'welcome',
    childName: '小朋友',
    testDate: new Date().toLocaleDateString('zh-CN'),
    ageBand: '7-8',
    scores: {
      expression: 0,
      logic: 0,
      creativity: 0,
      imagination: 0,
      reaction: 0
    },
    talentType: 'explorer',
    talentDescription: '充满好奇心的小探险家！',
    tips: [],
    resources: [],
    metrics: {
      expression: { charCount: 0, uniqueCharCount: 0, latencyMs: 0 },
      logic: { correct: 0, attempts: 0, avgLatencyMs: 0 },
      creativity: { activeMs: 0, colorsUsed: 0, shapesUsed: 0 },
      imagination: { charCount: 0, noveltyScore: 0, consistencyScore: 0, latencyMs: 0, answerText: '' },
      reaction: { hits: 0, mistakes: 0, avgLatencyMs: 0, totalMs: 10000 }
    },
    // 游戏进度相关状态初始值
    currentGameType: undefined,
    isCurrentGameCompleted: false
  });

  // 设置当前页面
  const setCurrentPage = useCallback((page: 'welcome' | 'interactive' | 'report') => {
    setState(prev => ({ ...prev, currentPage: page }));
  }, []);

  // 设置孩子名字
  const setChildName = useCallback((name: string) => {
    setState(prev => ({ ...prev, childName: name }));
  }, []);

  const setAgeBand = useCallback((age: '4-6' | '7-8' | '9-10') => {
    setState(prev => ({ ...prev, ageBand: age }));
  }, []);

  const recordMetric: AppContextType['recordMetric'] = useCallback((key, data) => {
    setState(prev => {
      // 对于逻辑维度，需要累加correct和attempts，而不是覆盖
      if (key === 'logic') {
        const currentLogic = prev.metrics.logic;
        const newLogic = {
          correct: currentLogic.correct + (data.correct || 0),
          attempts: currentLogic.attempts + (data.attempts || 0),
          // avgLatencyMs使用加权平均
          avgLatencyMs: currentLogic.attempts > 0 
            ? (currentLogic.avgLatencyMs * currentLogic.attempts + (data.avgLatencyMs || 0) * (data.attempts || 0)) / (currentLogic.attempts + (data.attempts || 0))
            : (data.avgLatencyMs || 0)
        };
        return {
          ...prev,
          metrics: {
            ...prev.metrics,
            logic: newLogic
          }
        };
      }
      
      // 其他维度使用原有的覆盖逻辑
      return {
        ...prev,
        metrics: {
          ...prev.metrics,
          [key]: { ...prev.metrics[key], ...(data as any) }
        }
      };
    });
  }, []);

  // 设置当前游戏类型
  const setCurrentGameType = useCallback((gameType: 'storytelling' | 'pattern' | 'drawing' | 'animalClick' | 'imagination' | undefined) => {
    setState(prev => ({ ...prev, currentGameType: gameType }));
  }, []);

  // 设置游戏完成状态
  const setGameCompleted = useCallback((completed: boolean) => {
    setState(prev => ({ ...prev, isCurrentGameCompleted: completed }));
  }, []);

  // 生成报告数据
  const generateReportData = useCallback(async () => {
    const { metrics } = state;
    const ageFactor = state.ageBand === '4-6' ? 1.2 : state.ageBand === '7-8' ? 1.0 : 0.9;
    const clamp10 = (val: number) => Math.max(0, Math.min(10, val));

    // 表达：字符数 + 独特性 + 速度
    const exprCharScore = clamp10((metrics.expression.charCount / 50) * 10 * 0.5 * ageFactor);
    const exprUniqueScore = clamp10((metrics.expression.uniqueCharCount / 20) * 10 * 0.3);
    const exprSpeedScore = clamp10(10 - metrics.expression.latencyMs / 3000 * 2);
    const expression = clamp10(exprCharScore + exprUniqueScore + exprSpeedScore * 0.2);

    // 逻辑：正确率 + 速度
    const logicAcc = metrics.logic.attempts > 0 ? metrics.logic.correct / metrics.logic.attempts : 0;
    const logicAccScore = clamp10(logicAcc * 10 * 0.6 * ageFactor);
    const logicSpeedScore = clamp10(10 - metrics.logic.avgLatencyMs / 4000 * 4);
    const logicStabilityScore = clamp10(logicAcc * 10 * 0.2);
    const logic = clamp10(logicAccScore + logicSpeedScore * 0.2 + logicStabilityScore);

    // 创造：根据数据类型处理
    let creativity: number;
    if ('imageDataUrl' in metrics.creativity) {
      // 新的DrawingMetrics格式，使用想象力评估
      try {
        const assessment = await evaluateImaginationWithLLM(
          metrics.creativity.imageDataUrl,
          metrics.creativity,
          state.ageBand
        );
        
        // 保存评估结果
        setState(prev => ({
          ...prev,
          imaginationAssessment: assessment
        }));
        
        // 将评估分数转换为创造力分数
        creativity = clamp10((assessment.score / 100) * 10 * ageFactor);
      } catch (error) {
        console.error('想象力评估失败:', error);
        // 使用基础算法作为兜底
        const timeScore = clamp10((metrics.creativity.totalMs / 10000) * 10 * 0.6 * ageFactor);
        const diversityScore = clamp10((metrics.creativity.colorsUsed + metrics.creativity.toolVariety) / 6 * 10 * 0.4);
        creativity = clamp10(timeScore + diversityScore);
      }
    } else {
      // 旧的格式，使用原有逻辑
      const creatTimeScore = clamp10((metrics.creativity.activeMs / 10000) * 10 * 0.6 * ageFactor);
      const creatDiversityScore = clamp10((metrics.creativity.colorsUsed + metrics.creativity.shapesUsed) / 6 * 10 * 0.4);
      creativity = clamp10(creatTimeScore + creatDiversityScore);
    }

    // 想象：新颖度 + 一致性 + 速度
    // 想象：优先用文本大模型评估，其次回退到启发式
    let imagination: number;
    const answerText = (metrics.imagination as any).answerText;
    if (answerText && String(answerText).trim()) {
      try {
        const assessment = await evaluateImaginationTextWithLLM(String(answerText), state.ageBand);
        setState(prev => ({
          ...prev,
          imaginationAssessment: assessment
        }));
        imagination = clamp10((assessment.score / 100) * 10 * ageFactor);
      } catch (error) {
        console.error('文本想象力评估失败:', error);
        const imagNoveltyScore = clamp10(metrics.imagination.noveltyScore * 0.7);
        const imagConsistencyScore = clamp10(metrics.imagination.consistencyScore * 0.2);
        const imagSpeedScore = clamp10(10 - metrics.imagination.latencyMs / 5000 * 0.1);
        imagination = clamp10((imagNoveltyScore + imagConsistencyScore + imagSpeedScore) * ageFactor);
      }
    } else {
      const imagNoveltyScore = clamp10(metrics.imagination.noveltyScore * 0.7);
      const imagConsistencyScore = clamp10(metrics.imagination.consistencyScore * 0.2);
      const imagSpeedScore = clamp10(10 - metrics.imagination.latencyMs / 5000 * 0.1);
      imagination = clamp10((imagNoveltyScore + imagConsistencyScore + imagSpeedScore) * ageFactor);
    }

    // 反应：命中数量 + 反应速度 + 准确率综合评分
    // 1. 命中数量得分（占50%）- 命中越多分数越高
    const hitCountScore = clamp10(Math.min(metrics.reaction.hits / 15 * 10, 10)); // 15次命中为满分
    
    // 2. 反应速度得分（占30%）- 平均反应时间越短分数越高
    const avgReactionTime = metrics.reaction.avgLatencyMs;
    const speedScore = clamp10(Math.max(0, 10 - avgReactionTime / 150)); // 150ms以下为满分，每增加150ms减1分
    
    // 3. 准确率得分（占20%）- 准确率越高分数越高
    const totalAttempts = metrics.reaction.hits + metrics.reaction.mistakes;
    const accuracy = totalAttempts > 0 ? metrics.reaction.hits / totalAttempts : 0;
    const accuracyScore = clamp10(accuracy * 10);
    
    // 综合计算反应力得分
    const reaction = clamp10((hitCountScore * 0.5 + speedScore * 0.3 + accuracyScore * 0.2) * ageFactor);

    const newScores = { expression, logic, creativity, imagination, reaction };

    // 找出最高分的维度，确定天赋类型
    let highestScore = Math.max(...Object.values(newScores));
    let talentType = 'inventor';
    let talentDescription = '';

    if (newScores.expression === highestScore) {
      talentType = 'artist';
      talentDescription = `你家的${state.childName}像一位富有表现力的小故事家！喜欢用语言和故事表达自己的想法。`;
    } else if (newScores.logic === highestScore) {
      talentType = 'scientist';
      talentDescription = `你家的${state.childName}像一位聪明的小科学家！善于发现规律和解决问题。`;
    } else if (newScores.creativity === highestScore) {
      talentType = 'inventor';
      talentDescription = `你家的${state.childName}像一位充满想象力的小发明家！总能创造出新奇的点子。`;
    } else if (newScores.imagination === highestScore) {
      talentType = 'storyteller';
      talentDescription = `你家的${state.childName}像一位奇思妙想的小故事家！擅长把不同事物组合成有趣的世界。`;
    } else if (newScores.reaction === highestScore) {
      talentType = 'explorer';
      talentDescription = `你家的${state.childName}像一位敏捷的小探险家！反应迅速，喜欢尝试新事物。`;
    }

    // 根据天赋类型生成小贴士
    let tips: string[] = [];
    if (talentType === 'artist') {
      tips = [
        '多提供讲故事、表演的机会，鼓励孩子表达自己的想法',
        '可以尝试参加语言类兴趣班，如朗诵、主持等',
        '为孩子创造丰富的阅读环境，培养阅读兴趣'
      ];
    } else if (talentType === 'scientist') {
      tips = [
        '提供拼图、积木等益智玩具，锻炼逻辑思维能力',
        '鼓励孩子提问，并一起探索答案',
        '可以尝试参加科学实验、数学思维等课程'
      ];
    } else if (talentType === 'inventor') {
      tips = [
        '多提供绘画、手工材料，鼓励孩子自由创作',
        '不要限制孩子的创意表达，尊重独特的想法',
        '可以尝试参加绘画、手工、创意编程等课程'
      ];
    } else if (talentType === 'storyteller') {
      tips = [
        '玩"如果……会怎样？"的家庭游戏，培养幻想与表达',
        '鼓励孩子为作品或玩具起名字并讲故事',
        '一起阅读富有想象力的绘本，扩展联想边界'
      ];
    } else if (talentType === 'explorer') {
      tips = [
        '多带孩子到户外探索自然，接触不同环境',
        '提供运动类玩具，锻炼反应能力和协调性',
        '可以尝试参加舞蹈、武术、球类等运动课程'
      ];
    }

    // 推荐资源
    const resources = [
      { name: '国家地理少儿频道', url: 'https://kids.nationalgeographic.com/' },
      { name: '儿童创意工坊', url: 'https://www.creativebug.com/' },
      { name: '趣味科学实验', url: 'https://www.stevespanglerscience.com/' }
    ];

    // 更新状态
    setState(prev => ({
      ...prev,
      scores: newScores,
      talentType,
      talentDescription,
      tips,
      resources
    }));
  }, [state]);

  // 提供Context值
  const contextValue: AppContextType = {
    state,
    setCurrentPage,
    setChildName,
    setAgeBand,
    recordMetric,
    generateReportData,
    setCurrentGameType,
    setGameCompleted
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// 创建自定义Hook，方便组件使用Context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppProvider;