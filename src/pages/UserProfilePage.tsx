import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, ConfigProvider, Skeleton, Table, theme as antTheme } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import UserHeader from '../components/user/UserHeader';
import EventsList from '../components/user/EventsList';
import FavoriteArtists from '../components/user/FavoriteArtists';
import ActivityHeatmap from '../components/user/ActivityHeatmap';
import Header from '../components/Header';
import Footer from '../components/Footer';
import type { UserInfo } from '../utils/user/fetchAllUserEvents';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import { fetchAllUserEvents } from '../utils/user/fetchAllUserEvents';
import { generatePrefectureMapData, PrefectureCount, PrefectureMap } from '../components/user/PrefectureMap';
import { EventData } from '../utils/events/eventdata';
import { parseUserPageData } from '../utils/user/parseUserPageData';
import { VenueCount } from '../components/user/VenueCount';

type InitialData = ReturnType<typeof parseUserPageData>;

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

interface VenueCount {
  [key: string]: number;
}

const calculateVenueRanking = (events: EventData[]): [string, number][] => {
  const venueCount: VenueCount = {};
  events.forEach((event: EventData) => {
    const venueName = event.venue.name;
    if (venueCount[venueName]) {
      venueCount[venueName] += 1;
    } else {
      venueCount[venueName] = 1;
    }
  });
  return Object.entries(venueCount).sort((a, b) => b[1] - a[1]);
};

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
  const [scheduledEvents] = useState<EventData[]>(initialData?.scheduledEvents || []);
  const [overlapEvents] = useState<EventData[]>(initialData?.overlapEvents || []);
  const [artists] = useState<ArtistData[]>(initialData?.artists || []);
  const [activities] = useState<ActivityData[]>(initialData?.activities || []);
  const [loading] = useState(false);
  const [selectedContent, setSelectedContent] = useState<string>('eventsList');
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [userEvents, setUserEvents] = useState<EventData[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsFetching(true);
      try {
        const userId = profile?.userId || ''; // 从 profile 获取用户 ID
        const username = profile?.username || ''; // 从 profile 获取用户名
        if (userId && username) {
          const events = await fetchAllUserEvents(username, userId);
          console.log('Fetched all events:', events); // 在控制台输出解析结果
          setUserEvents(events as any[]);
        }
      } catch (error) {
        console.error('Error fetching all user events:', error);
        setFetchError('无法加载所有用户活动，请稍后重试。');
      } finally {
        setIsFetching(false);
      }
    };
    fetchEvents();
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

  const venueRanking = useMemo<[string, number][]>(() => calculateVenueRanking(userEvents), [userEvents]);
  const prefectureMapData = useMemo<PrefectureCount>(() => generatePrefectureMapData(userEvents), [userEvents]);

  useEffect(() => { }, [prefectureMapData]);

  useEffect(() => {
    const svgPath = chrome.runtime.getURL('dist/jp.svg');

    const checkSVGObject = () => {
      const svgObject = document.querySelector('object[type="image/svg+xml"]');
      if (svgObject) {
        svgObject.setAttribute('data', svgPath);

        svgObject.addEventListener('load', () => {
        });
      } else {
        setTimeout(checkSVGObject, 500);
      }
    };

    checkSVGObject();
  }, [userEvents]);

  useEffect(() => { generatePrefectureMapData(userEvents); }, [userEvents]);

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
                    {selectedContent === 'eventsList' && (
                      <>
                        <EventsList events={scheduledEvents} theme={theme} username={username} title="最近参加的活动" />
                        <EventsList events={overlapEvents} theme={theme} username={username} title="共同参加的活动" />
                      </>
                    )}
                    {
                      selectedContent !== 'eventsList' && isFetching && <Skeleton active/>
                    }
                    {selectedContent === 'venueRanking' && !isFetching && (
                      <VenueCount prefectureMapData={prefectureMapData} venueRanking={venueRanking} userEvents={userEvents} />
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
                          { key: 'eventsList', label: '📅 活动列表' },
                          { key: 'venueRanking', label: '📍 场馆统计' },
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
