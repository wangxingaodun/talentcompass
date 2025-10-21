# TalentCompass - 儿童天赋探索平台

一个为家长设计的交互式Web应用，通过趣味小游戏帮助发现孩子的天赋和兴趣倾向。

## 📋 项目概述

TalentCompass是一款专注于儿童天赋探索的AI辅助测试平台。通过四个精心设计的互动游戏（故事接龙、图形密码、涂鸦小画家和小动物跳跳），系统能够评估孩子在表达能力、逻辑思维、创造力和反应速度四个维度的表现，并生成个性化的天赋探索报告。

## ✨ 核心功能

- **欢迎页**：简洁明了的测试介绍和启动界面
- **互动测试**：四个有趣的小游戏，适合4-12岁儿童参与
- **实时反馈**：AI小老师提供即时互动指导
- **天赋评估**：基于测试结果的多维度能力分析
- **个性化报告**：详细的天赋探索报告，包含培养建议和资源推荐
- **响应式设计**：适配各种设备屏幕，随时随地进行测试

## 🛠️ 技术栈

- **前端框架**：React 18
- **编程语言**：TypeScript
- **构建工具**：Vite
- **样式处理**：CSS (无额外框架)
- **图标和插图**：SVG (纯矢量图形)
- **代码质量**：ESLint + TypeScript Compiler

## 🚀 快速开始

### 前置要求
- Node.js (v16.0+) 和 npm
- 现代浏览器 (Chrome, Firefox, Safari, Edge)

### 安装和运行

1. **克隆项目**
```bash
git clone <repository-url>
cd talentcompass
```

2. **安装依赖**
```bash
npm install
```

3. **开发模式运行**
```bash
npm run dev
```

4. **构建生产版本**
```bash
npm run build
```

5. **预览生产版本**
```bash
npm run preview
```

## 📁 项目结构

```
talentcompass/
├── src/
│   ├── components/       # React组件
│   │   ├── AppContext.tsx  # 全局状态管理
│   │   ├── WelcomePage.tsx # 欢迎页
│   │   ├── InteractivePage.tsx # 互动测试页
│   │   └── ReportPage.tsx   # 报告页
│   ├── assets/           # 静态资源
│   ├── App.tsx           # 主应用组件
│   ├── App.css           # 主样式文件
│   ├── index.tsx         # 入口文件
│   └── index.css         # 全局基础样式
├── public/               # 公共资源
├── .gitignore            # Git忽略配置
├── package.json          # 项目依赖和脚本
├── tsconfig.json         # TypeScript配置
├── vite.config.ts        # Vite配置
└── README.md             # 项目文档
```

## 🎮 使用指南

1. **开始测试**：访问应用首页，点击"开始测试"按钮
2. **输入信息**：根据提示输入孩子的基本信息
3. **参与游戏**：按照顺序完成四个互动游戏
4. **查看报告**：测试完成后，系统自动生成并显示详细报告
5. **保存报告**：可以保存或打印报告，作为孩子成长的参考

## 🎨 设计说明

项目采用了现代化的UI设计，主要特点包括：

- **色彩系统**：使用明亮、活泼的色彩，符合儿童产品的特点
- **响应式布局**：完美适配桌面、平板和移动设备
- **动画效果**：适度的过渡动画，提升用户体验
- **无障碍设计**：符合WCAG标准的可访问性设计

## 🧪 测试说明

四个游戏分别对应不同的能力维度：

- **故事接龙**：评估表达能力和语言组织能力
- **图形密码**：评估逻辑思维和模式识别能力
- **涂鸦小画家**：评估创造力和想象力
- **小动物跳跳**：评估反应速度和手眼协调能力

## 📊 数据隐私

- 所有测试数据仅用于本次报告生成
- 不会存储任何个人敏感信息
- 测试完成后可自行删除相关数据
- 严格遵守数据隐私保护法规

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 📧 联系我们

如有任何问题或建议，请随时联系我们。

---

TalentCompass - 发现孩子的天赋火花！

© 2024 TalentCompass Team

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
