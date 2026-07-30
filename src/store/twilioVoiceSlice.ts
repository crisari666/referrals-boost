import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import i18n from '@/i18n';
import * as voipTokenService from '@/services/voipTokenService';
import * as twilioNumberService from '@/services/twilioNumberService';
import {
  disconnectActiveCall,
  registerTwilioDevice,
  setActiveCallMuted,
} from '@/lib/twilio-voice-runtime';
import type { TwilioCallPhase } from '@/types/twilio-voice';
import type { AuthUser } from '@/types/auth';
import {
  CALL_SCRIPT_STAGES,
  DEFAULT_CALL_STAGE_ID,
  type CallObjectionId,
  type CallStageId,
  type ProjectPillId,
} from '@/features/Clients/call-script/ventor-call-script';

function callStageIndex(stageId: CallStageId): number {
  return CALL_SCRIPT_STAGES.findIndex((stage) => stage.id === stageId);
}

export type CallPhase = TwilioCallPhase;

export type RegistrationStatus = 'idle' | 'loading' | 'registered' | 'error';

export type SessionFieldStatus = 'idle' | 'loading' | 'ready' | 'error';

export type CoachNote = {
  callSid: string;
  message: string;
  supervisorName: string;
  sentAt: string;
};

export type LiveTranscriptLine = {
  callSid: string;
  text: string;
  isFinal: boolean;
  speaker: string | null;
  sentAt: string;
};

export type VoiceScriptSuggestion = {
  callSid: string;
  stageId: CallStageId;
  objectionId: CallObjectionId | null;
  projectPillId: ProjectPillId | null;
  replyIds: string[];
  confidence: number;
  reason: string;
  sentAt: string;
};

export interface TwilioVoiceState {
  tokenJWT: string | null;
  tokenStatus: SessionFieldStatus;
  tokenError: string | null;
  userNumber: string | null;
  friendlyNumber: string | null;
  userInternationalNumber: string | null;
  friendlyInternationalNumber: string | null;
  numberStatus: SessionFieldStatus;
  registrationStatus: RegistrationStatus;
  callPhase: CallPhase;
  callError: string | null;
  isMuted: boolean;
  dialogOpen: boolean;
  coachNotes: CoachNote[];
  supervisorConnected: boolean;
  activeCallSid: string | null;
  activeStageId: CallStageId;
  selectedObjectionId: CallObjectionId | null;
  selectedProjectPillId: ProjectPillId | null;
  stageManualOverride: boolean;
  objectionManualOverride: boolean;
  liveTranscriptLines: LiveTranscriptLine[];
  lastSuggestion: VoiceScriptSuggestion | null;
}

const initialCallScriptState = {
  activeCallSid: null as string | null,
  activeStageId: DEFAULT_CALL_STAGE_ID,
  selectedObjectionId: null as CallObjectionId | null,
  selectedProjectPillId: null as ProjectPillId | null,
  stageManualOverride: false,
  objectionManualOverride: false,
  liveTranscriptLines: [] as LiveTranscriptLine[],
  lastSuggestion: null as VoiceScriptSuggestion | null,
};

const initialState: TwilioVoiceState = {
  tokenJWT: null,
  tokenStatus: 'idle',
  tokenError: null,
  userNumber: null,
  friendlyNumber: null,
  userInternationalNumber: null,
  friendlyInternationalNumber: null,
  numberStatus: 'idle',
  registrationStatus: 'idle',
  callPhase: 'idle',
  callError: null,
  isMuted: false,
  dialogOpen: false,
  coachNotes: [],
  supervisorConnected: false,
  ...initialCallScriptState,
};

