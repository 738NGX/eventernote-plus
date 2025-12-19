import React, { useMemo } from 'react';

export type ActivityHeatmapProps = {
  year: number;
  data: Record<string, number>;
  theme: 'light' | 'dark';
  username: string;
}

const ActivityHeatmap = ({ year, data, theme, username }: ActivityHeatmapProps) => {
  const isDark = theme === 'dark';

  // --- 配置项 ---
  const BLOCK_SIZE = 10; // 格子大小 (px)
  const BLOCK_GAP = 3;   // 间距 (px)
  const WEEK_WIDTH = BLOCK_SIZE + BLOCK_GAP; // 一列的实际宽度

  const getColor = (count: number): string => {
    if (count === 0) return isDark ? 'bg-slate-700' : 'bg-gray-100';
    if (count <= 1) return isDark ? 'bg-blue-900' : 'bg-blue-100';
    if (count <= 2) return isDark ? 'bg-blue-700' : 'bg-blue-300';
    if (count <= 3) return isDark ? 'bg-blue-500' : 'bg-blue-500';
    return isDark ? 'bg-blue-400' : 'bg-blue-700';
  };

  const { calendarData, monthLabels } = useMemo(() => {
    const days = [];
    const monthLabels: { label: string, weekIndex: number }[] = [];
    
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    const startDayOfWeek = startDate.getDay(); 
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    let currentDate = new Date(startDate);
    let lastMonth = -1;

    while (currentDate <= endDate) {
      const month = currentDate.getMonth();
      const dateString = currentDate.toISOString().split('T')[0];
      // 兼容两种 key 格式
      const shortDateString = `${String(month + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      
      const count = data[dateString] || data[shortDateString] || 0;

      // 计算月份标签位置
      if (month !== lastMonth) {
        // 当前总天数 / 7 = 当前是第几列
        const weekIndex = Math.floor(days.length / 7);
        monthLabels.push({
            label: currentDate.toLocaleString('default', { month: 'short' }), // 或 'Jan'
            weekIndex
        });
        lastMonth = month;
      }

      days.push({
        date: dateString,
        count: count,
        level: count > 4 ? 4 : count,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { calendarData: days, monthLabels };
  }, [year, data]);
  const weekDays = [
    { label: '日', show: true },    // Sun (0)
    { label: '月', show: false },  // Mon (1)
    { label: '火', show: true },    // Tue (2)
    { label: '水', show: false },  // Wed (3)
    { label: '木', show: true },    // Thu (4)
    { label: '金', show: false },  // Fri (5)
    { label: '土', show: true },    // Sat (6)
  ];

  return (
    <div 
      className={`p-4 rounded-xl border w-max ${isDark ? 'bg-[#0d1117] border-gray-800 text-gray-400' : 'bg-white border-gray-200 text-gray-500'} select-none`}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }}
    >
      <div className="flex flex-row items-end gap-2">
        <div className="flex flex-col gap-[3px] pb-[2px] text-xs font-medium text-right">
          {weekDays.map((day, i) => (
             <div 
               key={i} 
               style={{ height: `${BLOCK_SIZE}px`, lineHeight: `${BLOCK_SIZE}px` }} 
               className="flex items-center justify-end"
             >
               {day.show && <span className="text-[10px] transform translate-y-[1px]">{day.label}</span>}
             </div>
          ))}
        </div>

        <div className="flex flex-col">
          <div className="relative h-[16px] w-full mb-1">
            {monthLabels.map((m, i) => (
              <span 
                  key={i} 
                  className="absolute bottom-0 text-[10px]"
                  style={{ left: `${m.weekIndex * WEEK_WIDTH}px` }}
              >
                  {m.label}
              </span>
            ))}
          </div>
          <div 
            className="grid grid-rows-7 grid-flow-col w-max"
            style={{ gap: `${BLOCK_GAP}px` }}
          >
            {calendarData.map((item, index) => {
              if (item === null) {
                return <div key={`placeholder-${index}`} style={{ width: BLOCK_SIZE, height: BLOCK_SIZE }} />;
              }
              return (
                <div
                  key={item.date}
                  style={{ width: BLOCK_SIZE, height: BLOCK_SIZE }}
                  className={`rounded-[2px] ${getColor(item.level)} relative group box-border hover:ring-1 hover:ring-gray-400/50`}
                  onClick={()=>{ 
                    const [year, month, day] = item.date.split('-');
                    window.open(`https://www.eventernote.com/users/${username}/events?year=${year}&month=${Number(month)}&day=${Number(day)}`, '_blank');
                  }}
                >
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50 whitespace-nowrap bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none">
                     {item.date}有{item.count}场活动
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 底部图例 */}
      <div className="flex items-center justify-end gap-1 mt-3 text-[10px] ml-8">
        <span>少</span>
        {[0, 1, 2, 3, 4].map(level => (
           <div key={level} style={{ width: BLOCK_SIZE, height: BLOCK_SIZE }} className={`rounded-[2px] ${getColor(level)}`} />
        ))}
        <span>多</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;