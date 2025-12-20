// 注入到页面上下文的脚本
// 监听来自 content script 的消息

window.addEventListener('message', function(event) {
  if (event.source !== window) return;
  if (!event.data || !event.data.type) return;
  const { type, action, userId, noteId } = event.data;
  try {
    if (type === 'ENP_FOLLOW_ACTION') {
      if (action === 'follow' && typeof window.addFollow === 'function') {
        window.addFollow(userId);
        window.postMessage({ type: 'ENP_FOLLOW_RESULT', success: true, action }, '*');
      } else if (action === 'unfollow' && typeof window.removeFollow === 'function') {
        window.removeFollow(userId);
        window.postMessage({ type: 'ENP_FOLLOW_RESULT', success: true, action }, '*');
      } else {
        window.postMessage({ type: 'ENP_FOLLOW_RESULT', success: false, error: 'Function not available' }, '*');
      }
    } else if (type === 'ENP_ADD_NOTE') {
      if (typeof window.addNote === 'function') {
        window.addNote(noteId);
        window.postMessage({ type: 'ENP_ADD_NOTE_RESULT', success: true, noteId }, '*');
      } else {
        window.postMessage({ type: 'ENP_ADD_NOTE_RESULT', success: false, error: 'Function not available' }, '*');
      }
    } else if (type === 'ENP_DELETE_NOTE') {
      if (typeof window.deleteNote === 'function') {
        window.deleteNote(noteId);
        window.postMessage({ type: 'ENP_DELETE_NOTE_RESULT', success: true, noteId }, '*');
      } else {
        window.postMessage({ type: 'ENP_DELETE_NOTE_RESULT', success: false, error: 'Function not available' }, '*');
      }
    }
  } catch (e) {
    window.postMessage({ type: type + '_RESULT', success: false, error: e.message }, '*');
  }
});

console.log('[ENP Inject] Ready');
