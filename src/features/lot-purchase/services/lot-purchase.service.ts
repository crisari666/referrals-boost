import {
  DEFAULT_DOWN_PAYMENT_RATIO,
  DEFAULT_INSTALLMENT_COUNT,
  type BuyerProfile,
  type BuyerSession,
  type PurchaseDraftLot,
  type PurchaseOrder,
  type PurchasePayment,
  type PurchasePricing,
} from '@/features/lot-purchase/types/lot-purchase.types';

const BUYERS_KEY = 'referrals-boost:lot-purchase-buyers';
const ORDERS_KEY = 'referrals-boost:lot-purchase-orders';
const SESSION_KEY = 'referrals-boost:lot-purchase-buyer-session';

type StoredBuyer = BuyerProfile & { password: string };

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function buildPricingFromTotal(total: number): PurchasePricing {
  const safeTotal = Math.max(0, Math.round(total));
  const downPayment = Math.round(safeTotal * DEFAULT_DOWN_PAYMENT_RATIO);
  const remainder = Math.max(0, safeTotal - downPayment);
  const installmentCount = DEFAULT_INSTALLMENT_COUNT;
  const installmentAmount =
    installmentCount > 0 ? Math.round(remainder / installmentCount) : 0;
  return {
    total: safeTotal,
    downPayment,
    installmentCount,
    installmentAmount,
  };
}

export function readBuyerSession(): BuyerSession | null {
  const session = readJson<BuyerSession | null>(SESSION_KEY, null);
  if (!session?.token || !session.buyer?.id) return null;
  return session;
}

export function clearBuyerSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function registerBuyer(input: {
  email: string;
  password: string;
  fullName: string;
  documentId?: string;
  city?: string;
  phone?: string;
}): BuyerSession {
  const buyers = readJson<StoredBuyer[]>(BUYERS_KEY, []);
  const email = input.email.trim().toLowerCase();
  if (buyers.some((buyer) => buyer.email === email)) {
    throw new Error('EMAIL_TAKEN');
  }
  const now = new Date().toISOString();
  const buyer: StoredBuyer = {
    id: createId('buyer'),
    fullName: input.fullName.trim() || email.split('@')[0],
    documentId: input.documentId?.trim() ?? '',
    city: input.city?.trim() ?? '',
    email,
    phone: input.phone?.trim() ?? '',
    createdAt: now,
    password: input.password,
  };
  buyers.push(buyer);
  writeJson(BUYERS_KEY, buyers);
  const session: BuyerSession = {
    buyer: {
      id: buyer.id,
      fullName: buyer.fullName,
      documentId: buyer.documentId,
      city: buyer.city,
      email: buyer.email,
      phone: buyer.phone,
      createdAt: buyer.createdAt,
    },
    token: createId('btoken'),
  };
  writeJson(SESSION_KEY, session);
  return session;
}

export function loginBuyer(input: {
  email: string;
  password: string;
}): BuyerSession {
  const buyers = readJson<StoredBuyer[]>(BUYERS_KEY, []);
  const email = input.email.trim().toLowerCase();
  const found = buyers.find(
    (buyer) => buyer.email === email && buyer.password === input.password,
  );
  if (!found) {
    throw new Error('INVALID_CREDENTIALS');
  }
  const session: BuyerSession = {
    buyer: {
      id: found.id,
      fullName: found.fullName,
      documentId: found.documentId,
      city: found.city,
      email: found.email,
      phone: found.phone,
      createdAt: found.createdAt,
    },
    token: createId('btoken'),
  };
  writeJson(SESSION_KEY, session);
  return session;
}

export function updateBuyerProfile(
  buyerId: string,
  patch: Partial<
    Pick<BuyerProfile, 'fullName' | 'documentId' | 'city' | 'email' | 'phone'>
  >,
): BuyerProfile {
  const buyers = readJson<StoredBuyer[]>(BUYERS_KEY, []);
  const index = buyers.findIndex((buyer) => buyer.id === buyerId);
  if (index < 0) {
    throw new Error('BUYER_NOT_FOUND');
  }
  const next: StoredBuyer = {
    ...buyers[index],
    ...patch,
    email: (patch.email ?? buyers[index].email).trim().toLowerCase(),
  };
  buyers[index] = next;
  writeJson(BUYERS_KEY, buyers);
  const session = readBuyerSession();
  if (session?.buyer.id === buyerId) {
    const updatedSession: BuyerSession = {
      ...session,
      buyer: {
        id: next.id,
        fullName: next.fullName,
        documentId: next.documentId,
        city: next.city,
        email: next.email,
        phone: next.phone,
        createdAt: next.createdAt,
      },
    };
    writeJson(SESSION_KEY, updatedSession);
    return updatedSession.buyer;
  }
  return {
    id: next.id,
    fullName: next.fullName,
    documentId: next.documentId,
    city: next.city,
    email: next.email,
    phone: next.phone,
    createdAt: next.createdAt,
  };
}

export function listOrdersForBuyer(buyerId: string): PurchaseOrder[] {
  const orders = readJson<PurchaseOrder[]>(ORDERS_KEY, []);
  return orders
    .filter((order) => order.buyer.id === buyerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getOrderById(orderId: string): PurchaseOrder | null {
  const orders = readJson<PurchaseOrder[]>(ORDERS_KEY, []);
  return orders.find((order) => order.id === orderId) ?? null;
}

export function createPurchaseOrder(input: {
  lot: PurchaseDraftLot;
  buyer: BuyerProfile;
  pricing: PurchasePricing;
  legalAcceptedAt: string;
}): PurchaseOrder {
  const now = new Date().toISOString();
  const downPayment: PurchasePayment = {
    id: createId('pay'),
    amount: input.pricing.downPayment,
    label: 'down_payment',
    paidAt: now,
  };
  const order: PurchaseOrder = {
    id: createId('order'),
    projectId: input.lot.projectId,
    projectTitle: input.lot.projectTitle,
    lotId: input.lot.lotId,
    lotNumber: input.lot.lotNumber,
    lotArea: input.lot.lotArea,
    status: 'partially_paid',
    buyer: input.buyer,
    pricing: input.pricing,
    paidTotal: input.pricing.downPayment,
    legalAcceptedAt: input.legalAcceptedAt,
    payments: [downPayment],
    createdAt: now,
    updatedAt: now,
  };
  const orders = readJson<PurchaseOrder[]>(ORDERS_KEY, []);
  orders.push(order);
  writeJson(ORDERS_KEY, orders);
  return order;
}

export function simulateInstallmentPayment(orderId: string): PurchaseOrder {
  const orders = readJson<PurchaseOrder[]>(ORDERS_KEY, []);
  const index = orders.findIndex((order) => order.id === orderId);
  if (index < 0) {
    throw new Error('ORDER_NOT_FOUND');
  }
  const order = orders[index];
  const remaining = Math.max(0, order.pricing.total - order.paidTotal);
  if (remaining <= 0) {
    return order;
  }
  const amount = Math.min(order.pricing.installmentAmount || remaining, remaining);
  const now = new Date().toISOString();
  const payment: PurchasePayment = {
    id: createId('pay'),
    amount,
    label: 'installment',
    paidAt: now,
  };
  const paidTotal = order.paidTotal + amount;
  const status: PurchaseOrder['status'] =
    paidTotal >= order.pricing.total ? 'paid' : 'partially_paid';
  const next: PurchaseOrder = {
    ...order,
    paidTotal,
    status,
    payments: [...order.payments, payment],
    updatedAt: now,
  };
  orders[index] = next;
  writeJson(ORDERS_KEY, orders);
  return next;
}
