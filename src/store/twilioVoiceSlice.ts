import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import * as voipTokenService from '@/services/voipTokenService';
import * as twilioNumberService from '@/services/twilioNumberService';
import { disconnectActiveCall, registerTwilioDevice } from '@/lib/twilio-voice-runtime';
import type { TwilioCallPhase } from '@/types/twilio-voice';
import type { AuthUser } from '@/types/auth';

export type CallPhase = TwilioCallPhase;

export type RegistrationStatus = 'idle' | 'loading' | 'registered' | 'error';

export type SessionFieldStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface TwilioVoiceState {
  tokenJWT: string | null;
  tokenStatus: SessionFieldStatus;
  tokenError: string | null;
  userNumber: string | null;
  friendlyNumber: string | null;
  numberStatus: SessionFieldStatus;
  registrationStatus: RegistrationStatus;
  callPhase: CallPhase;
  callError: string | null;
  dialogOpen: boolean;
}

const initialState: TwilioVoiceState = {
  tokenJWT: null,
  tokenStatus: 'idle',
  tokenError: null,
  userNumber: null,
  friendlyNumber: null,
  numberStatus: 'idle',
  registrationStatus: 'idle',
  callPhase: 'idle',
  callError: null,
  dialogOpen: false,
};

export const ensureVoiceSession = createAsyncThunk(
  'twilioVoice/ensureVoiceSession',
  async (_, { getState }) => {
    const { auth } = getState() as { auth: { user: AuthUser | null } };
    const email = auth.user?.email;
    if (!email) {
      throw new Error('No hay sesión');
    }
    const [tokenResult, numberResult] = await Promise.all([
      voipTokenService.fetchVoipAccessToken(email),
      twilioNumberService.fetchUserTwilioNumber(),
    ]);
    await registerTwilioDevice(tokenResult.tokenJWT);
    return {
      tokenJWT: tokenResult.tokenJWT,
      userNumber: numberResult.number,
      friendlyNumber: numberResult.friendlyNumber,
    };
  }
);

export const hangUpVoiceCall = createAsyncThunk('twilioVoice/hangUp', async () => {
  disconnectActiveCall();
});

const twilioVoiceSlice = createSlice({
  name: 'twilioVoice',
  initialState,
  reducers: {
    setRegistrationStatus(state, action: PayloadAction<RegistrationStatus>) {
      state.registrationStatus = action.payload;
    },
    setCallPhase(state, action: PayloadAction<CallPhase>) {
      state.callPhase = action.payload;
    },
    setCallError(state, action: PayloadAction<string | null>) {
      state.callError = action.payload;
    },
    setTokenError(state, action: PayloadAction<string | null>) {
      state.tokenError = action.payload;
    },
    setDialogOpen(state, action: PayloadAction<boolean>) {
      state.dialogOpen = action.payload;
    },
    resetCallUi(state) {
      state.callPhase = 'idle';
      state.callError = null;
      state.dialogOpen = false;
    },
    voiceSessionCleared(state) {
      state.tokenJWT = null;
      state.tokenStatus = 'idle';
      state.tokenError = null;
      state.userNumber = null;
      state.friendlyNumber = null;
      state.numberStatus = 'idle';
      state.registrationStatus = 'idle';
      state.callPhase = 'idle';
      state.callError = null;
      state.dialogOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(ensureVoiceSession.pending, (state) => {
        state.tokenStatus = 'loading';
        state.numberStatus = 'loading';
        state.registrationStatus = 'loading';
        state.tokenError = null;
      })
      .addCase(ensureVoiceSession.fulfilled, (state, action) => {
        state.tokenStatus = 'ready';
        state.numberStatus = 'ready';
        state.registrationStatus = 'registered';
        state.tokenJWT = action.payload.tokenJWT;
        state.userNumber = action.payload.userNumber;
        state.friendlyNumber = action.payload.friendlyNumber;
      })
      .addCase(ensureVoiceSession.rejected, (state, action) => {
        state.tokenStatus = 'error';
        state.numberStatus = 'error';
        state.registrationStatus = 'error';
        state.tokenError =
          action.error.message ?? String(action.payload ?? 'Error al preparar VoIP');
      });
  },
});

export const {
  setRegistrationStatus,
  setCallPhase,
  setCallError,
  setTokenError,
  setDialogOpen,
  resetCallUi,
  voiceSessionCleared,
} = twilioVoiceSlice.actions;

export default twilioVoiceSlice.reducer;
