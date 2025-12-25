import { Breadcrumb, Button, ConfigProvider, Select, theme as antTheme } from "antd";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { StyleProvider } from "@ant-design/cssinjs";
import { useEffect, useState } from "react";
import { UserInfo } from "../utils/user/userInfo";
import PrefectureSelectMap from "../components/places/PrefectureSelectMap";
import PlacesInfoCard from "../components/places/PlacesInfoCard";
import { prefectureList } from "../utils/prefecture";
import { Input } from 'antd';
import { PlusOutlined } from "@ant-design/icons";

const { Search } = Input;

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
  const [selectedPref, setSelectedPref] = useState<string>('东京都');

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
                <h3>搜索会场情报</h3>
                <Search
                  placeholder="搜索场馆/地区..."
                  allowClear
                  enterButton="搜索"
                  size="large"
                  onSearch={kw => {
                    if (kw && kw.trim()) {
                      window.location.href = `/places/search?keyword=${encodeURIComponent(kw.trim())}`;
                    }
                  }}
                />
                <h4>选择或点击左侧地图来探索各个都道府县的会场！</h4>
                <Select
                  showSearch
                  placeholder="选择一个地区"
                  value={selectedPref}
                  onChange={setSelectedPref}
                  options={prefectureList.map(name => ({ label: name, value: name }))}
                  style={{ width: '100%' }}
                  filterOption={(input, option) =>
                    (option?.label as string).toLowerCase().includes(input.toLowerCase())
                  }
                  onInputKeyDown={e => {
                    if (e.key === 'Enter') {
                      const kw = (e.target as HTMLInputElement).value;
                      if (kw && kw.trim()) {
                        window.location.href = `/places/search?keyword=${encodeURIComponent(kw.trim())}`;
                      }
                    }
                  }}
                  allowClear
                />
                <PlacesInfoCard selectedPref={selectedPref} />
                <h4>没有找到你想要的会场？</h4>
                <Button icon={<PlusOutlined />} size="large" className="!w-full" type="primary" href={`/places/add`}>登记新的会场情报</Button>
              </div>
            </div>
          </div>
        </main>
        <Footer theme={theme} />
      </div>
    </ConfigProvider>
  </StyleProvider>
}