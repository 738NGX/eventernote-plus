/**
 * EventerNote Plus - Background Service Worker
 */

// 安装事件
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('EventerNote Plus installed successfully!');
    
    // 设置默认配置
    chrome.storage.local.set({
      enplus_config: {
        theme: 'modern',
        animations: true,
        compactMode: false
      },
      search_history: []
    });
    
    // 打开欢迎页面
    chrome.tabs.create({
      url: 'https://www.eventernote.com/'
    });
  } else if (details.reason === 'update') {
    console.log('EventerNote Plus updated to version', chrome.runtime.getManifest().version);
  }
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'log') {
    console.log('[Content Script]', request.message, request.data || '');
  }
  
  return true;
});

// 监听标签页更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('eventernote.com')) {
    console.log('EventerNote page loaded:', tab.url);
  }
});
