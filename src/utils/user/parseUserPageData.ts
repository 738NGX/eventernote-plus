import { EventData } from "../../utils/events/eventdata";

// 在清空 DOM 前解析用户页面数据
export function parseUserPageData() {
  // 头像
  const avatar = document.querySelector('.gb_users_side_profile img')?.getAttribute('src') || '';

  // 用户名
  const display_username = document.querySelector('.gb_users_side_profile .name1')?.textContent?.trim() || '';
  const displayname = document.querySelector('.gb_users_side_profile .name2')?.textContent?.trim() || '';
  const signature = document.querySelector('.gb_users_side_profile .text p')?.textContent?.trim() || '';

  // 统计数据 - 查找 parent class 为 "number" 的链接
  const username = location.pathname.split('/')[2] || display_username;
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
  // 关注按钮: <a href="javascript:addFollow()">フォローする</a>
  // 取消关注按钮: <a href="javascript:removeFollow()">フォローをやめる</a>
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
  const parseEventList = (listEl: Element | null): EventData[] => {
    const result: EventData[] = [];
    if (!listEl) return result;

    listEl.querySelectorAll('li').forEach(item => {
      const titleLink = item.querySelector('.event h4 a');
      const href = titleLink?.getAttribute('href') || '';
      const idMatch = href.match(/\/events\/(\d+)/);
      if (!idMatch) return;

      // 标题
      const title = titleLink?.textContent?.trim() || '';

      // 日期
      const dateEl = item.querySelector('.date p');
      const dateText = dateEl?.textContent?.trim() || '';
      const dateMatch = dateText.match(/(\d{4}-\d{2}-\d{2})/);
      // 动态获取星期信息
      const dayElement = Array.from(item.querySelectorAll('.date [class^="day"]'))
        .find(el => el.className.match(/day[0-6]/));
      const wday = dayElement?.textContent?.trim() || '';
      const dateWithWday = wday ? wday : dateMatch ? dateMatch[1] : '';

      // 场馆
      const venueName = item.querySelector('.place a')?.textContent?.trim() || '';
      const venueHref = item.querySelector('.place a')?.getAttribute('href') || '';
      const venueId = venueHref.match(/\/places\/(\d+)/)?.[1] || '';
      const timeText = item.querySelector('.place .s, .place span')?.textContent || '';

      // 时间
      const openMatch = timeText.match(/開場\s*(\d+:\d+)/);
      const startMatch = timeText.match(/開演\s*(\d+:\d+)/);
      const endMatch = timeText.match(/終演\s*(\d+:\d+)/);
      const startTime = startMatch ? startMatch[1] : '';
      const openTime = openMatch ? openMatch[1] : startTime;
      const endTime = endMatch ? endMatch[1] : '';

      // 出演人员
      const performers: { name: string, id: string }[] = [];
      item.querySelectorAll('.actor a').forEach(p => {
        const pHref = p.getAttribute('href') || '';
        const pIdMatch = pHref.match(/\/actors\/[^/]+\/(\d+)/);
        if (pIdMatch) {
          performers.push({ name: p.textContent?.trim() || '', id: pIdMatch[1] });
        }
      });

      // 参加人数
      const countEl = item.querySelector('.note_count p');
      const participantCount = parseInt(countEl?.textContent?.trim() || '0', 10);

      result.push({
        id: idMatch[1],
        title,
        date: dateWithWday,
        venue: { name: venueName, id: venueId, prefecture: { id: '', name: '' } },
        times: {
          open: openTime,
          start: startTime,
          end: endTime,
        },
        performers,
        participantCount,
      });
    });
    return result;
  };

  // 解析活动列表
  const allEventLists = document.querySelectorAll('.gb_event_list');
  let scheduledEvents = [] as EventData[];
  let overlapEvents = [] as EventData[]; 
  let favouriteArtistsEvents = [] as EventData[];  
  allEventLists.forEach(list => {
    const header = list.previousElementSibling;

    if (header && header.textContent) {
      if (header.textContent.includes('参加予定')) {
        scheduledEvents = parseEventList(list);
      } else if (header.textContent.includes('被っている')) {
        overlapEvents = parseEventList(list);
      } else if (header.textContent.includes('お気に入り声優')) {
        favouriteArtistsEvents = parseEventList(list);
      }
    }
  });

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
      username,
      displayName: displayname || username,
      avatarUrl: avatar,
      followingCount: following,
      followerCount: followers,
      eventCount,
      overlapCount,
      userId,
      isFollowing,
    },
    scheduledEvents,
    overlapEvents,
    favouriteArtistsEvents,
    artists,
    activities,
  };
}