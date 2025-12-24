import { EventData } from "../events/eventdata";
import { parseEventList } from "../events/parseEventList";
import { parseUsersProfile } from "./parseUsersProfile";

// 在清空 DOM 前解析用户页面数据
export function parseUsersPageData() {
  const userProfile = parseUsersProfile();
  
  // 解析活动列表
  const allEventLists = document.querySelectorAll('.gb_event_list');
  let scheduledEvents = [] as EventData[];
  let overlapEvents = [] as EventData[]; 
  let favouriteArtistsEvents = [] as EventData[];  
  allEventLists.forEach(list => {
    const header = list.previousElementSibling;

    if (header && header.textContent) {
      if (header.textContent.includes('参加予定')) {
        scheduledEvents = parseEventList(list);
      } else if (header.textContent.includes('被っている')) {
        overlapEvents = parseEventList(list);
      } else if (header.textContent.includes('お気に入り声優')) {
        favouriteArtistsEvents = parseEventList(list);
      }
    }
  });

  return {
    ...userProfile,
    scheduledEvents,
    overlapEvents,
    favouriteArtistsEvents,
  };
}