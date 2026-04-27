import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { APP_CONSTANTS } from "@/constants/app-constants";
import * as authService from "@/services/authService";
import * as profileService from "@/services/profileService";
import type { ApiUser, AuthUser, UserRole } from "@/types/auth";

export const FORGOT_PASSWORD_SUCCESS_MESSAGE =
  "Si tu correo se encuentra registrado, revisa tu bandeja de entrada";

export type { AuthUser, UserRole } from "@/types/auth";

function isApiUserLoginResult(value: unknown): value is ApiUser {
  if (!value || typeof value !== "object") return false;
  const u = value as Record<string, unknown>;
  return (
    typeof u._id === "string" &&
    typeof u.token === "string" &&
    u.token.length > 0
  );
}

function mapApiUserToAuthUser(api: ApiUser): AuthUser {
  const role: UserRole = api.root ? "admin" : api.physical ? "asesor_fisico" : "asesor_referido";
  return {
    id: api._id,
    user: api.user,
    name: api.name,
    lastName: api.lastName,
    email: api.email,
    phone: api.phone,
    token: api.token,
    level: api.level,
    percentage: api.percentage,
    connected: api.connected,
    enable: api.enable,
    root: api.root,
    link: api.link,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
    physical: Boolean(api.physical),
    role,
  };
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  forgotPasswordIsLoading: boolean;
  forgotPasswordError: string | null;
  forgotPasswordSubmitted: boolean;
}

function getInitialAuthState(): AuthState {
  const base = {
    isLoading: false,
    error: null,
    forgotPasswordIsLoading: false,
    forgotPasswordError: null,
    forgotPasswordSubmitted: false,
  };
  try {
    const raw = localStorage.getItem(APP_CONSTANTS.AUTH_USER_STORAGE_KEY);
    if (!raw) return { ...base, user: null, isAuthenticated: false };
    const user = JSON.parse(raw) as AuthUser;
    if (!user?.token) return { ...base, user: null, isAuthenticated: false };
    const normalized: AuthUser = {
      ...user,
      physical: typeof user.physical === "boolean" ? user.physical : user.role === "asesor_fisico",
    };
    return { ...base, user: normalized, isAuthenticated: true };
  } catch {
    return { ...base, user: null, isAuthenticated: false };
  }
}

export const refreshOwnProfile = createAsyncThunk<
  Pick<AuthUser, "name" | "lastName" | "email" | "phone">,
  void,
  { rejectValue: string }
>("auth/refreshOwnProfile", async (_, { rejectWithValue }) => {
  try {
    const p = await profileService.getOwnProfile();
    return {
      name: p.name,
      lastName: p.lastName,
      email: p.email,
      phone: p.phone,
    };
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "No se pudo actualizar los datos de sesión.";
    return rejectWithValue(message);
  }
});

export const loginUser = createAsyncThunk<
  AuthUser,
  { user: string; email: string; password: string; lat: number; lng: number },
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const response = await authService.login(payload);
    if (response.error) {
      return rejectWithValue(response.error);
    }
    if (!isApiUserLoginResult(response.result)) {
      const raw = response.message?.trim() ?? "";
      const msg =
        raw.length > 0 && raw.toLowerCase() !== "success"
          ? raw
          : "No se pudo iniciar sesión. Verifica usuario y contraseña.";
      return rejectWithValue(msg);
    }
    return mapApiUserToAuthUser(response.result);
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "Error de conexión. Intenta de nuevo.";
    return rejectWithValue(message);
  }
});

export const requestForgotPassword = createAsyncThunk<
  void,
  { email: string },
  { rejectValue: string }
>("auth/requestForgotPassword", async (payload, { rejectWithValue }) => {
  try {
    const response = await authService.requestForgotPassword({
      email: payload.email.trim(),
    });
    if (response.message !== "success" || response.error != null) {
      return rejectWithValue("No se pudo enviar la solicitud. Intenta de nuevo.");
    }
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.data && typeof err.response.data === "object") {
      const data = err.response.data as { error?: string };
      if (typeof data.error === "string" && data.error.length > 0) {
        return rejectWithValue("Revisa el formato del correo o intenta de nuevo.");
      }
    }
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "Error de conexión. Intenta de nuevo.";
    return rejectWithValue(message);
  }
});

const initialState: AuthState = getInitialAuthState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem(APP_CONSTANTS.AUTH_USER_STORAGE_KEY);
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.forgotPasswordIsLoading = false;
      state.forgotPasswordError = null;
      state.forgotPasswordSubmitted = false;
    },
    clearError(state) {
      state.error = null;
    },
    clearForgotPasswordState(state) {
      state.forgotPasswordIsLoading = false;
      state.forgotPasswordError = null;
      state.forgotPasswordSubmitted = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem(
          APP_CONSTANTS.AUTH_USER_STORAGE_KEY,
          JSON.stringify(action.payload)
        );
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Error desconocido";
      })
      .addCase(refreshOwnProfile.fulfilled, (state, action) => {
        if (state.user != null) {
          state.user = { ...state.user, ...action.payload };
          localStorage.setItem(
            APP_CONSTANTS.AUTH_USER_STORAGE_KEY,
            JSON.stringify(state.user)
          );
        }
      })
      .addCase(requestForgotPassword.pending, (state) => {
        state.forgotPasswordIsLoading = true;
        state.forgotPasswordError = null;
        state.forgotPasswordSubmitted = false;
      })
      .addCase(requestForgotPassword.fulfilled, (state) => {
        state.forgotPasswordIsLoading = false;
        state.forgotPasswordSubmitted = true;
        state.forgotPasswordError = null;
      })
      .addCase(requestForgotPassword.rejected, (state, action) => {
        state.forgotPasswordIsLoading = false;
        state.forgotPasswordSubmitted = false;
        state.forgotPasswordError = action.payload ?? "Error desconocido";
      });
  },
});

export const { logout, clearError, clearForgotPasswordState } = authSlice.actions;
export default authSlice.reducer;
