import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ViewMode = "form-marv" | "app";

interface User {
  email: string;
  name?: string;
}

interface AppState {
  viewMode: ViewMode;
  isDevelopmentMode: boolean;
  user: User | null;
  securityToken: string | null;
  formId: string | null;
}

const initialState: AppState = {
  viewMode: "form-marv",
  isDevelopmentMode: process.env.NODE_ENV === "development",
  user: null,
  securityToken: null,
  formId: null,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setSecurityToken: (state, action: PayloadAction<string | null>) => {
      state.securityToken = action.payload;
    },
    setFormId: (state, action: PayloadAction<string | null>) => {
      state.formId = action.payload;
    },
    setRouteParams: (
      state,
      action: PayloadAction<{ token: string; formId: string }>
    ) => {
      state.securityToken = action.payload.token;
      state.formId = action.payload.formId;
    },
  },
});

export const {
  setViewMode,
  setUser,
  setSecurityToken,
  setFormId,
  setRouteParams,
} = appSlice.actions;
export default appSlice.reducer;
