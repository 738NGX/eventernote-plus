import { Breadcrumb, Card, ConfigProvider, Menu, MenuProps, theme as antTheme } from "antd";
import { Company } from "../components/about/company";
import { Privacy } from "../components/about/privacy";
import { TermsOfService } from "../components/about/termsofservice";
import { About } from "../components/about/about";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { StyleProvider } from "@ant-design/cssinjs";
import { useEffect, useState } from "react";
import { UserInfo } from "../utils/user/fetchAllUserEvents";

export const AboutPage = ({ type, currentUser }: { type: 'company' | 'privacy' | 'termsofservice', currentUser: UserInfo | null }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('enplus-theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [selectedContent, setSelectedContent] = useState<string>('EventerNotePlus');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('enplus-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  const isDark = theme === 'dark';

  const handleContentChange: MenuProps['onClick'] = (e) => {
    setSelectedContent(e.key);
  };

  let enContent;
  switch (type) {
    case 'company':
      enContent = <Company />;
      break;
    case 'privacy':
      enContent = <Privacy />;
      break;
    case 'termsofservice':
      enContent = <TermsOfService />;
      break;
    default:
      break;
  }
  return <StyleProvider hashPriority="high">
    <ConfigProvider
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: { colorPrimary: '#1677ff' },
      }}
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
                  title: type === 'company' ? '关于我们' : type === 'privacy' ? '隐私政策' : '利用条款',
                }
              ]}
              className='!mb-2'
            />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-10 space-y-6">
                {(type !== 'company' || selectedContent === 'EventerNote') && enContent}
                {type === 'company' && selectedContent === 'EventerNotePlus' && <About />}
              </div>
              <div className="lg:col-span-2 space-y-6">
                {type === 'company' && <Card
                  className={isDark ? 'bg-slate-800 border-slate-700' : ''}
                  styles={{ body: { padding: 6 } }}
                >
                  <Menu
                    onClick={handleContentChange}
                    selectedKeys={[selectedContent]}
                    items={[
                      { key: 'EventerNotePlus', label: '关于本项目' },
                      { key: 'EventerNote', label: 'EN运营者情报' },
                    ]}
                  />
                </Card>}
              </div>
            </div>
          </div>
        </main>
        <Footer theme={theme} />
      </div>
    </ConfigProvider>
  </StyleProvider>
}