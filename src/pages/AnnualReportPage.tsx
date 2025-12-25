
import { useEffect, useState, useMemo } from "react";
import { fetchAnnualReportData } from "../utils/user/fetchAnnualReport";
import ActivityHeatmapDetailed from "../components/user/ActivityHeatmapDetailed";
import { PrefectureMap, generatePrefectureMapData } from "../components/user/PrefectureMap";
import { Card, Skeleton,  Divider, theme as antTheme, ConfigProvider, Avatar, Table } from "antd";
import type { EventData } from "../utils/events/eventdata";
import { EventCard } from "../components/event/EventCard";
import { StyleProvider } from "@ant-design/cssinjs";
import { calculateActivityHeatmapDetailedData } from "../utils/events/calculateActivityHeatmapDetailedData";

type FollowingEvent = { following: { id: string; name: string; profileUrl: string; avatar: string }; events: EventData[] };

function getFirstEvent(events: EventData[]): EventData | null {
  if (!events || events.length === 0) return null;
  return [...events].sort((a, b) => a.date.localeCompare(b.date))[0];
}

function getUniqueArtists(events: EventData[]) {
  const map = new Map<string, { id: string, name: string }>();
  events?.forEach((e: EventData) =>
    e.performers?.forEach((p) => map.set(p.id, p))
  );
  return map;
}

function getNewArtists(events: EventData[], prevEvents: EventData[]) {
  const prevIds = new Set<string>();
  prevEvents?.forEach((e: EventData) =>
    e.performers?.forEach((p) => prevIds.add(p.id))
  );
  const currMap = getUniqueArtists(events);
  // 只保留今年第一次见到的艺人
  return new Map(
    [...currMap.entries()].filter(([id]) => !prevIds.has(id))
  );
}

function getMost<T extends object, K extends keyof T>(events: T[], key: K): T | null {
  if (!events || events.length === 0) return null;
  return events.reduce((a, b) => (a[key] > b[key] ? a : b));
}
function getLeast<T extends object, K extends keyof T>(events: T[], key: K): T | null {
  if (!events || events.length === 0) return null;
  return events.reduce((a, b) => (a[key] < b[key] ? a : b));
}
function getMostActiveDay(events: EventData[]): { date: string; count: number } {
  const map: Record<string, number> = {};
  events.forEach((e: EventData) => { map[e.date] = (map[e.date] || 0) + 1; });
  let max = 0, maxDay = '';
  Object.entries(map).forEach(([d, c]) => { if (c > max) { max = c; maxDay = d; } });
  return { date: maxDay, count: max };
}
function getWithFollowings(events: EventData[], followingsEvents: FollowingEvent[]): EventData | undefined {
  // 统计与关注者同场最多的活动
  const userEventIds = new Set(events.map(e => e.id));
  const overlapCount: Record<string, number> = {};
  followingsEvents?.forEach((f: FollowingEvent) => {
    f.events?.forEach((e: EventData) => {
      if (userEventIds.has(e.id)) {
        overlapCount[e.id] = (overlapCount[e.id] || 0) + 1;
      }
    });
  });
  let max = 0, maxId: string | null = null;
  Object.entries(overlapCount).forEach(([id, c]) => { if (c > max) { max = c; maxId = id; } });
  return events.find(e => e.id === maxId);
}

