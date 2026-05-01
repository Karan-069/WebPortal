import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const switchRole = createAsyncThunk(
  "auth/switchRole",
  async (roleCode, { rejectWithValue }) => {
    try {
      const response = await api.post("/users/switch-role", { roleCode });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to switch role",
      );
    }
  },
);

export const refreshProfile = createAsyncThunk(
  "auth/refreshProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/current-user");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to refresh profile",
      );
    }
  },
);

const initialState = {
  user: (() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Auth hydration failed:", e);
      localStorage.removeItem("user");
      return null;
    }
  })(),
  token: localStorage.getItem("token") || null,
  tenantId: (() => {
    const tid = localStorage.getItem("tenantId");
    return tid ? tid.replace(/^"(.*)"$/, "$1").replace(/"/g, "") : null;
  })(),
  isAuthenticated: !!localStorage.getItem("token"),
  status: "idle",
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { user, token, accessToken, tenantId } = action.payload;
      const finalToken = accessToken || token; // Handle both naming conventions

      state.user = user;
      state.token = finalToken;
      state.tenantId = tenantId;
      state.isAuthenticated = true;

      localStorage.setItem("token", finalToken);
      localStorage.setItem("user", JSON.stringify(user));
      if (tenantId) {
        localStorage.setItem("tenantId", tenantId);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.tenantId = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("tenantId");
    },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(switchRole.pending, (state) => {
        state.status = "loading";
      })
      .addCase(switchRole.fulfilled, (state, action) => {
        const { user, accessToken, tenantId } = action.payload.data;
        state.status = "succeeded";
        state.user = user;
        state.token = accessToken;
        state.tenantId = tenantId;
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", accessToken);
        if (tenantId) localStorage.setItem("tenantId", tenantId);
      })
      .addCase(switchRole.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(refreshProfile.fulfilled, (state, action) => {
        const user = action.payload.data;
        state.user = user;
        localStorage.setItem("user", JSON.stringify(user));
      });
  },
});

export const { loginSuccess, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
