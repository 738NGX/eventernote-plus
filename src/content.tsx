import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import UserProfilePage from './pages/UserProfilePage';
import './index.css';
import { detectCurrentUser } from './utils/user/fetchAllUserEvents';
import { StyleProvider } from '@ant-design/cssinjs';
import { parseUserPageData } from './utils/user/parseUserPageData';
import { AboutPage } from './pages/AboutPage';
import { parseEventDetailData } from './utils/events/parseEventDetailData';
import { EventDetailPage } from './pages/EventDetailPage';
import { AnnualReportPage } from './pages/AnnualReportPage';
import { parseNoteDeleteData } from './utils/notes/parseNoteDeleteData';
import { NotePage } from './pages/NotePage';
import { parseUsersList } from './utils/user/parseUsersList';
import { UsersPage } from './pages/UsersPage';

// 获取当前页面类型
function getPageType(disabled: boolean): string {
  const path = location.pathname;
  
  // 主页 /
  if (path === '/' || /eventernote\.com\/?$/.test(location.href)) {
    return disabled ? 'disabled' : 'home';
  }
  
  // 用户页 /users 或 /users/${username}
  if (/^\/users(\/(?!notice|timeline|setting)[^/]+)?\/?$/.test(path)) {
    return disabled ? 'disabled' : 'user';
  }

  // 关注 /users/${username}/following
  if (/^\/users\/[^/]+\/following\/?$/.test(path)) {
    return disabled ? 'disabled' : 'following';
  }
  
  // 粉丝 /users/${username}/follower
  if (/^\/users\/[^/]+\/follower\/?$/.test(path)) {
    return disabled ? 'disabled' : 'follower';
  }

  // 年度报告 /annual-report/${username}/${year}
  if (/^\/annual-report\/[^/]+\/\d{4}\/?$/.test(path)) {
    return 'annual-report';
  }

  // 活动详情页 /events/${id}
  if (/^\/events\/\d+\/?$/.test(path)) {
    return disabled ? 'disabled' : 'eventDetail';
  }

  // 删除笔记 /notes/${id}/remove
  if (/^\/notes\/\d+\/remove\/?$/.test(path)) {
    return disabled ? 'disabled' : 'deleteNote';
  }

  // 关于页 /pages/comapny, /pages/termsofservice, /pages/privacy
  if (/^\/pages\/(company|termsofservice|privacy)\/?$/.test(path)) {
    return disabled ? 'disabled' : 'about';
  }
  
  return 'unknown';
}

// 根据唯一确定的方式获取主题
function getThemeColors() {
  let theme = localStorage.getItem('enplus-theme');

  // 如果 localStorage 中没有值，根据系统偏好初始化主题
  if (!theme) {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    localStorage.setItem('enplus-theme', theme);
  }

  if (theme === 'dark') {
    return {
      backgroundColor: '#000',
      color: '#fff'
    };
  } else if (theme === 'light') {
    return {
      backgroundColor: '#fff',
      color: '#000'
    };
  }

  console.error('localStorage 中未找到有效的主题值，请检查主题初始化逻辑。');
  throw new Error('未定义的主题');
}

const themeColors = getThemeColors();

