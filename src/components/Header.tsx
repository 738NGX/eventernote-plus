import { useState, useRef, useEffect, useCallback } from 'react';
import { AutoComplete, Input, Button, Avatar, ConfigProvider, theme as antTheme, Popover } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import { UserOutlined, SunOutlined, MoonOutlined, GithubFilled, UsergroupAddOutlined, SettingOutlined, BellOutlined, LogoutOutlined, HomeOutlined } from '@ant-design/icons';
import type { UserInfo } from '../utils/user/userInfo';


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

  const UserSettings = () => {
    return <div className='flex flex-col'>
      <Button type='text' icon={<HomeOutlined />} href={`/users/${user?.name}`} style={{ color: textColor }}>用户主页</Button>
      <Button type='text' icon={<BellOutlined />} href='/users/notice' style={{ color: textColor }}>系统通知</Button>
      <Button type='text' icon={<UsergroupAddOutlined />} href='/users/friends' style={{ color: textColor }}>好友动态</Button>
      <Button type='text' icon={<SettingOutlined />} href='/users/setting' style={{ color: textColor }}>用户设置</Button>
      <Button type='text' icon={<LogoutOutlined />} href='/signout' style={{ color: textColor }}>退出登录</Button>
    </div>
  }

  return (
    <StyleProvider hashPriority="high">
      <ConfigProvider
        theme={{
          algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
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
                color: '#ff74b9',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              EventerNote
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
              onSelect={onSelect}
              showSearch={{ onSearch }}
              style={{ width: '100%', maxWidth: 560 }}
              popupMatchSelectWidth={500}
            >
              <Input.Search
                size="large"
                placeholder="搜索声优、活动、会场..."
                onPressEnter={doSearch}
                enterButton
              />
            </AutoComplete>
          </div>

          {/* 右侧：主题切换 + 用户 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div className='flex flex-row gap-1'>
              <Popover content="Github页面" placement='bottom'>
                <Button
                  type='text'
                  icon={<GithubFilled />}
                  onClick={() => window.open('https://github.com/738NGX/eventernote-plus', '_blank')}
                  style={{ color: textColor }}
                />
              </Popover>
              <Popover content="切换主题" placement='bottom'>
                <Button
                  type='text'
                  icon={isDark ? <SunOutlined /> : <MoonOutlined />}
                  onClick={onToggleTheme}
                  style={{ color: textColor }}
                />
              </Popover>
            </div>

            {user ? (
              <Popover content={<UserSettings />} placement='bottom'>
                <a
                  href={'/users'}
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
              </Popover>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <a
                  href="/login"
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
                <Button type="primary" size="small" href="/register">
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
