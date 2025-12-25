import { Breadcrumb, Card, ConfigProvider, Pagination, theme as antTheme } from "antd";
import EventSearchForm from "../components/event/EventSearchForm";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { StyleProvider } from "@ant-design/cssinjs";
import { useEffect, useState } from "react";
import { UserInfo } from "../utils/user/userInfo";
import { parseEventsData } from "../utils/events/parseEventsData";
import { EventCard } from "../components/event/EventCard";

type Data = ReturnType<typeof parseEventsData>

interface EventsSearchProps {
  currentUser: UserInfo | null;
  getPopupContainer?: () => HTMLElement | ShadowRoot;
  data: Data;
}

export const EventsSearchPage = ({ currentUser, getPopupContainer, data }: EventsSearchProps) => {
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

  // 解析搜索字段
  const searchFields = {
    keyword: urlParams.get('keyword') || undefined,
    year: urlParams.get('year') || undefined,
    month: urlParams.get('month') || undefined,
    day: urlParams.get('day') || undefined,
    area_id: urlParams.get('area_id') || undefined,
    prefecture_id: urlParams.get('prefecture_id') || undefined,
  };

  const onPageChange = (page: number, pageSize: number) => {
    urlParams.set('page', page.toString());
    urlParams.set('limit', pageSize.toString());
    window.location.href = `/events/search?${urlParams.toString()}`;
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
                  title: <a href={`/events`}>活动情报</a>,
                },
                {
                  title: '活动情报搜索结果',
                }
              ]}
              className='!mb-2'
            />
            <h3 className="mb-8">🔍 搜索到{data.total}个活动</h3>
            <EventSearchForm
              initialValues={searchFields}
              onSearch={values => {
                // 只提交搜索参数，不带page和limit
                const params = new URLSearchParams();
                if (values.keyword) params.set('keyword', values.keyword);
                if (values.year) params.set('year', values.year);
                if (values.month) params.set('month', values.month);
                if (values.day) params.set('day', values.day);
                if (values.area) params.set('area_id', values.area);
                if (values.prefecture) params.set('prefecture_id', values.prefecture);
                window.location.href = `/events/search?${params.toString()}`;
              }}
            />
            <div className="mb-4 w-full flex flex-row items-center justify-center">
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