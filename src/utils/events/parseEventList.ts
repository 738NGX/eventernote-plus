import { EventData } from "./eventdata";

// 解析单个活动列表的函数
export const parseEventList = (listEl: Element | null): EventData[] => {
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