// 设置全局遮罩样式
const overlay = document.createElement("div");
overlay.lang = "zh-CN";
overlay.id = "global-loading-overlay";
overlay.style.position = "fixed";
overlay.style.top = "0";
overlay.style.left = "0";
overlay.style.width = "100%";
overlay.style.height = "100%";
overlay.style.backgroundColor = themeColors.backgroundColor;
overlay.style.zIndex = "9999";
overlay.style.display = "flex";
overlay.style.justifyContent = "center";
overlay.style.alignItems = "center";
overlay.style.fontSize = "24px";
overlay.style.color = themeColors.color;
overlay.innerText = "加载中...";
if (document.body) {
  document.body.appendChild(overlay);
} else {
  document.documentElement.appendChild(overlay);
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
  chrome.storage.sync.get(['disableUIReplace'], (result) => {
    const disabled = result.disableUIReplace || false;

    // 获取当前页面类型
    const pageType = getPageType(disabled);
    if (pageType === 'unknown' || pageType === 'disabled') {
      removeLoadingOverlay();
      return;
    }

    console.log(`[EventerNote Plus] 开始重建页面 (${pageType})...`);

    // 在清空页面前检测用户
    const currentUser = detectCurrentUser();
    
    // 在清空页面前解析页面数据
    let userPageData: ReturnType<typeof parseUserPageData> | null = null;
    if (pageType === 'user') {
      userPageData = parseUserPageData();
      //console.log('[ENP] Parsed from DOM:', userPageData);
    }
    let eventDetailData: ReturnType<typeof parseEventDetailData> | null = null;
    if (pageType === 'eventDetail') {
      eventDetailData = parseEventDetailData();
      console.log('[ENP] Parsed from DOM:', eventDetailData);
    }
    let deleteNoteData: ReturnType<typeof parseNoteDeleteData> | null = null;
    if (pageType === 'deleteNote') {
      deleteNoteData = parseNoteDeleteData();
      console.log('[ENP] Parsed from DOM:', deleteNoteData);
    }
    let usersListData: ReturnType<typeof parseUsersList> | null = null;
    if (pageType === 'following' || pageType === 'follower') {
      usersListData = parseUsersList();
      console.log('[ENP] Parsed from DOM:', usersListData);
    }

    // 注入页面上下文脚本来保存原网站的关注函数
    const injectScript = document.createElement('script');
    injectScript.src = chrome.runtime.getURL('inject.js');
    injectScript.onload = function() {
      (this as HTMLScriptElement).remove();
    };
    (document.head || document.documentElement).appendChild(injectScript);

    // 在清空页面之前，将遮罩移到 document.documentElement
    const overlay = document.getElementById("global-loading-overlay");
    if (overlay) {
      document.documentElement.appendChild(overlay);
    }

    // 在清空页面之前，注入基础样式以避免白屏
    const baseStyle = document.createElement('style');
    baseStyle.textContent = `
      body {
        background-color: ${themeColors.backgroundColor};
        color: ${themeColors.color};
      }
    `;
    document.head.appendChild(baseStyle);

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

    // 在样式加载完成后移除基础样式
    styleLink.onload = () => {
      baseStyle.remove();
    };

    // 根据页面类型渲染不同组件
    let component: React.ReactNode;
    // 传递 getPopupContainer 到 App
    const getPopupContainer = () => shadow;
    if (pageType === 'home') {
      component = <App initialUser={currentUser} getPopupContainer={getPopupContainer} />;
    } else if (pageType === 'user') {
      component = <UserProfilePage currentUser={currentUser} initialData={userPageData} getPopupContainer={getPopupContainer} />;
    } else if (pageType === 'about') {
      component = <AboutPage currentUser={currentUser} getPopupContainer={getPopupContainer} type={ location.pathname.match(/^\/pages\/(company|termsofservice|privacy)\/?$/)?.[1] as 'company' | 'privacy' | 'termsofservice'} />;
    } else if (pageType === 'eventDetail') {
      component = <EventDetailPage  initialData={eventDetailData!} currentUser={currentUser} getPopupContainer={getPopupContainer} />;
    } else if (pageType === 'deleteNote') {
      component = <NotePage type='delete' currentUser={currentUser} getPopupContainer={getPopupContainer} data={deleteNoteData!} />;
    } else if (pageType === 'annual-report') {
      component = <AnnualReportPage username='SUFE_IDOL' year='2025' />
    } else if (pageType === 'following' || pageType === 'follower') {
      component = <UsersPage type={pageType} currentUser={currentUser} getPopupContainer={getPopupContainer} data={usersListData!} />;
    }

    // 渲染 React 应用到 ShadowRoot，并用 StyleProvider 隔离 Antd 动态样式
    ReactDOM.createRoot(reactRoot).render(
      <React.StrictMode>
        <StyleProvider container={shadow} hashPriority="high">
          {component}
        </StyleProvider>
      </React.StrictMode>
    );

    // 确保遮罩仍然存在
    if (overlay) {
      document.documentElement.appendChild(overlay);
    }

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
  });
}

// 等待 DOM 就绪
if (document.readyState === 'loading') {
  overlay;
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}


