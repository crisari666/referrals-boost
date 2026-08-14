import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchPublicProjectLots } from '@/features/lot-stock/services/lot-stock.service';
import {
  EMPTY_KIND_SUMMARY,
  type LotKindSummary,
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
};

const initialState: LotStockState = {
  projectId: null,
  projectTitle: '',
  lots: [],
  summary: EMPTY_KIND_SUMMARY,
  isLoading: false,
  error: null,
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
      });
  },
});

export const { resetLotStock } = lotStockSlice.actions;

export const selectLotStock = (state: RootState): LotStockState => state.lotStock;

export default lotStockSlice.reducer;
