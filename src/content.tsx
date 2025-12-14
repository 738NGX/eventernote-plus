import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import UserProfilePage from './pages/UserProfilePage';
import './index.css';
import { detectCurrentUser } from './utils/user';

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

// 在清空 DOM 前解析用户页面数据
function parseUserPageData() {
  // 头像
  const avatar = document.querySelector('.gb_users_side_profile img')?.getAttribute('src') || '';
  
  // 用户名
  const name1 = document.querySelector('.gb_users_side_profile .name1')?.textContent?.trim() || '';
  const name2 = document.querySelector('.gb_users_side_profile .name2')?.textContent?.trim() || '';
  
  // 统计数据 - 查找 parent class 为 "number" 的链接
  const username = location.pathname.split('/')[2];
  let following = 0, followers = 0, eventCount = 0, overlapCount = 0;
  
  document.querySelectorAll('.number a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const num = parseInt(a.textContent?.trim() || '0', 10) || 0;
    
    if (href === `/users/${username}/following`) following = num;
    else if (href === `/users/${username}/follower`) followers = num;
    else if (href === `/users/${username}/events`) eventCount = num;
    else if (href === `/users/${username}/events/same`) overlapCount = num;
  });

  // 解析用户ID和关注状态
  // 关注按钮: <a href="javascript:addFollow(206530)">フォローする</a>
  // 取消关注按钮: <a href="javascript:removeFollow(206530)">フォローをやめる</a>
  let userId = '';
  let isFollowing = false;
  
  const followLink = document.querySelector('a[href^="javascript:addFollow"]');
  const unfollowLink = document.querySelector('a[href^="javascript:removeFollow"]');
  
  if (followLink) {
    const match = followLink.getAttribute('href')?.match(/addFollow\((\d+)\)/);
    if (match) userId = match[1];
    isFollowing = false;
  } else if (unfollowLink) {
    const match = unfollowLink.getAttribute('href')?.match(/removeFollow\((\d+)\)/);
    if (match) userId = match[1];
    isFollowing = true;
  }

  // 解析单个活动列表的函数
  const parseEventList = (listEl: Element | null): any[] => {
    const result: any[] = [];
    if (!listEl) return result;
    
    listEl.querySelectorAll('li').forEach(item => {
      const titleLink = item.querySelector('.event h4 a');
      const href = titleLink?.getAttribute('href') || '';
      const idMatch = href.match(/\/events\/(\d+)/);
      if (!idMatch) return;

      const img = item.querySelector('.date img')?.getAttribute('src') || '';
      const title = titleLink?.textContent?.trim() || '';
      const dateEl = item.querySelector('.date p');
      const dateText = dateEl?.textContent?.trim() || '';
      const dateMatch = dateText.match(/(\d{4}-\d{2}-\d{2})/);
      const venue = item.querySelector('.place a')?.textContent?.trim() || '';
      const timeText = item.querySelector('.place .s, .place span')?.textContent || '';
      const startMatch = timeText.match(/開演\s*(\d+:\d+)/);
      
      const performers: any[] = [];
      item.querySelectorAll('.actor a').forEach(p => {
        const pHref = p.getAttribute('href') || '';
        const pIdMatch = pHref.match(/\/actors\/[^/]+\/(\d+)/);
        if (pIdMatch) {
          performers.push({ name: p.textContent?.trim() || '', id: pIdMatch[1] });
        }
      });

      const countEl = item.querySelector('.note_count p');
      const participantCount = parseInt(countEl?.textContent?.trim() || '0', 10);

      result.push({
        id: idMatch[1],
        title,
        imageUrl: img,
        date: dateMatch?.[1] || dateText.split(' ')[0] || '',
        venue,
        startTime: startMatch?.[1],
        performers,
        participantCount,
      });
    });
    return result;
  };

  // 获取所有 .gb_event_list
  const allEventLists = document.querySelectorAll('.gb_event_list');
  
  // 第一个是参加予定イベント
  const events = parseEventList(allEventLists[0] || null);
  
  // 第二个是被っているイベント（共同活动），仅在查看他人页面时存在
  const overlapEvents = parseEventList(allEventLists[1] || null);

  // 喜欢的声优
  const artists: any[] = [];
  document.querySelectorAll('.gb_actors_list a').forEach(link => {
    const href = link.getAttribute('href') || '';
    const idMatch = href.match(/\/actors\/[^/]+\/(\d+)/);
    if (idMatch) {
      artists.push({ id: idMatch[1], name: link.textContent?.trim() || '' });
    }
  });

  // 活动日历
  const activities: any[] = [];
  const calendarTable = document.querySelector('.gb_calendar_score table');
  if (calendarTable) {
    const rows = calendarTable.querySelectorAll('tr');
    let currentYear = 0;
    let currentTotal = 0;
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const cells = row.querySelectorAll('td');
      if (cells.length === 0) continue;
      
      // 检查年份行
      const yearLink = cells[0].querySelector('a');
      const yearMatch = yearLink?.textContent?.match(/(\d{4})年/);
      
      if (yearMatch) {
        currentYear = parseInt(yearMatch[1], 10);
        currentTotal = parseInt(cells[cells.length - 1]?.textContent?.trim() || '0', 10);
        
        // 跳过下一行（月份标题）和读取数据行
        if (i + 2 < rows.length) {
          const dataRow = rows[i + 2];
          const dataCells = dataRow.querySelectorAll('td');
          const months: number[] = [];
          dataCells.forEach(cell => {
            const link = cell.querySelector('a');
            const count = parseInt(link?.textContent?.trim() || '0', 10) || 0;
            months.push(count);
          });
          if (months.length === 12) {
            activities.push({ year: currentYear, months, total: currentTotal });
          }
        }
      }
    }
  }

  return {
    profile: {
      displayName: name2 || name1,
      avatarUrl: avatar,
      followingCount: following,
      followerCount: followers,
      eventCount,
      overlapCount,
      userId,
      isFollowing,
    },
    events,
    overlapEvents,
    artists,
    activities,
  };
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

  // 创建 React 挂载点
  const root = document.createElement('div');
  root.id = 'enplus-root';
  document.body.appendChild(root);

  // 根据页面类型渲染不同组件
  let component: React.ReactNode;
  
  if (pageType === 'home') {
    component = <App initialUser={currentUser} />;
  } else if (pageType === 'user') {
    // 从 URL 提取用户名
    const username = location.pathname.split('/')[2];
    component = <UserProfilePage username={username} currentUser={currentUser} initialData={userPageData} />;
  }

  // 渲染 React 应用
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      {component}
    </React.StrictMode>
  );
}

// 等待 DOM 就绪
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
