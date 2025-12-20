import { Breadcrumb, Button, Card, ConfigProvider, Menu, MenuProps, Result, theme as antTheme } from "antd";
import { Company } from "../components/about/company";
import { Privacy } from "../components/about/privacy";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { StyleProvider } from "@ant-design/cssinjs";
import { useEffect, useState } from "react";
import { UserInfo } from "../utils/user/fetchAllUserEvents";
import { parseNoteDeleteData } from "../utils/notes/parseNoteDeleteData";

type Data = ReturnType<typeof parseNoteDeleteData>

interface NotePageProps {
  type: 'delete' | 'edit';
  currentUser: UserInfo | null;
  getPopupContainer?: () => HTMLElement | ShadowRoot;
  data: Data;
}

export const NotePage = ({ type, currentUser, getPopupContainer, data }: NotePageProps) => {
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

  let enContent;
  switch (type) {
    case 'delete':
      enContent = <Result
        status={data.success ? "success" : "error"}
        title={data.success ? "取消参加活动成功" : "取消参加活动失败"}
        extra={data.success ? [
          <Button type="primary" href={data.url} >返回活动页</Button>,
        ] : []}
      />
      break;
    case 'edit':
      enContent = null;
      break;
    default:
      break;
  }
  return <StyleProvider hashPriority="high">
    <ConfigProvider
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: { colorPrimary: '#ff74b9' },
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
                  title: type === 'delete' ? '删除笔记' : '编辑笔记',
                }
              ]}
              className='!mb-2'
            />
            {enContent}
          </div>
        </main>
        <Footer theme={theme} />
      </div>
    </ConfigProvider>
  </StyleProvider>
}