import { Breadcrumb, Card, ConfigProvider, Pagination, theme as antTheme } from "antd";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { StyleProvider } from "@ant-design/cssinjs";
import { useEffect, useState } from "react";
import { UserInfo } from "../utils/user/fetchAllUserEvents";
import { parseActorsEventsData } from "../utils/actors/parseActorsEventsData";
import { EventCard } from "../components/user/EventCard";

type Data = ReturnType<typeof parseActorsEventsData> & { id: string }

interface LimitedEventsProps {
  type: 'actors' | 'places';
  currentUser: UserInfo | null;
  getPopupContainer?: () => HTMLElement | ShadowRoot;
  data: Data;
}

export const LimitedEventsPage = ({ type, currentUser, getPopupContainer, data }: LimitedEventsProps) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('enplus-theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('enplus-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  const isDark = theme === 'dark';

  const currentPageMatch = window.location.search.match(/[?&]page=(\d+)/);
  const currentPage = currentPageMatch ? parseInt(currentPageMatch[1], 10) : 1;
  const limitMatch = window.location.search.match(/[?&]limit=(\d+)/);
  const limit = limitMatch ? parseInt(limitMatch[1], 10) : 20;

  return <StyleProvider hashPriority="high">
    <ConfigProvider
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
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
                  title: <a href={`/${type}`}>{type === 'actors' ? '艺人情报' : '会场情报'}</a>,
                },
                {
                  title: <a href={`/${type}/${data.id}`}>{data.name}</a>,
                },
                {
                  title: '活动列表',
                }
              ]}
              className='!mb-2'
            />
            <div className="mb-4 w-full flex flex-row items-center justify-center">
              <Pagination
                showQuickJumper
                current={currentPage}
                total={data.total}
                pageSize={limit}
                onChange={(page, pageSize) => {
                  window.location.href = `/${type}/${data.id}/events?page=${page}&limit=${pageSize || limit}`;
                }}
              />
            </div>
            {data.events.length === 0 ? (
              <Card className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  暂无活动
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.events.map(event => (
                  <EventCard event={event} isDark={isDark} />
                ))}
              </div>
            )}
            <div className="mt-4 w-full flex flex-row items-center justify-center">
              <Pagination
                showQuickJumper
                current={currentPage}
                total={data.total}
                pageSize={limit}
                onChange={(page, pageSize) => {
                  window.location.href = `/${type}/${data.id}/events?page=${page}&limit=${pageSize || limit}`;
                }}
              />
            </div>
          </div>
        </main>
        <Footer theme={theme} />
      </div>
    </ConfigProvider>
  </StyleProvider>
}