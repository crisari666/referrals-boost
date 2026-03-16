/**
 * Schedule service — all requests go through the centralized http client.
 */

import * as http from "@/lib/http";
import type { ScheduledVisit } from "@/types/schedule";

const BASE = "/api/schedule/visits";

/** GET /api/schedule/visits */
export function getVisits(params?: { from?: string; to?: string }) {
  return http.get<ScheduledVisit[]>(BASE, { params });
}

/** POST /api/schedule/visits */
export function createVisit(payload: Omit<ScheduledVisit, "id" | "createdAt">) {
  return http.post<ScheduledVisit>(BASE, payload);
}

/** PATCH /api/schedule/visits/:id */
export function updateVisit(id: string, payload: Partial<ScheduledVisit>) {
  return http.patch<ScheduledVisit>(`${BASE}/${id}`, payload);
}

/** DELETE /api/schedule/visits/:id */
export function deleteVisit(id: string) {
  return http.del<void>(`${BASE}/${id}`);
}
