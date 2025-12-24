import { parseUsersProfile } from "./parseUsersProfile"
import { parseEventList } from "../events/parseEventList";
import { parseBreadcrumb } from "../parseBreadcrumb";

export const parseUsersEvents = () => {
  const profile = parseUsersProfile();

  let total = 0;
  const t2List = document.querySelectorAll('.span8.page .gb_subtitle');
  t2List.forEach(t2 => {
    const match = t2.textContent?.match(/(\d+)件/);
    if (match) {
      total = parseInt(match[1], 10);
    }
  });

  // 解析活动列表
  const eventListEl = document.querySelector('.gb_event_list');
  const events = parseEventList(eventListEl);

  const breadcrumb = parseBreadcrumb();

  return {
    ...profile,
    total,
    events,
    breadcrumb,
  }
}