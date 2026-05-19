export type TrainingSessionUpcomingItem = {
  id: string;
  name: string;
  date: string;
  time: string;
  googleMeetUrl: string;
};

export type TrainingSessionUpcomingResponse = {
  data: TrainingSessionUpcomingItem[];
};
