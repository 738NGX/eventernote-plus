import { Breadcrumb, Card, ConfigProvider, Pagination, theme as antTheme } from "antd";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { StyleProvider } from "@ant-design/cssinjs";
import { useEffect, useState } from "react";
import { UserInfo } from "../utils/user/userInfo";
import { parseEventsData } from "../utils/events/parseEventsData";
import { EventCard } from "../components/event/EventCard";
import EventSearchForm from "../components/event/EventSearchForm";

type Data = ReturnType<typeof parseEventsData> & { id: string }

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


  const urlParams = new URLSearchParams(window.location.search);
  const currentPage = parseInt(urlParams.get('page') || '', 10) || 1;
  const limit = parseInt(urlParams.get('limit') || '', 10) || 30;

  const onPageChange = (page: number, pageSize: number) => {
    urlParams.set('page', page.toString());
    urlParams.set('limit', pageSize.toString());
    window.location.href = `/${type}/${data.id}/events?${urlParams.toString()}`;
  };

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
            <div className="mb-4 w-full flex flex-col items-center justify-center gap-4">
              <Pagination
                showQuickJumper
                current={currentPage}
                total={data.total}
                pageSize={limit}
                onChange={onPageChange}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.events.map(event => (
                <EventCard event={event} isDark={isDark} />
              ))}
            </div>
            <div className="mt-4 w-full flex flex-row items-center justify-center">
              <Pagination
                showQuickJumper
                current={currentPage}
                total={data.total}
                pageSize={limit}
                onChange={onPageChange}
              />
            </div>
          </div>
        </main>
        <Footer theme={theme} />
      </div>
    </ConfigProvider>
  </StyleProvider>
}