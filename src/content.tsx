import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import UserProfilePage from './pages/UserProfilePage';
import './index.css';
import { detectCurrentUser } from './utils/user/fetchAllUserEvents';
import { StyleProvider } from '@ant-design/cssinjs';
import { parseUserPageData } from './utils/user/parseUserPageData';

// 获取当前页面类型
function getPageType(): 'home' | 'user' | 'unknown' {
  const path = location.pathname;
  
  if (path === '/' || /eventernote\.com\/?$/.test(location.href)) {
    return 'home';
  }
  
  if (/^\/users\/[^/]+\/?$/.test(path)) {
    return 'user';
  }
  
  return 'unknown';
}

// Content script 入口
function init() {
  const pageType = getPageType();
  
  // 只处理首页和用户页
  if (pageType === 'unknown') {
    return;
  }

  console.log(`[EventerNote Plus] 开始重建页面 (${pageType})...`);

  // 在清空页面前检测用户
  const currentUser = detectCurrentUser();
  
  // 在清空页面前解析用户页面数据
  let userPageData: ReturnType<typeof parseUserPageData> | null = null;
  if (pageType === 'user') {
    userPageData = parseUserPageData();
    //console.log('[ENP] Parsed from DOM:', userPageData);
  }

  // 注入页面上下文脚本来保存原网站的关注函数
  const injectScript = document.createElement('script');
  injectScript.src = chrome.runtime.getURL('inject.js');
  injectScript.onload = function() {
    (this as HTMLScriptElement).remove();
  };
  (document.head || document.documentElement).appendChild(injectScript);

  // 清空页面
  document.body.innerHTML = '';

  // 创建 ShadowRoot 容器
  const root = document.createElement('div');
  root.id = 'enplus-root';
  document.body.appendChild(root);
  const shadow = root.attachShadow({ mode: 'open' });

  // 创建 React 挂载点
  const reactRoot = document.createElement('div');
  reactRoot.id = 'enplus-react-root';
  shadow.appendChild(reactRoot);

  // 注入样式（style.css）到 ShadowRoot
  const styleLink = document.createElement('link');
  styleLink.rel = 'stylesheet';
  styleLink.href = chrome.runtime.getURL('dist/scripts/style.css');
  shadow.appendChild(styleLink);

  // 根据页面类型渲染不同组件
  let component: React.ReactNode;
  // 传递 getPopupContainer 到 App
  const getPopupContainer = () => shadow;
  if (pageType === 'home') {
    component = <App initialUser={currentUser} getPopupContainer={getPopupContainer} />;
  } else if (pageType === 'user') {
    const username = location.pathname.split('/')[2];
    component = <UserProfilePage username={username} currentUser={currentUser} initialData={userPageData} getPopupContainer={getPopupContainer} />;
  }

  // 渲染 React 应用到 ShadowRoot，并用 StyleProvider 隔离 Antd 动态样式
  ReactDOM.createRoot(reactRoot).render(
    <React.StrictMode>
      <StyleProvider container={shadow} hashPriority="high">
        {component}
      </StyleProvider>
    </React.StrictMode>
  );
}

// 等待 DOM 就绪
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
