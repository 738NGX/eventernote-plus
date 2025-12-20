import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import { UserInfo } from './utils/user/fetchAllUserEvents';
import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider, theme as antTheme } from 'antd';


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

  return (
    <StyleProvider hashPriority="high">
      <ConfigProvider
        theme={{
          algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
          token: { colorPrimary: '#ff74b9' },
        }}
      >
        <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
          <Header theme={theme} onToggleTheme={toggleTheme} user={initialUser} getPopupContainer={getPopupContainer} />
          <Hero theme={theme} />
          <Features theme={theme} />
          <Footer theme={theme} />
        </div>
      </ConfigProvider>
    </StyleProvider>
  );
}
