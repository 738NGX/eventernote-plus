import { Breadcrumb, Button, Card, ConfigProvider, Menu, MenuProps, Result, Table, theme as antTheme, Input, Avatar } from "antd";
import { ACTOR_MANIFEST_URL, CDN_BASE } from "../utils/config";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { StyleProvider } from "@ant-design/cssinjs";
import { useEffect, useState } from "react";
import { UserInfo } from "../utils/user/fetchAllUserEvents";
import { parseActorsPageData } from "../utils/actors/parseActorsPageData";

type Data = ReturnType<typeof parseActorsPageData>

interface ActorsPageProps {
  currentUser: UserInfo | null;
  getPopupContainer?: () => HTMLElement | ShadowRoot;
  data: Data;
}

export const ActorsPage = ({ currentUser, getPopupContainer, data }: ActorsPageProps) => {
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

  const Content = () => {
    // 搜索栏
    const handleSearch = (kw: string) => {
      if (kw && kw.trim()) {
        window.location.href = `/actors/search?keyword=${encodeURIComponent(kw.trim())}`;
      }
    };

    // 头像 manifest 逻辑
    const [manifest, setManifest] = useState<Record<string, any> | null>(null);
    useEffect(() => {
      if (!manifest) {
        fetch(ACTOR_MANIFEST_URL, { cache: 'reload' })
          .then(res => res.json())
          .then(data => setManifest(data))
          .catch(() => setManifest({}));
      }
    }, [manifest]);

    const columns = [
      {
        title: '头像',
        dataIndex: 'avatar',
        key: 'avatar',
        width: 56,
        render: (_: any, record: any) => {
          const hasAvatar = manifest && manifest[record.id];
          return (
            <Avatar size={40} src={hasAvatar ? `${CDN_BASE}/actors/${record.id}.webp` : undefined}>
              {record.name?.[0]?.toUpperCase()}
            </Avatar>
          );
        },
      },
      {
        title: '艺人名',
        dataIndex: 'name',
        key: 'name',
        render: (text: string, record: any) => <a href={record.url} target="_blank" rel="noopener noreferrer">{text}</a>,
      },
    ];

    // 三组数据
    const popular = data?.popular || [];
    const recent = data?.recent || [];
    const initials = data?.initials || [];

    // 头文字表格列
    const initialColumns = [
      {
        title: '假名',
        dataIndex: 'kana',
        key: 'kana',
        render: (text: string, record: any) => <a href={record.url} target="_blank" rel="noopener noreferrer">{text}</a>,
      },
      {
        title: '人数',
        dataIndex: 'count',
        key: 'count',
        width: 100,
      },
    ];

    return (
      <div className="space-y-6">
        <h3>搜索和新增艺人情报</h3>
        {/* 搜索栏和新增按钮 */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0 mb-4">
          <Input.Search
            placeholder="搜索艺人名..."
            allowClear
            enterButton="搜索"
            size="large"
            onSearch={handleSearch}
            className="flex-1"
          />
          <Button type="primary"  size="large" className="w-full md:w-auto" href="/actors/add">新增艺人情报</Button>
        </div>

        {/* 三列表格 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="热门艺人" className="overflow-x-auto !p-0">
            <Table
              columns={columns}
              dataSource={popular}
              rowKey={r => r.id + r.name}
              pagination={false}
              size="middle"
              className="min-w-[220px] !rounded-none !border-0"
              showHeader={false}
            />
          </Card>
          <Card title="新着艺人" className="overflow-x-auto !p-0">
            <Table
              columns={columns}
              dataSource={recent}
              rowKey={r => r.id + r.name}
              pagination={false}
              size="middle"
              className="min-w-[220px] !rounded-none !border-0"
              showHeader={false}
            />
          </Card>
          <Card title="头文字索引" className="overflow-x-auto !p-0">
            <Table
              columns={initialColumns}
              dataSource={initials}
              rowKey={r => r.kana}
              pagination={false}
              size="middle"
              className="min-w-[180px] !rounded-none !border-0"
              showHeader={false}
            />
          </Card>
        </div>
      </div>
    );
  }

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
                  title: '艺人情报',
                }
              ]}
              className='!mb-2'
            />
            <Content />
          </div>
        </main>
        <Footer theme={theme} />
      </div>
    </ConfigProvider>
  </StyleProvider>
}