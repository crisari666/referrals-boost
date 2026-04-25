import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';
import {
  fetchCampaignByCode,
  submitSignupRegistration,
} from '@/features/signup-campaign/services/signup-campaign-service';
import type {
  SignupCampaignPublic,
  SignupCampaignSliceState,
  SignupRegistrationPayload,
} from '@/features/signup-campaign/signup-campaign-types';
import type { RootState } from '@/store';

const SIGNUP_SUCCESS_MESSAGE_ES =
  'Hemos enviado el contrato de corretaje a tu bandeja de entrada para que realice la firma digital';

type LoadRejectPayload = {
  message: string;
  kind: 'not_found' | 'unknown';
};

type SubmitRejectPayload = {
  message: string;
};

const initialState: SignupCampaignSliceState = {
  loadStatus: 'idle',
  campaign: null,
  loadError: null,
  loadErrorKind: null,
  submitStatus: 'idle',
  submitError: null,
  successMessage: null,
};

export const loadSignupCampaignByCode = createAsyncThunk<
  SignupCampaignPublic,
  string,
  { rejectValue: LoadRejectPayload }
>('signupCampaign/loadByCode', async (code, { rejectWithValue }) => {
  try {
    return await fetchCampaignByCode(code);
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      const status = err.response?.status;
      if (status === 404) {
        return rejectWithValue({
          message: 'Este enlace de registro no existe.',
          kind: 'not_found',
        });
      }
    }
    return rejectWithValue({
      message: 'No se pudo cargar la información de la campaña.',
      kind: 'unknown',
    });
  }
});

export const submitSignupCampaignRegistration = createAsyncThunk<
  { message: string },
  { code: string; payload: SignupRegistrationPayload },
  { rejectValue: SubmitRejectPayload }
>(
  'signupCampaign/submit',
  async ({ code, payload }, { rejectWithValue }) => {
    try {
      const response = await submitSignupRegistration(code, payload);
      return { message: response.message ?? SIGNUP_SUCCESS_MESSAGE_ES };
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data as { message?: string } | undefined;
        if (status === 410) {
          return rejectWithValue({
            message: 'Este enlace de registro ya no está disponible.',
          });
        }
        if (status === 409) {
          return rejectWithValue({
            message: 'Este correo ya está registrado.',
          });
        }
        if (data?.message) {
          return rejectWithValue({ message: data.message });
        }
      }
      return rejectWithValue({
        message: 'No pudimos enviar tu registro. Inténtalo nuevamente.',
      });
    }
  }
);

const signupCampaignSlice = createSlice({
  name: 'signupCampaign',
  initialState,
  reducers: {
    resetSignupCampaign(state) {
      state.loadStatus = 'idle';
      state.campaign = null;
      state.loadError = null;
      state.loadErrorKind = null;
      state.submitStatus = 'idle';
      state.submitError = null;
      state.successMessage = null;
    },
    resetSignupCampaignSubmit(state) {
      state.submitStatus = 'idle';
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSignupCampaignByCode.pending, (state) => {
        state.loadStatus = 'loading';
        state.loadError = null;
        state.loadErrorKind = null;
        state.campaign = null;
      })
      .addCase(loadSignupCampaignByCode.fulfilled, (state, action) => {
        state.loadStatus = 'success';
        state.campaign = action.payload;
        state.loadError = null;
        state.loadErrorKind = null;
      })
      .addCase(loadSignupCampaignByCode.rejected, (state, action) => {
        state.loadStatus = 'error';
        state.campaign = null;
        state.loadError = action.payload?.message ?? 'unknown';
        state.loadErrorKind = action.payload?.kind ?? 'unknown';
      })
      .addCase(submitSignupCampaignRegistration.pending, (state) => {
        state.submitStatus = 'submitting';
        state.submitError = null;
        state.successMessage = null;
      })
      .addCase(submitSignupCampaignRegistration.fulfilled, (state, action) => {
        state.submitStatus = 'success';
        state.successMessage = action.payload.message;
        state.submitError = null;
      })
      .addCase(submitSignupCampaignRegistration.rejected, (state, action) => {
        state.submitStatus = 'error';
        state.submitError = action.payload?.message ?? 'unknown';
      });
  },
});

export const { resetSignupCampaign, resetSignupCampaignSubmit } =
  signupCampaignSlice.actions;

const selectSignupCampaignSlice = (
  state: RootState
): SignupCampaignSliceState => state.signupCampaign;

export const selectSignupCampaign = createSelector(
  [selectSignupCampaignSlice],
  (slice) => slice.campaign
);

export const selectSignupCampaignLoadStatus = createSelector(
  [selectSignupCampaignSlice],
  (slice) => slice.loadStatus
);

export const selectSignupCampaignLoadErrorKind = createSelector(
  [selectSignupCampaignSlice],
  (slice) => slice.loadErrorKind
);

export const selectSignupCampaignStatus = createSelector(
  [selectSignupCampaign],
  (campaign) => campaign?.status ?? null
);

export const selectSignupCampaignWhatsappUrl = createSelector(
  [selectSignupCampaign],
  (campaign) => campaign?.whatsappRedirectUrl ?? null
);

export const selectSignupSubmitStatus = createSelector(
  [selectSignupCampaignSlice],
  (slice) => slice.submitStatus
);

export const selectSignupSubmitError = createSelector(
  [selectSignupCampaignSlice],
  (slice) => slice.submitError
);

export const selectSignupSuccessMessage = createSelector(
  [selectSignupCampaignSlice],
  (slice) => slice.successMessage
);

export default signupCampaignSlice.reducer;
