import type { PurchaseOrderStatus } from '@/features/lot-purchase/types/lot-purchase.types';

export const ORDER_STATUS_LABEL_KEY: Record<PurchaseOrderStatus, string> = {
  draft: 'lotPurchase.statusDraft',
  pending_payment: 'lotPurchase.statusPendingPayment',
  partially_paid: 'lotPurchase.statusPartiallyPaid',
  paid: 'lotPurchase.statusPaid',
  cancelled: 'lotPurchase.statusCancelled',
};
