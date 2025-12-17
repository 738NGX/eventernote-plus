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

// 添加全局遮罩
function addLoadingOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "global-loading-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 1)";
  overlay.style.zIndex = "9999";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.fontSize = "24px";
  overlay.style.color = "#fff";
  overlay.innerText = "加载中...";
  if (document.body) {
    document.body.appendChild(overlay);
  } else {
    document.documentElement.appendChild(overlay);
  }
}

// 移除全局遮罩
function removeLoadingOverlay() {
  const overlay = document.getElementById("global-loading-overlay");
  if (overlay) {
    overlay.remove();
  }
}

// Content script 入口
function init() {
  // 获取当前页面类型
  const pageType = getPageType();
  
  // 只处理首页和用户页
  if (pageType === 'unknown') {
    removeLoadingOverlay();
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
  document.documentElement.setAttribute('lang', 'zh-CN');

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

  // 等待 DOM 就绪
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      console.log("DOM 加载完成");
      removeLoadingOverlay();
    });
  } else {
    console.log("DOM 已加载完成");
    removeLoadingOverlay();
  }
}

// 等待 DOM 就绪
if (document.readyState === 'loading') {
  addLoadingOverlay();
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
