import { useState, useRef, useEffect, useCallback } from 'react';
import { AutoComplete, Input, Button, Avatar, ConfigProvider, theme as antTheme } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import { UserOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';
import type { UserInfo } from '../utils/user';


interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  user: UserInfo | null;
  getPopupContainer?: () => HTMLElement | ShadowRoot;
}

export default function Header({ theme, onToggleTheme, user, getPopupContainer }: HeaderProps) {
  const [keyword, setKeyword] = useState('');
  const [options, setOptions] = useState<any[]>([]);
  const controllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number>(0);

  const fetchSuggestions = useCallback(async (kw: string) => {
    if (!kw.trim()) {
      setOptions([]);
      return;
    }

    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();

    try {
      const resp = await fetch(
        `https://www.eventernote.com/api/vertical/search?keyword=${encodeURIComponent(kw)}`,
        { signal: controllerRef.current.signal }
      );
      const data = await resp.json();
      
      if (data.code === 200 && data.results?.[0]) {
        const result = data.results[0];
        const newOptions: any[] = [];

        if (result.actors?.length) {
          newOptions.push({
            label: '声优/艺术家',
            options: result.actors.slice(0, 5).map((a: any) => ({
              value: a.name,
              label: a.name,
              url: `/actors/${encodeURIComponent(a.name)}/${a.id}`,
            })),
          });
        }

        if (result.events?.length) {
          newOptions.push({
            label: '活动',
            options: result.events.slice(0, 5).map((e: any) => ({
              value: e.event_name,
              label: `${e.event_date ? `[${e.event_date}] ` : ''}${e.event_name}`,
              url: `/events/${e.id}`,
            })),
          });
        }

        if (result.places?.length) {
          newOptions.push({
            label: '会场',
            options: result.places.slice(0, 3).map((p: any) => ({
              value: p.place_name,
              label: p.place_name,
              url: `/places/${p.id}`,
            })),
          });
        }

        setOptions(newOptions);
      } else {
        setOptions([]);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') console.error(err);
    }
  }, []);

  const onSearch = (value: string) => {
    setKeyword(value);
    clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => fetchSuggestions(value), 150);
  };

  const onSelect = (_: string, opt: any) => {
    if (opt.url) window.location.href = opt.url;
  };

  const doSearch = () => {
    if (keyword.trim()) {
      window.location.href = `/events/search?keyword=${encodeURIComponent(keyword.trim())}`;
    }
  };

  useEffect(() => () => {
    clearTimeout(timerRef.current);
    controllerRef.current?.abort();
  }, []);

  const isDark = theme === 'dark';
  const textColor = isDark ? '#e5e7eb' : '#374151';
  const hoverBg = isDark ? '#374151' : '#f3f4f6';

  return (
    <StyleProvider hashPriority="high">
      <ConfigProvider
        theme={{
          algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
          token: { colorPrimary: '#1677ff' },
        }}
        getPopupContainer={getPopupContainer}
      >
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          height: 56,
          background: isDark ? '#1f2937' : '#ffffff',
          borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 24,
        }}
      >
        {/* 左侧：Logo + 导航 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexShrink: 0 }}>
          <a 
            href="/" 
            style={{ 
              fontSize: 18, 
              fontWeight: 700, 
              color: '#1677ff', 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            🎵 EventerNote
          </a>
          
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[
              { href: '/events', label: '活动情报' },
              { href: '/actors', label: '艺人情报' },
              { href: '/places', label: '会场情报' },
            ].map(item => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  color: textColor,
                  textDecoration: 'none',
                  fontSize: 14,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* 中间：搜索栏（填满剩余空间） */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <AutoComplete
            value={keyword}
            options={options}
            onSearch={onSearch}
            onSelect={onSelect}
            style={{ width: '100%', maxWidth: 560 }}
            popupMatchSelectWidth={500}
          >
            <Input
              size="large"
              placeholder="搜索声优、活动、会场..."
              style={{ borderRadius: 8, height: 44 }}
              onPressEnter={doSearch}
            />
          </AutoComplete>
          <Button type="primary" size="large" onClick={doSearch} style={{ borderRadius: 8, height: 44 }}>
            搜索
          </Button>
        </div>

        {/* 右侧：主题切换 + 用户 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <Button
            type="text"
            icon={isDark ? <SunOutlined /> : <MoonOutlined />}
            onClick={onToggleTheme}
            style={{ color: textColor }}
          />

          {user ? (
            <a 
              href={user.profileUrl || '/users/'} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8, 
                textDecoration: 'none',
                padding: '4px 12px 4px 4px',
                borderRadius: 20,
                background: isDark ? '#374151' : '#f3f4f6',
              }}
            >
              <Avatar src={user.avatar} size={28} icon={<UserOutlined />} />
              <span style={{ color: textColor, fontSize: 14, fontWeight: 500 }}>{user.name}</span>
            </a>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <a 
                href="/users/sign_in" 
                style={{ 
                  color: textColor, 
                  textDecoration: 'none', 
                  fontSize: 14,
                  padding: '6px 12px',
                  borderRadius: 6,
                }}
              >
                登录
              </a>
              <Button type="primary" size="small" href="/users/sign_up">
                注册
              </Button>
            </div>
          )}
        </div>
      </header>
    </ConfigProvider>
    </StyleProvider>
  );
}
