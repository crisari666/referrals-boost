import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type UserRole = "asesor_referido" | "asesor_fisico" | "admin";

const MOCK_USERS = [
  {
    id: "1",
    email: "referido@lotelink.com",
    password: "referido123",
    name: "Carlos Mendoza",
    role: "asesor_referido" as UserRole,
    avatar: undefined,
  },
  {
    id: "2",
    email: "fisico@lotelink.com",
    password: "fisico123",
    name: "Ana García",
    role: "asesor_fisico" as UserRole,
    avatar: undefined,
  },
  {
    id: "3",
    email: "admin@lotelink.com",
    password: "admin123",
    name: "Luis Torres",
    role: "admin" as UserRole,
    avatar: undefined,
  },
];

export const loginUser = createAsyncThunk<
  AuthUser,
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 1200));

  const found = MOCK_USERS.find(
    (u) => u.email === email && u.password === password
  );

  if (!found) {
    return rejectWithValue("Credenciales incorrectas. Verifica tu email y contraseña.");
  }

  const { password: _, ...user } = found;
  return user;
});

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
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
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Error desconocido";
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
