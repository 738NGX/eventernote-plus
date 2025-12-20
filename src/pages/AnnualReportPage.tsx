
import { useEffect, useState, useMemo } from "react";
import { fetchAnnualReportData } from "../utils/user/fetchAnnualReport";
import ActivityHeatmap from "../components/user/ActivityHeatmap";
import ActivityHeatmapDetailed from "../components/user/ActivityHeatmapDetailed";
import { ActorWordCloud } from "../components/user/ActorWordCloud";
import { VenueCount } from "../components/user/VenueCount";
import { PrefectureMap, generatePrefectureMapData } from "../components/user/PrefectureMap";
import { Card, Skeleton, Statistic, Tag, Divider, Button } from "antd";
import { CrownOutlined, EnvironmentOutlined, UserOutlined, CalendarOutlined, TeamOutlined } from "@ant-design/icons";

import type { EventData } from "../utils/events/eventdata";
type FollowingEvent = { following: { id: string; name: string; profileUrl: string; avatar: string }; events: EventData[] };

function getFirstEvent(events: EventData[]): EventData | null {
  if (!events || events.length === 0) return null;
  return [...events].sort((a, b) => a.date.localeCompare(b.date))[0];
}
function getLastEvent(events: EventData[]): EventData | null {
  if (!events || events.length === 0) return null;
  return [...events].sort((a, b) => b.date.localeCompare(a.date))[0];
}
function getUniqueArtists(events: EventData[]): Set<string> {
  const set = new Set<string>();
  events?.forEach((e: EventData) => e.performers?.forEach((p: { id: string }) => set.add(p.id)));
  return set;
}
function getNewArtists(events: EventData[], prevEvents: EventData[]): Set<string> {
  const prevSet = new Set<string>();
  prevEvents?.forEach((e: EventData) => e.performers?.forEach((p: { id: string }) => prevSet.add(p.id)));
  const currSet = getUniqueArtists(events);
  return new Set([...currSet].filter(x => !prevSet.has(x)));
}
function getSeason(dateStr: string): '春' | '夏' | '秋' | '冬' {
  const m = parseInt(dateStr.slice(5, 7));
  if ([3,4,5].includes(m)) return '春';
  if ([6,7,8].includes(m)) return '夏';
  if ([9,10,11].includes(m)) return '秋';
  return '冬';
}
function getSeasonEvents(events: EventData[]): Record<'春'|'夏'|'秋'|'冬', EventData[]> {
  const map: Record<'春'|'夏'|'秋'|'冬', EventData[]> = { 春: [], 夏: [], 秋: [], 冬: [] };
  events?.forEach((e: EventData) => { map[getSeason(e.date)].push(e); });
  return map;
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

export const AnnualReportPage = ({ username, year }: { username: string, year: string }) => {
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

  // 数据分析

  // 只统计指定年份的活动
  const userEvents: EventData[] = data?.userEvents || [];
  const followingsEvents: FollowingEvent[] = data?.followingsEvents || [];
  const thisYearEvents: EventData[] = userEvents.filter(e => e.date.startsWith(year));
  const prevEvents: EventData[] = userEvents.filter(e => !e.date.startsWith(year));

  const firstEvent = getFirstEvent(userEvents); // 用户历史最早活动
  const firstEventOfYear = getFirstEvent(thisYearEvents); // 本年第一场
  const lastEventOfYear = getLastEvent(thisYearEvents);
  const uniqueArtists = getUniqueArtists(thisYearEvents);
  const newArtists = getNewArtists(thisYearEvents, prevEvents);
  const seasonEvents = getSeasonEvents(thisYearEvents);
  const mostActiveDay = getMostActiveDay(thisYearEvents);
  const mostPeopleEvent = getMost(thisYearEvents, 'participantCount');
  const leastPeopleEvent = getLeast(thisYearEvents, 'participantCount');
  const withFollowingsEvent = getWithFollowings(thisYearEvents, followingsEvents);
  const prefectureMapData = useMemo(() => generatePrefectureMapData(thisYearEvents), [thisYearEvents]);

  // 年度艺人/场馆
  const artistCount: { [key: string]: number } = {};
  thisYearEvents.forEach(e => e.performers.forEach(p => { artistCount[p.name] = (artistCount[p.name] || 0) + 1; }));
  const topArtists: [string, number][] = Object.entries(artistCount).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 3);
  const venueCount: { [key: string]: number } = {};
  thisYearEvents.forEach(e => { const v = e.venue?.name; if (v) venueCount[v] = (venueCount[v] || 0) + 1; });
  const topVenues: [string, number][] = Object.entries(venueCount).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 3);

  // 年度活动关键词（艺人名/场馆名/地名/活动名）
  const keywords = [...topArtists.map(a => a[0]), ...topVenues.map(v => v[0])];

  // 季节代表活动
  const seasonRep = Object.fromEntries(Object.entries(seasonEvents).map(([k, v]) => [k, getFirstEvent(v)]));

  // 月度活动统计
  const monthStat = Array(12).fill(0);
  thisYearEvents.forEach(e => { const m = parseInt(e.date.slice(5, 7)); if (m) monthStat[m - 1] += 1; });

  // 年度之最活动（让用户自选，暂用最多人活动/最活跃日/第一场等）

  return (
    <div className="max-w-3xl mx-auto py-8 px-2 md:px-0">
      <Card className="mb-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-2">{year} 年度活动报告</h1>
        <div className="text-gray-500 mb-2">@{username}，感谢你在 EventerNote 记录下的每一份热爱。</div>
        {isFetching || !data ? <Skeleton active paragraph={{ rows: 8 }} /> : <>
          <div className="mb-4">
            <Statistic title="今年参加活动总数" value={thisYearEvents.length} prefix={<CalendarOutlined />} />
            <Statistic title="参与艺人总数" value={uniqueArtists.size} prefix={<UserOutlined />} />
            <Statistic title="新接触艺人数" value={newArtists.size} prefix={<CrownOutlined />} />
          </div>
          <Divider>年度回顾</Divider>
          <div className="mb-4">
            {firstEvent && (
              <div className="mb-2">你的首次活动是 <Tag color="blue">{firstEvent.title}</Tag>，举办于 <b>{firstEvent.date}</b>，距今已有 <b>{Math.floor((new Date().getTime() - new Date(firstEvent.date).getTime()) / (1000*60*60*24))}</b> 天。</div>
            )}
            {firstEventOfYear && (
              <div className="mb-2">今年的第一场活动是 <Tag color="green">{firstEventOfYear.title}</Tag>，举办于 <b>{firstEventOfYear.date}</b>。</div>
            )}
            <div className="mb-2">今年你共参加了 <b>{thisYearEvents.length}</b> 场活动，见证了 <b>{uniqueArtists.size}</b> 位艺人的现场。</div>
            <div className="mb-2">其中 <b>{newArtists.size}</b> 位是你今年首次接触的全新艺人。</div>
          </div>
          <Divider>年度关键词</Divider>
          <div className="mb-4">
            <ActorWordCloud data={keywords.map((k, i) => ({ id: k, text: k, value: 10 - i }))} dark={theme === 'dark'} />
          </div>
          <Divider>春夏秋冬 · 代表活动</Divider>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {Object.entries(seasonRep).map(([season, event]) => event && (
              <Card key={season} title={season + '季代表'}>
                <div><b>{event.title}</b></div>
                <div>{event.date} @ {event.venue?.name}</div>
              </Card>
            ))}
          </div>
          <Divider>月度活动热力图</Divider>
          <div className="mb-4">
            <ActivityHeatmap activities={[
              { year: parseInt(year), months: monthStat, total: thisYearEvents.length }
            ]} theme={theme} />
          </div>
          <Divider>都道府县分布</Divider>
          <div className="mb-4">
            <PrefectureMap data={prefectureMapData} />
          </div>
          <Divider>特别的活动</Divider>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card title="今年的第一场活动" size="small">{getFirstEvent(userEvents)?.title} <br /> {getFirstEvent(userEvents)?.date}</Card>
            <Card title="活动最多的一天" size="small">{mostActiveDay.date} <br /> 共 {mostActiveDay.count} 场</Card>
            <Card title="最多人参加的活动" size="small">{mostPeopleEvent?.title} <br /> {mostPeopleEvent?.participantCount} 人</Card>
            <Card title="最少人参加的活动" size="small">{leastPeopleEvent?.title} <br /> {leastPeopleEvent?.participantCount} 人</Card>
            <Card title="和关注者一起参与最多的活动" size="small">{withFollowingsEvent?.title} <br /> {withFollowingsEvent?.date}</Card>
          </div>
          <Divider>年度之最</Divider>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card title="年度艺人" size="small">{topArtists[0]?.[0]} <br /> 共 {topArtists[0]?.[1]} 场</Card>
            <Card title="年度场馆" size="small">{topVenues[0]?.[0]} <br /> 共 {topVenues[0]?.[1]} 场</Card>
            <Card title="年度活动（自动推荐）" size="small">{mostPeopleEvent?.title} <br /> {mostPeopleEvent?.date}</Card>
          </div>
          <Divider>详细数据</Divider>
          <VenueCount venueRanking={Object.entries(venueCount)} userEvents={thisYearEvents} />
        </>}
      </Card>
    </div>
  );
}