import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as usersService from '@/services/users-service';

export interface ScheduleAssigneesState {
  namesById: Record<string, string>;
  loadingById: Record<string, boolean>;
}

const initialState: ScheduleAssigneesState = {
  namesById: {},
  loadingById: {},
};

export const fetchScheduleAssigneeNamesByIds = createAsyncThunk<
  usersService.BasicUserNameRow[],
  string[],
  { rejectValue: string }
>('scheduleAssignees/fetchByIds', async (ids, { rejectWithValue }) => {
  try {
    return await usersService.listBasicUsersByIds(ids);
  } catch (error: unknown) {
    const message =
      error && typeof error === 'object' && 'message' in error
        ? String((error as { message: string }).message)
        : 'No se pudo cargar nombres de asesores.';
    return rejectWithValue(message);
  }
});

const scheduleAssigneesSlice = createSlice({
  name: 'scheduleAssignees',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchScheduleAssigneeNamesByIds.pending, (state, action) => {
        for (const id of action.meta.arg) {
          state.loadingById[id] = true;
        }
      })
      .addCase(fetchScheduleAssigneeNamesByIds.fulfilled, (state, action) => {
        const requested = action.meta.arg;
        for (const id of requested) {
          state.loadingById[id] = false;
        }
        for (const row of action.payload) {
          const value = row.displayName?.trim();
          if (value) {
            state.namesById[row.id] = value;
          }
        }
      })
      .addCase(fetchScheduleAssigneeNamesByIds.rejected, (state, action) => {
        for (const id of action.meta.arg) {
          state.loadingById[id] = false;
        }
      });
  },
});

export default scheduleAssigneesSlice.reducer;
