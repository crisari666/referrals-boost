import * as http from '@/lib/http';
import { APP_CONSTANTS } from '@/constants/app-constants';
import type { AuthUser } from '@/types/auth';

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

export type VendorDashboardResult = {
  monthCommissions: number;
  totalHistoryCommissions: number;
  customersActives: number;
  customerConversion: number;
  monthlyGoal: number;
};

export type VendorDashboardApiResponse = {
  error: string | null;
  message: string;
  result: VendorDashboardResult;
};

const VENDOR_DASHBOARD_PATH = 'vendor-dashboard';

export async function getVendorDashboard(): Promise<VendorDashboardResult> {
  const data = await http.get<VendorDashboardApiResponse>(VENDOR_DASHBOARD_PATH, withAuth());
  if (data.error) {
    throw new Error(data.error);
  }
  return data.result;
}
