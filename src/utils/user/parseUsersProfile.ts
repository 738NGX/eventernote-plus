export const parseUsersProfile = () => {
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

  // 喜欢的声优
  const artists: { id: string, name: string }[] = [];
  document.querySelectorAll('.gb_actors_list a').forEach(link => {
    const href = link.getAttribute('href') || '';
    const idMatch = href.match(/\/actors\/[^/]+\/(\d+)/);
    if (idMatch) {
      artists.push({ id: idMatch[1], name: link.textContent?.trim() || '' });
    }
  });

  // 活动日历
  const activities: { year: number, months: number[], total: number }[] = [];
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
      signature,
      avatarUrl: avatar,
      followingCount: following,
      followerCount: followers,
      eventCount,
      overlapCount,
      userId,
      isFollowing,
    },
    artists,
    activities,
  }
}