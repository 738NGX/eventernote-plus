export function parseActorsFansData() {
  // 解析艺人名字：从面包屑第三个 <a> 标签中提取
  let name = '';
  const breadcrumb = document.querySelector('.breadcrumb');
  if (breadcrumb) {
    const links = breadcrumb.querySelectorAll('a');
    if (links.length >= 3) {
      name = links[2].textContent?.trim() || '';
    }
  }

  // 解析粉丝总数
  let total = 0;
  const subtitle = document.querySelector('.gb_subtitle');
  if (subtitle) {
    const match = subtitle.textContent?.match(/\((\d+)\)/);
    if (match) total = parseInt(match[1], 10);
  }

  // 解析粉丝列表

  const users: Array<{
    id: string;
    username: string;
    avatarUrl: string;
    profileUrl: string;
  }> = [];
  document.querySelectorAll('.gb_users_icon ul.clearfix > li').forEach(li => {
    const a = li.querySelector('p.img a');
    const img = li.querySelector('p.img img');
    const name = li.querySelector('p.name');
    if (a && img && name) {
      // id 从 profileUrl 提取
      const profileUrl = a.getAttribute('href') || '';
      let id = '';
      const match = profileUrl.match(/\/users\/([^/]+)\/?/);
      if (match) id = match[1];
      users.push({
        id,
        username: name.textContent?.trim() || '',
        avatarUrl: img.getAttribute('src') || '',
        profileUrl,
      });
    }
  });


  // 分页信息
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

  return {
    name,
    total,
    users,
    pagination,
  };
}