import { Card, Tag, Button } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { EventData } from '../../utils/events/eventdata';
import { EventCard } from './EventCard';

interface EventsListProps {
  events: EventData[];
  theme: 'light' | 'dark';
  username: string;
  title?: string;
}

export default function EventsList({ events, theme, username, title }: EventsListProps) {
  const isDark = theme === 'dark';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold mb-4">
          📅 {title}
        </h3>
        <Button
          type="link"
          href={`/users/${username}/events`}
          icon={<RightOutlined />}
        >
          查看全部
        </Button>
      </div>

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
