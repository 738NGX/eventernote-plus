import { useState } from 'react';
import { Card, Avatar, Button, Statistic, message } from 'antd';
import { UserOutlined, UserAddOutlined, UserDeleteOutlined } from '@ant-design/icons';
import type { UserProfileData } from '../../pages/UserProfilePage';

interface UserHeaderProps {
  profile: UserProfileData | null;
  theme: 'light' | 'dark';
  isOwner: boolean;
}

// 通过 postMessage 调用页面上下文中的原网站关注函数
function callFollowAction(action: 'follow' | 'unfollow', userId: number): Promise<boolean> {
  return new Promise((resolve) => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'ENP_FOLLOW_RESULT') {
        window.removeEventListener('message', handler);
        resolve(event.data.success);
      }
    };
    window.addEventListener('message', handler);
    
    // 发送消息到页面上下文
    window.postMessage({ type: 'ENP_FOLLOW_ACTION', action, userId }, '*');
    
    // 超时处理
    setTimeout(() => {
      window.removeEventListener('message', handler);
      resolve(false);
    }, 3000);
  });
}

export default function UserHeader({ profile, theme, isOwner }: UserHeaderProps) {
  const isDark = theme === 'dark';
  const [isFollowing, setIsFollowing] = useState(profile?.isFollowing || false);
  const [loading, setLoading] = useState(false);

  if (!profile) return null;

  const handleFollow = async () => {
    if (!profile.userId) {
      message.error('无法获取用户ID');
      return;
    }
    
    const userId = parseInt(profile.userId, 10);
    
    setLoading(true);
    const action = isFollowing ? 'unfollow' : 'follow';
    const success = await callFollowAction(action, userId);
    
    if (success) {
      setIsFollowing(!isFollowing);
      message.success(isFollowing ? '已取消关注' : '关注成功');
    } else {
      message.error('操作失败，请刷新页面重试');
    }
    setLoading(false);
  };

  return (
    <Card
      className={isDark ? 'bg-slate-800 border-slate-700' : ''}
      styles={{ body: { padding: 24 } }}
    >
      {/* 头像和用户名 */}
      <div className="flex flex-col items-center text-center mb-6">
        <Avatar
          size={100}
          src={profile.avatarUrl}
          icon={<UserOutlined />}
          style={{ 
            border: `3px solid ${isDark ? '#3b82f6' : '#2563eb'}`,
            marginBottom: 16,
          }}
        />
        <h1 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {profile.displayName}
        </h1>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          @{profile.username}
        </p>
      </div>

      {/* 统计数据 */}
      <div className={`grid ${!isOwner && profile.overlapCount !== undefined ? 'grid-cols-4' : 'grid-cols-3'} gap-4 mb-6`}>
        <a href={`/users/${profile.username}/following`} className="text-center hover:opacity-80">
          <Statistic
            title={<span className={isDark ? 'text-gray-400' : ''}>关注</span>}
            value={profile.followingCount}
            valueStyle={{ fontSize: 20, color: isDark ? '#fff' : '#1f2937' }}
          />
        </a>
        <a href={`/users/${profile.username}/follower`} className="text-center hover:opacity-80">
          <Statistic
            title={<span className={isDark ? 'text-gray-400' : ''}>粉丝</span>}
            value={profile.followerCount}
            valueStyle={{ fontSize: 20, color: isDark ? '#fff' : '#1f2937' }}
          />
        </a>
        <a href={`/users/${profile.username}/events`} className="text-center hover:opacity-80">
          <Statistic
            title={<span className={isDark ? 'text-gray-400' : ''}>活动</span>}
            value={profile.eventCount}
            valueStyle={{ fontSize: 20, color: isDark ? '#fff' : '#1f2937' }}
          />
        </a>
        {!isOwner && profile.overlapCount !== undefined && profile.overlapCount > 0 && (
          <a href={`/users/${profile.username}/events/same`} className="text-center hover:opacity-80">
            <Statistic
              title={<span className={isDark ? 'text-gray-400' : ''}>同场</span>}
              value={profile.overlapCount}
              valueStyle={{ fontSize: 20, color: isDark ? '#fff' : '#1f2937' }}
            />
          </a>
        )}
      </div>

      {/* 操作按钮 - 仅非本人时显示关注按钮 */}
      {!isOwner && profile.userId && (
        <div className="flex gap-3">
          <Button
            type={isFollowing ? 'default' : 'primary'}
            danger={isFollowing}
            icon={isFollowing ? <UserDeleteOutlined /> : <UserAddOutlined />}
            block
            loading={loading}
            onClick={handleFollow}
          >
            {isFollowing ? '取消关注' : '关注'}
          </Button>
        </div>
      )}
    </Card>
  );
}
