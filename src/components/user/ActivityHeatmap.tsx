import { Card, Tooltip } from 'antd';
import type { ActivityData } from '../../pages/UserProfilePage';

interface ActivityHeatmapProps {
  activities: ActivityData[];
  theme: 'light' | 'dark';
}

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export default function ActivityHeatmap({ activities, theme }: ActivityHeatmapProps) {
  const isDark = theme === 'dark';

  if (activities.length === 0) return null;

  // 获取颜色深度
  const getColor = (count: number): string => {
    if (count === 0) return isDark ? 'bg-slate-700' : 'bg-gray-100';
    if (count === 1) return isDark ? 'bg-blue-900' : 'bg-blue-100';
    if (count <= 2) return isDark ? 'bg-blue-700' : 'bg-blue-300';
    if (count <= 4) return isDark ? 'bg-blue-500' : 'bg-blue-500';
    return isDark ? 'bg-blue-400' : 'bg-blue-700';
  };

  return (
    <Card
      className={isDark ? 'bg-slate-800 border-slate-700' : ''}
      title={
        <span className={isDark ? 'text-white' : ''}>
          📊 活动参加记录
        </span>
      }
      styles={{ body: { padding: 16 } }}
    >
      <div className="space-y-4">
        {activities.map(yearData => (
          <div key={yearData.year}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {yearData.year}年
              </span>
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                共 {yearData.total} 场
              </span>
            </div>
            
            <div className="grid grid-cols-12 gap-1">
              {yearData.months.map((count, idx) => (
                <Tooltip key={idx} title={`${MONTHS[idx]}: ${count} 场活动`}>
                  <div
                    className={`aspect-square rounded-sm cursor-pointer transition hover:scale-110 ${getColor(count)}`}
                  />
                </Tooltip>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 图例 */}
      <div className={`mt-4 flex items-center justify-end gap-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        <span>少</span>
        <div className={`w-3 h-3 rounded-sm ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`} />
        <div className={`w-3 h-3 rounded-sm ${isDark ? 'bg-blue-900' : 'bg-blue-100'}`} />
        <div className={`w-3 h-3 rounded-sm ${isDark ? 'bg-blue-700' : 'bg-blue-300'}`} />
        <div className={`w-3 h-3 rounded-sm ${isDark ? 'bg-blue-500' : 'bg-blue-500'}`} />
        <div className={`w-3 h-3 rounded-sm ${isDark ? 'bg-blue-400' : 'bg-blue-700'}`} />
        <span>多</span>
      </div>
    </Card>
  );
}
