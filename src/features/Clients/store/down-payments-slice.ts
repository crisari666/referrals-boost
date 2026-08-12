import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as downPaymentsService from '@/services/down-paymentsService';
import type {
  CreateCustomerDownPaymentBody,
  CreateCustomerPaymentFeeBody,
  CustomerDownPaymentItem,
} from '@/services/down-payments.types';

type DownPaymentsState = {
  items: CustomerDownPaymentItem[];
  customerId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
};

const initialState: DownPaymentsState = {
  items: [],
  customerId: null,
  isLoading: false,
  isSaving: false,
  error: null,
};

export const fetchDownPaymentsByCustomer = createAsyncThunk(
  'downPayments/fetchByCustomer',
  async (customerId: string, { rejectWithValue }) => {
    try {
      const data = await downPaymentsService.listDownPaymentsByCustomer(customerId);
      return { customerId, data };
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to load down payments';
      return rejectWithValue(message);
    }
  },
);

export const createDownPaymentThunk = createAsyncThunk(
  'downPayments/create',
  async (
    input: {
      body: CreateCustomerDownPaymentBody;
      contractFile: File;
      evidenceFile?: File;
    },
    { rejectWithValue },
  ) => {
    try {
      return await downPaymentsService.createDownPayment(
        input.body,
        input.contractFile,
        input.evidenceFile,
      );
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to create down payment';
      return rejectWithValue(message);
    }
  },
);

export const addPaymentFeeThunk = createAsyncThunk(
  'downPayments/addFee',
  async (
    input: {
      downPaymentId: string;
      body: CreateCustomerPaymentFeeBody;
      evidenceFile?: File;
    },
    { rejectWithValue },
  ) => {
    try {
      return await downPaymentsService.addPaymentFee(
        input.downPaymentId,
        input.body,
        input.evidenceFile,
      );
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to add fee';
      return rejectWithValue(message);
    }
  },
);

const downPaymentsSlice = createSlice({
  name: 'downPayments',
  initialState,
  reducers: {
    clearDownPayments: (state) => {
      state.items = [];
      state.customerId = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDownPaymentsByCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDownPaymentsByCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customerId = action.payload.customerId;
        state.items = action.payload.data;
      })
      .addCase(fetchDownPaymentsByCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = String(action.payload ?? action.error.message);
      })
      .addCase(createDownPaymentThunk.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(createDownPaymentThunk.fulfilled, (state, action) => {
        state.isSaving = false;
        state.items = [
          action.payload,
          ...state.items.filter((d) => d.id !== action.payload.id),
        ];
      })
      .addCase(createDownPaymentThunk.rejected, (state, action) => {
        state.isSaving = false;
        state.error = String(action.payload ?? action.error.message);
      })
      .addCase(addPaymentFeeThunk.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(addPaymentFeeThunk.fulfilled, (state, action) => {
        state.isSaving = false;
        state.items = state.items.map((d) =>
          d.id === action.payload.id ? action.payload : d,
        );
      })
      .addCase(addPaymentFeeThunk.rejected, (state, action) => {
        state.isSaving = false;
        state.error = String(action.payload ?? action.error.message);
      });
  },
});

export const { clearDownPayments } = downPaymentsSlice.actions;
export default downPaymentsSlice.reducer;
