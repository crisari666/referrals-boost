import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import i18n from '@/i18n';
import * as leadConversationService from '@/services/leadConversationService';
import type {
  LeadConversationMessageItem,
  LeadConversationMessagesPage,
  LeadConversationSummary,
} from '@/services/leadConversationService.types';

type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

type LeadConversationState = {
  customerId: string | null;
  summary: LeadConversationSummary | null;
  summaryStatus: LoadStatus;
  summaryError: string | null;
  messages: LeadConversationMessageItem[];
  messagesNextBefore: string | null;
  messagesStatus: LoadStatus;
  messagesError: string | null;
};

const initialState: LeadConversationState = {
  customerId: null,
  summary: null,
  summaryStatus: 'idle',
  summaryError: null,
  messages: [],
  messagesNextBefore: null,
  messagesStatus: 'idle',
  messagesError: null,
};

const readErrorMessage = (err: unknown, fallbackKey: string): string =>
  err && typeof err === 'object' && 'message' in err
    ? String((err as { message: string }).message)
    : i18n.t(fallbackKey);

export const fetchLeadConversationSummary = createAsyncThunk<
  LeadConversationSummary,
  string,
  { rejectValue: string }
>('leadConversation/fetchSummary', async (customerId, { rejectWithValue }) => {
  try {
    return await leadConversationService.getLeadConversationSummary(customerId);
  } catch (err: unknown) {
    return rejectWithValue(readErrorMessage(err, 'clients.leadQualificationLoadFailed'));
  }
});

export const fetchLeadConversationMessages = createAsyncThunk<
  LeadConversationMessagesPage,
  { customerId: string; before?: string },
  { rejectValue: string }
>('leadConversation/fetchMessages', async ({ customerId, before }, { rejectWithValue }) => {
  try {
    return await leadConversationService.getLeadConversationMessages(customerId, before);
  } catch (err: unknown) {
    return rejectWithValue(readErrorMessage(err, 'clients.leadChatLoadFailed'));
  }
});

const leadConversationSlice = createSlice({
  name: 'leadConversation',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeadConversationSummary.pending, (state, action) => {
        if (state.customerId !== action.meta.arg) {
          state.summary = null;
          state.messages = [];
          state.messagesNextBefore = null;
          state.messagesStatus = 'idle';
        }
        state.customerId = action.meta.arg;
        state.summaryStatus = 'loading';
        state.summaryError = null;
      })
      .addCase(fetchLeadConversationSummary.fulfilled, (state, action) => {
        state.summaryStatus = 'succeeded';
        state.summary = action.payload;
      })
      .addCase(fetchLeadConversationSummary.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.summaryStatus = 'failed';
        state.summaryError = action.payload ?? i18n.t('clients.leadQualificationLoadFailed');
      })
      .addCase(fetchLeadConversationMessages.pending, (state, action) => {
        if (!action.meta.arg.before) {
          state.messages = [];
          state.messagesNextBefore = null;
        }
        state.messagesStatus = 'loading';
        state.messagesError = null;
      })
      .addCase(fetchLeadConversationMessages.fulfilled, (state, action) => {
        const isOlderPage = Boolean(action.meta.arg.before);
        state.messagesStatus = 'succeeded';
        state.messages = isOlderPage ? [...action.payload.items, ...state.messages] : action.payload.items;
        state.messagesNextBefore = action.payload.nextBefore ?? null;
      })
      .addCase(fetchLeadConversationMessages.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.messagesStatus = 'failed';
        state.messagesError = action.payload ?? i18n.t('clients.leadChatLoadFailed');
      });
  },
});

export default leadConversationSlice.reducer;
