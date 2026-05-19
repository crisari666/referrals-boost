import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchUpcomingTrainingSessions } from '@/features/training-sessions/services/training-sessions-service';
import type { TrainingSessionUpcomingItem } from '@/features/training-sessions/types/training-session-upcoming';
import type { RootState } from '@/store';

export interface TrainingSessionsState {
  upcoming: TrainingSessionUpcomingItem[];
  loading: boolean;
  error: string | null;
}

const initialState: TrainingSessionsState = {
  upcoming: [],
  loading: false,
  error: null,
};

export const fetchUpcomingTrainingSessionsThunk = createAsyncThunk(
  'trainingSessions/fetchUpcoming',
  async () => {
    const response = await fetchUpcomingTrainingSessions();
    return response.data;
  },
);

const trainingSessionsSlice = createSlice({
  name: 'trainingSessions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUpcomingTrainingSessionsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingTrainingSessionsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.upcoming = action.payload;
      })
      .addCase(fetchUpcomingTrainingSessionsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load training sessions';
      });
  },
});

export const selectTrainingSessionsUpcoming = (state: RootState): TrainingSessionUpcomingItem[] =>
  state.trainingSessions.upcoming;

export const selectTrainingSessionsLoading = (state: RootState): boolean =>
  state.trainingSessions.loading;

export const selectTrainingSessionsError = (state: RootState): string | null =>
  state.trainingSessions.error;

export default trainingSessionsSlice.reducer;
