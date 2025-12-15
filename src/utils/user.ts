import axios from 'axios';
import * as cheerio from 'cheerio';

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

interface Venue {
  id: string;
  name: string;
  prefecture: {
    id: string;
    name: string;
  };
}

interface Performer {
  name: string;
  id: string;
}

export interface EventData {
  id: string;
  title: string;
  date: string;
  openTime?: string;
  startTime?: string;
  endTime?: string;
  venue: {
    id: string;
    name: string;
    prefecture: {
      id: string;
      name: string;
    };
  };
  performers: {
    id: string;
    name: string;
  }[];
  imageUrl?: string; // Optional field
  participantCount?: number; // Optional field
}

/**
 * Fetches all events for a user from Eventernote across all pages.
 * @param username The username of the user.
 * @param userId The user ID of the user.
 * @returns A promise that resolves to an array of event objects.
 */
export async function fetchAllUserEvents(username: string, userId: string): Promise<EventData[]> {
  const events: EventData[] = [];

  try {
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const url = `https://www.eventernote.com/users/${username}/events?page=${page}&user_id=${userId}`;
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      // Conditionally import 'fs' for development environment
      if (process.env.NODE_ENV === 'development') {
        const fs = await import('fs');
        fs.writeFileSync(`./debug_user_events_page_${page}.html`, response.data, 'utf-8');
      }

      const pageEvents: EventData[] = [];

      $('li.clearfix').each((_, element) => {
        const eventTitle = $(element).find('h4 a').text().trim();
        const eventLink = $(element).find('h4 a').attr('href');
        const eventId = eventLink?.split('/').pop() || '';

        const date = $(element).find('.date p').first().text().trim();
        const timeInfo = $(element).find('.place span.s').text().trim();
        const [openTime, startTime, endTime] = timeInfo.match(/\d{2}:\d{2}/g) || [];

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
          : null; // 如果没有场地信息，设置为 null

        if (venue) {
          const prefectureInfo = $(element).find('.place').text().match(/\(([^)]+)\)/);
          if (prefectureInfo) {
            venue.prefecture.name = prefectureInfo[1];
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
            openTime,
            startTime,
            endTime,
            venue, // 允许 venue 为 null
            performers,
          });
        }
      });

      // Ensure venue data from venues.json is matched with fetched events
      const venueData = await fetchVenueData();
      // Mapping of prefectureId to prefecture names
      const prefectureMap: Record<string, string> = {
        '1': '北海道',
        '2': '青森県',
        '3': '岩手県',
        '4': '宮城県',
        '5': '秋田県',
        '6': '山形県',
        '7': '福島県',
        '8': '茨城県',
        '9': '栃木県',
        '10': '群馬県',
        '11': '埼玉県',
        '12': '千葉県',
        '13': '東京都',
        '14': '神奈川県',
        '15': '新潟県',
        '16': '富山県',
        '17': '石川県',
        '18': '福井県',
        '19': '山梨県',
        '20': '長野県',
        '21': '岐阜県',
        '22': '静岡県',
        '23': '愛知県',
        '24': '三重県',
        '25': '滋賀県',
        '26': '京都府',
        '27': '大阪府',
        '28': '兵庫県',
        '29': '奈良県',
        '30': '和歌山県',
        '31': '鳥取県',
        '32': '島根県',
        '33': '岡山県',
        '34': '広島県',
        '35': '山口県',
        '36': '徳島県',
        '37': '香川県',
        '38': '愛媛県',
        '39': '高知県',
        '40': '福岡県',
        '41': '佐賀県',
        '42': '長崎県',
        '43': '熊本県',
        '44': '大分県',
        '45': '宮崎県',
        '46': '鹿児島県',
        '47': '沖縄県',
        '90': '海外',
      };

      // Update venue prefecture based on prefectureId
      for (const event of pageEvents) {
        if (!event.venue) {
          console.warn('Skipping event due to missing venue:', event);
          continue; // 跳过没有场地信息的事件
        }

        const venueMatch = venueData.find(v => String(v.venueId) === String(event.venue.id));
        if (venueMatch) {
          event.venue.prefecture.id = venueMatch.prefectureId;
          event.venue.prefecture.name = prefectureMap[String(venueMatch.prefectureId)] || '';

          // Debugging: Log matched venue data and prefecture mapping
          console.log('Matching venue:', venueMatch);
          console.log('Prefecture ID:', venueMatch.prefectureId);
          console.log('Prefecture Name:', prefectureMap[String(venueMatch.prefectureId)]);
        }
      }

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
export async function fetchVenueData(): Promise<Venue[]> {
  const url = chrome.runtime.getURL('dist/venues.json'); // Get the correct URL for the extension environment
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to load venue data');
  }
  return response.json();
}
