import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  fetchPublicLotsMap,
  fetchPublicProjectLots,
  holdProjectLot as holdProjectLotReq,
  unholdProjectLot as unholdProjectLotReq,
} from '@/features/lot-stock/services/lot-stock.service';
import { getHttpErrorMessage } from '@/lib/parse-api-error';
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
  holdLoading: boolean;
  holdError: string | null;
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
  holdLoading: false,
  holdError: null,
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
            id: lot.id || '',
            ventorName: lot.ventorName ?? '',
            heldByUserId: lot.heldByUserId ?? '',
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

export const holdProjectLot = createAsyncThunk<
  string,
  { projectId: string; lotId: string; ventorName?: string },
  { rejectValue: string }
>('lotStock/hold', async (params, { dispatch, rejectWithValue }) => {
  try {
    await holdProjectLotReq(params);
    await dispatch(fetchLotStock(params.projectId)).unwrap();
    void dispatch(fetchLotStockMap(params.projectId));
    return params.lotId;
  } catch (err: unknown) {
    return rejectWithValue(getHttpErrorMessage(err, 'Failed to hold lot'));
  }
});

export const unholdProjectLot = createAsyncThunk<
  string,
  { projectId: string; lotId: string },
  { rejectValue: string }
>('lotStock/unhold', async (params, { dispatch, rejectWithValue }) => {
  try {
    await unholdProjectLotReq(params);
    await dispatch(fetchLotStock(params.projectId)).unwrap();
    void dispatch(fetchLotStockMap(params.projectId));
    return params.lotId;
  } catch (err: unknown) {
    return rejectWithValue(getHttpErrorMessage(err, 'Failed to unhold lot'));
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
      })
      .addCase(holdProjectLot.pending, (state) => {
        state.holdLoading = true;
        state.holdError = null;
      })
      .addCase(holdProjectLot.fulfilled, (state) => {
        state.holdLoading = false;
        state.holdError = null;
      })
      .addCase(holdProjectLot.rejected, (state, action) => {
        state.holdLoading = false;
        state.holdError = action.payload ?? 'Failed to hold lot';
      })
      .addCase(unholdProjectLot.pending, (state) => {
        state.holdLoading = true;
        state.holdError = null;
      })
      .addCase(unholdProjectLot.fulfilled, (state) => {
        state.holdLoading = false;
        state.holdError = null;
      })
      .addCase(unholdProjectLot.rejected, (state, action) => {
        state.holdLoading = false;
        state.holdError = action.payload ?? 'Failed to unhold lot';
      });
  },
});

export const { resetLotStock } = lotStockSlice.actions;

export const selectLotStock = (state: RootState): LotStockState => state.lotStock;

export default lotStockSlice.reducer;
