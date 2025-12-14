// 注入到页面上下文的脚本
// 监听来自 content script 的消息
window.addEventListener('message', function(event) {
  if (event.source !== window) return;
  if (!event.data || event.data.type !== 'ENP_FOLLOW_ACTION') return;
  
  const { action, userId } = event.data;
  
  try {
    if (action === 'follow' && typeof window.addFollow === 'function') {
      window.addFollow(userId);
      window.postMessage({ type: 'ENP_FOLLOW_RESULT', success: true, action }, '*');
    } else if (action === 'unfollow' && typeof window.removeFollow === 'function') {
      window.removeFollow(userId);
      window.postMessage({ type: 'ENP_FOLLOW_RESULT', success: true, action }, '*');
    } else {
      window.postMessage({ type: 'ENP_FOLLOW_RESULT', success: false, error: 'Function not available' }, '*');
    }
  } catch (e) {
    window.postMessage({ type: 'ENP_FOLLOW_RESULT', success: false, error: e.message }, '*');
  }
});

console.log('[ENP Inject] Ready');
