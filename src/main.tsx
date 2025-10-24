import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/ui.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  // 移除 StrictMode，避免开发环境下 useEffect 双调用导致重复请求
  <App />
)
