import React from 'react';
import AppProvider, { useAppContext } from './components/AppContext';
import WelcomePage from './components/WelcomePage';
import InteractivePage from './components/InteractivePage';
import ReportPage from './components/ReportPage';
import './App.css';

// 主应用组件，使用Context
const AppContent: React.FC = () => {
  const { state, setCurrentPage, generateReportData } = useAppContext();

  // 处理开始测试
  const handleStartTest = () => {
    setCurrentPage('interactive');
  };

  // 处理测试完成，生成报告
  const handleTestComplete = () => {
    generateReportData();
    setCurrentPage('report');
  };

  // 根据当前页面渲染不同的组件
  return (
    <div className="app-container">
      {state.currentPage === 'welcome' && (
        <WelcomePage onStartTest={handleStartTest} />
      )}
      {state.currentPage === 'interactive' && (
        <InteractivePage 
          onComplete={handleTestComplete} 
          childName={state.childName} 
        />
      )}
      {state.currentPage === 'report' && (
        <ReportPage 
          childName={state.childName} 
          testDate={state.testDate} 
          scores={state.scores} 
          talentType={state.talentType} 
          talentDescription={state.talentDescription} 
          tips={state.tips} 
          resources={state.resources} 
        />
      )}
    </div>
  );
};

// 包装主应用组件，提供Context
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
