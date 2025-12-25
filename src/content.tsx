import React from 'react';
import { match } from 'path-to-regexp';
import ReactDOM from 'react-dom/client';
import App from './App';
import UserProfilePage from './pages/UserProfilePage';
import './index.css';
import { detectCurrentUser } from './utils/user/detectCurrentUser';
import { StyleProvider } from '@ant-design/cssinjs';
import { parseUsersPageData } from './utils/user/parseUsersPageData';
import { AboutPage } from './pages/AboutPage';
import { parseEventDetailData } from './utils/events/parseEventDetailData';
import { EventDetailPage } from './pages/EventDetailPage';
import { AnnualReportPage } from './pages/AnnualReportPage';
import { parseNoteDeleteData } from './utils/notes/parseNoteDeleteData';
import { NotePage } from './pages/NotePage';
import { parseUsersList } from './utils/user/parseUsersList';
import { UsersPage } from './pages/UsersPage';
import { ConfigProvider } from 'antd';
import { PlacesPage } from './pages/PlacesPage';
import { parseActorsPageData } from './utils/actors/parseActorsPageData';
import { ActorsPage } from './pages/ActorsPage';
import { ActorsDetailPage } from './pages/ActorsDetailPage';
import { parseActorsDetailData } from './utils/actors/parseActorsDetailData';
import { parseEventsData } from './utils/events/parseEventsData';
import { parseActorsFansData } from './utils/actors/parseActorsFansData';
import { LimitedEventsPage } from './pages/LimitedEventsPage';
import { ActorsFansPage } from './pages/ActorsFansPage';
import { parsePrefecturePageData } from './utils/places/parsePrefecturePageData';
import { PrefecturePage } from './pages/PrefecturePage';
import { parsePlacesDetailData } from './utils/places/parsePlacesDetailData';
import { PlacesDetailPage } from './pages/PlacesDetailPage';
import { parseUsersEvents } from './utils/user/parseUsersEvents';
import UsersEventsPage from './pages/UsersEventsPage';
import { EventsSearchPage } from './pages/EventsSearchPage';
import { parseEventsPage } from './utils/events/parseEventsPage';
import { EventsPage } from './pages/EventsPage';

// 获取当前页面类型
const getPageType = (disabled: boolean) => {
  const path = location.pathname;
  // 特殊首页判断
  if (path === '/' || location.href.endsWith('eventernote.com') || location.href.endsWith('eventernote.com/')) {
    return disabled ? 'disabled' : 'home';
  }

  // 路由模板表
  const routes = [
    { pattern: '/actors', type: 'actors' },
    { pattern: '/actors/:id', type: 'actorsDetail' },
    { pattern: '/actors/:id/events', type: 'actorsEvents' },
    { pattern: '/actors/:id/users', type: 'actorsFans' },
    { pattern: '/places', type: 'places' },
    { pattern: '/places/prefecture/:id', type: 'prefecture' },
    { pattern: '/places/:id/events', type: 'placesEvents' },
    { pattern: '/places/:id', type: 'placesDetail' },
    { pattern: '/events', type: 'events' },
    { pattern: '/events/search', type: 'eventsSearch' },
    { pattern: '/events/:id', type: 'eventDetail' },
    { pattern: '/users', type: 'user' },
    { pattern: '/users/:username/events/same', type: 'userEventsSame' },
    { pattern: '/users/:username/events', type: 'userEvents' },
    { pattern: '/users/:username/following', type: 'following' },
    { pattern: '/users/:username/follower', type: 'follower' },
    { pattern: '/annual-report/:year/:username', type: 'annual-report' },
    { pattern: '/notes/:id/remove', type: 'deleteNote' },
    { pattern: '/pages/:about', type: 'about' },
  ];

  for (const r of routes) {
    const m = match(r.pattern, { end: true })(path);
    if (m) {
      if (disabled && r.type !== 'annual-report') {
        return 'disabled';
      }
      return r.type;
    }
  }
  // 用户页特殊处理（/users/xxx，排除 notice/timeline/setting）
  if (path.startsWith('/users/')) {
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 2 && !['notice', 'timeline', 'setting'].includes(parts[1])) {
      return disabled ? 'disabled' : 'user';
    }
  }
  return 'unknown';
}

