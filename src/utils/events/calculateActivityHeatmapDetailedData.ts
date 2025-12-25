import { EventData } from "./eventdata";

export const calculateActivityHeatmapDetailedData = (events: EventData[]): Record<string, Record<string, number>> => {
  const heatmapData: Record<string, Record<string, number>> = {};
  events.forEach((event: EventData) => {
    const year = event.date.slice(0, 4);
    const monthDay = event.date.slice(5, 10); // MM-DD

    if (!heatmapData[year]) {
      heatmapData[year] = {};
    }
    if (heatmapData[year][monthDay]) {
      heatmapData[year][monthDay] += 1;
    }
    else {
      heatmapData[year][monthDay] = 1;
    }
  });
  return heatmapData;
}