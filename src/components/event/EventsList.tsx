import { Card, Tag, Button } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { EventData } from '../../utils/events/eventdata';
import { EventCard } from './EventCard';

interface EventsListProps {
  events: EventData[];
  theme: 'light' | 'dark';
  username?: string;
  href?: string;
  title?: string;
}

export default function EventsList({ events, theme, username, title, href }: EventsListProps) {
  const isDark = theme === 'dark';

  return (
    <div>
      {(title || username || href) && <div className="flex items-center justify-between mb-2">
        {title && <h3 className="text-lg font-bold">
          📅 {title}
        </h3>}
        {(username || href) && <Button
          type="link"
          href={username ? `/users/${username}/events${title === '同场参加的活动' ? '/same' : title === '收藏的艺人的近期活动' ? '/?type=3' : ''}` : href}
          icon={<RightOutlined />}
        >
          查看全部
        </Button>}
      </div>}

      {events.length === 0 ? (
        <Card className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
          <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            暂无活动
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map(event => (
            <EventCard event={event} isDark={isDark} />
          ))}
        </div>
      )}
    </div>
  );
}
