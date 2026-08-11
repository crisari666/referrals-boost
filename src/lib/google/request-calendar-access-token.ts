import {
  GOOGLE_CALENDAR_AND_MEET_SCOPES,
} from "@/lib/google/google-calendar.constants";
import { loadGisScript } from "@/lib/google/load-gis-script";
import type { GoogleTokenResponse } from "@/lib/google/gis-types";
import { APP_CONSTANTS } from "@/constants/app-constants";

type CachedAccessToken = {
  accessToken: string;
  expiresAtMs: number;
  scope: string;
};

const TOKEN_EXPIRY_SKEW_MS = 60_000;
const SESSION_TOKEN_KEY = "referrals-boost:google-calendar-access-token";

let cachedToken: CachedAccessToken | null = null;

function getGoogleClientId(): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? "";
  if (!clientId) {
    throw new Error(
      "Missing VITE_GOOGLE_CLIENT_ID. Add the Google OAuth web client id to env.",
    );
  }
  return clientId;
}

function readSessionCache(): CachedAccessToken | null {
  try {
    const raw = sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as CachedAccessToken;
    if (
      typeof parsed.accessToken !== "string" ||
      typeof parsed.expiresAtMs !== "number" ||
      typeof parsed.scope !== "string"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeSessionCache(token: CachedAccessToken): void {
  cachedToken = token;
  try {
    sessionStorage.setItem(SESSION_TOKEN_KEY, JSON.stringify(token));
  } catch {
    // ignore quota / private mode
  }
}

function ensureMemoryCache(): CachedAccessToken | null {
  if (cachedToken) {
    return cachedToken;
  }
  cachedToken = readSessionCache();
  return cachedToken;
}

function isCachedTokenValid(requiredScope: string): boolean {
  const token = ensureMemoryCache();
  if (!token) {
    return false;
  }
  if (token.expiresAtMs <= Date.now() + TOKEN_EXPIRY_SKEW_MS) {
    return false;
  }
  const cachedParts = new Set(token.scope.split(/\s+/).filter(Boolean));
  return requiredScope
    .split(/\s+/)
    .filter(Boolean)
    .every((s) => cachedParts.has(s));
}

export function hasGrantedGoogleCalendarMeetScopes(): boolean {
  try {
    return localStorage.getItem(APP_CONSTANTS.GOOGLE_SCOPES_GRANTED_KEY) === "1";
  } catch {
    return false;
  }
}

function markGoogleCalendarMeetScopesGranted(): void {
  try {
    localStorage.setItem(APP_CONSTANTS.GOOGLE_SCOPES_GRANTED_KEY, "1");
  } catch {
    // ignore
  }
}

type RequestAccessTokenOptions = {
  /** Empty = silent if already authorized; "consent" forces the permission UI once. */
  prompt?: "" | "consent";
};

async function requestGoogleAccessToken(
  scope: string,
  options: RequestAccessTokenOptions = {},
): Promise<string> {
  if (isCachedTokenValid(scope)) {
    return ensureMemoryCache()!.accessToken;
  }
  await loadGisScript();
  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) {
    throw new Error("Google Identity Services is not available.");
  }
  const clientId = getGoogleClientId();
  const prompt = options.prompt ?? "";
  return new Promise<string>((resolve, reject) => {
    const tokenClient = oauth2.initTokenClient({
      client_id: clientId,
      scope,
      callback: (response: GoogleTokenResponse) => {
        if (response.error || !response.access_token) {
          reject(
            new Error(
              response.error_description ||
                response.error ||
                "Google sign-in was cancelled or failed.",
            ),
          );
          return;
        }
        const expiresInSec =
          typeof response.expires_in === "number" && response.expires_in > 0
            ? response.expires_in
            : 3600;
        writeSessionCache({
          accessToken: response.access_token,
          expiresAtMs: Date.now() + expiresInSec * 1000,
          scope,
        });
        markGoogleCalendarMeetScopesGranted();
        resolve(response.access_token);
      },
      error_callback: (error) => {
        reject(
          new Error(error.message || error.type || "Google sign-in failed."),
        );
      },
    });
    tokenClient.requestAccessToken({ prompt });
  });
}

/**
 * Call once after app login. Shows Google consent only the first time the user
 * has not already granted Calendar + Meet scopes; later logins renew silently.
 */
export async function ensureGoogleCalendarAndMeetScopesAtLogin(): Promise<void> {
  const alreadyGranted = hasGrantedGoogleCalendarMeetScopes();
  await requestGoogleAccessToken(GOOGLE_CALENDAR_AND_MEET_SCOPES, {
    prompt: alreadyGranted ? "" : "consent",
  });
}

/**
 * Returns a Google OAuth access token with Calendar + Meet scopes.
 * Silent renew only — permissions are expected to have been granted at login.
 */
export async function requestGoogleCalendarAccessToken(): Promise<string> {
  return requestGoogleAccessToken(GOOGLE_CALENDAR_AND_MEET_SCOPES, {
    prompt: "",
  });
}

/** Clears the session-cached Google Calendar access token (keeps “granted” flag). */
export function clearGoogleCalendarAccessToken(): void {
  cachedToken = null;
  try {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {
    // ignore
  }
}
