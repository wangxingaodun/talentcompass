import React from 'react';
import { useAppContext } from './AppContext';
import type { ImaginationAssessment } from './games/types';

interface ReportPage3Props {
  childName: string;
  talentType: string;
  tips: string[];
  resources: {
    name: string;
    url: string;
  }[];
  imaginationAssessment?: ImaginationAssessment;
}

const ReportPage3: React.FC<ReportPage3Props> = ({
  childName,
  talentType,
  tips,
  resources,
  imaginationAssessment
}) => {
  const { state } = useAppContext();
  const imagMetrics = state.metrics.imagination || ({} as any);
  // 根据天赋类型获取个性化建议
  const getPersonalizedAdvice = () => {
    switch (talentType.toLowerCase()) {
      case 'inventor':
        return {
          icon: '🔧',
          title: '发明家成长路径',
          description: '培养动手能力和创新思维，鼓励探索科技世界',
          activities: [
            '参与科学实验和手工制作',
            '学习编程和机器人制作',
            '观察生活中的问题并思考解决方案',
            '参观科技馆和创客空间'
          ]
        };
      case 'artist':
        return {
          icon: '🎨',
          title: '艺术家成长路径',
          description: '发展美感和创意表达，培养艺术鉴赏能力',
          activities: [
            '尝试不同的艺术媒介和技法',
            '参观美术馆和艺术展览',
            '学习色彩搭配和构图技巧',
            '创作个人作品集'
          ]
        };
      case 'scientist':
        return {
          icon: '🔬',
          title: '科学家成长路径',
          description: '培养观察力和逻辑思维，激发对自然的好奇心',
          activities: [
            '进行简单的科学实验',
            '观察自然现象并记录',
            '学习科学方法和思维',
            '阅读科普书籍和杂志'
          ]
        };
      case 'explorer':
        return {
          icon: '🗺️',
          title: '探险家成长路径',
          description: '培养勇气和适应能力，拓展视野和见识',
          activities: [
            '参与户外活动和探索',
            '学习地理和历史知识',
            '培养团队合作精神',
            '挑战新的环境和任务'
          ]
        };
      case 'storyteller':
        return {
          icon: '📚',
          title: '故事家成长路径',
          description: '发展语言表达和想象力，培养叙事技巧',
          activities: [
            '多读各类优秀作品',
            '练习口语表达和写作',
            '创作原创故事',
            '参与戏剧和表演活动'
          ]
        };
      default:
        return {
          icon: '🌟',
          title: '全面发展路径',
          description: '均衡发展各项能力，发现更多可能性',
          activities: [
            '尝试多种不同的活动',
            '培养好奇心和学习兴趣',
            '发展社交和沟通能力',
            '保持开放的心态'
          ]
        };
    }
  };

  const personalizedAdvice = getPersonalizedAdvice();

  return (
    <div className="report-page-content">
      {/* 想象力报告（文本） */}
      <div className="imagination-text-report">
        <h2>✨ 想象力报告（文本）</h2>
        {!imaginationAssessment ? (
          <p>暂无想象力评估数据</p>
        ) : (
          <div className="imagination-report-content">
            {/* 题目与回答 */}
            <div className="qa-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="qa-card">
                <div className="qa-label">题目</div>
                <div className="qa-text" style={{ whiteSpace: 'pre-wrap' }}>{imagMetrics.prompt || '（未提供题目）'}</div>
              </div>
              <div className="qa-card">
                <div className="qa-label">孩子回答</div>
                <div className="qa-text" style={{ whiteSpace: 'pre-wrap' }}>{imagMetrics.answerText || '（未提供回答）'}</div>
              </div>
            </div>

            {/* 总分与等级 */}
            <div className="assessment-score-section" style={{ marginTop: 12 }}>
              <div className="assessment-score">
                <div className="score-circle">
                  <div className="score-value">{imaginationAssessment.score}</div>
                  <div className="score-label">分</div>
                </div>
                <div className="score-level">
                  <span className={`level-badge level-${imaginationAssessment.level}`}>
                    {imaginationAssessment.level === 'excellent' ? '🌟 优秀' : 
                     imaginationAssessment.level === 'good' ? '👍 良好' : '💪 待提升'}
                  </span>
                </div>
              </div>
            </div>

            {/* 多维度评分 */}
            {imaginationAssessment.subscores && (
              <div className="subscores-section" style={{ marginTop: 12 }}>
                <h3>🔹 多维度评分</h3>
                <div className="subscore-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div className="subscore-item">
                    <div className="subscore-label">内容</div>
                    <div className="subscore-bar" style={{ background: '#eee', borderRadius: 8, overflow: 'hidden' }}>
                      <div className="subscore-fill" style={{ width: `${imaginationAssessment.subscores.content}%`, height: 8, background: '#4caf50' }}></div>
                    </div>
                    <div className="subscore-value" style={{ marginTop: 4 }}>{imaginationAssessment.subscores.content}</div>
                  </div>
                  <div className="subscore-item">
                    <div className="subscore-label">想象力</div>
                    <div className="subscore-bar" style={{ background: '#eee', borderRadius: 8, overflow: 'hidden' }}>
                      <div className="subscore-fill" style={{ width: `${imaginationAssessment.subscores.imagination}%`, height: 8, background: '#ff9800' }}></div>
                    </div>
                    <div className="subscore-value" style={{ marginTop: 4 }}>{imaginationAssessment.subscores.imagination}</div>
                  </div>
                  <div className="subscore-item">
                    <div className="subscore-label">切题程度</div>
                    <div className="subscore-bar" style={{ background: '#eee', borderRadius: 8, overflow: 'hidden' }}>
                      <div className="subscore-fill" style={{ width: `${imaginationAssessment.subscores.relevance}%`, height: 8, background: '#2196f3' }}></div>
                    </div>
                    <div className="subscore-value" style={{ marginTop: 4 }}>{imaginationAssessment.subscores.relevance}</div>
                  </div>
                </div>
              </div>
            )}

            {/* 亮点与建议 */}
            <div className="assessment-details" style={{ marginTop: 12 }}>
              <div className="assessment-highlights">
                <h3>✨ 亮点表现</h3>
                <ul className="reasons-list">
                  {imaginationAssessment.reasons.map((reason, index) => (
                    <li key={index} className="reason-item">
                      <span className="reason-icon">🌟</span>
                      <span className="reason-text">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {imaginationAssessment.suggestions && imaginationAssessment.suggestions.length > 0 && (
                <div className="assessment-suggestions">
                  <h3>🚀 提升建议</h3>
                  <ul className="suggestions-list">
                    {imaginationAssessment.suggestions.map((suggestion, index) => (
                      <li key={index} className="suggestion-item">
                        <span className="suggestion-icon">💡</span>
                        <span className="suggestion-text">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 个性化成长建议 */}
      <div className="growth-advice-section">
        <h2>{personalizedAdvice.icon} {personalizedAdvice.title}</h2>
        <div className="advice-content">
          <p className="advice-description">{personalizedAdvice.description}</p>
          <div className="activities-grid">
            {personalizedAdvice.activities.map((activity, index) => (
              <div key={index} className="activity-card">
                <div className="activity-number">{index + 1}</div>
                <div className="activity-text">{activity}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 小贴士 */}
      <div className="tips-section">
        <h2>💡 给爸爸妈妈的小贴士</h2>
        <div className="tips-container">
          {tips.map((tip, index) => (
            <div key={index} className="tip-card">
              <div className="tip-icon">
                {index === 0 && '🎯'}
                {index === 1 && '💪'}
                {index === 2 && '🌱'}
                {index === 3 && '🤝'}
                {index >= 4 && '✨'}
              </div>
              <div className="tip-content">
                <div className="tip-title">贴士 {index + 1}</div>
                <div className="tip-text">{tip}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 下一步探索 */}
      <div className="resources-section">
        <h2>🚀 下一步探索</h2>
        <div className="resources-intro">
          <p>为{childName}精心挑选的学习资源，帮助进一步发展天赋潜能：</p>
        </div>
        <div className="resources-grid">
          {resources.map((resource, index) => (
            <a 
              key={index} 
              href={resource.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="resource-card"
            >
              <div className="resource-icon">
                {resource.name.includes('课程') && '📚'}
                {resource.name.includes('游戏') && '🎮'}
                {resource.name.includes('书籍') && '📖'}
                {resource.name.includes('活动') && '🎯'}
                {resource.name.includes('工具') && '🛠️'}
                {!resource.name.match(/(课程|游戏|书籍|活动|工具)/) && '🌟'}
              </div>
              <div className="resource-content">
                <div className="resource-name">{resource.name}</div>
                <div className="resource-arrow">→</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* 结语 */}
      <div className="conclusion-section">
        <div className="conclusion-card">
          <div className="conclusion-icon">🎉</div>
          <div className="conclusion-content">
            <h3>恭喜{childName}完成天赋探索！</h3>
            <p>
              每个孩子都是独一无二的，都有自己的闪光点。这份报告只是一个开始，
              希望能帮助{childName}更好地认识自己，发现更多的可能性。
            </p>
            <p>
              记住，天赋需要时间和努力来培养。保持好奇心，勇敢尝试，
              相信{childName}一定能在自己喜欢的领域里闪闪发光！
            </p>
          </div>
        </div>
        
        <div className="signature">
          <div className="signature-line">
            <span className="signature-label">评估老师：</span>
            <span className="signature-name">高小吉 AI老师</span>
          </div>
          <div className="signature-line">
            <span className="signature-label">生成时间：</span>
            <span className="signature-date">{new Date().toLocaleDateString('zh-CN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage3;