import { Breadcrumb, Card, ConfigProvider, theme as antTheme, Radio } from "antd";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { StyleProvider } from "@ant-design/cssinjs";
import { useEffect, useState } from "react";
import { UserInfo } from "../utils/user/userInfo";
import EventsList from "../components/user/EventsList";
import { AimOutlined, EditOutlined, EnvironmentOutlined, LinkOutlined, PhoneFilled, UserOutlined } from "@ant-design/icons";
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
  const [mapDataSource, setMapDataSource] = useState<string>('bing');

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
                  cover={
                    data.latitude && data.longitude ? (
                      <iframe
                        title="Google Map"
                        width="100%"
                        height="500"
                        style={{ border: 0, overflow: 'hidden' }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={
                          (() => {
                            const dataSource: Record<string, string> = {
                              'baidu': `https://api.map.baidu.com/marker?location=${data.latitude},${data.longitude}&output=html&coord_type=wgs84&zoom=15&src=webapp.data_display`,
                              'bing': `https://www.bing.com/maps/embed?h=500&w=515&cp=${data.latitude}~${data.longitude}&lvl=15`,
                              'yandex': `https://yandex.com/map-widget/v1/?ll=${data.longitude}%2C${data.latitude}&z=15&pt=${data.longitude}%2C${data.latitude}`,
                            }
                            return dataSource[mapDataSource];
                          })()
                        }
                      />
                    ) : null
                  }
                  actions={[
                    <a className="!gap-2" href={`/places/${data.id}/edit`}><EditOutlined />编辑信息</a>
                  ]}
                >
                  <h1 className={`text-lg font-bold !mt-0`}>
                    {data.name}
                  </h1>
                  {data.tel && <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} flex flex-row gap-2`}>
                    <PhoneFilled />{data.tel}
                  </p>}
                  {data.address && <a href={data.googleMapUrl || '#'} target="_blank" rel="noopener noreferrer">
                    <p className="flex flex-row gap-2"><EnvironmentOutlined />{data.address}</p>
                  </a>}
                  {data.website && <a href={data.website} target="_blank" rel="noopener noreferrer">
                    <p className="flex flex-row gap-2"><LinkOutlined />{data.website}</p>
                  </a>}
                  {
                    data.seatInfoUrl ? (
                      <a href={data.seatInfoUrl} target="_blank" rel="noopener noreferrer">
                        <p className="flex flex-row gap-2"><UserOutlined />{data.capacity || '官网坐席情报'}</p>
                      </a>
                    ) : data.capacity ? <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} flex flex-row gap-2`}>
                      <UserOutlined />{data.capacity}
                    </p> : null
                  }
                  {
                    data.latitude && data.longitude && (
                      <div className="flex flex-col gap-2">
                        <span className="flex flex-row gap-2"><AimOutlined />地图数据来源</span>
                        <Radio.Group
                          block
                          options={[
                            { label: '必应地图', value: 'bing' },
                            { label: '百度地图', value: 'baidu' },
                            { label: 'Yandex', value: 'yandex' },
                          ]}
                          onChange={e => setMapDataSource(e.target.value)}
                          value={mapDataSource}
                          optionType="button"
                          buttonStyle="solid"
                        />
                      </div>
                    )
                  }
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