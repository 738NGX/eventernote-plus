import { Button } from 'antd';

interface HeroProps {
  theme: 'light' | 'dark';
}

export default function Hero({ theme }: HeroProps) {
  const isDark = theme === 'dark';

  return (
    <section
      className={`relative py-24 px-6 text-center ${isDark ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-pink-300 to-pink-500'}`}
    >
      <div className="relative z-10 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Eventernote (イベンターノート)
        </h1>
        <p className="text-lg text-white/80 mb-8">
          追踪你喜欢的声优·偶像·艺人的演唱会、见面会和其他活动
        </p>

        <div className="flex justify-center gap-4">
          <Button
            type="primary"
            size="large"
            href="/events"
            style={{ 
              background: '#fff', 
              color: '#ff74b9', 
              fontWeight: 600,
              height: 48,
              paddingInline: 32,
              borderRadius: 8,
            }}
          >
            最新活动
          </Button>
          <Button
            type="default"
            size="large"
            href="/actors"
            style={{ 
              background: 'rgba(255,255,255,0.2)', 
              color: '#fff', 
              fontWeight: 600,
              borderColor: 'transparent',
              height: 48,
              paddingInline: 32,
              borderRadius: 8,
            }}
          >
            浏览艺人
          </Button>
        </div>
      </div>
    </section>
  );
}
