/**
 * Auth service — all requests go through the centralized http client.
 */

import * as http from "@/lib/http";
import type { ApiUser, LoginPayload, LoginResponse } from "@/types/auth";

/** POST /api/auth/login */
export function login(payload: LoginPayload) {
  return http.post<LoginResponse>("login/signin", payload);
}

/** POST /api/auth/logout */
export function logout() {
  return http.post<void>("/api/auth/logout");
}

/** GET /api/auth/me */
export function getMe() {
  return http.get<ApiUser>("/api/auth/me");
}
