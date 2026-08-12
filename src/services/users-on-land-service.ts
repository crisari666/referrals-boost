/**
 * On-land presence APIs (CRM `users` routes).
 * Presence is set only from admin (crm_lots_agents); ventors only list active agents.
 */

import { isAxiosError } from "axios";
import i18n from "@/i18n";
import { get } from "@/lib/http";

type UsersApiEnvelope<T> = {
  result: T;
  error: string | null;
  message: string;
};

export type ActiveOnLandUser = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  displayName: string;
};

function errorFromPayload(payload: unknown): string | null {
  if (payload && typeof payload === "object" && "error" in payload) {
    const e = (payload as { error?: unknown }).error;
    if (e != null && String(e).length > 0) return String(e);
  }
  return null;
}

function assertOk<T>(data: UsersApiEnvelope<T>, fallback: string): void {
  const fromField = errorFromPayload(data);
  if (fromField) throw new Error(fromField);
  if (data.message === "error") throw new Error(fallback);
}

function rethrowAxios(err: unknown): never {
  if (isAxiosError(err)) {
    const m = errorFromPayload(err.response?.data);
    if (m) throw new Error(m);
  }
  throw err;
}

/** GET users/on-land/active */
export async function listActiveOnLandUsers(): Promise<ActiveOnLandUser[]> {
  try {
    const data = await get<UsersApiEnvelope<ActiveOnLandUser[]>>(
      "users/on-land/active"
    );
    assertOk(data, i18n.t("schedule.onLandAgentsLoadFailed"));
    return Array.isArray(data.result) ? data.result : [];
  } catch (e) {
    rethrowAxios(e);
  }
}
