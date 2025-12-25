export const parseSideComment = () => {
  const result: Array<{
    userName: string;
    userLink: string;
    userIcon: string;
    eventTitle: string;
    eventLink: string;
    comment: string;
    readMoreLink: string;
  }> = [];

  const items = document.querySelectorAll('.gb_events_side_comment ul.media-list > li.media');
  items.forEach((li) => {
    const userA = li.querySelector('a.pull-left');
    const userImg = userA?.querySelector('img');
    const eventA = li.querySelector('.media-heading a');
    const commentP = li.querySelector('p.comment');
    const readMoreA = li.querySelector('p.more a');

    result.push({
      userName: userImg?.getAttribute('alt')?.replace('さん', '') || '',
      userLink: userA?.getAttribute('href') || '',
      userIcon: userImg?.getAttribute('src') || '',
      eventTitle: eventA?.textContent?.trim() || '',
      eventLink: eventA?.getAttribute('href') || '',
      comment: commentP?.textContent?.trim() || '',
      readMoreLink: readMoreA?.getAttribute('href') || '',
    });
  });

  return result;
}