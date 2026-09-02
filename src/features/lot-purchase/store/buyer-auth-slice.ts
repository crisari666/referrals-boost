import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  clearBuyerSession,
  loginBuyer,
  readBuyerSession,
  registerBuyer,
  updateBuyerProfile,
} from '@/features/lot-purchase/services/lot-purchase.service';
import type {
  BuyerProfile,
  BuyerSession,
} from '@/features/lot-purchase/types/lot-purchase.types';

type BuyerAuthState = {
  session: BuyerSession | null;
  isAuthenticated: boolean;
  error: string | null;
};

function getInitialState(): BuyerAuthState {
  const session = readBuyerSession();
  return {
    session,
    isAuthenticated: Boolean(session),
    error: null,
  };
}

const buyerAuthSlice = createSlice({
  name: 'buyerAuth',
  initialState: getInitialState(),
  reducers: {
    buyerRegister(
      state,
      action: PayloadAction<{
        email: string;
        password: string;
        fullName: string;
      }>,
    ) {
      state.error = null;
      try {
        state.session = registerBuyer(action.payload);
        state.isAuthenticated = true;
      } catch (err) {
        state.error =
          err instanceof Error && err.message === 'EMAIL_TAKEN'
            ? 'EMAIL_TAKEN'
            : 'REGISTER_FAILED';
        state.isAuthenticated = false;
        state.session = null;
      }
    },
    buyerLogin(
      state,
      action: PayloadAction<{ email: string; password: string }>,
    ) {
      state.error = null;
      try {
        state.session = loginBuyer(action.payload);
        state.isAuthenticated = true;
      } catch {
        state.error = 'INVALID_CREDENTIALS';
        state.isAuthenticated = false;
        state.session = null;
      }
    },
    buyerLogout(state) {
      clearBuyerSession();
      state.session = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    buyerClearError(state) {
      state.error = null;
    },
    buyerUpdateProfile(
      state,
      action: PayloadAction<
        Partial<
          Pick<BuyerProfile, 'fullName' | 'documentId' | 'city' | 'email' | 'phone'>
        >
      >,
    ) {
      if (!state.session) return;
      try {
        const buyer = updateBuyerProfile(state.session.buyer.id, action.payload);
        state.session = { ...state.session, buyer };
        state.error = null;
      } catch {
        state.error = 'UPDATE_FAILED';
      }
    },
  },
});

export const {
  buyerRegister,
  buyerLogin,
  buyerLogout,
  buyerClearError,
  buyerUpdateProfile,
} = buyerAuthSlice.actions;

export default buyerAuthSlice.reducer;
