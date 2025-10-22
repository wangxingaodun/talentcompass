import React from 'react';

export type TeacherMood = 'happy' | 'encouraging' | 'thinking' | 'excited' | 'gentle' | 'surprised';

interface TeacherAvatarProps {
  mood: TeacherMood;
  isAnimating?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const TeacherAvatar: React.FC<TeacherAvatarProps> = ({ 
  mood, 
  isAnimating = false, 
  size = 'medium' 
}) => {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  const getMoodEmoji = (mood: TeacherMood) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'encouraging': return '👍';
      case 'thinking': return '🤔';
      case 'excited': return '🎉';
      case 'gentle': return '😌';
      case 'surprised': return '😮';
      default: return '😊';
    }
  };

  const getMoodColor = (mood: TeacherMood) => {
    switch (mood) {
      case 'happy': return 'from-yellow-400 to-orange-400';
      case 'encouraging': return 'from-green-400 to-blue-400';
      case 'thinking': return 'from-purple-400 to-pink-400';
      case 'excited': return 'from-red-400 to-yellow-400';
      case 'gentle': return 'from-blue-300 to-green-300';
      case 'surprised': return 'from-pink-400 to-purple-400';
      default: return 'from-blue-400 to-purple-400';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* AI小老师头像 */}
      <div 
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          bg-gradient-to-br ${getMoodColor(mood)}
          flex items-center justify-center
          shadow-lg
          transition-all duration-500 ease-in-out
          ${isAnimating ? 'animate-bounce' : 'hover:scale-110'}
          border-4 border-white
        `}
      >
        <div className="text-4xl filter drop-shadow-sm">
          {getMoodEmoji(mood)}
        </div>
      </div>
      
      {/* AI标识 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
        AI小老师
      </div>
      
      {/* 思考动画点点 */}
      {mood === 'thinking' && (
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      )}
    </div>
  );
};

export default TeacherAvatar;