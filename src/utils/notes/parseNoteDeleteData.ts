// ノート削除完了ページHTML解析
// 指定文言があれば {success:true,url}，否则 {success:false}

// 解析当前页面是否为“ノートの削除が完了しました。”页面，并返回跳转链接
export function parseNoteDeleteData(): { success: true; url: string } | { success: false } {
  // 查找 h2 元素，判断文本
  const h2 = document.querySelector('.span8.page h2');
  if (!h2 || h2.textContent?.trim() !== 'ノートの削除が完了しました。') {
    return { success: false };
  }
  // 查找“イベントページに戻る”链接
  const link = document.querySelector('.span8.page a');
  if (link && link.textContent?.includes('イベントページに戻る')) {
    const url = link.getAttribute('href') || '';
    return { success: true, url };
  }
  return { success: false };
}