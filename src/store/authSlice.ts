import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { APP_CONSTANTS } from "@/constants/app-constants";
import * as authService from "@/services/authService";
import type { ApiUser, AuthUser, UserRole } from "@/types/auth";

export type { AuthUser, UserRole } from "@/types/auth";

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
    role,
  };
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

function getInitialAuthState(): AuthState {
  const base = { isLoading: false, error: null };
  try {
    const raw = localStorage.getItem(APP_CONSTANTS.AUTH_USER_STORAGE_KEY);
    if (!raw) return { ...base, user: null, isAuthenticated: false };
    const user = JSON.parse(raw) as AuthUser;
    if (!user?.token) return { ...base, user: null, isAuthenticated: false };
    return { ...base, user, isAuthenticated: true };
  } catch {
    return { ...base, user: null, isAuthenticated: false };
  }
}

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
    return mapApiUserToAuthUser(response.result);
  } catch (err: unknown) {
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
    },
    clearError(state) {
      state.error = null;
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
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
