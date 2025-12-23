import { Breadcrumb, ConfigProvider, Table, theme as antTheme } from "antd";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { StyleProvider } from "@ant-design/cssinjs";
import { useEffect, useState } from "react";
import { UserInfo } from "../utils/user/fetchAllUserEvents";
import { parsePrefecturePageData } from "../utils/places/parsePrefecturePageData";

type Data = ReturnType<typeof parsePrefecturePageData>

interface PrefecturePageProps {
  currentUser: UserInfo | null;
  getPopupContainer?: () => HTMLElement | ShadowRoot;
  data: Data;
}

export const PrefecturePage = ({ currentUser, getPopupContainer, data }: PrefecturePageProps) => {
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
                  title: `${data.prefectureName}的会场一览`,
                }
              ]}
              className='!mb-2'
            />
            <h1>探索{data.prefectureName}的{data.places.length}个会场</h1>
            <Table
              columns={[
                {
                  title: '场馆名',
                  dataIndex: 'name',
                  key: 'name',
                  render: (text, record) => <a href={`/places/${record.id}`}>{text}</a>,
                },
              ]}
              dataSource={data.places}
              showHeader={false}
              pagination={false}
            />
          </div>
        </main>
        <Footer theme={theme} />
      </div>
    </ConfigProvider>
  </StyleProvider>
}