export const AnnualReportPage = ({ username, year, getPopupContainer }: { username: string, year: string, getPopupContainer: any }) => {
  const [dataPromise] = useState(async () => {
    return await fetchAnnualReportData(username, year);
  });
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchAnnualReportData>> | null>(null);
  const [theme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const getData = async () => {
      if (!dataPromise) return;
      setIsFetching(true);
      try {
        const data = await dataPromise;
        setData(data);
      } catch (error) {
        console.error('Error fetching all user events:', error);
      } finally {
        setIsFetching(false);
      }
    };
    getData();
  }, [dataPromise]);

  // 只统计指定年份的活动
  const userEvents: EventData[] = data?.userEvents || [];
  const followingsEvents: FollowingEvent[] = data?.followingsEvents || [];
  const thisYearEvents: EventData[] = userEvents.filter(e => e.date.startsWith(year));
  const prevEvents: EventData[] = userEvents.filter(e => !e.date.startsWith(year));

  const firstEvent = getFirstEvent(userEvents); // 用户历史最早活动
  const firstEventOfYear = getFirstEvent(thisYearEvents); // 本年第一场
  const uniqueArtists = getUniqueArtists(thisYearEvents);
  const newArtists = getNewArtists(thisYearEvents, prevEvents);
  const mostActiveDay = getMostActiveDay(thisYearEvents);
  const mostPeopleEvent = getMost(thisYearEvents, 'participantCount');
  const leastPeopleEvent = getLeast(thisYearEvents, 'participantCount');
  const withFollowingsEvent = getWithFollowings(thisYearEvents, followingsEvents);
  const prefectureMapData = useMemo(() => generatePrefectureMapData(thisYearEvents), [thisYearEvents]);

  // 年度艺人/场馆
  const artistCount: { [key: string]: number } = {};
  thisYearEvents.forEach(e => e.performers.forEach(p => { artistCount[p.name] = (artistCount[p.name] || 0) + 1; }));
  const topArtists: [string, number][] = Object.entries(artistCount).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 10);
  const venueCount: { [key: string]: number } = {};
  thisYearEvents.forEach(e => { const v = e.venue?.name; if (v) venueCount[v] = (venueCount[v] || 0) + 1; });
  const topVenues: [string, number][] = Object.entries(venueCount).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 10);

  // 月度活动统计
  const activityHeatmapDetailedData = useMemo<Record<string, Record<string, number>>>(() => calculateActivityHeatmapDetailedData(thisYearEvents), [thisYearEvents]);

  // 年度之最活动（让用户自选，暂用最多人活动/最活跃日/第一场等）

  return <StyleProvider hashPriority="high">
    <ConfigProvider
      theme={{
        algorithm: antTheme.defaultAlgorithm,
      }}
      getPopupContainer={getPopupContainer}
    >
      <div className="max-w-4xl mx-auto py-8 px-2 md:px-0">
        <Card className="mb-6 shadow-lg">
          <h1 className="text-2xl font-bold mb-2">@{username} 的 {year} 年度活动报告</h1>
          <div className="text-gray-500 mb-2">感谢你记录下的每一份热爱。</div>
          {isFetching || !data ? <Skeleton active paragraph={{ rows: 8 }} /> : <>
            <Divider>初见</Divider>
            {firstEvent && (
              <div className="mb-4 flex flex-col gap-4">
                <p className="text-lg">还记得吗？你参加的第一次活动是</p>
                <EventCard event={firstEvent} isDark={false} />
                <p className="text-lg">距今已有<b>{Math.floor((new Date().getTime() - new Date(firstEvent.date).getTime()) / (1000 * 60 * 60 * 24))}</b> 天了，还记得第一次给你带来的悸动吗？</p>
              </div>
            )}
            <Divider>回顾</Divider>
            <p className="text-lg mb-4">今年你共参加了 <b>{thisYearEvents.length}</b> 场活动，见证了 <b>{uniqueArtists.size}</b> 位艺人的现场演出。</p>
            <p className="text-lg mb-4">其中 <b>{newArtists.values().next().value?.name}</b> 等 <b>{newArtists.size}</b> 位是你今年第一次见面的艺人。</p>
            {firstEventOfYear && (
              <div className="mb-4 flex flex-col gap-4">
                <p className="text-lg">你今年参加的第一场活动是</p>
                <EventCard event={firstEventOfYear} isDark={false} />
                <p className="text-lg">你一定很爱 <b>{firstEventOfYear.performers[0].name}</b>，才会选择第一场就看TA的活动。</p>
              </div>
            )}
            <Divider>今年的活动日历</Divider>
            <div className="w-full flex items-center justify-center">
              {Object.entries(activityHeatmapDetailedData).sort((a, b) => b[0].localeCompare(a[0])).map(([year, data]) => (
                <ActivityHeatmapDetailed key={year} username={username} year={parseInt(year)} data={data} theme={theme} />
              ))}
            </div>
            <Divider>今年的活动地图</Divider>
            <PrefectureMap data={prefectureMapData} />
            <Divider>特别的回忆</Divider>
            <div className="mb-4 flex flex-col gap-4">
              <p className="text-lg">{mostActiveDay.date}是今年中你最忙碌的一天，这一天你参加了 <b>{mostActiveDay.count}</b> 场活动</p>
              {
                thisYearEvents.filter(e => e.date === mostActiveDay.date).map(e => (
                  <EventCard key={e.id} event={e} isDark={false} />
                ))
              }
              <p className="text-lg">今年你参加了热门活动</p>
              <EventCard event={mostPeopleEvent!} isDark={false} />
              <p className="text-lg">和 <b>{mostPeopleEvent?.participantCount}</b> 人一起灵魂共振</p>
              <p className="text-lg">你也参加了</p>
              <EventCard event={leastPeopleEvent!} isDark={false} />
              <p className="text-lg">这是属于你和另外 <b>{leastPeopleEvent?.participantCount}</b> 人的小众宝藏</p>
              <p className="text-lg">这次的活动一定给你留下了宝贵回忆</p>
              <EventCard event={withFollowingsEvent!} isDark={false} />
              <p className="text-lg">因为你和他们一起参与了这次活动</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {
                  followingsEvents.filter(f => f.events.some(e => e.id === withFollowingsEvent?.id)).map(f => (
                    <Card
                      key={f.following.id}
                      hoverable
                    >
                      <Card.Meta
                        avatar={<Avatar shape="square" size={64} alt={f.following.name} src={f.following.avatar} />}
                        title={<a href={f.following.profileUrl}>{f.following.name}</a>}
                        description={<span>UID: {f.following.id}</span>}
                      />
                    </Card>
                  ))
                }
              </div>
            </div>
            <Divider>你的年度之最</Divider>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card title="年度艺人" size="small">
                <p className="text-lg font-bold">{topArtists[0]?.[0]} <br /> 见面 {topArtists[0]?.[1]} 次</p>
                <Table
                  size="small"
                  pagination={false}
                  columns={[
                    { title: '排行', dataIndex: 'rank', key: 'rank', render: (_: any, __: any, index: number) => `${index + 1}#` },
                    { title: '艺人', dataIndex: 'name', key: 'name' },
                    { title: '场次', dataIndex: 'count', key: 'count', render: (count: number) => `${count} 回` },
                  ]}
                  dataSource={topArtists.map(([name, count], index) => ({ key: index, name, count }))}
                  showHeader={false}
                />
              </Card>
              <Card title="年度场馆" size="small">
                <p className="text-lg font-bold">{topVenues[0]?.[0]} <br /> 造访 {topVenues[0]?.[1]} 次</p>
                <Table
                  size="small"
                  pagination={false}
                  columns={[
                    { title: '排行', dataIndex: 'rank', key: 'rank', render: (_: any, __: any, index: number) => `${index + 1}#` },
                    { title: '场馆', dataIndex: 'name', key: 'name' },
                    { title: '场次', dataIndex: 'count', key: 'count', render: (count: number) => `${count} 回` },
                  ]}
                  dataSource={topVenues.map(([name, count], index) => ({ key: index, name, count }))}
                  showHeader={false}
                />
              </Card>
            </div>
          </>}
        </Card>
      </div>
    </ConfigProvider>
  </StyleProvider>;
}