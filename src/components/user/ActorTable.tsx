import { PrefectureCount, PrefectureMap } from "./PrefectureMap";
import { EventData } from "../../utils/events/eventdata";
import { Table } from "antd";
import { ActorCountData } from "./ActorWordCloud";

export const ActorTable = ({ actorCountData }: { actorCountData: ActorCountData[] }) => {
  return <div>
    <Table
      dataSource={actorCountData.map((item, index) => {
        return {
          key: index,
          name: item.text,
          id: item.id,
          count: item.value,
        }
      }).sort((a, b) => b.count - a.count)}
      columns={[
        {
          title: '艺人',
          dataIndex: 'name',
          key: 'name',
          render: (text: string, record: any) => (
            <a href={`https://www.eventernote.com/actors/${record.id}`} target="_blank" rel="noopener noreferrer">
              {text}
            </a>
          ),
        },
        {
          title: '见面次数',
          dataIndex: 'count',
          key: 'count',
        },
      ]}
    />
  </div>
}