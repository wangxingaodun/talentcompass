import type { Dimension } from './games/types';

const pool = {
  expression: {
    excellent: [
      '你把故事讲得太精彩了，像小作家！✨',
      '节奏与内容都很棒，继续发挥你的表达力！📚',
      '内容丰富又有细节，超赞的叙述能力！🌟',
    ],
    good: [
      '结构清晰，继续加一点细节会更棒！👍',
      '节奏不错，再多说一点你的想法！💡',
      '很好！试试看加入更多有趣的元素～🎈',
    ],
    needs_improvement: [
      '没关系，我们先讲一个你最喜欢的部分～🤗',
      '可以从“开头-发展-结尾”三个部分来试试！🌱',
      '试着描述一个角色的感受，会更有代入感～💭',
    ],
  },
  logic: {
    excellent: [
      '观察力满分！一眼就找到了规律！🧠',
      '推理很快很准，太厉害了！🎯',
      '你像小侦探一样敏锐！🔍',
    ],
    good: [
      '不错的尝试，再观察一下颜色与位置！🔢',
      '你很接近了，试试换一个角度！🔄',
      '节奏很好，耐心再来一题更稳！⏱️',
    ],
    needs_improvement: [
      '别着急，从第一列开始慢慢比对～📏',
      '可以先剔除明显不符合的选项！🧩',
      '换个思路，比如先看形状再看颜色～💡',
    ],
  },
  creativity: {
    excellent: [
      '配色大胆又和谐，你是天生的艺术家！🎨',
      '构图很有创意，想法超赞！🌈',
      '元素丰富又有层次，很棒的作品！✨',
    ],
    good: [
      '不错的开始！试着加一点新颜色！🖌️',
      '可以加入一些形状让画面更有趣～🟣🟠',
      '很有感觉！再加一笔就更完整啦～✏️',
    ],
    needs_improvement: [
      '不妨先画一个你最熟悉的形状～⬜',
      '可以先勾勒轮廓再填色，放轻松～😊',
      '从简单到复杂，一步一步就很好～🥰',
    ],
  },
  reaction: {
    excellent: [
      '手速惊人！像闪电一样快！⚡',
      '精准又迅速，太棒了！🏅',
      '专注度满分，继续保持！🎯',
    ],
    good: [
      '节奏不错，注意力再集中一点就更棒～👀',
      '你很稳！下一次试着更快一点！🚀',
      '表现良好，再多击中一两次就完美啦！✨',
    ],
    needs_improvement: [
      '别急，可以先跟着节奏慢慢来～🎵',
      '试试固定视线，耐心等待目标出现～🧘',
      '做得不错！稳定比速度更重要～🧩',
    ],
  },
  imagination: {
    excellent: [
      '脑洞大开又合理！小小创造家！🪄',
      '想法独特而完整，太有趣了！🌟',
      '你像魔法师一样构建世界！✨',
    ],
    good: [
      '很棒的想法！再多加一点细节！🔍',
      '思路清晰，再试试加入情节变化～📖',
      '不错！补充原因会更完整哦～🧠',
    ],
    needs_improvement: [
      '试着从“如果…”开始，让想象飞起来～🦋',
      '可以先选一个主角，再想它的变化～🧚',
      '不急，先说一个你最喜欢的设定～🌱',
    ],
  },
};

export function getEncouragement(
  dimension: Dimension,
  performance: 'excellent' | 'good' | 'needs_improvement',
  childName?: string,
  exclude?: string,
): string {
  const list = pool[dimension][performance];
  const filtered = exclude ? list.filter((m) => m !== exclude) : list;
  const base = filtered[Math.floor(Math.random() * filtered.length)] || list[0];
  return childName ? base.replace('你', `${childName}`) : base;
}