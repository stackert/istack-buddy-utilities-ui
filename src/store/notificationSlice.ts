import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LogLevel } from "../services/logger";

export interface Notification {
  id: string;
  title: string;
  message: string;
  level: LogLevel;
  timestamp: string;
  moreInfo?: string;
  isSticky: boolean;
}

interface NotificationState {
  notifications: Notification[];
  activeToasts: Notification[];
}

const initialState: NotificationState = {
  notifications: [],
  activeToasts: [],
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, "id" | "timestamp">>
    ) => {
      const newNotification: Notification = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        isSticky: action.payload.isSticky ?? false,
      };

      // Add to notifications list only if sticky
      if (newNotification.isSticky) {
        state.notifications.unshift(newNotification);
      }

      // Always add to active toasts
      state.activeToasts.push(newNotification);
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.activeToasts = state.activeToasts.filter(
        (toast) => toast.id !== action.payload
      );
    },
    dismissNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
      state.activeToasts = state.activeToasts.filter(
        (toast) => toast.id !== action.payload
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.activeToasts = [];
    },
  },
});

export const {
  addNotification,
  removeToast,
  dismissNotification,
  clearAllNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
