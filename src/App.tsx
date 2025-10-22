import React, { useState } from 'react';
import AppProvider, { useAppContext } from './components/AppContext';
import WelcomePage from './components/WelcomePage';
import InteractivePage from './components/InteractivePage';
import ReportPage from './components/ReportPage';
import { APIConfig } from './components/APIConfig';
import './App.css';

// 主应用组件，使用Context
const AppContent: React.FC = () => {
  const { state, setCurrentPage, generateReportData } = useAppContext();
  const [showAPIConfig, setShowAPIConfig] = useState(false);

  // 处理开始测试
  const handleStartTest = () => {
    setCurrentPage('interactive');
  };

  // 处理测试完成，生成报告
  const handleTestComplete = async () => {
    await generateReportData();
    setCurrentPage('report');
  };

  // 根据当前页面渲染不同的组件
  return (
    <div className="app-container">
      {/* 设置按钮 */}
      <button 
        className="settings-button"
        onClick={() => setShowAPIConfig(true)}
        title="API设置"
      >
        ⚙️
      </button>

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
          imaginationAssessment={state.imaginationAssessment}
        />
      )}

      {/* API配置模态框 */}
      {showAPIConfig && (
        <APIConfig onClose={() => setShowAPIConfig(false)} />
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
