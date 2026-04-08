/**
 * Clients service — all requests go through the centralized http client.
 *
 * NOTE: All requests from this service must include the auth token header.
 */

import * as http from "@/lib/http";
import { APP_CONSTANTS } from "@/constants/app-constants";
import type { AuthUser } from "@/store/authSlice";

type WithTokenHeaders<T extends http.HttpOptions | undefined> = T extends http.HttpOptions
  ? http.HttpOptions
  : http.HttpOptions | undefined;

function getAuthHeaders(): Record<string, string> {
  try {
    const raw = localStorage.getItem(APP_CONSTANTS.AUTH_USER_STORAGE_KEY);
    if (!raw) return {};
    const user = JSON.parse(raw) as AuthUser | null;
    if (!user?.token) return {};
    return {
      Token: user.token,
      userId: user.id,
      level: String(user.level),
    };
  } catch {
    return {};
  }
}

function withAuth(options?: http.HttpOptions): WithTokenHeaders<typeof options> {
  const authHeaders = getAuthHeaders();
  if (!options) {
    return { headers: authHeaders };
  }
  return {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      ...authHeaders,
    },
  };
}

const CUSTOMERS_BASE = "customers";
const CUSTOMERS_BY_CREATOR_PATH = "customers/by-creator";
const CUSTOMERS_VENDOR_PATH = "customers/vendor";
const CUSTOMER_LOG_SITUATION_PATH = "customer-logs/log-situation";

export type InterestProyectItem = { proyect: string; date: string };

export type CreateVendorCustomerPayload = {
  name: string;
  email: string;
  whatsapp: string;
  phone: string;
  documentType?: string;
  document?: string;
  interestProyect?: InterestProyectItem[];
  notes?: string[];
};

export type CreateCustomerPayload = {
  name: string;
  lastName: string;
  phone: string;
  whatsapp: string;
  email: string;
  document: string;
};

export type Customer = {
  _id: string;
  name: string;
  lastName: string;
  phone: string;
  whatsapp: string;
  email: string;
  document: string;
};

export type CustomerByCreator = {
  _id: string;
  name: string;
  lastName: string;
  phone: string;
  whatsapp: string;
  email: string;
  status: number;
  userCreator: string;
  userAssigned: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CustomersByCreatorResponse = ApiResponse<CustomerByCreator[]>;

export type ApiResponse<T> = {
  error: string | null;
  result: T;
  message: string;
};

export type CreateCustomerResponse = ApiResponse<Customer>;

export type VendorCustomer = {
  _id: string;
  name: string;
  lastName?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  document?: string;
  documentType?: string;
};

export type CreateVendorCustomerResponse = ApiResponse<VendorCustomer>;

export type CreateCustomerLogPayload = {
  customer: string;
  note: string;
};

export type Situation = {
  _id: string;
  description: string;
};

export type CustomerLog = {
  _id: string;
  name: string;
  user: string;
  customer: string;
  note: string;
  confirmed: boolean;
  situation: Situation;
  date: string;
  status: number;
  checked: boolean;
  dateChecked: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateCustomerLogResponse = ApiResponse<CustomerLog>;

/** GET {{BASE_URL}}customers/by-creator */
export function getCustomersByCreator() {
  return http.get<CustomersByCreatorResponse>(CUSTOMERS_BY_CREATOR_PATH, withAuth());
}

/** POST {{BASE_URL}}customers/vendor — vendor (level 4) creates customer; notes → CustomerNote rows */
export function createVendorCustomer(payload: CreateVendorCustomerPayload) {
  return http.post<CreateVendorCustomerResponse>(
    CUSTOMERS_VENDOR_PATH,
    payload,
    withAuth()
  );
}

/** POST {{BASE_URL}}customers */
export function createCustomer(payload: CreateCustomerPayload) {
  return http.post<CreateCustomerResponse>(CUSTOMERS_BASE, payload, withAuth());
}

/** POST {{BASE_URL}}customer-logs/log-situation */
export function createCustomerLogSituation(payload: CreateCustomerLogPayload) {
  return http.post<CreateCustomerLogResponse>(
    CUSTOMER_LOG_SITUATION_PATH,
    payload,
    withAuth()
  );
}
