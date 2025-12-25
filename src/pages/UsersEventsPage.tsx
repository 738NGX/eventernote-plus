import { useState, useEffect, useMemo } from 'react';
import { Breadcrumb, Button, Card, ConfigProvider, Form, FormProps, Pagination, Select, Skeleton, Switch, theme as antTheme } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import UserHeader from '../components/user/UserHeader';
import FavoriteArtists from '../components/user/FavoriteArtists';
import ActivityHeatmap from '../components/user/ActivityHeatmap';
import Header from '../components/Header';
import Footer from '../components/Footer';
import type { UserInfo } from '../utils/user/userInfo';
import { parseUsersEvents } from '../utils/user/parseUsersEvents';
import EventsList from '../components/event/EventsList';

type Data = ReturnType<typeof parseUsersEvents>;

interface UsersEventsPageProps {
  type: 'userEvents' | 'userEventsSame';
  currentUser: UserInfo | null;
  data: Data;
  getPopupContainer?: () => HTMLElement | ShadowRoot;
}

type DateFilterFieldType = {
  year?: string;
  month?: string;
  day?: string;
};

export default function UsersEventsPage({ type, currentUser, data, getPopupContainer }: UsersEventsPageProps) {
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

  const total = urlParams.get('year') || urlParams.get('month') || urlParams.get('day')
    ? parseInt(document.title.match(/\((\d+)\)/)?.[1] || '0', 10) || 0
    : data.total;

  const onPageChange = (page: number, pageSize: number) => {
    urlParams.set('page', page.toString());
    urlParams.set('limit', pageSize.toString());
    window.location.href = `/users/${encodeURIComponent(data.profile.username)}/events${type === 'userEvents' ? '' : '/same'}?${urlParams.toString()}`;
  };

  const onFilterDate: FormProps<DateFilterFieldType>['onFinish'] = (values) => {
    const { year, month, day } = values;
    const emptyParams = new URLSearchParams();
    emptyParams.set('year', year || '');
    emptyParams.set('month', month || '');
    emptyParams.set('day', day || '');
    window.location.href = `/users/${encodeURIComponent(data.profile.username)}/events?${emptyParams.toString()}`;
  };

  return (
    <StyleProvider hashPriority="high">
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
                    title: <a href={data.breadcrumb[1].href}>{data.breadcrumb[1].title}</a>,
                  },
                  {
                    title: `${type === 'userEvents' ? '活动' : '同场活动'}列表`,
                  }
                ]}
                className='!mb-2'
              />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 左侧边栏 */}
                <div className="lg:col-span-3 space-y-6">
                  <UserHeader profile={data.profile} theme={theme} isOwner={currentUser?.name === data.profile.username} />
                  <FavoriteArtists artists={data.artists} theme={theme} />
                  <ActivityHeatmap activities={data.activities} theme={theme} />
                </div>
                {/* 中间主内容 */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="mb-4 w-full flex flex-row items-center justify-center">
                    <Pagination
                      showQuickJumper
                      current={currentPage}
                      total={total}
                      pageSize={limit}
                      onChange={onPageChange}
                    />
                  </div>
                  <EventsList events={data.events} theme={theme} title={`${data.profile.username}的${type === 'userEvents' ? '全部' : '同场'}活动`} />
                  <div className="mt-4 w-full flex flex-row items-center justify-center">
                    <Pagination
                      showQuickJumper
                      current={currentPage}
                      total={total}
                      pageSize={limit}
                      onChange={onPageChange}
                    />
                  </div>
                </div>
                {/* 右侧边栏 */}
                <div className="lg:col-span-2 space-y-6">
                  {type === 'userEvents' && (
                    <Card title="筛选日期">
                      <Form
                        layout="vertical"
                        variant='filled'
                        onFinish={onFilterDate}
                        initialValues={{
                          year: urlParams.get('year') || undefined,
                          month: urlParams.get('month') || undefined,
                          day: urlParams.get('day') || undefined,
                        }}
                      >
                        {/* 年份选择 */}
                        <Form.Item<DateFilterFieldType> label="年份" name="year">
                          <Select
                            placeholder="请选择年份"
                            allowClear
                            options={(() => {
                              const now = new Date().getFullYear();
                              const start = 1980, end = now + 1;
                              return Array.from({ length: end - start + 1 }, (_, i) => {
                                const year = end - i;
                                return {
                                  label: `${year}年`,
                                  value: year.toString(),
                                };
                              });
                            })()}
                          />
                        </Form.Item>
                        {/* 月份选择 */}
                        <Form.Item<DateFilterFieldType> label="月份" name="month">
                          <Select
                            placeholder="请选择月份"
                            allowClear
                            options={(() => {
                              return Array.from({ length: 12 }, (_, i) => ({
                                label: `${i + 1}月`,
                                value: (i + 1).toString(),
                              }));
                            })()}
                          />
                        </Form.Item>
                        {/* 天数选择（仅在选中月份时显示） */}
                        <Form.Item<DateFilterFieldType> label="日期" name="day">
                          <Select
                            placeholder="请选择日期"
                            allowClear
                            options={(() => {
                              return Array.from({ length: 31 }, (_, i) => ({
                                label: `${i + 1}日`,
                                value: (i + 1).toString(),
                              }));
                            })()}
                          />
                        </Form.Item>
                        <Form.Item label={null}>
                          <Button type="primary" htmlType="submit">
                            应用筛选
                          </Button>
                        </Form.Item>
                      </Form>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </main>
          <Footer theme={theme} />
        </div>
      </ConfigProvider>
    </StyleProvider>
  );
}
