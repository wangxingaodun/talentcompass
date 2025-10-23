import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/ui.css'
import App from './App.tsx'

// 百度统计代码
declare global {
  interface Window {
    _hmt?: any[];
  }
}

window._hmt = window._hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?db370395536f6d9f3433974dec89c9a3";
  var s = document.getElementsByTagName("script")[0];
  if (s && s.parentNode) {
    s.parentNode.insertBefore(hm, s);
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
