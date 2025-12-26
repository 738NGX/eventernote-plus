import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import { UserInfo } from './utils/user/userInfo';
import { StyleProvider } from '@ant-design/cssinjs';
import { Button, ConfigProvider, theme as antTheme } from 'antd';


interface AppProps {
  initialUser: UserInfo | null;
  getPopupContainer?: () => HTMLElement | ShadowRoot;
}

export default function App({ initialUser, getPopupContainer }: AppProps) {
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

  const [showOnboardBanner, setShowOnboardBanner] = useState(() => {
    const stored = localStorage.getItem('enplus-show-onboard-banner');
    return stored !== 'false';
  });

  // 只在initialUser存在并且当前时间为当年12月到次年1月期间显示年度报告横幅
  const thisYear = new Date().getFullYear();
  const [showAnnualReportBanner, setShowAnnualReportBanner] = useState(initialUser && (new Date().getMonth() === 11 || new Date().getMonth() === 0));
  const showYear = (new Date().getMonth() === 0 ? thisYear - 1 : thisYear);

  return (
    <StyleProvider hashPriority="high">
      <ConfigProvider
        theme={{
          algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        }}
      >
        <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
          <Header theme={theme} onToggleTheme={toggleTheme} user={initialUser} getPopupContainer={getPopupContainer} />
          <Hero theme={theme} />
          {showOnboardBanner && <div className='w-full bg-blue-400'>
            <div className='max-w-6xl mx-auto flex flex-row items-center justify-between py-2'>
              <p className='text-white text-lg'>第一次使用EventerNote Plus吗？</p>
              <div className='flex flex-row gap-4'>
                <Button
                  type="primary"
                  href={`/pages/company`}
                  style={{
                    background: '#fff',
                    color: '#60a5fa',
                  }}
                >
                  查看项目介绍
                </Button>
                <Button
                  type="default"
                  onClick={() => { localStorage.setItem('enplus-show-onboard-banner', 'false'); setShowOnboardBanner(false); }}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    borderColor: 'transparent',
                  }}
                >
                  以后不再显示
                </Button>
              </div>
            </div>
          </div>}
          {showAnnualReportBanner && <div className='w-full bg-red-400'>
            <div className='max-w-6xl mx-auto flex flex-row items-center justify-between py-2'>
              <p className='text-white text-lg'>{showYear}年个人年度报告已出炉，快来看看你一年的活动足迹</p>
              <div className='flex flex-row gap-4'>
                <Button
                  type="primary"
                  href={`/annual-report/${showYear}/${initialUser!.name}`}
                  target='_blank'
                  style={{
                    background: '#fff',
                    color: '#f87171',
                  }}
                >
                  查看报告
                </Button>
                <Button
                  type="default"
                  onClick={() => { setShowAnnualReportBanner(false) }}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    borderColor: 'transparent',
                  }}
                >
                  稍后再说
                </Button>
              </div>
            </div>
          </div>}
          <Features theme={theme} />
          <Footer theme={theme} />
        </div>
      </ConfigProvider>
    </StyleProvider>
  );
}
