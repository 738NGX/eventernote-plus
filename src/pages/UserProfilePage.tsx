import { useState, useEffect, useMemo, useRef } from 'react';
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
import { fetchAllUserEvents } from '../utils/user';
import { getIdByPrefectureName } from '../utils/prefecture';

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

interface VenueCount {
  [key: string]: number;
}

interface PrefectureCount {
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

const generateHeatmapData = (events: EventData[]): PrefectureCount => {
  const prefectureCount: PrefectureCount = {};
  events.forEach((event: EventData) => {
    const prefectureName = event.venue.prefecture.name?.trim(); // 确保名称没有多余空格
    if (prefectureName) {
      if (prefectureCount[prefectureName]) {
        prefectureCount[prefectureName] += 1;
      } else {
        prefectureCount[prefectureName] = 1;
      }
    } else {
      console.warn('Event with missing or invalid prefecture name:', {
        eventId: event.id,
        eventTitle: event.title,
        venue: event.venue.name,
      });
    }
  });
  return prefectureCount;
};

const PrefectureMap = ({ heatmapData }: { heatmapData: PrefectureCount }) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSvg = async () => {
      try {
        const svgPath = chrome.runtime.getURL('dist/jp.svg'); // 保留dist路径
        const response = await fetch(svgPath);
        if (!response.ok) {
          throw new Error('无法加载SVG文件');
        }
        const svgText = await response.text();
        setSvgContent(svgText);
      } catch (error) {
        console.error('加载SVG文件时出错:', error);
      }
    };

    loadSvg();
  }, []);

  useEffect(() => {
    if (!svgContainerRef.current || !svgContent) return;

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;

    // 确保SVG有viewBox和preserveAspectRatio
    if (!svgElement.hasAttribute('viewBox')) {
      svgElement.setAttribute('viewBox', '0 0 1000 846');
    }
    svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // 设置宽度为100%，高度自动
    svgElement.setAttribute('width', '100%');
    svgElement.setAttribute('height', 'auto');

    // 获取颜色深度函数
    const getColor = (count: number): string => {
      if (count === 0) return '#e5e7eb'; // Gray-100
      if (count <= 2) return '#93c5fd'; // Blue-300
      if (count <= 5) return '#3b82f6'; // Blue-500
      return '#1e40af'; // Blue-900
    };

    // 应用热力图数据
    Object.entries(heatmapData).forEach(([prefecture, count]) => {
      const prefectureId = getIdByPrefectureName(prefecture, true)
      const path = svgElement.querySelector(`#JP${prefectureId}`) as SVGPathElement | null;
      if (path) {
        path.setAttribute('fill', getColor(count));

        // 添加鼠标悬停事件
        path.addEventListener('mouseenter', (e: MouseEvent) => {
          path.setAttribute('stroke', '#000'); // 鼠标悬停时添加边框
          path.setAttribute('stroke-width', '2');
          const tooltip = document.createElement('div');
          tooltip.id = 'svg-tooltip';
          tooltip.style.position = 'absolute';
          tooltip.style.background = 'rgba(0, 0, 0, 0.7)';
          tooltip.style.color = '#fff';
          tooltip.style.padding = '4px 8px';
          tooltip.style.borderRadius = '4px';
          tooltip.style.fontSize = '12px';
          tooltip.style.pointerEvents = 'none';
          tooltip.style.top = `${e.clientY + 10}px`; // 鼠标位置 + 偏移量
          tooltip.style.left = `${e.clientX + 10}px`;
          tooltip.innerText = `${prefecture}: ${count} 次活动`;
          document.body.appendChild(tooltip);
        });

        path.addEventListener('mouseleave', () => {
          path.removeAttribute('stroke');
          path.removeAttribute('stroke-width');
          const tooltip = document.getElementById('svg-tooltip');
          if (tooltip) {
            tooltip.remove();
          }
        });
      } else {
        console.warn(`SVG中找不到id或name为${prefecture}的元素`);
      }
    });

    // 清空容器并插入SVG
    svgContainerRef.current.innerHTML = '';
    svgContainerRef.current.appendChild(svgElement);
  }, [svgContent, heatmapData]);

  return (
    <div ref={svgContainerRef} style={{ width: '100%', height: 'auto', position: 'relative' }}>
      {!svgContent && <p>无法加载地图，请检查路径或文件。</p>}
    </div>
  );
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
  const [events] = useState<EventData[]>(initialData?.events || []);
  const [overlapEvents] = useState<EventData[]>(initialData?.overlapEvents || []);
  const [artists] = useState<ArtistData[]>(initialData?.artists || []);
  const [activities] = useState<ActivityData[]>(initialData?.activities || []);
  const [loading] = useState(false); // 初始数据已从 DOM 解析，不需要 loading
  const [selectedContent, setSelectedContent] = useState<string>('upcomingEvents');
  const [fetchedEvents, setFetchedEvents] = useState<EventData[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [userEvents, setUserEvents] = useState<EventData[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [japanGeoJson, setJapanGeoJson] = useState<any>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const userId = profile?.userId || ''; // 从 profile 获取用户 ID
        const username = profile?.username || ''; // 从 profile 获取用户名
        if (userId && username) {
          const events = await fetchAllUserEvents(username, userId);
          setFetchedEvents(events as any[]);
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
          //console.log('Fetched additional events:', events); // 在控制台输出解析结果
          setUserEvents(events as any[]);
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

  const venueRanking = useMemo<[string, number][]>(() => calculateVenueRanking(userEvents), [userEvents]);
  const heatmapData = useMemo<PrefectureCount>(() => generateHeatmapData(userEvents), [userEvents]);

  useEffect(() => { }, [heatmapData]);

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

  useEffect(() => { generateHeatmapData(userEvents); }, [userEvents]);

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
                    {selectedContent === 'venueRanking' && (
                      <div>
                        <h3 className="text-lg font-bold mt-6 mb-4">活动地图</h3>
                        <PrefectureMap heatmapData={heatmapData} />
                        <h3 className="text-lg font-bold mb-4">常去场馆</h3>
                        <ul className="list-disc pl-5">
                          {venueRanking.map(([venue, count], index) => (
                            <li key={index}>{venue}: {count} 次</li>
                          ))}
                        </ul>
                      </div>
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
                          { key: 'venueRanking', label: '场馆排行榜' },
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
