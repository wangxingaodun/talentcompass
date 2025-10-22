import React, { useState } from 'react';
import { useAppContext } from './AppContext';

interface WelcomePageProps {
  onStartTest: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onStartTest }) => {
  const { setChildName, setAgeBand } = useAppContext();
  const [localName, setLocalName] = useState('');
  const [localAgeBand, setLocalAgeBand] = useState<'4-6' | '7-8' | '9-10' | ''>('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!localName.trim() || !localAgeBand) {
      setError('请填写昵称并选择年龄段');
      return;
    }
    setError('');
    setChildName(localName.trim());
    setAgeBand(localAgeBand);
    onStartTest();
  };

  return (
    <div className="welcome-page">
      <div className="welcome-content">
        <h1 className="welcome-title">发现孩子的天赋火花！免费趣味小测试</h1>
        <p className="welcome-subtitle">15–20分钟，AI小老师陪孩子玩5个小游戏，生成专属兴趣报告</p>
        
        <div className="welcome-illustration">
          {/* 卡通孩子与AI老师互动的场景 - 使用占位图 */}
          <div className="illustration-placeholder">
            <svg width="300" height="250" viewBox="0 0 300 250" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="300" height="250" rx="20" fill="#F5F7FA" />
              <circle cx="100" cy="120" r="50" fill="#4CAF50" />
              <circle cx="200" cy="120" r="40" fill="#2196F3" />
              <path d="M100 170 Q150 220 200 170" stroke="#FF5722" strokeWidth="4" fill="none" />
              <path d="M80 100 L120 100" stroke="white" strokeWidth="8" />
              <path d="M185 110 L215 110" stroke="white" strokeWidth="6" />
            </svg>
          </div>
        </div>

        <div className="welcome-form">
          <div className="form-row">
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
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🎂</span>
                年龄段
              </label>
              <select
                value={localAgeBand}
                onChange={(e) => setLocalAgeBand(e.target.value as '4-6' | '7-8' | '9-10' | '')}
                className="form-select"
              >
                <option value="">请选择</option>
                <option value="4-6">4–6岁</option>
                <option value="7-8">7–8岁</option>
                <option value="9-10">9–10岁</option>
              </select>
            </div>
          </div>
          {error && <div className="form-error">{error}</div>}
        </div>
        
        <button className="start-test-button" onClick={handleSubmit} style={{ marginTop: 16 }}>
          开始测试
        </button>
        
        <p className="privacy-note">
          测试过程安全，数据仅用于本次报告，完成后可删除。
        </p>
      </div>
    </div>
  );
};

export default WelcomePage;