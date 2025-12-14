import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { detectCurrentUser } from './utils/user';

// Content script 入口
function init() {
  // 仅在首页运行
  if (location.pathname !== '/' && !/eventernote\.com\/?$/.test(location.href)) {
    return;
  }

  console.log('[EventerNote Plus] 开始重建页面 (React)...');

  // 在清空页面前检测用户
  const currentUser = detectCurrentUser();

  // 清空页面
  document.body.innerHTML = '';

  // 创建 React 挂载点
  const root = document.createElement('div');
  root.id = 'enplus-root';
  document.body.appendChild(root);

  // 渲染 React 应用
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App initialUser={currentUser} />
    </React.StrictMode>
  );
}

// 等待 DOM 就绪
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
