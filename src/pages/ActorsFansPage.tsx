import { Avatar, Breadcrumb, Card, ConfigProvider, Pagination, Result, theme as antTheme } from "antd";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { StyleProvider } from "@ant-design/cssinjs";
import { useEffect, useState } from "react";
import { UserInfo } from "../utils/user/userInfo";
import { parseActorsFansData } from "../utils/actors/parseActorsFansData";

type Data = ReturnType<typeof parseActorsFansData> & { id: string }

interface ActorsFansProps {
  currentUser: UserInfo | null;
  getPopupContainer?: () => HTMLElement | ShadowRoot;
  data: Data;
}

export const ActorsFansPage = ({ currentUser, getPopupContainer, data }: ActorsFansProps) => {
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
  const limit = limitMatch ? parseInt(limitMatch[1], 10) : 30;

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
                  title: <a href={`/actors/${data.id}`}>{data.name}</a>,
                },
                {
                  title: '粉丝列表',
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
                  window.location.href = `/actors/${data.id}/users?page=${page}&limit=${pageSize || limit}`;
                }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {data.users.length === 0 ? (
                <Result status="info" title="暂无数据" />
              ) : (
                data.users.map(user => (
                  <Card
                    key={user.id}
                    hoverable
                  >
                    <Card.Meta
                      avatar={<Avatar shape="square" size={64} alt={user.username} src={user.avatarUrl}/>}
                      title={<a href={user.profileUrl}>{user.username}</a>}
                    />
                  </Card>
                ))
              )}
            </div>
            <div className="mt-4 w-full flex flex-row items-center justify-center">
              <Pagination
                showQuickJumper
                current={currentPage}
                total={data.total}
                pageSize={limit}
                onChange={(page, pageSize) => {
                  window.location.href = `/actors/${data.id}/users?page=${page}&limit=${pageSize || limit}`;
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