import { APP_CONSTANTS } from '@/constants/app-constants';

export function getStoredAuthToken(): string | null {
  try {
    const raw = localStorage.getItem(APP_CONSTANTS.AUTH_USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: unknown };
    return typeof parsed.token === 'string' && parsed.token.length > 0 ? parsed.token : null;
  } catch {
    return null;
  }
}
