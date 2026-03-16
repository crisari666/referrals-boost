/**
 * Clients service — all requests go through the centralized http client.
 */

import * as http from "@/lib/http";
import type { Client } from "@/data/mockData";

const BASE = "/api/clients";

/** GET /api/clients */
export function getClients(params?: { search?: string; status?: string }) {
  return http.get<Client[]>(BASE, { params });
}

/** GET /api/clients/:id */
export function getClient(id: string) {
  return http.get<Client>(`${BASE}/${id}`);
}

/** POST /api/clients */
export function createClient(payload: Omit<Client, "id">) {
  return http.post<Client>(BASE, payload);
}

/** PATCH /api/clients/:id */
export function updateClient(id: string, payload: Partial<Client>) {
  return http.patch<Client>(`${BASE}/${id}`, payload);
}

/** DELETE /api/clients/:id */
export function deleteClient(id: string) {
  return http.del<void>(`${BASE}/${id}`);
}
