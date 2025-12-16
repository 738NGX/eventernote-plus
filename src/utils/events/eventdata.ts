export interface EventData {
  id: string;
  title: string;
  date: string;
  venue: {
    id: string;
    name: string;
    prefecture: {
      id: string;
      name: string;
    };
  };
  times: {
    open: string
    start: string;
    end: string;
  }
  performers: {
    id: string;
    name: string;
  }[];
  participantCount: number;
};