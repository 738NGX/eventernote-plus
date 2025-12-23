import { parseEventList } from "../events/parseEventList";

export function parseActorsEventsData() {
  // 解析艺人名字：从面包屑第三个 <a> 标签中提取
  let name = '';
  const breadcrumb = document.querySelector('.breadcrumb');
  if (breadcrumb) {
    const links = breadcrumb.querySelectorAll('a');
    if (links.length >= 3) {
      name = links[2].textContent?.trim() || '';
    }
  }

  // 解析活动总数
  let total = 0;
  const t2List = document.querySelectorAll('.span8.page .t2');
  t2List.forEach(t2 => {
    const match = t2.textContent?.match(/(\d+)件/);
    if (match) {
      total = parseInt(match[1], 10);
    }
  });

  // 解析分页
  const pagination: Array<{ href: string; page: number|null }> = [];
  document.querySelectorAll('.pagination-centered ul li a, .pagination-centered ul li span').forEach(el => {
    let href = '';
    let page: number|null = null;
    if (el.tagName.toLowerCase() === 'a') {
      href = el.getAttribute('href') || '';
      const num = el.textContent?.trim();
      if (num && /^\d+$/.test(num)) page = parseInt(num, 10);
    } else if (el.tagName.toLowerCase() === 'span') {
      const num = el.textContent?.trim();
      if (num && /^\d+$/.test(num)) page = parseInt(num, 10);
    }
    if (href || page !== null) {
      pagination.push({ href, page });
    }
  });

  // 解析活动列表
  const eventListEl = document.querySelector('.gb_event_list');
  const events = parseEventList(eventListEl);

  return {
    name,
    total,
    events,
    pagination,
  };
}
