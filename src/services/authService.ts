/**
 * Auth service — all requests go through the centralized http client.
 */

import * as http from "@/lib/http";
import type { AuthUser } from "@/store/authSlice";

/** POST /api/auth/login */
export function login(email: string, password: string) {
  return http.post<AuthUser>("/api/auth/login", { email, password });
}

/** POST /api/auth/logout */
export function logout() {
  return http.post<void>("/api/auth/logout");
}

/** GET /api/auth/me */
export function getMe() {
  return http.get<AuthUser>("/api/auth/me");
}
