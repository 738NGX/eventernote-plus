/**
 * EventerNote Plus - Popup 交互逻辑（精简版）
 * 仅保留必要功能，虚假代码已删除
 */

console.log('popup.js 已加载'); // 确认脚本加载

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

// 修复 ID
const toggleInput = document.getElementById('uiReplaceToggle');
if (toggleInput) {
  chrome.storage.sync.get(['disableUIReplace'], (result) => {
    const currentValue = result.disableUIReplace || false;
    toggleInput.checked = !currentValue;

    toggleInput.addEventListener('change', () => {
      const newValue = !toggleInput.checked;
      chrome.storage.sync.set({ disableUIReplace: newValue }, () => {
        console.log(`disableUIReplace 状态已切换: ${newValue}`);
      });
    });
  });
} else {
  console.error('未找到 UI 替换开关元素');
}

const clearCacheButton = document.getElementById('clearCache');
if (clearCacheButton) {
  clearCacheButton.addEventListener('click', () => {
    chrome.storage.sync.clear(() => {
      console.log('缓存已清除');
    });
  });
} else {
  console.error('未找到清除缓存按钮');
}

// 页面加载完成后初始化
console.log('初始化函数调用开始');
init();
