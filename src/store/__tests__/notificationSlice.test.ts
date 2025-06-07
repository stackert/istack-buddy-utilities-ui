import notificationReducer, {
  addNotification,
  removeToast,
  dismissNotification,
  clearAllNotifications,
  Notification,
} from "../notificationSlice";
import { AnyAction } from "@reduxjs/toolkit";

describe("Notification Slice", () => {
  const mockNotification: Omit<Notification, "id" | "timestamp"> = {
    title: "Test Title",
    message: "Test Message",
    level: "info",
    isSticky: false,
  };

  const mockStickyNotification: Omit<Notification, "id" | "timestamp"> = {
    title: "Sticky Title",
    message: "Sticky Message",
    level: "error",
    isSticky: true,
  };

  const mockNotificationWithoutSticky: Partial<
    Omit<Notification, "id" | "timestamp">
  > = {
    title: "No Sticky Title",
    message: "No Sticky Message",
    level: "info",
  };

  describe("Initial State", () => {
    it("should have empty notifications and activeToasts arrays", () => {
      const initialState = notificationReducer(undefined, {
        type: "@@INIT",
      } as AnyAction);
      expect(initialState.notifications).toEqual([]);
      expect(initialState.activeToasts).toEqual([]);
    });
  });

  describe("addNotification", () => {
    it("should add a non-sticky notification only to activeToasts", () => {
      const state = notificationReducer(
        undefined,
        addNotification(mockNotification)
      );

      expect(state.notifications).toHaveLength(0);
      expect(state.activeToasts).toHaveLength(1);

      const addedToast = state.activeToasts[0];
      expect(addedToast).toMatchObject({
        title: mockNotification.title,
        message: mockNotification.message,
        level: mockNotification.level,
        isSticky: mockNotification.isSticky,
      });
      expect(addedToast.id).toBeDefined();
      expect(addedToast.timestamp).toBeDefined();
    });

    it("should add a sticky notification to both arrays", () => {
      const state = notificationReducer(
        undefined,
        addNotification(mockStickyNotification)
      );

      expect(state.notifications).toHaveLength(1);
      expect(state.activeToasts).toHaveLength(1);

      const addedNotification = state.notifications[0];
      const addedToast = state.activeToasts[0];

      expect(addedNotification).toMatchObject({
        title: mockStickyNotification.title,
        message: mockStickyNotification.message,
        level: mockStickyNotification.level,
        isSticky: mockStickyNotification.isSticky,
      });
      expect(addedNotification.id).toBeDefined();
      expect(addedNotification.timestamp).toBeDefined();

      // Both arrays should have the same notification
      expect(addedNotification).toEqual(addedToast);
    });

    it("should default isSticky to false when not provided", () => {
      const state = notificationReducer(
        undefined,
        addNotification(
          mockNotificationWithoutSticky as Omit<
            Notification,
            "id" | "timestamp"
          >
        )
      );

      expect(state.notifications).toHaveLength(0);
      expect(state.activeToasts).toHaveLength(1);

      const addedToast = state.activeToasts[0];
      expect(addedToast.isSticky).toBe(false);
    });

    it("should generate unique IDs for each notification", () => {
      const state1 = notificationReducer(
        undefined,
        addNotification(mockNotification)
      );
      const state2 = notificationReducer(
        state1,
        addNotification(mockNotification)
      );

      expect(state2.activeToasts[0].id).not.toBe(state2.activeToasts[1].id);
    });
  });

  describe("removeToast", () => {
    it("should remove a toast from activeToasts but keep it in notifications if sticky", () => {
      // First add a sticky notification
      const state1 = notificationReducer(
        undefined,
        addNotification(mockStickyNotification)
      );
      const notificationId = state1.activeToasts[0].id;

      // Then remove the toast
      const state2 = notificationReducer(state1, removeToast(notificationId));

      expect(state2.notifications).toHaveLength(1);
      expect(state2.activeToasts).toHaveLength(0);
    });

    it("should remove a non-sticky notification completely", () => {
      // First add a non-sticky notification
      const state1 = notificationReducer(
        undefined,
        addNotification(mockNotification)
      );
      const notificationId = state1.activeToasts[0].id;

      // Then remove the toast
      const state2 = notificationReducer(state1, removeToast(notificationId));

      expect(state2.notifications).toHaveLength(0);
      expect(state2.activeToasts).toHaveLength(0);
    });

    it("should handle removing a non-existent notification", () => {
      // Start with a sticky notification
      const state1 = notificationReducer(
        undefined,
        addNotification(mockStickyNotification)
      );

      // Try to remove a non-existent notification
      const state2 = notificationReducer(
        state1,
        removeToast("non-existent-id")
      );

      // State should remain unchanged
      expect(state2).toEqual(state1);
    });
  });

  describe("dismissNotification", () => {
    it("should remove a notification from both arrays", () => {
      // First add a sticky notification
      const state1 = notificationReducer(
        undefined,
        addNotification(mockStickyNotification)
      );
      const notificationId = state1.notifications[0].id;

      // Then dismiss it
      const state2 = notificationReducer(
        state1,
        dismissNotification(notificationId)
      );

      expect(state2.notifications).toHaveLength(0);
      expect(state2.activeToasts).toHaveLength(0);
    });
  });

  describe("clearAllNotifications", () => {
    it("should clear both notifications and activeToasts arrays", () => {
      // First add both types of notifications
      const state1 = notificationReducer(
        undefined,
        addNotification(mockNotification)
      );
      const state2 = notificationReducer(
        state1,
        addNotification(mockStickyNotification)
      );

      // Then clear all
      const state3 = notificationReducer(state2, clearAllNotifications());

      expect(state3.notifications).toHaveLength(0);
      expect(state3.activeToasts).toHaveLength(0);
    });
  });
});
