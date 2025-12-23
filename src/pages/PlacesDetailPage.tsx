import { Breadcrumb, Button, Card, ConfigProvider, Image, theme as antTheme, Table, Avatar, message, Modal } from "antd";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { StyleProvider } from "@ant-design/cssinjs";
import { useEffect, useState } from "react";
import { UserInfo } from "../utils/user/fetchAllUserEvents";
import EventsList from "../components/user/EventsList";
import fallbackImage from "../utils/fallbackImage";
import { EditOutlined } from "@ant-design/icons";
import { parsePlacesDetailData } from "../utils/places/parsePlacesDetailData";

type Data = ReturnType<typeof parsePlacesDetailData>

interface PlacesDetailProps {
  currentUser: UserInfo | null;
  getPopupContainer?: () => HTMLElement | ShadowRoot;
  data: Data;
}

export const PlacesDetailPage = ({ currentUser, getPopupContainer, data }: PlacesDetailProps) => {
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
                  title: <a href="/places">会场情报</a>,
                },
                {
                  title: data.name,
                }
              ]}
              className='!mb-2'
            />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 space-y-6">
                <Card
                  cover={null}
                  actions={[
                    <a className="!gap-2" href={`/places/${data.id}/edit`}><EditOutlined />编辑信息</a>
                  ]}
                >
                  <h1 className={`text-lg font-bold !mt-0`}>
                    {data.name}
                  </h1>
                  {data.address && <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {data.address}
                  </p>}
                  {data.tel && <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {data.tel}
                  </p>}
                  {data.website && <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {data.website}
                  </p>}
                  {data.capacity && <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {data.capacity}
                  </p>}
                  {data.seatInfoUrl && <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {data.seatInfoUrl}
                  </p>}
                </Card>
                <Card title="会场tips">
                  <p>{data.tips?.split('\n').map((line, index) => (
                    <span key={index}>
                      {line}
                      <br />
                    </span>
                  ))}</p>
                </Card>
              </div>
              <div className="lg:col-span-6 space-y-6">
                <EventsList events={data.events} theme={theme} title="最近的活动" href={`/places/${data.id}/events`} />
              </div>
            </div>
          </div>
        </main>
        <Footer theme={theme} />
      </div>
    </ConfigProvider>
  </StyleProvider>
}