import { useState, useEffect } from 'react';
import { Card, ConfigProvider, theme as antTheme } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import UserHeader from '../components/user/UserHeader';
import UpcomingEvents from '../components/user/UpcomingEvents';
import FavoriteArtists from '../components/user/FavoriteArtists';
import ActivityHeatmap from '../components/user/ActivityHeatmap';
import Header from '../components/Header';
import Footer from '../components/Footer';
import type { UserInfo } from '../utils/user';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import { fetchAllUserEvents } from '../utils/user'; // Updated to use the correct function name

interface InitialData {
  profile: {
    displayName: string;
    avatarUrl: string;
    followingCount: number;
    followerCount: number;
    eventCount: number;
    overlapCount: number;
    userId: string;
    isFollowing: boolean;
  };
  events: any[];
  overlapEvents: any[];
  artists: any[];
  activities: any[];
}

interface UserProfilePageProps {
  username: string;
  currentUser: UserInfo | null;
  initialData: InitialData | null;
  getPopupContainer?: () => HTMLElement | ShadowRoot;
}

export interface UserProfileData {
  username: string;
  displayName: string;
  avatarUrl: string;
  followingCount: number;
  followerCount: number;
  eventCount: number;
  overlapCount?: number;
  userId?: string;
  isFollowing?: boolean;
}

export interface EventData {
  id: string;
  title: string;
  imageUrl?: string; // Optional field
  date: string;
  venue: {
    id: string;
    name: string;
    prefecture: {
      id: string;
      name: string;
    };
  };
  openTime?: string;
  startTime?: string;
  endTime?: string;
  performers: {
    id: string;
    name: string;
  }[];
  participantCount?: number; // Optional field
}

export interface ArtistData {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface ActivityData {
  year: number;
  months: number[]; // 12 个月的活动数
  total: number;
}

export default function UserProfilePage({ username, currentUser, initialData, getPopupContainer }: UserProfilePageProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('enplus-theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // 使用从 DOM 解析的初始数据
  const [profile] = useState<UserProfileData | null>(() => {
    if (initialData?.profile) {
      return {
        username,
        ...initialData.profile,
      };
    }
    return null;
  });
  const [events] = useState<EventData[]>(initialData?.events || []);
  const [overlapEvents] = useState<EventData[]>(initialData?.overlapEvents || []);
  const [artists] = useState<ArtistData[]>(initialData?.artists || []);
  const [activities] = useState<ActivityData[]>(initialData?.activities || []);
  const [loading] = useState(false); // 初始数据已从 DOM 解析，不需要 loading
  const [selectedContent, setSelectedContent] = useState<'upcomingEvents' | 'overlapEvents'>('upcomingEvents');
  const [fetchedEvents, setFetchedEvents] = useState<EventData[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [additionalEvents, setAdditionalEvents] = useState<EventData[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const userId = profile?.userId || ''; // 从 profile 获取用户 ID
        const username = profile?.username || ''; // 从 profile 获取用户名
        if (userId && username) {
          const events = await fetchAllUserEvents(username, userId);
          setFetchedEvents(events);
        }
      } catch (error) {
        console.error('Error fetching user events:', error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchEvents();
  }, [profile]);

  useEffect(() => {
    const fetchAdditionalEvents = async () => {
      try {
        const userId = profile?.userId || ''; // 从 profile 获取用户 ID
        const username = profile?.username || ''; // 从 profile 获取用户名
        if (userId && username) {
          const events = await fetchAllUserEvents(username, userId);
          console.log('Fetched additional events:', events); // 在控制台输出解析结果
          setAdditionalEvents(events);
        }
      } catch (error) {
        console.error('Error fetching additional user events:', error);
        setFetchError('无法加载更多用户活动，请稍后重试。');
      }
    };

    fetchAdditionalEvents();
  }, [profile]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('enplus-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  const isDark = theme === 'dark';

  const handleContentChange: MenuProps['onClick'] = (e) => {
    setSelectedContent(e.key as 'upcomingEvents' | 'overlapEvents');
  };

  return (
    <StyleProvider hashPriority="high">
      <ConfigProvider
        theme={{
          algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
          token: { colorPrimary: '#1677ff' },
        }}
        getPopupContainer={getPopupContainer}
      >
        <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
          <Header theme={theme} onToggleTheme={toggleTheme} user={currentUser} />

          <main className="flex-1 py-8 px-6">
            <div className="max-w-7xl mx-auto">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-lg">加载中...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-11 gap-8">
                  {/* 左侧边栏 */}
                  <div className="lg:col-span-3 space-y-6">
                    <UserHeader profile={profile} theme={theme} isOwner={currentUser?.name === username} />
                    <FavoriteArtists artists={artists} theme={theme} />
                    <ActivityHeatmap activities={activities} theme={theme} />
                  </div>

                  {/* 中间主内容 */}
                  <div className="lg:col-span-6 space-y-6">
                    {selectedContent === 'upcomingEvents' && (
                      <UpcomingEvents events={events} theme={theme} username={username} title="最近参加的活动" />
                    )}
                    {selectedContent === 'overlapEvents' && overlapEvents.length > 0 && (
                      <UpcomingEvents events={overlapEvents} theme={theme} username={username} title="共同参加的活动" />
                    )}
                  </div>

                  {/* 右侧边栏 */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card
                      className={isDark ? 'bg-slate-800 border-slate-700' : ''}
                      styles={{ body: { padding: 6 } }}
                    >
                      <Menu
                        onClick={handleContentChange}
                        selectedKeys={[selectedContent]}

                        items={[
                          { key: 'upcomingEvents', label: '最近参加的活动' },
                          { key: 'overlapEvents', label: '共同参加的活动' },
                        ]}
                      />
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </main>

          <Footer theme={theme} />
        </div>
      </ConfigProvider>
    </StyleProvider>
  );
}
