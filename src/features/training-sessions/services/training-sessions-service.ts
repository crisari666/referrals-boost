import { http } from '@/lib/http';
import type { TrainingSessionUpcomingResponse } from '@/features/training-sessions/types/training-session-upcoming';

export async function fetchUpcomingTrainingSessions(): Promise<TrainingSessionUpcomingResponse> {
  return http.get<TrainingSessionUpcomingResponse>('/training-sessions/upcoming');
}
