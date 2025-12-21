import { Breadcrumb, Card, Statistic, ConfigProvider, Image, theme as antTheme, Tag, Button, Result, message } from "antd";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { StyleProvider } from "@ant-design/cssinjs";
import { useEffect, useState } from "react";
import { UserInfo } from "../utils/user/fetchAllUserEvents";
import { parseEventDetailData } from "../utils/events/parseEventDetailData";
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, LinkOutlined } from "@ant-design/icons";
import fallbackImage from "../utils/fallbackImage";

const { Timer } = Statistic;

interface EventDetailPageProps {
  initialData: ReturnType<typeof parseEventDetailData>;
  currentUser: UserInfo | null;
  getPopupContainer?: () => HTMLElement | ShadowRoot;
}

export const EventDetailPage = ({ initialData, currentUser, getPopupContainer }: EventDetailPageProps) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('enplus-theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  // 本地参加状态
  const [userStatus, setUserStatus] = useState(initialData.sidebar.user_status);
  const [noteLoading, setNoteLoading] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('enplus-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  const isDark = theme === 'dark';

  const AvatarList = ({ userList, emptyText }: { userList: any, emptyText: string }) => {
    if (userList.length === 0) {
      return <p>{emptyText}</p>
    }
    return <div className="grid grid-cols-5 gap-2">
      {userList.map((user: any) => (
        <a
          key={user.user_id}
          href={user.url || '#'}
          className={`flex flex-col items-center  text-center hover:opacity-80 transition`}
        >
          <Image
            src={user.icon || fallbackImage}
            fallback={fallbackImage}
            width={48}
            height={48}
            className="rounded-full"
            preview={false}
          />
          <span className={`mt-2 text-sm truncate w-16 ${isDark ? '!text-white' : '!text-slate-900'}`}>{user.name}</span>
        </a>
      ))}
    </div>
  }

  return <StyleProvider hashPriority="high">
    <ConfigProvider
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
      }}
      getPopupContainer={getPopupContainer}
    >
      <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
        <Header theme={theme} onToggleTheme={toggleTheme} user={currentUser} />
        <main className="flex-1">
          <ConfigProvider
            theme={{
              algorithm: antTheme.darkAlgorithm,
            }}
          >
            <div
              className={`w-full py-8 px-6 relative ${isDark ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-pink-500 to-pink-700'}`}
              style={{
                backgroundImage: initialData.info.image ? `linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${initialData.info.image})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {initialData.info.image && <div
                className="absolute inset-0"
                style={{
                  backdropFilter: 'blur(2px)',
                  WebkitBackdropFilter: 'blur(2px)',
                }}
              ></div>}
              <div className="relative max-w-7xl mx-auto">
                <Breadcrumb
                  items={[
                    {
                      title: <a href="/">首页</a>,
                    },
                    {
                      title: <a href="/events">活动和演唱会情报</a>,
                    },
                    {
                      title: initialData.title,
                    }
                  ]}
                  className='!mb-2'
                />
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {initialData.title}
                  </h1>
                  <div className="flex flex-row gap-5">
                    {
                      (() => {
                        if (!initialData.info.date) return null;
                        const [year, month, day] = initialData.info.date.slice(0, 10).split('-');
                        return <a className="!text-white hover:!text-gray-400" href={`/events/search?year=${year}&month=${Number(month)}&day=${Number(day)}`}>
                          <h3 className="flex flex-row items-center gap-2">
                            <CalendarOutlined /> {initialData.info.date}
                          </h3>
                        </a>
                      })()
                    }
                    {
                      initialData.info.location && <a className="!text-white hover:!text-gray-400" href={`/places/${initialData.info.location.id}`}>
                        <h3 className="flex flex-row items-center gap-2">
                          <EnvironmentOutlined />{initialData.info.location.name}
                        </h3>
                      </a>
                    }
                  </div>
                  {
                    (() => {
                      // 利用initialData.info.date和initialData.info.time.start(为空时默认00:00)构造一个位于UTC+9时区的Date对象
                      if (!initialData.info.date) return null;
                      const dateStr = initialData.info.date.slice(0, 10);
                      const timeStr = initialData.info.time?.start || '00:00';
                      const [year, month, day] = dateStr.split('-').map(Number);
                      const [hour, minute] = timeStr.split(':').map(Number);
                      const eventDate = new Date(Date.UTC(year, month - 1, day, hour - 9, minute));
                      // 判断是否早于当前时间
                      const now = new Date();
                      const isPast = eventDate.getTime() < now.getTime();
                      return <Timer
                        className="!mt-2"
                        type={isPast ? 'countup' : 'countdown'}
                        title={isPast ? '活动已结束，距离活动开始已过去' : '距离活动开始还剩'}
                        value={eventDate.getTime()}
                        format={isPast ? "DD 天" : "DD 天 HH 时 mm 分 ss 秒"}
                      />
                    })()
                  }
                </div>
              </div>
            </div>
          </ConfigProvider>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8">
              <div className="lg:col-span-8 space-y-6">
                <Card title="基本情报" hoverable>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 flex-col">
                      <h5 className="flex flex-row items-center gap-2 !mt-0"><ClockCircleOutlined /> 演出时间</h5>
                      <p className="font-bold">开场 {initialData.info.time?.open || '-'} / 开演 {initialData.info.time?.start || '-'} / 终演 {initialData.info.time?.end || '-'}</p>
                      <p>终演时间为预估时间，仅供参考。</p>
                      <h5 className="flex flex-row items-center gap-2"><LinkOutlined /> 相关链接</h5>
                      {
                        initialData.info.related_links && initialData.info.related_links.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {initialData.info.related_links.map((link, index) => (
                              <Tag
                                key={index}
                                color='magenta'
                                icon={<LinkOutlined />}
                                href={link}
                                target="_blank"
                                className="cursor-pointer hover:opacity-80 transition"
                                style={{ margin: 0, padding: '4px 10px', fontSize: 13 }}
                              >
                                {new URL(link).hostname}
                              </Tag>
                            ))}
                          </div>
                        ) : <p>无相关链接</p>
                      }
                    </div>
                    <div className="col-span-1">
                      <Image src={initialData.info.image} fallback={fallbackImage}></Image>
                    </div>
                  </div>
                </Card>
                <Card title="出演人员" hoverable>
                  {
                    initialData.info.performers && initialData.info.performers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {initialData.info.performers.map((performer) => (
                          <Tag
                            key={performer.id}
                            color='magenta'
                            icon={<LinkOutlined />}
                            href={performer.url}
                            className="cursor-pointer hover:opacity-80 transition"
                            style={{ margin: 0, padding: '4px 10px', fontSize: 13 }}
                          >
                            {performer.name}
                          </Tag>
                        ))}
                      </div>
                    ) : <p>出演人员未定</p>
                  }
                </Card>
                <Card title="活动说明" hoverable>
                  <p>{initialData.info.description?.split('\n').map((line, index) => (
                    <span key={index}>
                      {line}
                      <br />
                    </span>
                  ))}</p>
                </Card>
              </div>
              <div className="lg:col-span-4 space-y-6">
                <Card title="参加状态" hoverable>
                  <Result
                    status={userStatus.is_participating ? "success" : "info"}
                    title={userStatus.is_participating ? "您已参加此活动" : "您未参加此活动"}
                    extra={userStatus.is_participating ? [
                      <Button type="primary" href={`/notes/${initialData.sidebar.user_status.id}/edit`} >编辑笔记</Button>,
                      <Button danger loading={noteLoading} onClick={async () => {
                        setNoteLoading(true);
                        const handler = (event: MessageEvent) => {
                          if (event.data?.type === 'ENP_DELETE_NOTE_RESULT') {
                            window.removeEventListener('message', handler);
                            setNoteLoading(false);
                            if (event.data.success) {
                              setUserStatus(s => ({ ...s, is_participating: false }));
                              message.success('已取消参加，请等待页面重定向……');
                            } else {
                              message.error('操作失败');
                            }
                          }
                        };
                        window.addEventListener('message', handler);
                        window.postMessage({ type: 'ENP_DELETE_NOTE', noteId: initialData.sidebar.user_status.id }, '*');
                        setTimeout(() => {
                          window.removeEventListener('message', handler);
                          setNoteLoading(false);
                        }, 500);
                      }}>取消参加</Button>,
                    ] : [<Button type="primary" loading={noteLoading} onClick={async () => {
                      setNoteLoading(true);
                      const handler = (event: MessageEvent) => {
                        if (event.data?.type === 'ENP_ADD_NOTE_RESULT') {
                          window.removeEventListener('message', handler);
                          setNoteLoading(false);
                          if (event.data.success) {
                            setUserStatus(s => ({ ...s, is_participating: true }));
                            message.success('已参加活动，请等待页面重定向……');
                          } else {
                            message.error('操作失败');
                          }
                        }
                      };
                      window.addEventListener('message', handler);
                      window.postMessage({ type: 'ENP_ADD_NOTE', noteId: initialData.id }, '*');
                      setTimeout(() => {
                        window.removeEventListener('message', handler);
                        setNoteLoading(false);
                        // 刷新页面
                        window.location.reload();
                      }, 500);
                    }}>参加活动</Button>]}
                  />
                </Card>
                {initialData.sidebar.friends.exists && <Card title={`参加此活动的好友（${initialData.sidebar.friends.count}人）`} hoverable>
                  <AvatarList userList={initialData.sidebar.friends.list} emptyText="暂无好友参加此活动" />
                </Card>}
                <Card title={`参加此活动的人（${initialData.sidebar.participants.count}人）`} extra={<a href={initialData.sidebar.participants.see_all_url || "#"}>查看全部</a>} hoverable>
                  <AvatarList userList={initialData.sidebar.participants.preview_list} emptyText="暂无人参加此活动" />
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