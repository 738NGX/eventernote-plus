/**
 * EventerNote Plus - Popup 交互逻辑（精简版）
 * 仅保留必要功能，虚假代码已删除
 */

// 获取当前活动标签页
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// 初始化
async function init() {
  const tab = await getCurrentTab();
  const isEventernote = tab && tab.url?.includes('eventernote.com');
  
  if (!isEventernote) {
    document.querySelector('.status-active').textContent = '⚠ 未在目标网站';
    document.querySelector('.status-active').style.color = '#f59e0b';
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
