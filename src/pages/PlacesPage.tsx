import { Breadcrumb, Button, Card, ConfigProvider, Menu, MenuProps, Result, Select, theme as antTheme } from "antd";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { StyleProvider } from "@ant-design/cssinjs";
import { useEffect, useState } from "react";
import { UserInfo } from "../utils/user/fetchAllUserEvents";
import PrefectureSelectMap from "../components/places/PrefectureSelectMap";
import PlacesInfoCard from "../components/places/PlacesInfoCard";
import { prefectureList } from "../utils/prefecture";

interface PlacesPageProps {
  currentUser: UserInfo | null;
  getPopupContainer?: () => HTMLElement | ShadowRoot;
}

export const PlacesPage = ({ currentUser, getPopupContainer }: PlacesPageProps) => {
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
  const [selectedPref, setSelectedPref] = useState<string>('東京都');

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
                  title: '场馆情报',
                }
              ]}
              className='!mb-2'
            />
            <div className="flex gap-8">
              {/* 左侧地图 */}
              <div className="w-2/3">
                <PrefectureSelectMap
                  isDark={isDark}
                  selectedPref={selectedPref}
                  onSelect={setSelectedPref}
                />
              </div>
              {/* 右侧卡片 */}
              <div className="flex-1 flex flex-col gap-4">
                <Select
                  showSearch={{ optionFilterProp: 'label' }}
                  placeholder="搜索或者选择一个地区"
                  value={selectedPref}
                  onChange={setSelectedPref}
                  options={prefectureList.map(name => ({ label: name, value: name }))}
                  style={{ width: '100%' }}
                />
                <PlacesInfoCard selectedPref={selectedPref} />
              </div>
            </div>
          </div>
        </main>
        <Footer theme={theme} />
      </div>
    </ConfigProvider>
  </StyleProvider>
}