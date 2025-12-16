import { Card, Tag, Button } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, TeamOutlined, RightOutlined } from '@ant-design/icons';
import { EventData } from '../../utils/events/eventdata';

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
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          📅 {title}
        </h2>
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
            <Card
              key={event.id}
              hoverable
              className={`overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700 hover:border-primary-500' : ''}`}
              styles={{ body: { padding: 0 } }}
            >
              <div className="flex">
                {/* 活动封面 */}
                <a
                  href={`/events/${event.id}`}
                  className="flex-shrink-0 w-28 md:w-32 aspect-square"
                >
                  <img
                    src={`https://eventernote.s3.amazonaws.com/images/events/${event.id}_s.jpg`}
                    alt={event.title}
                    className="w-full h-full object-contain bg-black"
                  />
                </a>

                {/* 活动信息 */}
                <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                  <div>
                    <a href={`/events/${event.id}`} className="block">
                      <h3 className={`font-semibold text-sm md:text-base mb-2 hover:text-primary-500 transition line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {event.title}
                      </h3>
                    </a>

                    <div className={`space-y-1 text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {event.date && (
                        <div className="flex items-center gap-2">
                          <CalendarOutlined />
                          <span>{event.date}</span>
                          {event.times.start && <span className="text-primary-500">{event.times.start} 开演</span>}
                        </div>
                      )}

                      {event.venue && (
                        <div className="flex items-center gap-2">
                          <EnvironmentOutlined />
                          <span className="truncate">{event.venue.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 出演者标签 */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {event.performers.slice(0, 5).map(p => (
                      <Tag
                        key={p.id}
                        color={isDark ? 'blue' : 'processing'}
                        className="text-xs"
                        style={{ margin: 0 }}
                      >
                        {p.name}
                      </Tag>
                    ))}
                    {event.performers.length > 5 && (
                      <Tag className="text-xs" style={{ margin: 0 }}>+{event.performers.length - 5}</Tag>
                    )}
                  </div>
                </div>

                {/* 参加人数 */}
                {event.participantCount > 0 && (
                  <div className={`flex-shrink-0 w-16 md:w-20 flex flex-col items-center justify-center border-l ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
                    <TeamOutlined className="text-lg mb-1 text-primary-500" />
                    <span className={`text-base md:text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {event.participantCount}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      人参加
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
