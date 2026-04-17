/**
 * Profile and self-service account API (CRM `users` routes).
 */

import { isAxiosError } from "axios";
import { get, patch, post } from "@/lib/http";

export type OwnProfile = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
};

type UsersApiEnvelope<T> = {
  result: T;
  error: string | null;
  message: string;
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

/** GET users/me */
export async function getOwnProfile(): Promise<OwnProfile> {
  try {
    const data = await get<UsersApiEnvelope<OwnProfile>>("users/me");
    assertOk(data, "No se pudo cargar el perfil.");
    return data.result;
  } catch (e) {
    rethrowAxios(e);
  }
}

/** PATCH users/me */
export async function patchOwnProfile(
  payload: Partial<Pick<OwnProfile, "name" | "lastName" | "phone">>
): Promise<void> {
  try {
    const data = await patch<UsersApiEnvelope<boolean>>("users/me", payload);
    assertOk(data, "No se pudo guardar el perfil.");
  } catch (e) {
    rethrowAxios(e);
  }
}

/** POST users/me/email-change/request */
export async function requestEmailChange(newEmail: string): Promise<void> {
  try {
    const data = await post<UsersApiEnvelope<boolean>>(
      "users/me/email-change/request",
      { newEmail }
    );
    assertOk(data, "No se pudo enviar el código de verificación.");
  } catch (e) {
    rethrowAxios(e);
  }
}

/** POST users/me/email-change/confirm */
export async function confirmEmailChange(params: {
  newEmail: string;
  code: string;
}): Promise<void> {
  try {
    const data = await post<UsersApiEnvelope<boolean>>(
      "users/me/email-change/confirm",
      params
    );
    assertOk(data, "No se pudo confirmar el correo.");
  } catch (e) {
    rethrowAxios(e);
  }
}

/** PATCH users/me/password */
export async function changeOwnPassword(params: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  try {
    const data = await patch<UsersApiEnvelope<boolean>>("users/me/password", {
      currentPassword: params.currentPassword,
      newPassword: params.newPassword,
    });
    assertOk(data, "No se pudo actualizar la contraseña.");
  } catch (e) {
    rethrowAxios(e);
  }
}

const BASE = "/api/profile";

/** GET /api/profile (legacy dashboard shape) */
export function getProfile() {
  return get<unknown>(BASE);
}

/** PATCH /api/profile */
export function updateProfile(payload: unknown) {
  return patch<unknown>(BASE, payload);
}
