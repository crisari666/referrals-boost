/** Minimal Google Identity Services typings used by Sign-In and Calendar OAuth. */

export type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

export type GoogleCredentialResponse = {
  credential?: string;
  select_by?: string;
  clientId?: string;
};

export type GoogleIdConfiguration = {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: string;
  ux_mode?: "popup" | "redirect";
  use_fedcm_for_prompt?: boolean;
};

export type GoogleGsiButtonConfiguration = {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number | string;
  locale?: string;
};

export type GoogleTokenClientConfig = {
  client_id: string;
  scope: string;
  callback: (response: GoogleTokenResponse) => void;
  error_callback?: (error: { type?: string; message?: string }) => void;
};

export type GoogleTokenClient = {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
};

export type GoogleAccountsId = {
  initialize: (config: GoogleIdConfiguration) => void;
  renderButton: (
    parent: HTMLElement,
    options: GoogleGsiButtonConfiguration,
  ) => void;
  prompt: (momentListener?: (notification: unknown) => void) => void;
  disableAutoSelect: () => void;
};

export type GoogleAccountsOauth2 = {
  initTokenClient: (config: GoogleTokenClientConfig) => GoogleTokenClient;
};

export type GoogleAccounts = {
  id: GoogleAccountsId;
  oauth2: GoogleAccountsOauth2;
};

declare global {
  interface Window {
    google?: {
      accounts: GoogleAccounts;
    };
  }
}

export {};