export const ensureVoiceSession = createAsyncThunk(
  'twilioVoice/ensureVoiceSession',
  async (_, { getState }) => {
    const { auth } = getState() as { auth: { user: AuthUser | null } };
    const email = auth.user?.email;
    if (!email) {
      throw new Error(i18n.t('twilio.noSession'));
    }
    const [tokenResult, numbersResult] = await Promise.all([
      voipTokenService.fetchVoipAccessToken(email),
      twilioNumberService.fetchUserTwilioNumbers(),
    ]);
    const regularNumber = numbersResult.regular?.number ?? null;
    if (!regularNumber) {
      throw new Error(i18n.t('twilio.twilioNumberFetchFailed'));
    }
    await registerTwilioDevice(tokenResult.tokenJWT);
    return {
      tokenJWT: tokenResult.tokenJWT,
      userNumber: regularNumber,
      friendlyNumber: numbersResult.regular?.friendlyNumber ?? null,
      userInternationalNumber: numbersResult.international?.number ?? null,
      friendlyInternationalNumber: numbersResult.international?.friendlyNumber ?? null,
    };
  }
);

export const hangUpVoiceCall = createAsyncThunk('twilioVoice/hangUp', async () => {
  disconnectActiveCall();
});

export const toggleCallMute = createAsyncThunk(
  'twilioVoice/toggleMute',
  async (_, { getState }) => {
    const { twilioVoice } = getState() as { twilioVoice: TwilioVoiceState };
    const nextMuted = !twilioVoice.isMuted;
    const actualMuted = setActiveCallMuted(nextMuted);
    return actualMuted ?? twilioVoice.isMuted;
  },
);

