import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as scheduleService from "@/services/scheduleService";
import type {
  CreateVentorSchedulePayload,
  VentorScheduleEventApi,
  VentorScheduleStatusApi,
} from "@/services/scheduleService";

export interface ScheduleState {
  /** Events keyed by UTC calendar day `YYYY-MM-DD` (from `scheduledAt` ISO). */
  byDay: Record<string, VentorScheduleEventApi[]>;
  dayLoading: Record<string, boolean>;
  dayError: Record<string, string | undefined>;
  creating: boolean;
  patchingById: Record<string, boolean>;
}

const initialState: ScheduleState = {
  byDay: {},
  dayLoading: {},
  dayError: {},
  creating: false,
  patchingById: {},
};

function upsertEventInDayCache(
  state: ScheduleState,
  event: VentorScheduleEventApi
): void {
  const ymd = event.scheduledAt.slice(0, 10);
  const prev = state.byDay[ymd] ?? [];
  const idx = prev.findIndex((e) => e.id === event.id);
  const next =
    idx === -1
      ? [...prev, event]
      : prev.map((e, i) => (i === idx ? event : e));
  next.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  state.byDay[ymd] = next;
}

function replaceEventInAllCachedDays(
  state: ScheduleState,
  event: VentorScheduleEventApi
): void {
  for (const key of Object.keys(state.byDay)) {
    state.byDay[key] = state.byDay[key].map((e) =>
      e.id === event.id ? event : e
    );
  }
}

export const fetchVentorScheduleByDay = createAsyncThunk<
  { dateYmd: string; events: VentorScheduleEventApi[] },
  string,
  { rejectValue: string }
>("schedule/fetchByDay", async (dateYmd, { rejectWithValue }) => {
  try {
    const events = await scheduleService.listVentorScheduleByDay(dateYmd);
    return { dateYmd, events };
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "No se pudo cargar la agenda.";
    return rejectWithValue(message);
  }
});

export const createVentorScheduleEventRequest = createAsyncThunk<
  VentorScheduleEventApi,
  CreateVentorSchedulePayload,
  { rejectValue: string }
>("schedule/createEvent", async (payload, { rejectWithValue }) => {
  try {
    return await scheduleService.createVentorScheduleEvent(payload);
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "No se pudo agendar la visita.";
    return rejectWithValue(message);
  }
});

export const patchVentorScheduleStatusRequest = createAsyncThunk<
  VentorScheduleEventApi,
  { eventId: string; status: VentorScheduleStatusApi },
  { rejectValue: string }
>("schedule/patchStatus", async ({ eventId, status }, { rejectWithValue }) => {
  try {
    return await scheduleService.patchVentorScheduleStatus(eventId, status);
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "No se pudo actualizar el estado.";
    return rejectWithValue(message);
  }
});

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    clearScheduleDay(state, action: PayloadAction<string>) {
      delete state.byDay[action.payload];
      delete state.dayLoading[action.payload];
      delete state.dayError[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVentorScheduleByDay.pending, (state, action) => {
        const dateYmd = action.meta.arg;
        state.dayLoading[dateYmd] = true;
        state.dayError[dateYmd] = undefined;
      })
      .addCase(fetchVentorScheduleByDay.fulfilled, (state, action) => {
        const { dateYmd, events } = action.payload;
        state.dayLoading[dateYmd] = false;
        state.byDay[dateYmd] = events;
      })
      .addCase(fetchVentorScheduleByDay.rejected, (state, action) => {
        const dateYmd = action.meta.arg;
        state.dayLoading[dateYmd] = false;
        state.dayError[dateYmd] =
          action.payload ?? action.error.message ?? "Error";
      })
      .addCase(createVentorScheduleEventRequest.pending, (state) => {
        state.creating = true;
      })
      .addCase(createVentorScheduleEventRequest.fulfilled, (state, action) => {
        state.creating = false;
        upsertEventInDayCache(state, action.payload);
      })
      .addCase(createVentorScheduleEventRequest.rejected, (state) => {
        state.creating = false;
      })
      .addCase(patchVentorScheduleStatusRequest.pending, (state, action) => {
        state.patchingById[action.meta.arg.eventId] = true;
      })
      .addCase(patchVentorScheduleStatusRequest.fulfilled, (state, action) => {
        state.patchingById[action.payload.id] = false;
        replaceEventInAllCachedDays(state, action.payload);
      })
      .addCase(patchVentorScheduleStatusRequest.rejected, (state, action) => {
        const id = action.meta.arg.eventId;
        state.patchingById[id] = false;
      });
  },
});

export const { clearScheduleDay } = scheduleSlice.actions;
export default scheduleSlice.reducer;
