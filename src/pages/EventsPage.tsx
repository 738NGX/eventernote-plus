import { Avatar, Breadcrumb, Button, Card, ConfigProvider, Divider, Pagination, Tabs, theme as antTheme } from "antd";
import EventSearchForm from "../components/event/EventSearchForm";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { StyleProvider } from "@ant-design/cssinjs";
import { useEffect, useState } from "react";
import { UserInfo } from "../utils/user/userInfo";
import { parseEventsPage } from "../utils/events/parseEventsPage";
import { EventCard } from "../components/event/EventCard";
import { PlusOutlined } from "@ant-design/icons";

type Data = ReturnType<typeof parseEventsPage>

const { Meta } = Card;

interface EventsPageProps {
  currentUser: UserInfo | null;
  getPopupContainer?: () => HTMLElement | ShadowRoot;
  data: Data;
}

export const EventsPage = ({ currentUser, getPopupContainer, data }: EventsPageProps) => {
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
  const type = urlParams.get('type') || '1';

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
                  title: '活动情报',
                }
              ]}
              className='!mb-2'
            />
            <h3 className="mb-8">搜索活动情报</h3>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                <EventSearchForm
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
                <Tabs
                  defaultActiveKey="1"
                  type="card"
                  size="large"
                  items={[
                    { label: '今天举办的活动', key: '1' },
                    { label: '最近登记的活动', key: '2' },
                    { label: '收藏艺人的活动', key: '3' },
                  ]}
                  activeKey={type}
                  onChange={key => {
                    const params = new URLSearchParams(window.location.search);
                    params.set('type', key);
                    window.location.href = `/events?${params.toString()}`;
                  }}
                />
                <div className="!mt-0 space-y-4">
                  {data.events.map(event => (
                    <EventCard event={event} isDark={isDark} />
                  ))}
                </div>
              </div>
              <div className="lg:col-span-4 space-y-6">
                <h4>没有找到你想要的活动？</h4>
                <Button icon={<PlusOutlined />} size="large" className="!w-full" type="primary">登记新的活动情报</Button>
                <Divider />
                <div className="flex flex-row items-center justify-between">
                  <h4 className="!m-0">收到的活动感想投稿</h4>
                  <a href="/notes">阅读更多</a>
                </div>
                {
                  data.sideComments.map((comment, index) => (
                    <Card key={index} hoverable>
                      <Meta
                        avatar={<a href={comment.userLink}><Avatar src={comment.userIcon} /></a>}
                        title={<a href={comment.eventLink}>{comment.eventTitle}</a>}
                        description={comment.comment}
                      />
                      <a href={comment.readMoreLink}><p className="!w-full text-right !mb-0">阅读全文</p></a>
                    </Card>
                  ))
                }

              </div>
            </div>
          </div>
        </main>
        <Footer theme={theme} />
      </div>
    </ConfigProvider>
  </StyleProvider>
}