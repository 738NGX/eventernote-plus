import { useState, useEffect, useMemo } from 'react';
import { Breadcrumb, Card, ConfigProvider, Skeleton, Switch, theme as antTheme } from 'antd';
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
import { ActorWordCloud, ActorCountData } from '../components/user/ActorWordCloud';
import { ActorTable } from '../components/user/ActorTable';
import ActivityHeatmapDetailed from '../components/user/ActivityHeatmapDetailed';

type InitialData = ReturnType<typeof parseUserPageData>;

interface UserProfilePageProps {
  currentUser: UserInfo | null;
  initialData: InitialData | null;
  getPopupContainer?: () => HTMLElement | ShadowRoot;
}

export interface UserProfileData {
  username: string;
  signature: string;
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

const calculateActivityHeatmapDetailedData = (events: EventData[]): Record<string, Record<string, number>> => {
  const heatmapData: Record<string, Record<string, number>> = {};
  events.forEach((event: EventData) => {
    const year = event.date.slice(0, 4);
    const monthDay = event.date.slice(5, 10); // MM-DD

    if (!heatmapData[year]) {
      heatmapData[year] = {};
    }
    if (heatmapData[year][monthDay]) {
      heatmapData[year][monthDay] += 1;
    }
    else {
      heatmapData[year][monthDay] = 1;
    }
  });
  return heatmapData;
}

const generateActorData = (
  events: EventData[],
  artists: ArtistData[]
): { allActorData: ActorCountData[]; favouriteActorData: ActorCountData[] } => {
  const actorCount: { [key: string]: { id: string; value: number } } = {};

  events.forEach((event: EventData) => {
    event.performers.forEach((performer) => {
      if (actorCount[performer.name]) {
        actorCount[performer.name].value += 1;
      } else {
        actorCount[performer.name] = { id: performer.id, value: 1 };
      }
    });
  });

  const allActorData: ActorCountData[] = Object.entries(actorCount).map(([text, { id, value }]) => ({
    id,
    text,
    value,
  }));

  // 根据 artists 筛选，只保留在 artists 内的
  const favouriteActorData: ActorCountData[] = allActorData.filter((actor) =>
    artists.some((artist) => artist.name === actor.text)
  );

  return { allActorData, favouriteActorData };
};

export default function UserProfilePage({ currentUser, initialData, getPopupContainer }: UserProfilePageProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('enplus-theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const isMyPage = !location.pathname.split('/')[2];

  // 使用从 DOM 解析的初始数据
  const [profile] = useState<UserProfileData | null>(() => {
    console.log('Initial data from DOM:', initialData);
    if (initialData?.profile) {
      return initialData.profile;
    }
    return null;
  });
  const [scheduledEvents] = useState<EventData[]>(initialData?.scheduledEvents || []);
  const [overlapEvents] = useState<EventData[]>(initialData?.overlapEvents || []);
  const [favouriteArtistsEvents] = useState<EventData[]>(initialData?.favouriteArtistsEvents || []);
  const [artists] = useState<ArtistData[]>(initialData?.artists || []);
  const [showFavoriteArtists, setShowFavoriteArtists] = useState<boolean>(true);
  const [activities] = useState<ActivityData[]>(initialData?.activities || []);
  const [loading] = useState(false);
  const [selectedContent, setSelectedContent] = useState<string>('eventsList');
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [userEvents, setUserEvents] = useState<EventData[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!profile) return;
      setIsFetching(true);
      try {
        const events = await fetchAllUserEvents(profile.username);
        console.log('Fetched all events:', events); // 在控制台输出解析结果
        setUserEvents(events as any[]);
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
    setSelectedContent(e.key);
  };

  const venueRanking = useMemo<[string, number][]>(() => calculateVenueRanking(userEvents), [userEvents]);
  const prefectureMapData = useMemo<PrefectureCount>(() => generatePrefectureMapData(userEvents), [userEvents]);
  const { allActorData, favouriteActorData } = useMemo(() => generateActorData(userEvents, artists), [userEvents, artists]);
  const activityHeatmapDetailedData = useMemo<Record<string, Record<string, number>>>(() => calculateActivityHeatmapDetailedData(userEvents), [userEvents]);

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
          token: { colorPrimary: '#ff74b9' },
        }}
        getPopupContainer={getPopupContainer}
      >
        <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
          <Header theme={theme} onToggleTheme={toggleTheme} user={currentUser} />
          <main className="flex-1 py-8 px-6">
            <div className="max-w-7xl mx-auto">
              <Breadcrumb
                items={[
                  {
                    title: <a href="/">首页</a>,
                  },
                  {
                    title: isMyPage ? '我的活动笔记' : `${profile?.username}的活动笔记`,
                  }
                ]}
                className='!mb-2'
              />
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-lg">加载中...</div>
                </div>
              ) : (
                profile && <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* 左侧边栏 */}
                  <div className="lg:col-span-3 space-y-6">
                    <UserHeader profile={profile} theme={theme} isOwner={currentUser?.name === profile?.username} />
                    <FavoriteArtists artists={artists} theme={theme} canEdit={isMyPage} />
                    <ActivityHeatmap activities={activities} theme={theme} />
                  </div>
                  {/* 中间主内容 */}
                  <div className="lg:col-span-7 space-y-6">
                    {selectedContent === 'eventsList' && (
                      <>
                        <EventsList events={scheduledEvents} theme={theme} username={profile.username} title="最近参加的活动" />
                        {overlapEvents.length > 0 && <EventsList events={overlapEvents} theme={theme} username={profile.username} title="共同参加的活动" />}
                        {favouriteArtistsEvents.length > 0 && <EventsList events={favouriteArtistsEvents} theme={theme} username={profile.username} title="收藏的艺人的近期活动" />}
                      </>
                    )}
                    {
                      selectedContent !== 'eventsList' && isFetching && <Skeleton active />
                    }
                    {
                      selectedContent === 'eventCalendar' && !isFetching && (
                        <>
                          <h3 className="text-lg font-bold mb-4">📅 活动日程</h3>
                          {Object.entries(activityHeatmapDetailedData).sort((a, b) => b[0].localeCompare(a[0])).map(([year, data]) => (
                            <>
                              <div className='flex flex-row items-center justify-between'>
                                <h4>{year}年</h4>
                                <span className={`${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                  共 {Object.values(data).reduce((sum, count) => sum + count, 0)} 场
                                </span>
                              </div>
                              <ActivityHeatmapDetailed key={year} username={profile.username} year={parseInt(year)} data={data} theme={theme} />
                            </>
                          ))}
                        </>
                      )
                    }
                    {selectedContent === 'actorRanking' && !isFetching && (
                      <>
                        <div className="flex flex-row items-center justify-between">
                          <h3 className="text-lg font-bold ">⭐ 艺人统计</h3>
                          <Switch checkedChildren="只看收藏" unCheckedChildren="展示全部" onChange={(checked: boolean) => setShowFavoriteArtists(checked)} value={showFavoriteArtists} />
                        </div>
                        <ActorWordCloud data={showFavoriteArtists ? favouriteActorData.slice(0, 40) : allActorData.slice(0, 40)} dark={theme === 'dark'} />
                        <ActorTable actorCountData={showFavoriteArtists ? favouriteActorData : allActorData} />
                      </>
                    )}
                    {selectedContent === 'venueRanking' && !isFetching && (
                      <>
                        <h3 className="text-lg font-bold mb-4">📍 场馆统计</h3>
                        <Card
                          className={isDark ? 'bg-slate-800 border-slate-700' : ''}
                          styles={{ body: { padding: 6 } }}
                        >
                          <PrefectureMap data={prefectureMapData} isDark={isDark} />
                        </Card>
                        <VenueCount venueRanking={venueRanking} userEvents={userEvents} />
                      </>
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
                          { key: 'eventsList', label: '🏠 用户主页' },
                          { key: 'eventCalendar', label: '📅 活动日程' },
                          { key: 'actorRanking', label: '⭐ 艺人统计' },
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
