import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./slices/themeSlice";
import appReducer from "./slices/appSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    app: appReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
