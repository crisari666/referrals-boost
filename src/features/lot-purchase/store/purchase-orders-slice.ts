import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  createPurchaseOrder,
  getOrderById,
  listOrdersForBuyer,
  simulateInstallmentPayment,
} from '@/features/lot-purchase/services/lot-purchase.service';
import type {
  BuyerProfile,
  PurchaseDraftLot,
  PurchaseOrder,
  PurchasePricing,
} from '@/features/lot-purchase/types/lot-purchase.types';

type PurchaseOrdersState = {
  orders: PurchaseOrder[];
  selectedOrder: PurchaseOrder | null;
  error: string | null;
};

const purchaseOrdersSlice = createSlice({
  name: 'purchaseOrders',
  initialState: {
    orders: [],
    selectedOrder: null,
    error: null,
  } as PurchaseOrdersState,
  reducers: {
    loadBuyerOrders(state, action: PayloadAction<string>) {
      state.orders = listOrdersForBuyer(action.payload);
      state.error = null;
    },
    loadOrderById(state, action: PayloadAction<string>) {
      state.selectedOrder = getOrderById(action.payload);
      state.error = state.selectedOrder ? null : 'ORDER_NOT_FOUND';
    },
    placePurchaseOrder(
      state,
      action: PayloadAction<{
        lot: PurchaseDraftLot;
        buyer: BuyerProfile;
        pricing: PurchasePricing;
        legalAcceptedAt: string;
      }>,
    ) {
      try {
        const order = createPurchaseOrder(action.payload);
        state.orders = [order, ...state.orders.filter((item) => item.id !== order.id)];
        state.selectedOrder = order;
        state.error = null;
      } catch {
        state.error = 'CREATE_FAILED';
      }
    },
    payMockInstallment(state, action: PayloadAction<string>) {
      try {
        const order = simulateInstallmentPayment(action.payload);
        state.selectedOrder = order;
        state.orders = state.orders.map((item) =>
          item.id === order.id ? order : item,
        );
        state.error = null;
      } catch {
        state.error = 'PAYMENT_FAILED';
      }
    },
    clearPurchaseOrdersError(state) {
      state.error = null;
    },
  },
});

export const {
  loadBuyerOrders,
  loadOrderById,
  placePurchaseOrder,
  payMockInstallment,
  clearPurchaseOrdersError,
} = purchaseOrdersSlice.actions;

export default purchaseOrdersSlice.reducer;
