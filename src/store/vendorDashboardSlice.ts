import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { logout } from '@/store/authSlice';
import * as vendorDashboardService from '@/services/vendorDashboardService';
import type { VendorDashboardResult } from '@/services/vendorDashboardService';
import * as clientsService from '@/services/clientsService';

interface VendorDashboardState {
  data: VendorDashboardResult | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: VendorDashboardState = {
  data: null,
  isLoading: false,
  error: null,
};

export const fetchVendorDashboard = createAsyncThunk<
  VendorDashboardResult,
  void,
  { rejectValue: string }
>('vendorDashboard/fetch', async (_, { rejectWithValue }) => {
  try {
    const [dashboard, msStats] = await Promise.all([
      vendorDashboardService.getVendorDashboard(),
      clientsService.getVendorCustomerMineDashboardStats().catch(() => null),
    ]);
    if (msStats) {
      return {
        ...dashboard,
        customersActives: msStats.customersActives,
        customerConversion: msStats.customerConversion,
      };
    }
    return dashboard;
  } catch (err: unknown) {
    const message =
      err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'Error al cargar el dashboard de vendedor.';
    return rejectWithValue(message);
  }
});

const vendorDashboardSlice = createSlice({
  name: 'vendorDashboard',
  initialState,
  reducers: {
    clearVendorDashboard(state) {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendorDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVendorDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchVendorDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Error desconocido';
      })
      .addCase(logout, () => initialState);
  },
});

export const { clearVendorDashboard } = vendorDashboardSlice.actions;
export default vendorDashboardSlice.reducer;
