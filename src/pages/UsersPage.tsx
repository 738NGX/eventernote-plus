import { Avatar, Breadcrumb, Button, Card, ConfigProvider, Image, MenuProps, Result, theme as antTheme } from "antd";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { StyleProvider } from "@ant-design/cssinjs";
import { useEffect, useState } from "react";
import { UserInfo } from "../utils/user/userInfo";
import { parseUsersList } from "../utils/user/parseUsersList";
import fallbackImage from "../utils/fallbackImage";

type Data = ReturnType<typeof parseUsersList>

interface UsersPageProps {
  type: 'following' | 'follower';
  currentUser: UserInfo | null;
  getPopupContainer?: () => HTMLElement | ShadowRoot;
  data: Data;
}

export const UsersPage = ({ type, currentUser, getPopupContainer, data }: UsersPageProps) => {
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
                  title: <a href={data.breadcrumb[1].href}>{data.breadcrumb[1].title}</a>,
                },
                {
                  title: `${type === 'following' ? '关注' : '粉丝' }列表`,
                }
              ]}
              className='!mb-2'
            />
            <h3>{`${data.breadcrumb[1].title}的${type === 'following' ? '关注' : '粉丝' }列表`}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {data.usersList.length === 0 ? (
                <Result status="info" title="暂无数据" />
              ) : (
                data.usersList.map(user => (
                  <Card
                    key={user.id}
                    hoverable
                  >
                    <Card.Meta
                      avatar={<Avatar shape="square" size={64} alt={user.name} src={user.avatar}/>}
                      title={<a href={user.profileUrl}>{user.name}</a>}
                      description={<span>UID: {user.id}</span>}
                    />
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
        <Footer theme={theme} />
      </div>
    </ConfigProvider>
  </StyleProvider>
}