export type PurchaseOrderStatus =
  | 'draft'
  | 'pending_payment'
  | 'partially_paid'
  | 'paid'
  | 'cancelled';

export type PurchaseWizardStep =
  | 'resumen'
  | 'cuenta'
  | 'datos'
  | 'legal'
  | 'pago'
  | 'exito';

export type BuyerProfile = {
  id: string;
  fullName: string;
  documentId: string;
  city: string;
  email: string;
  phone: string;
  createdAt: string;
};

export type BuyerSession = {
  buyer: BuyerProfile;
  token: string;
};

export type PurchasePricing = {
  total: number;
  downPayment: number;
  installmentCount: number;
  installmentAmount: number;
};

export type PurchasePayment = {
  id: string;
  amount: number;
  label: string;
  paidAt: string;
};

export type PurchaseOrder = {
  id: string;
  projectId: string;
  projectTitle: string;
  lotId: string;
  lotNumber: string;
  lotArea: number;
  status: PurchaseOrderStatus;
  buyer: BuyerProfile;
  pricing: PurchasePricing;
  paidTotal: number;
  legalAcceptedAt: string | null;
  payments: PurchasePayment[];
  createdAt: string;
  updatedAt: string;
};

export type PurchaseDraftLot = {
  projectId: string;
  projectTitle: string;
  lotId: string;
  lotNumber: string;
  lotArea: number;
  price: number;
  stageName: string;
};

export type PurchaseDraft = {
  lot: PurchaseDraftLot;
  expiresAt: string;
  buyerData: {
    fullName: string;
    documentId: string;
    city: string;
    email: string;
    phone: string;
  } | null;
  legalAccepted: boolean;
  pricing: PurchasePricing | null;
  orderId: string | null;
};

export const PURCHASE_WIZARD_STEPS: PurchaseWizardStep[] = [
  'resumen',
  'cuenta',
  'datos',
  'legal',
  'pago',
  'exito',
];

export const PURCHASE_DRAFT_TTL_MS = 15 * 60 * 1000;

export const DEFAULT_INSTALLMENT_COUNT = 12;
export const DEFAULT_DOWN_PAYMENT_RATIO = 0.2;
