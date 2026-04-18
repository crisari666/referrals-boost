/**
 * Clients service — all requests go through the centralized http client.
 *
 * NOTE: All requests from this service must include the auth token header.
 */

import * as http from "@/lib/http";
import { getStoredAuthToken } from "@/lib/auth-token";
import { APP_CONSTANTS } from "@/constants/app-constants";
import type { AuthUser } from "@/store/authSlice";
import type {
  CreateCustomerLogPayload,
  CreateCustomerLogResponse,
  CreateCustomerPayload,
  CreateCustomerResponse,
  CreateVendorCustomerPayload,
  CreateVendorCustomerResponse,
  CreationDetailCustomer,
  CreationDetailNote,
  CustomerByCreator,
  CustomerByIdResponse,
  CustomerCreationDetailPayload,
  CustomerCreationDetailResponse,
  CustomersByCreatorResponse,
  InterestProyectItem,
  MsCustomerDocument,
  MsCustomerMineRow,
  VendorCustomer,
} from "./clientsService.types";

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

function getCustomersMsOrigin(): string {
  const raw = import.meta.env.VITE_URL_CUSTOMERS_MS?.trim();
  if (!raw) {
    throw new Error("VITE_URL_CUSTOMERS_MS is not configured");
  }
  return raw.replace(/\/$/, "");
}

