/** Login request payload */
export type LoginPayload = {
  user: string;
  email: string;
  password: string;
  lat: number;
  lng: number;
};

/** User as returned by the API (result) */
export type ApiUser = {
  physical: boolean;
  _id: string;
  user: string;
  name: string;
  lastName: string;
  phone: string;
  phoneJob: string;
  email: string;
  level: number;
  tokenMobile: string | null;
  document: string;
  passText: string | null;
  tokenExp: string | null;
  leaveDate: string | null;
  goal: number | null;
  office: string | null;
  lead: string | null;
  connected: boolean;
  percentage: number;
  enable: boolean;
  root: boolean;
  link: string;
  fcmToken: string | null;
  lat: number | null;
  lng: number | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  token: string;
};

/** Login API response wrapper */
export type LoginResponse = {
  error: string | null;
  result: ApiUser;
  message: string;
};

export type UserRole = "asesor_referido" | "asesor_fisico" | "admin";

/** User type used in the app (mapped from API result); includes token for authenticated requests */
export type AuthUser = {
  id: string;
  user: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  token: string;
  level: number;
  percentage: number;
  connected: boolean;
  enable: boolean;
  root: boolean;
  link: string;
  createdAt: string;
  updatedAt: string;
  /** From API login; physical sellers get VoIP/agenda/status edit and WhatsApp nav */
  physical: boolean;
  /** Derived from API: root → admin, physical → asesor_fisico, else asesor_referido */
  role: UserRole;
};
