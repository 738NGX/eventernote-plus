import { Button } from 'antd';

interface HeroProps {
  theme: 'light' | 'dark';
}

export default function Hero({ theme }: HeroProps) {
  const isDark = theme === 'dark';

  return (
    <section
      className={`relative py-24 px-6 text-center ${isDark ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-pink-500 to-pink-700'}`}
    >
      <div className="relative z-10 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          发现日本艺人活动
        </h1>
        <p className="text-lg text-white/80 mb-8">
          追踪你喜欢的声优、艺人的演唱会、活动和见面会
        </p>

        <div className="flex justify-center gap-4">
          <Button
            type="primary"
            size="large"
            href="/events"
            style={{ 
              background: '#fff', 
              color: '#2563eb', 
              fontWeight: 600,
              height: 48,
              paddingInline: 32,
              borderRadius: 8,
            }}
          >
            浏览活动
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
            发现声优
          </Button>
        </div>
      </div>
    </section>
  );
}