const twilioVoiceSlice = createSlice({
  name: 'twilioVoice',
  initialState,
  reducers: {
    setRegistrationStatus(state, action: PayloadAction<RegistrationStatus>) {
      state.registrationStatus = action.payload;
    },
    setCallPhase(state, action: PayloadAction<CallPhase>) {
      state.callPhase = action.payload;
      if (
        action.payload === 'closed' ||
        action.payload === 'idle' ||
        action.payload === 'error'
      ) {
        state.isMuted = false;
      }
    },
    setCallError(state, action: PayloadAction<string | null>) {
      state.callError = action.payload;
    },
    setCallMuted(state, action: PayloadAction<boolean>) {
      state.isMuted = action.payload;
    },
    setTokenError(state, action: PayloadAction<string | null>) {
      state.tokenError = action.payload;
    },
    setDialogOpen(state, action: PayloadAction<boolean>) {
      state.dialogOpen = action.payload;
    },
    setActiveCallSid(state, action: PayloadAction<string | null>) {
      state.activeCallSid = action.payload;
    },
    appendCoachNote(state, action: PayloadAction<CoachNote>) {
      state.coachNotes.push(action.payload);
      state.supervisorConnected = true;
    },
    setCallScriptStage(state, action: PayloadAction<CallStageId>) {
      state.activeStageId = action.payload;
      state.stageManualOverride = true;
      if (action.payload !== 'pildora') {
        state.selectedProjectPillId = null;
      }
    },
    selectCallObjection(state, action: PayloadAction<CallObjectionId | null>) {
      state.selectedObjectionId = action.payload;
      state.objectionManualOverride = action.payload !== null;
    },
    selectProjectPill(state, action: PayloadAction<ProjectPillId | null>) {
      state.selectedProjectPillId = action.payload;
      state.activeStageId = 'pildora';
      state.stageManualOverride = true;
    },
    appendLiveTranscriptLine(state, action: PayloadAction<LiveTranscriptLine>) {
      const line = action.payload;
      if (!line.isFinal) {
        const last = state.liveTranscriptLines[state.liveTranscriptLines.length - 1];
        if (last && !last.isFinal && last.speaker === line.speaker) {
          state.liveTranscriptLines[state.liveTranscriptLines.length - 1] = line;
          return;
        }
        state.liveTranscriptLines.push(line);
        if (state.liveTranscriptLines.length > 40) {
          state.liveTranscriptLines.shift();
        }
        return;
      }
      const last = state.liveTranscriptLines[state.liveTranscriptLines.length - 1];
      if (last && !last.isFinal) {
        state.liveTranscriptLines[state.liveTranscriptLines.length - 1] = line;
      } else {
        state.liveTranscriptLines.push(line);
      }
      if (state.liveTranscriptLines.length > 40) {
        state.liveTranscriptLines.shift();
      }
    },
    applyVoiceScriptSuggestion(state, action: PayloadAction<VoiceScriptSuggestion>) {
      const suggestion = action.payload;
      state.lastSuggestion = suggestion;
      const currentIndex = callStageIndex(state.activeStageId);
      const suggestedIndex = callStageIndex(suggestion.stageId);
      const canAutoAdvance =
        !state.stageManualOverride || suggestion.confidence >= 0.85;
      if (canAutoAdvance && suggestedIndex >= currentIndex) {
        // Keep focus: never jump backward; allow same stage or forward.
        state.activeStageId = suggestion.stageId;
        if (suggestion.confidence >= 0.85) {
          state.stageManualOverride = false;
        }
      }
      if (suggestion.objectionId) {
        if (!state.objectionManualOverride || suggestion.confidence >= 0.85) {
          state.selectedObjectionId = suggestion.objectionId;
          if (suggestion.confidence >= 0.85) {
            state.objectionManualOverride = false;
          }
        }
      } else if (!state.objectionManualOverride && suggestion.confidence >= 0.6) {
        state.selectedObjectionId = null;
      }
      if (suggestion.projectPillId) {
        state.selectedProjectPillId = suggestion.projectPillId;
      }
    },
    initCallScriptUi(state) {
      state.activeStageId = DEFAULT_CALL_STAGE_ID;
      state.selectedObjectionId = null;
      state.selectedProjectPillId = null;
      state.stageManualOverride = false;
      state.objectionManualOverride = false;
      state.liveTranscriptLines = [];
      state.lastSuggestion = null;
    },
    resetCallUi(state) {
      state.callPhase = 'idle';
      state.callError = null;
      state.isMuted = false;
      state.dialogOpen = false;
      state.coachNotes = [];
      state.supervisorConnected = false;
      Object.assign(state, initialCallScriptState);
    },
    voiceSessionCleared(state) {
      state.tokenJWT = null;
      state.tokenStatus = 'idle';
      state.tokenError = null;
      state.userNumber = null;
      state.friendlyNumber = null;
      state.userInternationalNumber = null;
      state.friendlyInternationalNumber = null;
      state.numberStatus = 'idle';
      state.registrationStatus = 'idle';
      state.callPhase = 'idle';
      state.callError = null;
      state.dialogOpen = false;
      state.coachNotes = [];
      state.supervisorConnected = false;
      Object.assign(state, initialCallScriptState);
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
        state.userInternationalNumber = action.payload.userInternationalNumber;
        state.friendlyInternationalNumber = action.payload.friendlyInternationalNumber;
      })
      .addCase(ensureVoiceSession.rejected, (state, action) => {
        state.tokenStatus = 'error';
        state.numberStatus = 'error';
        state.registrationStatus = 'error';
        state.tokenError =
          action.error.message ?? String(action.payload ?? i18n.t('twilio.prepareError'));
      })
      .addCase(toggleCallMute.fulfilled, (state, action) => {
        state.isMuted = action.payload;
      });
  },
});

export const {
  setRegistrationStatus,
  setCallPhase,
  setCallError,
  setTokenError,
  setCallMuted,
  setDialogOpen,
  setActiveCallSid,
  appendCoachNote,
  setCallScriptStage,
  selectCallObjection,
  selectProjectPill,
  appendLiveTranscriptLine,
  applyVoiceScriptSuggestion,
  initCallScriptUi,
  resetCallUi,
  voiceSessionCleared,
} = twilioVoiceSlice.actions;

export default twilioVoiceSlice.reducer;
