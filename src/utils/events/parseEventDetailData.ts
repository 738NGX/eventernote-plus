import { parseTime } from "../../utils/times";

interface Performer {
  name: string;
  url: string;
  id: string | null;
}

interface EventInfo {
  date?: string;
  time?: { open: string, start: string, end: string };
  location?: { name: string, id: string };
  performers?: Performer[];
  related_links?: string[];
  image?: string;
  description?: string;
  twitter_hashtag?: string;
}

/**
 * Parses event details directly from the current page's DOM.
 * @returns The parsed event data as an object.
 */
export function parseEventInfo(): EventInfo {
  const data: EventInfo = {};
  const rows = document.querySelectorAll('.gb_events_info_table table tr');

  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length < 2) return;

    const label = cells[0].innerText.trim();
    const content = cells[1];

    if (label === '開催日時') {
      data.date = content.innerText.trim();
    } else if (label === '時間') {
      const timeText = content.innerText.trim();
      data.time = parseTime(timeText);
    } else if (label === '開催場所') {
      data.location = { name: content.innerText.trim(), id: (() => {
        let lid = content.querySelector('a')?.getAttribute('href')?.split('/').pop() || '';
        return lid.split('?')[0].split('#')[0];
      })() };
    } else if (label === '出演者') {
      data.performers = Array.from(content.querySelectorAll('a')).map(a => ({
        name: a.innerText.trim(),
        url: a.href,
        id: (() => {
          let aid = a.getAttribute('href')?.split('/').pop() || '';
          return aid.split('?')[0].split('#')[0] || null;
        })()
      }));
    } else if (label === '関連リンク') {
      const links = content.querySelectorAll('a');
      data.related_links = Array.from(links).map(a => a.href);
    } else if (cells[0].querySelector('img')) {
      data.image = cells[0].querySelector('img')?.src || '';
      data.description = content.innerText.trim();
    } else if (label === 'Twitterハッシュタグ') {
      data.twitter_hashtag = content.innerText.trim();
    }
  });

  return data;
}

interface UserStatus {
  is_participating: boolean;
  id: string | null;
  action_url: string | null;
}

interface User {
  name: string;
  url: string | null;
  icon: string | null;
  user_id: string | null;
}

interface Friends {
  exists: boolean;
  count: number;
  list: User[];
}

interface Participants {
  exists: boolean;
  count: number;
  preview_list: User[];
  see_all_url: string | null;
}

interface EventDetailSidebarData {
  user_status: UserStatus;
  friends: Friends;
  participants: Participants;
}


export function parseEventDetailSidebarData(): EventDetailSidebarData {
  const data: EventDetailSidebarData = {
    user_status: {
      is_participating: false,
      id: null,
      action_url: null
    },
    friends: {
      exists: false,
      count: 0,
      list: []
    },
    participants: {
      exists: false,
      count: 0,
      preview_list: [],
      see_all_url: null
    }
  };

  const container = document.querySelector('.span4.page');
  if (!container) return data;

  // Parse user status
  const entryArea = container.querySelector('#entry_area');
  if (entryArea) {
    const editArea = entryArea.querySelector('.note-edit-area') as HTMLElement | null;
    const createArea = entryArea.querySelector('.note-create-area') as HTMLElement | null;
    const isJoined = editArea && editArea.style.display !== 'none';

    data.user_status.is_participating = isJoined || false;

    if (isJoined) {
      const editBtn = editArea.querySelector('a') as HTMLAnchorElement | null;
      data.user_status.action_url = editBtn?.href || null;
      data.user_status.id = editBtn?.href.match(/\/notes\/(\d+)/)?.[1] || null;
    } else {
      const joinBtn = createArea?.querySelector('a') as HTMLAnchorElement | null;
      data.user_status.action_url = joinBtn?.href || null;
      data.user_status.id = joinBtn?.href.match(/addNote\('(\d+)'\)/)?.[1] || null;
    }
  }

  // Extract user list
  const extractUserList = (ulElement: Element | null): User[] => {
    if (!ulElement) return [];
    return Array.from(ulElement.querySelectorAll('li')).map(li => {
      const a = li.querySelector('a') as HTMLAnchorElement | null;
      const img = li.querySelector('img') as HTMLImageElement | null;
      const name = li.querySelector('.name') as HTMLElement | null;
      return {
        name: name?.innerText.trim() || "Unknown",
        url: a?.href || null,
        icon: img?.src || null,
        user_id: (() => {
          let uid = a?.href.split('/').pop() || '';
          return uid.split('?')[0].split('#')[0] || null;
        })()
      };
    });
  };

  // Parse friends and participants
  const headers = container.querySelectorAll('h2');
  headers.forEach(h2 => {
    const text = h2.innerText || "";
    const nextEl = h2.nextElementSibling;

    if (nextEl && nextEl.classList.contains('gb_users_icon')) {
      const countMatch = text.match(/\((\d+)人\)/);
      const count = countMatch ? parseInt(countMatch[1]) : 0;
      const userList = extractUserList(nextEl.querySelector('ul'));

      if (text.includes('フレンズ')) {
        data.friends = {
          exists: true,
          count: count,
          list: userList
        };
      } else if (text.includes('イベンター')) {
        const seeAllLink = nextEl.querySelector('.t2 a') as HTMLAnchorElement | null;
        data.participants = {
          exists: true,
          count: count,
          preview_list: userList,
          see_all_url: seeAllLink?.href || null
        };
      }
    }
  });

  return data;
}

export function parseEventDetailData() {
  let id = location.pathname.split('/').pop() || '';
  id = id.split('?')[0].split('#')[0];
  const title = document.querySelector('.gb_events_detail_title')?.textContent?.trim() || '';
  const info = parseEventInfo();
  const sidebar = parseEventDetailSidebarData();
  return { id, title, info, sidebar };
}