function customersMsUrl(pathAfterOrigin: string): string {
  const origin = getCustomersMsOrigin();
  const p = pathAfterOrigin.replace(/^\//, "");
  return `${origin}/${p}`;
}

/** Customers MS expects JWT in `TOKEN` header (see crm-omega-customers-ms). */
function withCustomersMsAuth(options?: http.HttpOptions): http.HttpOptions {
  const token = getStoredAuthToken();
  const headers: Record<string, string> = { ...(options?.headers ?? {}) };
  if (token) {
    headers.TOKEN = token;
  }
  return { ...options, headers };
}

function toMsDocumentType(raw?: string): "cc" | "passport" | undefined {
  if (!raw?.trim()) return undefined;
  const v = raw.trim().toLowerCase();
  if (v === "cc" || v === "cedula" || v === "cédula") return "cc";
  if (v === "passport" || v === "pasaporte") return "passport";
  return undefined;
}

function msInterestDateToYmd(value: string | Date | undefined): string {
  if (value == null) return new Date().toISOString().slice(0, 10);
  if (typeof value === "string") {
    const head = value.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(head)) return head;
    const ms = Date.parse(value);
    if (!Number.isNaN(ms)) return new Date(ms).toISOString().slice(0, 10);
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

function mapMsRowToCreationDetailCustomer(
  row: MsCustomerMineRow
): CreationDetailCustomer {
  const projects = row.interestedProjects ?? [];
  const interestProyect: InterestProyectItem[] | undefined =
    projects.length > 0
      ? projects.map((p) => ({
          proyect: p.projectId,
          date: msInterestDateToYmd(p.date),
        }))
      : undefined;

  return {
    name: row.name ?? "",
    lastName: row.lastName,
    email: row.email,
    whatsapp: row.whatsapp,
    phone: row.phone,
    document: row.document,
    documentType: row.documentType,
    interestProyect,
    createdAt: row.createdAt,
    userCreator: row.createdBy,
    status: 0,
  };
}

function mapMsDescriptionLinesToNotes(
  row: MsCustomerMineRow,
  customerId: string
): CreationDetailNote[] {
  const lines = row.description ?? [];
  const fallbackStamp = row.createdAt ?? row.updatedAt ?? new Date().toISOString();
  return lines.map((item, i) => {
    if (typeof item === "string") {
      return {
        _id: `ms-desc-${customerId}-${i}`,
        customerId,
        note: item,
        user: row.createdBy ?? "",
        createdAt: fallbackStamp,
        updatedAt: row.updatedAt ?? fallbackStamp,
      };
    }
    const stamp = item.date ?? fallbackStamp;
    return {
      _id: String(item._id ?? `ms-desc-${customerId}-${i}`),
      customerId: String(item.customerId ?? customerId),
      note: item.description,
      user: item.user,
      createdAt: stamp,
      updatedAt: stamp,
    };
  });
}

/** Maps customers MS list row to legacy CRM shape for existing UI. */
function mapMsMineRowToCustomerByCreator(row: MsCustomerMineRow): CustomerByCreator {
  const created = row.createdAt ?? new Date().toISOString();
  return {
    _id: String(row._id),
    name: row.name ?? "",
    lastName: row.lastName ?? "",
    phone: row.phone ?? "",
    whatsapp: row.whatsapp ?? "",
    email: row.email ?? "",
    status: 0,
    userCreator: row.createdBy ?? "",
    userAssigned: null,
    createdAt: created,
    updatedAt: row.updatedAt ?? created,
  };
}

const CUSTOMERS_BASE = "customers";
const CUSTOMER_LOG_SITUATION_PATH = "customer-logs/log-situation";

export type * from "./clientsService.types";

/**
 * Lists customers created by the authenticated user (customers MS `GET customer/mine`).
 * Wraps plain JSON array as `ApiResponse` for callers that expect monolith shape.
 */
export async function getCustomersByCreator(): Promise<CustomersByCreatorResponse> {
  const rows = await http.get<MsCustomerMineRow[]>("", {
    url: customersMsUrl("customer/mine"),
    ...withCustomersMsAuth(),
  });
  const list = Array.isArray(rows) ? rows : [];
  return {
    error: null,
    result: list.map(mapMsMineRowToCustomerByCreator),
    message: "success",
  };
}

/** GET {{BASE_URL}}customers/:customerId */
export function getCustomerById(customerId: string) {
  return http.get<CustomerByIdResponse>(
    `${CUSTOMERS_BASE}/${encodeURIComponent(customerId)}`,
    withAuth()
  );
}

/**
 * Customer detail for vendor UI: customers MS `GET customer/:customerId`,
 * mapped to legacy `creation-detail` payload (no situation logs from MS yet).
 */
export async function getCustomerCreationDetail(
  customerId: string
): Promise<CustomerCreationDetailResponse> {
  const row = await http.get<MsCustomerMineRow>("", {
    url: customersMsUrl(`customer/${encodeURIComponent(customerId)}`),
    ...withCustomersMsAuth(),
  });
  const id = String(row._id ?? customerId);
  const payload: CustomerCreationDetailPayload = {
    customer: mapMsRowToCreationDetailCustomer(row),
    notes: mapMsDescriptionLinesToNotes(row, id),
    customerLogSituations: [],
  };
  return {
    error: null,
    result: payload,
    message: "success",
  };
}

/**
 * Vendor create via customers MS: POST `customer`, then parallel
 * `customer/:id/descriptions` (each note) and `customer/:id/projects` (each interest).
 * Response shape matches monolith `ApiResponse<VendorCustomer>` for callers.
 */
export async function createVendorCustomer(
  payload: CreateVendorCustomerPayload
): Promise<CreateVendorCustomerResponse> {
  const docType = toMsDocumentType(payload.documentType);
  const createBody: Record<string, unknown> = {
    name: payload.name.trim(),
    lastName: "",
    phone: payload.phone.trim(),
    whatsapp: payload.whatsapp.trim(),
    email: payload.email.trim(),
  };
  if (payload.document?.trim()) {
    createBody.document = payload.document.trim();
  }
  if (docType) {
    createBody.documentType = docType;
  }

  const msOpts = withCustomersMsAuth();
  const created = await http.post<MsCustomerDocument>("", createBody, {
    url: customersMsUrl("customer"),
    ...msOpts,
  });

  const customerId = String(created._id);
  const noteTexts = (payload.notes ?? [])
    .map((n) => n.trim())
    .filter((n) => n.length > 0);
  const interests = (payload.interestProyect ?? [])
    .map((item) => ({
      projectId: item.proyect.trim(),
      date: item.date.trim(),
    }))
    .filter((item) => item.projectId.length > 0);

  const descriptionRequests = noteTexts.map((description) =>
    http.post<unknown>("", { description }, {
      url: customersMsUrl(
        `customer/${encodeURIComponent(customerId)}/descriptions`
      ),
      ...withCustomersMsAuth(),
    })
  );

  const projectRequests = interests.map(({ projectId, date }) => {
    const body: { projectId: string; date?: string } = { projectId };
    const iso = Date.parse(date);
    if (!Number.isNaN(iso)) {
      body.date = new Date(iso).toISOString();
    }
    return http.post<MsCustomerDocument>("", body, {
      url: customersMsUrl(
        `customer/${encodeURIComponent(customerId)}/projects`
      ),
      ...withCustomersMsAuth(),
    });
  });

  const parallel = [...descriptionRequests, ...projectRequests];
  const parallelResults =
    parallel.length > 0 ? await Promise.all(parallel) : [];

  let resultDoc = created;
  if (projectRequests.length > 0) {
    resultDoc = parallelResults[
      parallelResults.length - 1
    ] as MsCustomerDocument;
  }

  const vendor: VendorCustomer = {
    _id: String(resultDoc._id),
    name: resultDoc.name,
    lastName: resultDoc.lastName,
    phone: resultDoc.phone,
    whatsapp: resultDoc.whatsapp,
    email: resultDoc.email,
    document: resultDoc.document,
    documentType: resultDoc.documentType,
  };

  return {
    error: null,
    result: vendor,
    message: "success",
  };
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
