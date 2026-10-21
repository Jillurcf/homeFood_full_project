import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import { api } from "../api/clients";

export const TOKEN_KEY = "auth_token";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  nidNumber?: string;
  address?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hasChecked: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  hasChecked: false,
  isLoading: false,
  error: null,
};

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const json = await api.post<{ success: boolean; data: { user: User; token: string } }>(
        "/auth/login",
        payload
      );
      await SecureStore.setItemAsync(TOKEN_KEY, json.data.token);
      return json.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Login failed");
    }
  }
);

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (
    payload: {
      name: string;
      username: string;
      email: string;
      password: string;
      phone?: string;
      nidNumber?: string;
      address?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const json = await api.post<{ success: boolean; data: { user: User; token: string } }>(
        "/auth/register",
        payload
      );
      await SecureStore.setItemAsync(TOKEN_KEY, json.data.token);
      return json.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Registration failed");
    }
  }
);

export const fetchMeThunk = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) throw new Error("No token");
      const json = await api.get<{ success: boolean; data: User }>("/auth/me", token);
      return { user: json.data, token };
    } catch (err: any) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      return rejectWithValue(err.message || "Session expired");
    }
  }
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.isLoading = false;
        state.hasChecked = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.hasChecked = true;
        state.error = (action.payload as string) || "Login failed";
      })
      // Register
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.isLoading = false;
        state.hasChecked = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.hasChecked = true;
        state.error = (action.payload as string) || "Registration failed";
      })
      // Fetch Me
      .addCase(fetchMeThunk.pending, (state) => {
        state.isLoading = true;
        state.hasChecked = false;
      })
      .addCase(fetchMeThunk.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.isLoading = false;
        state.hasChecked = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(fetchMeThunk.rejected, (state) => {
        state.isLoading = false;
        state.hasChecked = true;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.hasChecked = false;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
