export const APP_CONSTANTS = {
  AUTH_USER_STORAGE_KEY: "referrals-boost:auth-user",
  LANGUAGE_STORAGE_KEY: "referrals-boost:language",
  /** User previously consented to Calendar + Meet GIS scopes in this browser. */
  GOOGLE_SCOPES_GRANTED_KEY: "referrals-boost:google-calendar-meet-scopes-granted",
  /** Browser notification permission was granted in this origin. */
  PUSH_NOTIFICATIONS_GRANTED_KEY: "referrals-boost:push-notifications-granted",
  /** Public lot stock view preferences (rows per column, view mode). */
  LOT_STOCK_PREFS_KEY: "referrals-boost:lot-stock-prefs",
} as const;

/** Login `user` field; goals/achievements UI is shown only for this account. */
export const ACHIEVEMENTS_GOALS_USERNAME = "kdev999";
