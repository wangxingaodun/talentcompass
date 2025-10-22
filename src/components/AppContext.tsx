import React, { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';

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
    creativity: { activeMs: number; colorsUsed: number; shapesUsed: number };
    imagination: { charCount: number; noveltyScore: number; consistencyScore: number; latencyMs: number };
    reaction: { hits: number; mistakes: number; avgLatencyMs: number; totalMs: number };
  };
}

// 定义Context类型
interface AppContextType {
  state: AppState;
  setCurrentPage: (page: 'welcome' | 'interactive' | 'report') => void;
  setChildName: (name: string) => void;
  setAgeBand: (age: '4-6' | '7-8' | '9-10') => void;
  recordMetric: (key: keyof AppState['metrics'], data: Partial<AppState['metrics'][keyof AppState['metrics']]>) => void;
  generateReportData: () => void;
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
      imagination: { charCount: 0, noveltyScore: 0, consistencyScore: 0, latencyMs: 0 },
      reaction: { hits: 0, mistakes: 0, avgLatencyMs: 0, totalMs: 10000 }
    }
  });

  // 设置当前页面
  const setCurrentPage = (page: 'welcome' | 'interactive' | 'report') => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  // 设置孩子名字
  const setChildName = (name: string) => {
    setState(prev => ({ ...prev, childName: name }));
  };

  const setAgeBand = (age: '4-6' | '7-8' | '9-10') => {
    setState(prev => ({ ...prev, ageBand: age }));
  };

  const recordMetric: AppContextType['recordMetric'] = (key, data) => {
    setState(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        [key]: { ...prev.metrics[key], ...(data as any) }
      }
    }));
  };

  // 生成报告数据（根据测试指标进行简单归一化计算）
  const generateReportData = () => {
    const { metrics, ageBand } = state;

    // 简化的年龄系数（低幼更宽容）
    const ageFactor = ageBand === '4-6' ? 0.9 : ageBand === '7-8' ? 1.0 : 1.1;

    const clamp10 = (n: number) => Math.max(0, Math.min(10, n));

    // 表达：字数与独特字符占比 + 速度
    const exprLenScore = clamp10((metrics.expression.charCount / 20) * 6);
    const exprVarScore = clamp10((metrics.expression.uniqueCharCount / Math.max(1, metrics.expression.charCount)) * 4 * 10);
    const exprSpeedScore = clamp10(10 - metrics.expression.latencyMs / 5000 * 3);
    const expression = clamp10((exprLenScore * 0.4 + exprVarScore * 0.3 + exprSpeedScore * 0.3) * ageFactor);

    // 逻辑：正确率 + 速度
    const logicAcc = metrics.logic.attempts > 0 ? metrics.logic.correct / metrics.logic.attempts : 0;
    const logicAccScore = clamp10(logicAcc * 10 * 0.6 * ageFactor);
    const logicSpeedScore = clamp10(10 - metrics.logic.avgLatencyMs / 4000 * 4);
    const logicStabilityScore = clamp10(logicAcc * 10 * 0.2);
    const logic = clamp10(logicAccScore + logicSpeedScore * 0.2 + logicStabilityScore);

    // 创造：有效绘制时间 + 多样性（占位）
    const creatTimeScore = clamp10((metrics.creativity.activeMs / 60000) * 10 * 0.6 * ageFactor);
    const creatDiversityScore = clamp10((metrics.creativity.colorsUsed + metrics.creativity.shapesUsed) / 6 * 10 * 0.4);
    const creativity = clamp10(creatTimeScore + creatDiversityScore);

    // 想象：新颖度 + 一致性 + 速度
    const imagNoveltyScore = clamp10(metrics.imagination.noveltyScore * 0.7);
    const imagConsistencyScore = clamp10(metrics.imagination.consistencyScore * 0.2);
    const imagSpeedScore = clamp10(10 - metrics.imagination.latencyMs / 5000 * 0.1);
    const imagination = clamp10((imagNoveltyScore + imagConsistencyScore + imagSpeedScore) * ageFactor);

    // 反应：命中率 + 速度 + 稳定
    const reacHitRate = metrics.reaction.totalMs > 0 ? metrics.reaction.hits / (metrics.reaction.totalMs / 1000) : 0; // 每秒命中数
    const reacHitScore = clamp10(reacHitRate * 2 * 0.5 * ageFactor);
    const reacSpeedScore = clamp10(10 - metrics.reaction.avgLatencyMs / 500 * 3);
    const reacMistakePenalty = clamp10(Math.max(0, 10 - metrics.reaction.mistakes * 2));
    const reaction = clamp10(reacHitScore + reacSpeedScore * 0.3 + reacMistakePenalty * 0.2);

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
        '玩“如果……会怎样？”的家庭游戏，培养幻想与表达',
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
  };

  // 提供Context值
  const contextValue: AppContextType = {
    state,
    setCurrentPage,
    setChildName,
    setAgeBand,
    recordMetric,
    generateReportData
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