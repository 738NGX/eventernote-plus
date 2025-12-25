import { Card, Switch, Tooltip } from 'antd';
import type { ActivityData } from '../../pages/UserProfilePage';
import { useState } from 'react';

interface ActivityHeatmapProps {
  activities: ActivityData[];
  theme: 'light' | 'dark';
  title?: string;
}

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export default function ActivityHeatmap({ title, activities, theme }: ActivityHeatmapProps) {
  const isDark = theme === 'dark';
  const [showNumber, setShowNumber] = useState(false);

  if (activities.length === 0) return null;

  // 获取颜色深度
  const getColor = (count: number): string => {
    if (count === 0) return isDark ? 'bg-slate-700' : 'bg-gray-100';
    if (count <= 2) return isDark ? 'bg-pink-900' : 'bg-pink-300';
    if (count <= 4) return isDark ? 'bg-pink-700' : 'bg-pink-500';
    if (count <= 8) return isDark ? 'bg-pink-500' : 'bg-pink-700';
    return isDark ? 'bg-pink-300' : 'bg-pink-900';
  };

  return (
    <Card
      className={isDark ? 'bg-slate-800 border-slate-700' : ''}
      title={
        <span className={isDark ? 'text-white' : ''}>
          {title || '📊 活动参加数'}
        </span>
      }
      extra={<Switch checkedChildren="展示数字" unCheckedChildren="隐藏数字" onChange={(checked: boolean) => setShowNumber(checked)} value={showNumber} />}
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
                    className={`flex items-center justify-center aspect-square rounded-sm cursor-pointer transition hover:scale-110 ${getColor(count)}`}
                  >
                    <p className='text-white text-xs !m-0'>{showNumber && count > 0 ? count : null}</p>
                  </div>
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
        <div className={`w-3 h-3 rounded-sm ${isDark ? 'bg-pink-900' : 'bg-pink-300'}`} />
        <div className={`w-3 h-3 rounded-sm ${isDark ? 'bg-pink-700' : 'bg-pink-500'}`} />
        <div className={`w-3 h-3 rounded-sm ${isDark ? 'bg-pink-500' : 'bg-pink-700'}`} />
        <div className={`w-3 h-3 rounded-sm ${isDark ? 'bg-pink-300' : 'bg-pink-900'}`} />
        <span>多</span>
      </div>
    </Card>
  );
}
