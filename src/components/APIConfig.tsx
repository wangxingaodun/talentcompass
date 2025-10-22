import React, { useState, useEffect } from 'react';

interface APIConfigProps {
  onClose: () => void;
}

export const APIConfig: React.FC<APIConfigProps> = ({ onClose }) => {
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [showKeys, setShowKeys] = useState(false);

  useEffect(() => {
    // 加载已保存的API密钥
    const savedOpenaiKey = localStorage.getItem('openai_api_key') || '';
    const savedAnthropicKey = localStorage.getItem('anthropic_api_key') || '';
    setOpenaiKey(savedOpenaiKey);
    setAnthropicKey(savedAnthropicKey);
  }, []);

  const handleSave = () => {
    // 保存API密钥到localStorage
    if (openaiKey.trim()) {
      localStorage.setItem('openai_api_key', openaiKey.trim());
    } else {
      localStorage.removeItem('openai_api_key');
    }

    if (anthropicKey.trim()) {
      localStorage.setItem('anthropic_api_key', anthropicKey.trim());
    } else {
      localStorage.removeItem('anthropic_api_key');
    }

    alert('API配置已保存！');
    onClose();
  };

  const handleClear = () => {
    localStorage.removeItem('openai_api_key');
    localStorage.removeItem('anthropic_api_key');
    setOpenaiKey('');
    setAnthropicKey('');
    alert('API配置已清除！');
  };

  return (
    <div className="api-config-overlay">
      <div className="api-config-modal">
        <div className="api-config-header">
          <h2>🤖 多模态AI配置</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="api-config-content">
          <div className="api-info">
            <p>配置真实的多模态AI API以获得更准确的想象力评估结果。</p>
            <p>如果不配置，系统将使用本地算法进行评估。</p>
          </div>

          <div className="api-section">
            <h3>🔥 OpenAI GPT-4 Vision (推荐)</h3>
            <p className="api-description">
              最先进的多模态AI，评估准确度最高。
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                获取API密钥 →
              </a>
            </p>
            <input
              type={showKeys ? 'text' : 'password'}
              placeholder="sk-..."
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              className="api-input"
            />
          </div>

          <div className="api-section">
            <h3>🧠 Anthropic Claude 3 Vision (备选)</h3>
            <p className="api-description">
              优秀的替代方案，在创意评估方面表现出色。
              <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer">
                获取API密钥 →
              </a>
            </p>
            <input
              type={showKeys ? 'text' : 'password'}
              placeholder="sk-ant-..."
              value={anthropicKey}
              onChange={(e) => setAnthropicKey(e.target.value)}
              className="api-input"
            />
          </div>

          <div className="api-controls">
            <label className="show-keys-toggle">
              <input
                type="checkbox"
                checked={showKeys}
                onChange={(e) => setShowKeys(e.target.checked)}
              />
              显示密钥
            </label>
          </div>

          <div className="api-actions">
            <button onClick={handleClear} className="clear-btn">
              清除配置
            </button>
            <button onClick={handleSave} className="save-btn">
              保存配置
            </button>
          </div>

          <div className="api-note">
            <p><strong>隐私说明：</strong></p>
            <ul>
              <li>API密钥仅保存在您的浏览器本地存储中</li>
              <li>不会上传到任何服务器</li>
              <li>仅用于直接调用AI服务进行评估</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};