import React, { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';

// 定义应用状态类型
interface AppState {
  currentPage: 'welcome' | 'interactive' | 'report';
  childName: string;
  testDate: string;
  scores: {
    expression: number;
    logic: number;
    creativity: number;
    reaction: number;
  };
  talentType: string;
  talentDescription: string;
  tips: string[];
  resources: {
    name: string;
    url: string;
  }[];
}

// 定义Context类型
interface AppContextType {
  state: AppState;
  setCurrentPage: (page: 'welcome' | 'interactive' | 'report') => void;
  setChildName: (name: string) => void;
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
    childName: '小明', // 默认名字，可以在欢迎页修改
    testDate: new Date().toLocaleDateString('zh-CN'),
    scores: {
      expression: 0,
      logic: 0,
      creativity: 0,
      reaction: 0
    },
    talentType: 'explorer',
    talentDescription: '你家的小明像一只充满好奇心的小探险家！',
    tips: [],
    resources: []
  });

  // 设置当前页面
  const setCurrentPage = (page: 'welcome' | 'interactive' | 'report') => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  // 设置孩子名字
  const setChildName = (name: string) => {
    setState(prev => ({ ...prev, childName: name }));
  };

  // 生成报告数据（这里模拟生成，实际应用中应该根据测试结果计算）
  const generateReportData = () => {
    // 随机生成各项分数（实际应用中应该根据测试结果计算）
    const newScores = {
      expression: Math.floor(Math.random() * 5) + 5, // 5-10分
      logic: Math.floor(Math.random() * 5) + 5,
      creativity: Math.floor(Math.random() * 5) + 5,
      reaction: Math.floor(Math.random() * 5) + 5
    };

    // 找出最高分的维度，确定天赋类型
    let highestScore = Math.max(...Object.values(newScores));
    let talentType = 'inventor';
    let talentDescription = '';

    if (newScores.expression === highestScore) {
      talentType = 'artist';
      talentDescription = `你家的${state.childName}像一位富有表现力的小艺术家！喜欢用语言和故事表达自己的想法。`;
    } else if (newScores.logic === highestScore) {
      talentType = 'scientist';
      talentDescription = `你家的${state.childName}像一位聪明的小科学家！善于发现规律和解决问题。`;
    } else if (newScores.creativity === highestScore) {
      talentType = 'inventor';
      talentDescription = `你家的${state.childName}像一位充满想象力的小发明家！总能创造出新奇的点子。`;
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