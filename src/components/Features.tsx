import { Button } from 'antd';

interface FeaturesProps {
  theme: 'light' | 'dark';
}

const features = [
  {
    icon: '📊',
    title: '自动识别你的喜好',
    desc: '我们会自动分析您喜爱的配音演员和艺术家的相关信息，并向您推荐他们。',
  },
  {
    icon: '🎤',
    title: '从知名声优到地下偶像',
    desc: '除了水树奈奈、田村由香里、茅原实里、堀江由衣等超级著名声优外，它还涵盖了包括桃色幸运草Z在内的众多偶像，以及电波组.inc等地下偶像。',
  },
  {
    icon: '📅',
    title: '外部日历完全对接',
    desc: '只需登记你参加的活动，活动时间和信息就会自动同步到你的Google日历或iPhone日历。',
  },
  {
    icon: '👥',
    title: '扩展你的人脉',
    desc: '使用EventerNote，可以一目了然地看到参加同一活动的同好。关注感兴趣的用户，试着扩展你的推友圈吧！',
  },
  {
    icon: '💰',
    title: '活动费用和感想完整记录',
    desc: '您可以详细记录您在活动上花费的金额和细节，以及您对活动的感受，以便日后回顾。',
  },
  {
    icon: '💡',
    title: '压倒性的活动覆盖率',
    desc: '一旦配音演员或艺术家的活动公布，就会创建一个活动页面，并且您会收到通知，这样您就不会错过任何重要活动。',
  },
];

const testimonials = [
  {
    quote: '全てのイベント情報が収束する唯一のサービス、それがイベンターノート。',
    author: '茅原実里＆田村ゆかりファン',
    handle: '@monoporhy',
  },
  {
    quote: 'Googleカレンダーと連携して、僕のイベンター生活が180°変わった',
    author: '新谷良子ファン',
    handle: '@anohitoHRS',
  },
  {
    quote: '自分のイベント人生を管理できる世界でたったひとつのサービスだ。',
    author: '堀江由衣ファン歴13年',
    handle: '@Jinmen',
  },
  {
    quote: '今夜推しを観に行こう。',
    author: '',
    handle: '@momonoka7',
  },
  {
    quote: '自分の思い出を仲間と共有出来て、更に新しい仲間と出会える…こんなに素晴らしい事はない。',
    author: '',
    handle: '@mottei2010',
  },
  {
    quote: 'ぽっかり空いた休日でもあなたにぴったりのイベントが見つかる。そう、Eventernoteならね。',
    author: '米国在住イベンター',
    handle: '@shingujikasumi',
  },
];

export default function Features({ theme }: FeaturesProps) {
  const isDark = theme === 'dark';

  return (
    <section className={`py-16 px-6 ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto">
        {/* 功能区标题 */}
        <h2 className={`text-2xl font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          EventerNote的丰富功能，这就是被选择的理由。
        </h2>

        {/* 6个功能卡片 3x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((f, i) => (
            <div
              key={i}
              className={`p-6 rounded-xl transition hover:shadow-lg flex flex-col items-center ${isDark
                ? 'bg-slate-800 border border-slate-700 hover:border-pink-500'
                : 'bg-white border border-gray-200 hover:shadow-md'}`}
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className={`text-lg font-semibold mb-3 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {f.title}
              </h3>
              <p className={`text-sm leading-relaxed text-left ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* 用户评价区 */}
        <div className="mb-16">
          <h3 className={`text-xl font-bold text-center mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            受到了一致好评，从老资历到小资历都在广泛使用。
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={`p-5 rounded-lg ${isDark
                  ? 'bg-slate-800 border border-slate-700'
                  : 'bg-white border border-gray-200'}`}
              >
                <p className={`text-sm mb-3 italic ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  "{t.quote}"
                </p>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  <div className="block">- {t.handle} {t.author}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部CTA */}
        <div className="text-center">
          <Button
            type="primary"
            size="large"
            href="/login"
            style={{
              height: 56,
              paddingInline: 48,
              fontSize: 18,
              fontWeight: 600,
              borderRadius: 28,
            }}
          >
            立即开始使用EventerNote（免费）
          </Button>
        </div>
      </div>
    </section>
  );
}
