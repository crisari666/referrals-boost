import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  buildPricingFromTotal,
} from '@/features/lot-purchase/services/lot-purchase.service';
import {
  PURCHASE_DRAFT_TTL_MS,
  type PurchaseDraft,
  type PurchaseDraftLot,
  type PurchasePricing,
} from '@/features/lot-purchase/types/lot-purchase.types';

type PurchaseDraftState = {
  draft: PurchaseDraft | null;
};

const DRAFT_KEY = 'referrals-boost:lot-purchase-draft';

function readDraft(): PurchaseDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as PurchaseDraft;
    if (!draft?.lot?.lotId || !draft.expiresAt) return null;
    if (new Date(draft.expiresAt).getTime() <= Date.now()) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

function persistDraft(draft: PurchaseDraft | null): void {
  if (!draft) {
    localStorage.removeItem(DRAFT_KEY);
    return;
  }
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

const purchaseDraftSlice = createSlice({
  name: 'purchaseDraft',
  initialState: { draft: readDraft() } as PurchaseDraftState,
  reducers: {
    startPurchaseDraft(state, action: PayloadAction<PurchaseDraftLot>) {
      const lot = action.payload;
      const draft: PurchaseDraft = {
        lot,
        expiresAt: new Date(Date.now() + PURCHASE_DRAFT_TTL_MS).toISOString(),
        buyerData: null,
        legalAccepted: false,
        pricing: buildPricingFromTotal(lot.price),
        orderId: null,
      };
      state.draft = draft;
      persistDraft(draft);
    },
    setDraftBuyerData(
      state,
      action: PayloadAction<NonNullable<PurchaseDraft['buyerData']>>,
    ) {
      if (!state.draft) return;
      state.draft = { ...state.draft, buyerData: action.payload };
      persistDraft(state.draft);
    },
    setDraftLegalAccepted(state, action: PayloadAction<boolean>) {
      if (!state.draft) return;
      state.draft = { ...state.draft, legalAccepted: action.payload };
      persistDraft(state.draft);
    },
    setDraftPricing(state, action: PayloadAction<PurchasePricing>) {
      if (!state.draft) return;
      state.draft = { ...state.draft, pricing: action.payload };
      persistDraft(state.draft);
    },
    setDraftOrderId(state, action: PayloadAction<string>) {
      if (!state.draft) return;
      state.draft = { ...state.draft, orderId: action.payload };
      persistDraft(state.draft);
    },
    clearPurchaseDraft(state) {
      state.draft = null;
      persistDraft(null);
    },
  },
});

export const {
  startPurchaseDraft,
  setDraftBuyerData,
  setDraftLegalAccepted,
  setDraftPricing,
  setDraftOrderId,
  clearPurchaseDraft,
} = purchaseDraftSlice.actions;

export default purchaseDraftSlice.reducer;
