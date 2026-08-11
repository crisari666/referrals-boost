export const APP_CONSTANTS = {
  AUTH_USER_STORAGE_KEY: "referrals-boost:auth-user",
  LANGUAGE_STORAGE_KEY: "referrals-boost:language",
  /** User previously consented to Calendar + Meet GIS scopes in this browser. */
  GOOGLE_SCOPES_GRANTED_KEY: "referrals-boost:google-calendar-meet-scopes-granted",
} as const;

/** Login `user` field; goals/achievements UI is shown only for this account. */
export const ACHIEVEMENTS_GOALS_USERNAME = "kdev999";
