// 注入到页面上下文的脚本
// 监听来自 content script 的消息

// 劫持 Eventernote.addFavoriteActors/removeFavoriteActors，包装回调
if (window.Eventernote && typeof window.Eventernote.addFavoriteActors === 'function') {
  const origAdd = window.Eventernote.addFavoriteActors;
  window.Eventernote.addFavoriteActors = function(actorId, success, failure) {
    const wrapSuccess = function(data) {
      if (typeof success === 'function') success(data);
      window.postMessage({ type: 'ENP_FAVORITE_RESULT', success: true, action: 'add', actorId, data }, '*');
    };
    const wrapFailure = function(data) {
      if (typeof failure === 'function') failure(data);
      window.postMessage({ type: 'ENP_FAVORITE_RESULT', success: false, action: 'add', actorId, data }, '*');
    };
    return origAdd.call(this, actorId, wrapSuccess, wrapFailure);
  };
}
if (window.Eventernote && typeof window.Eventernote.removeFavoriteActors === 'function') {
  const origRemove = window.Eventernote.removeFavoriteActors;
  window.Eventernote.removeFavoriteActors = function(actorId, success, failure) {
    const wrapSuccess = function(data) {
      if (typeof success === 'function') success(data);
      window.postMessage({ type: 'ENP_FAVORITE_RESULT', success: true, action: 'remove', actorId, data }, '*');
    };
    const wrapFailure = function(data) {
      if (typeof failure === 'function') failure(data);
      window.postMessage({ type: 'ENP_FAVORITE_RESULT', success: false, action: 'remove', actorId, data }, '*');
    };
    return origRemove.call(this, actorId, wrapSuccess, wrapFailure);
  };
}

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
    // 收藏/取消收藏艺人
    else if (type === 'ENP_FAVORITE_ACTION') {
      // 只需调用原生 addFavorite/removeFavorite 触发 UI，回调已在 Eventernote.addFavoriteActors 劫持
      const { action, actorId } = event.data;
      const oldAlert = window.alert;
      const oldConfirm = window.confirm;
      window.alert = () => {};
      window.confirm = () => true;
      try {
        if (action === 'add' && typeof window.addFavorite === 'function') {
          window.addFavorite(actorId);
        } else if (action === 'remove' && typeof window.removeFavorite === 'function') {
          window.removeFavorite(actorId);
        } else {
          window.postMessage({ type: 'ENP_FAVORITE_RESULT', success: false, action, actorId, error: 'Function not available' }, '*');
        }
      } finally {
        window.alert = oldAlert;
        window.confirm = oldConfirm;
      }
    }
  } catch (e) {
    window.postMessage({ type: type + '_RESULT', success: false, error: e.message }, '*');
  }
});

console.log('[ENP Inject] Ready');
