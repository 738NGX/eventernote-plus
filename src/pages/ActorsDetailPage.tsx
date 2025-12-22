import { Breadcrumb, Button, Card, ConfigProvider, Image, theme as antTheme, Table, Avatar } from "antd";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { StyleProvider } from "@ant-design/cssinjs";
import { useEffect, useState } from "react";
import { UserInfo } from "../utils/user/fetchAllUserEvents";
import { parseActorsDetailData } from "../utils/actors/parseActorsDetailData";
import EventsList from "../components/user/EventsList";
import { CDN_BASE } from "../utils/config";
import fallbackImage from "../utils/fallbackImage";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";

type Data = ReturnType<typeof parseActorsDetailData> & { id: string }

interface ActorsDetailProps {
  currentUser: UserInfo | null;
  getPopupContainer?: () => HTMLElement | ShadowRoot;
  data: Data;
}

export const ActorsDetailPage = ({ currentUser, getPopupContainer, data }: ActorsDetailProps) => {
  // 更健壮地获取id，去除查询参数和hash
  let id = window.location.pathname.split('/').pop() || '';
  id = id.split('?')[0].split('#')[0];

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
                  title: <a href="/actors">艺人情报</a>,
                },
                {
                  title: data.name,
                }
              ]}
              className='!mb-2'
            />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <Card
                  cover={<Image className="!w-full !rounded-t-md" src={`${CDN_BASE}/actors/${id}.webp`} fallback={fallbackImage} />}
                  actions={[
                    <a className="!gap-2" href={`/events/add?actor_ids=${data.id}`}><PlusOutlined />新增活动</a>,
                    <a className="!gap-2" href={`/actors/${data.id}/edit`}><EditOutlined />编辑信息</a>
                  ]}
                >
                  <h1 className={`text-lg font-bold !mt-0`}>
                    {data.name}
                  </h1>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {data.kana}
                  </p>
                  <Button className="!w-full mt-2" type={data.isFavorite ? 'default' : 'primary'} danger={data.isFavorite}>
                    {data.isFavorite ? '取消收藏' : '收藏艺人'}
                  </Button>
                </Card>
                <Card title={`粉丝一览`} extra={<a href={`/actors/${data.id}/users`}>查看全部{data.fansTotal}人</a>}>
                  <div className="grid grid-cols-5 gap-2">
                    {data.fans.map((user) => (
                      <a
                        key={user.id}
                        href={user.profileUrl}
                        className={`flex flex-col items-center text-center hover:opacity-80 transition`}
                      >
                        <Image
                          src={user.avatarUrl}
                          fallback={fallbackImage}
                          width={36}
                          height={36}
                          className="rounded-full"
                          preview={false}
                        />
                      </a>
                    ))}
                  </div>
                </Card>
              </div>
              <div className="lg:col-span-6 space-y-6">
                <EventsList events={data.events} theme={theme} title="最近的活动" href={`/actors/${data.id}/events`} />
              </div>
              <div className="lg:col-span-3 space-y-6">
                <Card title="用户排行" className="overflow-x-auto !p-0">
                  <p>展示参加{data.name}活动的次数排行，数据每日更新。</p>
                  <Table
                    columns={[
                      {
                        title: '排行',
                        dataIndex: 'rank',
                        key: 'rank',
                        render: (text) => { return `${text}` },
                      },
                      {
                        title: '头像',
                        dataIndex: 'avatar',
                        key: 'avatar',
                        width: 56,
                        render: (_, record) => {
                          return (
                            <Avatar size={40} src={record.avatarUrl}>
                              {record.username?.[0]?.toUpperCase()}
                            </Avatar>
                          );
                        },
                      },
                      {
                        title: '用户名',
                        dataIndex: 'username',
                        key: 'username',
                        render: (text, record) => <a href={record.profileUrl}><span className="w-16 truncate">{text}</span></a>,
                      },
                      {
                        title: '回数',
                        dataIndex: 'count',
                        key: 'count',
                        render: (text) => { return `${text}回` },
                      },
                    ]}
                    dataSource={data.fansRanking}
                    rowKey={r => r.id}
                    pagination={false}
                    size="middle"
                    className="min-w-[220px] !rounded-none !border-0"
                    showHeader={false}
                  />
                </Card>
              </div>
            </div>
          </div>
        </main>
        <Footer theme={theme} />
      </div>
    </ConfigProvider>
  </StyleProvider>
}