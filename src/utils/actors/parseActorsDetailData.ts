import { parseEventList } from "../events/parseEventList";

export interface ActorDetail {
  name: string;
  kana: string;
  isFavorite: boolean;
  favoriteId: string;
  events: ReturnType<typeof parseEventList>;
  fans: Array<{
    id: string;
    username: string;
    avatarUrl: string;
    profileUrl: string;
  }>;
  fansTotal: number;
  fansRanking: Array<{
    rank: number;
    count: number;
    id: string;
    username: string;
    avatarUrl: string;
    profileUrl: string;
  }>;
}

export function parseActorsDetailData(): ActorDetail {
  // 基本信息
  const name = document.querySelector('.gb_actors_title .name h2')?.textContent?.trim() || '';
  const kana = document.querySelector('.gb_actors_title .name .kana')?.textContent?.trim() || '';
  const isFavorite = document.getElementById('favorite_actors_remove')?.style.display !== 'none';
  const favoriteId = document.getElementById('favorite_actors_remove')?.querySelector('a')?.getAttribute('href')?.match(/removeFavorite\((\d+)\)/)?.[1] || '';

  // 近期活动
  const events = parseEventList(document.querySelector('.gb_event_list'));

  // 粉丝列表
  const fans: ActorDetail['fans'] = [];
  document.querySelectorAll('.gb_users_icon ul.clearfix > li').forEach(li => {
    const a = li.querySelector('p.img a');
    const img = li.querySelector('p.img img');
    const name = li.querySelector('p.name');
    if (a && img && name) {
      const profileUrl = a.getAttribute('href') || '';
      let id = '';
      const match = profileUrl.match(/\/users\/([^/]+)\/?/);
      if (match) id = match[1];
      fans.push({
        id,
        username: name.textContent?.trim() || '',
        avatarUrl: img.getAttribute('src') || '',
        profileUrl,
      });
    }
  });
  // 粉丝总数
  let fansTotal = 0;
  // 选取.gb_users_icon前一个h2下的span.number
  let fansNum: Element | null = null;
  const gbUsersIcon = document.querySelector('.gb_users_icon');
  if (gbUsersIcon) {
    let prev = gbUsersIcon.previousElementSibling;
    while (prev) {
      if (prev.tagName === 'H2') {
        fansNum = prev.querySelector('span.number');
        break;
      }
      prev = prev.previousElementSibling;
    }
  }
  if (fansNum) {
    fansTotal = parseInt(fansNum.textContent || '0', 10);
  }

  // 粉丝排行榜
  const fansRanking: ActorDetail['fansRanking'] = [];
  document.querySelectorAll('.gb_users_list ul > li').forEach(li => {
    // 支持有<b>标签和无<b>标签的名次
    const rankMatch = li.innerHTML.match(/(?:<b>)?(\d+)(?:<\/b>)?位 (\d+)回/);
    const a = li.querySelector('a');
    const img = li.querySelector('img');
    if (rankMatch && a && img) {
      const profileUrl = a.getAttribute('href') || '';
      let id = '';
      const match = profileUrl.match(/\/users\/([^/]+)\/?/);
      if (match) id = match[1];
      fansRanking.push({
        rank: parseInt(rankMatch[1], 10),
        count: parseInt(rankMatch[2], 10),
        id,
        username: a.textContent?.trim() || '',
        avatarUrl: img.getAttribute('src') || '',
        profileUrl,
      });
    }
  });

  return {
    name,
    kana,
    isFavorite,
    favoriteId,
    events,
    fans,
    fansTotal,
    fansRanking,
  };
}
