import { UserInfo } from "./userInfo";

export function detectCurrentUser(): UserInfo | null {
  // 1) Rails/gon 约定
  const win = window as any;
  if (win.gon && (win.gon.current_user || win.gon.user)) {
    const u = win.gon.current_user || win.gon.user;
    return {
      id: u.id,
      name: u.name || u.screen_name || 'User',
      avatar: u.avatar || u.profile_image_url || u.icon_url,
      profileUrl: u.profile_url || (u.id ? `/users/${u.id}` : '/users/'),
    };
  }

  // 2) 前端状态对象
  if (win.__INITIAL_STATE__ && win.__INITIAL_STATE__.currentUser) {
    const u = win.__INITIAL_STATE__.currentUser;
    return {
      id: u.id,
      name: u.name || u.screen_name || 'User',
      avatar: u.avatar || u.profile_image_url,
      profileUrl: u.profile_url || (u.id ? `/users/${u.id}` : '/users/'),
    };
  }

  // 3) meta 标签
  const metaName = document.querySelector('meta[name="current-user-name"]')?.getAttribute('content');
  const metaId = document.querySelector('meta[name="current-user-id"]')?.getAttribute('content');
  const metaAvatar = document.querySelector('meta[name="current-user-avatar"]')?.getAttribute('content');
  if (metaName || metaId) {
    return {
      id: metaId || undefined,
      name: metaName || 'User',
      avatar: metaAvatar || undefined,
      profileUrl: metaId ? `/users/${metaId}` : '/users/',
    };
  }

  // 4) 从原页面 DOM 提取（在清空前调用）
  const avatarImg = document.querySelector('img[src*="/images/users/"]') as HTMLImageElement | null;
  const userLink = avatarImg?.closest('a');
  if (avatarImg && userLink) {
    return {
      name: avatarImg.alt || userLink.textContent?.trim() || 'User',
      avatar: avatarImg.src,
      profileUrl: userLink.href,
    };
  }

  return null;
}