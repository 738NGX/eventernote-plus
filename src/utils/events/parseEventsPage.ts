import { parseEventsData } from "./parseEventsData"
import { parseSideComment } from "./parseSideComment";

export const parseEventsPage = () => {
  const events = parseEventsData();
  const sideComments = parseSideComment();
  return {
    ...events, 
    sideComments
  }
}