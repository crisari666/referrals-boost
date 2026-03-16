/**
 * Profile service — all requests go through the centralized http client.
 */

import * as http from "@/lib/http";

export interface SellerProfile {
  id: string;
  name: string;
  level: string;
  levelProgress: number;
  totalCommissions: number;
  monthCommissions: number;
  monthGoal: number;
  clientsTracking: number;
  clientsConverted: number;
  referralLink: string;
  achievements: Array<{ id: string; title: string; icon: string; unlocked: boolean }>;
  ranking: number;
}

const BASE = "/api/profile";

/** GET /api/profile */
export function getProfile() {
  return http.get<SellerProfile>(BASE);
}

/** PATCH /api/profile */
export function updateProfile(payload: Partial<SellerProfile>) {
  return http.patch<SellerProfile>(BASE, payload);
}
