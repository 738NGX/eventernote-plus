import { EventData } from "../../utils/events/eventdata";
import { Table } from "antd";

export const VenueCount = ({ venueRanking, userEvents }: { venueRanking: [string, number][], userEvents: EventData[] }) => {
  return <div>
    <Table
      dataSource={venueRanking.map(([venue, count], index) => {
        const venueId = userEvents.find(event => event.venue.name === venue)?.venue.id || 'unknown';
        const prefecture = userEvents.find(event => event.venue.name === venue)?.venue.prefecture.name || '未知';
        return {
          key: index,
          venue,
          venueId,
          prefecture,
          count,
        };
      })}
      columns={[
        {
          title: '场馆名称',
          dataIndex: 'venue',
          key: 'venue',
          render: (text: string, record: any) => (
            <a href={`https://www.eventernote.com/places/${record.venueId}`} target="_blank" rel="noopener noreferrer">
              {text}
            </a>
          ),
        },
        {
          title: '都道府县',
          dataIndex: 'prefecture',
          key: 'prefecture',
        },
        {
          title: '活动次数',
          dataIndex: 'count',
          key: 'count',
        },
      ]}
    />
  </div>
}