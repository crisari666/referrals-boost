import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  fetchPublicLotsMap,
  fetchPublicProjectLots,
} from '@/features/lot-stock/services/lot-stock.service';
import {
  EMPTY_KIND_SUMMARY,
  type LotKindSummary,
  type LotMapPaintResponse,
  type PublicProjectLot,
} from '@/features/lot-stock/types/lot-stock.types';
import type { RootState } from '@/store';

export type LotStockState = {
  projectId: string | null;
  projectTitle: string;
  lots: PublicProjectLot[];
  summary: LotKindSummary;
  isLoading: boolean;
  error: string | null;
  mapPaint: LotMapPaintResponse | null;
  mapLoading: boolean;
  mapError: string | null;
};

const initialState: LotStockState = {
  projectId: null,
  projectTitle: '',
  lots: [],
  summary: EMPTY_KIND_SUMMARY,
  isLoading: false,
  error: null,
  mapPaint: null,
  mapLoading: false,
  mapError: null,
};

export const fetchLotStock = createAsyncThunk<
  { projectId: string; projectTitle: string; lots: PublicProjectLot[]; summary: LotKindSummary },
  string,
  { rejectValue: string }
>('lotStock/fetch', async (projectId, { rejectWithValue }) => {
  try {
    const data = await fetchPublicProjectLots(projectId);
    return {
      projectId: data.projectId ?? projectId,
      projectTitle: data.projectTitle ?? '',
      lots: Array.isArray(data.lots)
        ? data.lots.map((lot) => ({
            ...lot,
            ventorName: lot.ventorName ?? '',
            holdUntil: lot.holdUntil ?? null,
            stageKey: lot.stageKey || 'default',
            stageName:
              lot.stageName ||
              (lot.stageKey && lot.stageKey !== 'default' ? lot.stageKey : 'General'),
            stageOrder: typeof lot.stageOrder === 'number' ? lot.stageOrder : 0,
          }))
        : [],
      summary: data.summary ?? EMPTY_KIND_SUMMARY,
    };
  } catch (err: unknown) {
    const message =
      err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'Failed to load lot stock';
    return rejectWithValue(message);
  }
});

export const fetchLotStockMap = createAsyncThunk<
  LotMapPaintResponse,
  string,
  { rejectValue: string }
>('lotStock/fetchMap', async (projectId, { rejectWithValue }) => {
  try {
    return await fetchPublicLotsMap(projectId);
  } catch (err: unknown) {
    const message =
      err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'Failed to load lot map';
    return rejectWithValue(message);
  }
});

const lotStockSlice = createSlice({
  name: 'lotStock',
  initialState,
  reducers: {
    resetLotStock() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLotStock.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLotStock.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projectId = action.payload.projectId;
        state.projectTitle = action.payload.projectTitle;
        state.lots = action.payload.lots;
        state.summary = action.payload.summary;
        state.error = null;
      })
      .addCase(fetchLotStock.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to load lot stock';
      })
      .addCase(fetchLotStockMap.pending, (state) => {
        state.mapLoading = true;
        state.mapError = null;
      })
      .addCase(fetchLotStockMap.fulfilled, (state, action) => {
        state.mapLoading = false;
        state.mapPaint = action.payload;
        state.mapError = null;
      })
      .addCase(fetchLotStockMap.rejected, (state, action) => {
        state.mapLoading = false;
        state.mapPaint = null;
        state.mapError = action.payload ?? 'Failed to load lot map';
      });
  },
});

export const { resetLotStock } = lotStockSlice.actions;

export const selectLotStock = (state: RootState): LotStockState => state.lotStock;

export default lotStockSlice.reducer;
