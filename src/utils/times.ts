// 日期和时间解析工具函数
export const parseTime = (timeText: string) => {
  const openMatch = timeText.match(/開場\s*(\d+:\d+)/);
  const startMatch = timeText.match(/開演\s*(\d+:\d+)/);
  const endMatch = timeText.match(/終演\s*(\d+:\d+)/);
  const startTime = startMatch ? startMatch[1] : '';
  const openTime = openMatch ? openMatch[1] : startTime;
  const endTime = endMatch ? endMatch[1] : '';

  return {
    open: openTime,
    start: startTime,
    end: endTime,
  };
}

export const parseDate = (dateText: string) => {
  const dateMatch = dateText.match(/(\d{4}-\d{2}-\d{2})/);
  return dateMatch ? dateMatch[1] : '';
}

export const dateBetween = (current: Date, target: Date): { value: number, type: '还剩' | '已过' } => {
  const diffTime = target.getTime() - current.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays >= 0) {
    return { value: diffDays, type: '还剩' };
  } else {
    return { value: -diffDays, type: '已过' };
  }
}