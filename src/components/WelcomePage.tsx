import React, { useState } from 'react';
import { useAppContext } from './AppContext';

interface WelcomePageProps {
  onStartTest: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onStartTest }) => {
  const { setChildName } = useAppContext();
  const [localName, setLocalName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!localName.trim()) {
      setError('请填写昵称');
      return;
    }
    setError('');
    setChildName(localName.trim());
    onStartTest();
  };

  return (
    <div className="welcome-page">
      <div className="welcome-content">
        <h1 className="welcome-title">
          <span className="ai-badge">
            <span className="ai-icon">✨</span>
            AI驱动
          </span>
          发现孩子的天赋火花！智能天赋测评
        </h1>
        <p className="welcome-subtitle">
          🚀 AI智能分析 · 多维度评估 · 个性化报告<br/>
          15–20分钟，AI助教陪孩子玩5个智能小游戏，生成专属天赋洞察报告
        </p>
        
        <div className="ai-features">
          <div className="feature-item">
            <span className="feature-icon">🧠</span>
            <span className="feature-text">AI智能评估</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span className="feature-text">数据驱动分析</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <span className="feature-text">精准天赋识别</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <span className="feature-text">实时智能反馈</span>
          </div>
        </div>
        


        <div className="welcome-form">
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">👶</span>
              昵称
            </label>
            <input
              type="text"
              placeholder="给孩子起个昵称"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              className="form-input"
            />
          </div>
          {error && <div className="form-error">{error}</div>}
        </div>
        
        <button className="start-test-button" onClick={handleSubmit} style={{ marginTop: 16 }}>
          开始测试
        </button>
        
        <p className="privacy-note">
          🔒 AI技术保障隐私安全，数据仅用于本次智能分析，完成后可删除
        </p>
      </div>
    </div>
  );
};

export default WelcomePage;