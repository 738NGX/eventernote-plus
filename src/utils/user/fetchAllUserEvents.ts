import axios from 'axios';
import * as cheerio from 'cheerio';
import { getPrefectureNameById } from '../prefecture';
import { EventData } from '../events/eventdata';

// 日期和时间解析工具函数
function parseDateAndTime(dateText: string, timeText: string) {
  const dateMatch = dateText.match(/(\d{4}-\d{2}-\d{2})/);
  const openMatch = timeText.match(/開場\s*(\d+:\d+)/);
  const startMatch = timeText.match(/開演\s*(\d+:\d+)/);
  const endMatch = timeText.match(/終演\s*(\d+:\d+)/);
  const startTime = startMatch ? startMatch[1] : '';
  const openTime = openMatch ? openMatch[1] : startTime;
  const endTime = endMatch ? endMatch[1] : '';

  return {
    date: dateMatch ? `${dateMatch[1]}` : '',
    times: {
      open: openTime,
      start: startTime,
      end: endTime,
    },
  };
}

// 从页面检测当前登录用户
export interface UserInfo {
  id?: string;
  name: string;
  avatar?: string;
  profileUrl?: string;
}

export function detectCurrentUser(): UserInfo | null {
  // 1) Rails/gon 约定
  const win = window as any;
  if (win.gon && (win.gon.current_user || win.gon.user)) {
    const u = win.gon.current_user || win.gon.user;
    return {
      id: u.id,
      name: u.name || u.screen_name || 'User',
      avatar: u.avatar || u.profile_image_url || u.icon_url,
      profileUrl: u.profile_url || (u.id ? `/users/${u.id}` : '/users/'),
    };
  }

  // 2) 前端状态对象
  if (win.__INITIAL_STATE__ && win.__INITIAL_STATE__.currentUser) {
    const u = win.__INITIAL_STATE__.currentUser;
    return {
      id: u.id,
      name: u.name || u.screen_name || 'User',
      avatar: u.avatar || u.profile_image_url,
      profileUrl: u.profile_url || (u.id ? `/users/${u.id}` : '/users/'),
    };
  }

  // 3) meta 标签
  const metaName = document.querySelector('meta[name="current-user-name"]')?.getAttribute('content');
  const metaId = document.querySelector('meta[name="current-user-id"]')?.getAttribute('content');
  const metaAvatar = document.querySelector('meta[name="current-user-avatar"]')?.getAttribute('content');
  if (metaName || metaId) {
    return {
      id: metaId || undefined,
      name: metaName || 'User',
      avatar: metaAvatar || undefined,
      profileUrl: metaId ? `/users/${metaId}` : '/users/',
    };
  }

  // 4) 从原页面 DOM 提取（在清空前调用）
  const avatarImg = document.querySelector('img[src*="/images/users/"]') as HTMLImageElement | null;
  const userLink = avatarImg?.closest('a');
  if (avatarImg && userLink) {
    return {
      name: avatarImg.alt || userLink.textContent?.trim() || 'User',
      avatar: avatarImg.src,
      profileUrl: userLink.href,
    };
  }

  return null;
}

/**
 * Fetches all events for a user from Eventernote across all pages.
 * @param username The username of the user.
 * @param userId The user ID of the user.
 * @returns A promise that resolves to an array of event objects.
 */
export async function fetchAllUserEvents(username: string): Promise<EventData[]> {
  const events: EventData[] = [];

  try {
    let page = 1;
    let hasMorePages = true;
    const venueData = await fetchVenueData();

    while (hasMorePages) {
      const url = `https://www.eventernote.com/users/${username}/events?page=${page}`;
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      const pageEvents: EventData[] = [];

      $('li.clearfix').each((_, element) => {
        const eventTitle = $(element).find('h4 a').text().trim();
        const eventLink = $(element).find('h4 a').attr('href');
        const eventId = eventLink?.split('/').pop() || '';

        const dateText = $(element).find('.date p').first().text().trim();
        const timeText = $(element).find('.place span.s').text().trim();
        const { date, times } = parseDateAndTime(dateText, timeText);

        const venueElement = $(element).find('.place a');
        const venue = venueElement.length
          ? {
            id: venueElement.attr('href')?.split('/').pop() || '',
            name: venueElement.text().trim(),
            prefecture: {
              id: '',
              name: '',
            },
          }
          : { id: '', name: '', prefecture: { id: '', name: '' } };

        if (venue) {
          const venueMatch = venueData.find(v => String(v.venueId) === String(venue.id));
          if (venueMatch) {
            const prefectureId = venueMatch.prefectureId.toString();
            venue.prefecture.id = prefectureId;
            venue.prefecture.name = getPrefectureNameById(prefectureId);
          }
        }

        const performers = $(element)
          .find('.actor ul li a')
          .map((_, el) => ({
            name: $(el).text().trim(),
            id: $(el).attr('href')?.split('/').pop() || '',
          }))
          .get();

        if (eventId && eventTitle) {
          pageEvents.push({
            id: eventId,
            title: eventTitle,
            date,
            times,
            participantCount: parseInt($(element).find('.note_count p').text().trim()) || 0,
            venue,
            performers,
          });
        }
      });

      if (pageEvents.length > 0) {
        events.push(...pageEvents);
        page++;
      } else {
        hasMorePages = false;
      }
    }

    return events;
  } catch (error) {
    console.error('Error fetching user events:', error);
    return events;
  }
}

// Updated fetchVenueData to use chrome.runtime.getURL for browser extension compatibility
export async function fetchVenueData(): Promise<[{ venueId: string, prefectureId: number }]> {
  const url = chrome.runtime.getURL('dist/venues.json'); // Get the correct URL for the extension environment
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to load venue data');
  }
  return response.json();
}