// 根据唯一确定的方式获取主题
const getThemeColors = () => {
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
const removeLoadingOverlay = () => {
  const overlay = document.getElementById("global-loading-overlay");
  if (overlay) {
    overlay.remove();
  }
}

// Content script 入口
const init = () => {
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
    type PageData = {
      userPageData?: ReturnType<typeof parseUsersPageData>;
      usersEventsData?: ReturnType<typeof parseUsersEvents>;
      prefecturePageData?: ReturnType<typeof parsePrefecturePageData>;
      placesDetailData?: ReturnType<typeof parsePlacesDetailData>;
      actorsPageData?: ReturnType<typeof parseActorsPageData>;
      actorsDetailData?: ReturnType<typeof parseActorsDetailData>;
      eventsData?: ReturnType<typeof parseEventsData>;
      eventsPageData?: ReturnType<typeof parseEventsPage>;
      actorsFansData?: ReturnType<typeof parseActorsFansData>;
      eventDetailData?: ReturnType<typeof parseEventDetailData>;
      deleteNoteData?: ReturnType<typeof parseNoteDeleteData>;
      usersListData?: ReturnType<typeof parseUsersList>;
    };
    const parseMap: Record<keyof PageData, () => any> = {
      userPageData: parseUsersPageData,
      usersEventsData: parseUsersEvents,
      prefecturePageData: parsePrefecturePageData,
      placesDetailData: parsePlacesDetailData,
      actorsPageData: parseActorsPageData,
      actorsDetailData: parseActorsDetailData,
      eventsData: parseEventsData,
      eventsPageData: parseEventsPage,
      actorsFansData: parseActorsFansData,
      eventDetailData: parseEventDetailData,
      deleteNoteData: parseNoteDeleteData,
      usersListData: parseUsersList,
    };
    const dataKeyMap: Record<string, keyof PageData> = {
      user: 'userPageData',
      userEvents: 'usersEventsData',
      userEventsSame: 'usersEventsData',
      prefecture: 'prefecturePageData',
      placesDetail: 'placesDetailData',
      actors: 'actorsPageData',
      actorsDetail: 'actorsDetailData',
      actorsEvents: 'eventsData',
      placesEvents: 'eventsData',
      events: 'eventsPageData',
      eventsSearch: 'eventsData',
      actorsFans: 'actorsFansData',
      eventDetail: 'eventDetailData',
      deleteNote: 'deleteNoteData',
      following: 'usersListData',
      follower: 'usersListData',
    };
    const pageData: PageData = {};
    const dataKey = dataKeyMap[pageType];
    if (dataKey && parseMap[dataKey]) {
      pageData[dataKey] = parseMap[dataKey]!();
      console.log('[ENP] Parsed from DOM:', pageData[dataKey]);
    }

    // 注入页面上下文脚本来保存原网站的关注函数
    const injectScript = document.createElement('script');
    injectScript.src = chrome.runtime.getURL('inject.js');
    injectScript.onload = function () {
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
    switch (pageType) {
      case 'home':
        component = <App initialUser={currentUser} getPopupContainer={getPopupContainer} />;
        break;
      case 'actors':
        component = <ActorsPage currentUser={currentUser} getPopupContainer={getPopupContainer} data={pageData.actorsPageData!} />;
        break;
      case 'places':
        component = <PlacesPage currentUser={currentUser} getPopupContainer={getPopupContainer} />;
        break;
      case 'prefecture':
        component = <PrefecturePage currentUser={currentUser} getPopupContainer={getPopupContainer} data={pageData.prefecturePageData!} />;
        break;
      case 'placesDetail':
        component = <PlacesDetailPage currentUser={currentUser} getPopupContainer={getPopupContainer} data={pageData.placesDetailData!} />;
        break;
      case 'user':
        component = <UserProfilePage currentUser={currentUser} data={pageData.userPageData!} getPopupContainer={getPopupContainer} />;
        break;
      case 'userEvents':
      case 'userEventsSame':
        component = <UsersEventsPage currentUser={currentUser} data={pageData.usersEventsData!} getPopupContainer={getPopupContainer} type={pageType} />;
        break;
      case 'events':
        component = <EventsPage currentUser={currentUser} getPopupContainer={getPopupContainer} data={pageData.eventsPageData!} />;
        break;
      case 'eventsSearch':
        component = <EventsSearchPage currentUser={currentUser} getPopupContainer={getPopupContainer} data={pageData.eventsData!} />;
        break;
      case 'actorsDetail': {
        let id = window.location.pathname.split('/').pop() || '';
        id = id.split('?')[0].split('#')[0];
        component = <ActorsDetailPage currentUser={currentUser} getPopupContainer={getPopupContainer} data={{ ...pageData.actorsDetailData!, id }} />;
        break;
      }
      case 'actorsEvents':
      case 'placesEvents': {
        let id = window.location.pathname.split('/').slice(-2, -1)[0] || '';
        component = <LimitedEventsPage type={pageType === 'actorsEvents' ? 'actors' : 'places'} currentUser={currentUser} getPopupContainer={getPopupContainer} data={{ ...pageData.eventsData!, id }} />;
        break;
      }
      case 'actorsFans': {
        let id = window.location.pathname.split('/').slice(-2, -1)[0] || '';
        component = <ActorsFansPage currentUser={currentUser} getPopupContainer={getPopupContainer} data={{ ...pageData.actorsFansData!, id }} />;
        break;
      }
      case 'about':
        component = <AboutPage currentUser={currentUser} getPopupContainer={getPopupContainer} type={location.pathname.match(/^\/pages\/(company|termsofservice|privacy)\/?$/)?.[1] as 'company' | 'privacy' | 'termsofservice'} />;
        break;
      case 'eventDetail':
        component = <EventDetailPage initialData={pageData.eventDetailData!} currentUser={currentUser} getPopupContainer={getPopupContainer} />;
        break;
      case 'deleteNote':
        component = <NotePage type='delete' currentUser={currentUser} getPopupContainer={getPopupContainer} data={pageData.deleteNoteData!} />;
        break;
      case 'annual-report':
        // 从 URL 中提取参数
        const annualMatch = match('/annual-report/:year/:username')(window.location.pathname);
        if (annualMatch && typeof annualMatch !== 'boolean') {
          const year = annualMatch.params.year as string;
          const username = annualMatch.params.username as string;
          document.title = `${username} 的 ${year} 年度报告 - EventerNote Plus`;
          component = <AnnualReportPage username={username} year={year} />;
        } else {
          console.error('Invalid match for annual report URL');
          component = null;
        }
        break;
      case 'following':
      case 'follower':
        component = <UsersPage type={pageType} currentUser={currentUser} getPopupContainer={getPopupContainer} data={pageData.usersListData!} />;
        break;
      default:
        component = null;
    }

    // 渲染 React 应用到 ShadowRoot，并用 StyleProvider 隔离 Antd 动态样式
    ReactDOM.createRoot(reactRoot).render(
      <React.StrictMode>
        <StyleProvider container={shadow} hashPriority="high">
          <ConfigProvider theme={{
            token: { colorPrimary: '#ff74b9', colorLink: '#ff74b9', colorInfo: '#ff74b9' },
          }}>
            {component}
          </ConfigProvider>
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


