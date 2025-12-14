import { Card, Avatar, Button, Statistic } from 'antd';
import { UserOutlined, UserAddOutlined } from '@ant-design/icons';
import type { UserProfileData } from '../../pages/UserProfilePage';

interface UserHeaderProps {
  profile: UserProfileData | null;
  theme: 'light' | 'dark';
  isOwner: boolean;
}

export default function UserHeader({ profile, theme, isOwner }: UserHeaderProps) {
  const isDark = theme === 'dark';

  if (!profile) return null;

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
      {!isOwner && (
        <div className="flex gap-3">
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            block
            onClick={() => {
              // 调用关注 API
              // @ts-ignore
              if (typeof addFollow === 'function') addFollow(profile.username);
            }}
          >
            关注
          </Button>
        </div>
      )}
    </Card>
  );
}
