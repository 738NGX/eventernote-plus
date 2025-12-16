import { PrefectureCount, PrefectureMap } from "./PrefectureMap";
import { EventData } from "../../utils/events/eventdata";
import { Table } from "antd";

export const VenueCount = ({ prefectureMapData, venueRanking, userEvents }: { prefectureMapData: PrefectureCount, venueRanking: [string, number][], userEvents: EventData[] }) => {
  return <div>
    <h3 className="text-lg font-bold mt-6 mb-4">活动足迹</h3>
    <PrefectureMap data={prefectureMapData} />
    <h3 className="text-lg font-bold mb-4">常去场馆</h3>
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