export const parseActorsPageData = () => {
  // ...existing code...
  // 解析页面DOM，提取必要内容
  const page = document.querySelector('.span8.page');
  if (!page) return null;

  // 总数
  const header = page.querySelector('.page-header h2');
  const totalMatch = header?.textContent?.match(/\((\d+)件\)/);
  const total = totalMatch ? parseInt(totalMatch[1], 10) : null;

  // 热门艺人
  const popularList = page.querySelectorAll('h3:nth-of-type(1) + ul.gb_actors_list_inline li a');
  const popular = Array.from(popularList).map(a => {
    const url = a.getAttribute('href') ?? '';
    // /actors/xxx/{id} 或 /actors/{id}
    const idMatch = url.match(/\/actors\/(?:[^\/]+\/)?(\d+)/);
    return {
      name: a.textContent?.trim() ?? '',
      url,
      id: idMatch ? idMatch[1] : ''
    };
  });

  // 新着艺人
  const newList = page.querySelectorAll('h3:nth-of-type(2) + ul.gb_actors_list_inline li a');
  const recent = Array.from(newList).map(a => {
    const url = a.getAttribute('href') ?? '';
    const idMatch = url.match(/\/actors\/(?:[^\/]+\/)?(\d+)/);
    return {
      name: a.textContent?.trim() ?? '',
      url,
      id: idMatch ? idMatch[1] : ''
    };
  });

  // 头文字索引
  const initialList = page.querySelectorAll('ul.gb_actors_initial li a');
  const initials = Array.from(initialList).map(a => {
    const countSpan = a.querySelector('span.count');
    const count = countSpan ? parseInt(countSpan.textContent ?? '0', 10) : 0;
    // 提取假名（如“あ”）
    const kanaMatch = a.textContent?.match(/^(.+) \(/);
    return {
      kana: kanaMatch ? kanaMatch[1].trim() : '',
      url: a.getAttribute('href') ?? '',
      count
    };
  });

  return {
    total,
    popular,
    recent,
    initials
  };

}