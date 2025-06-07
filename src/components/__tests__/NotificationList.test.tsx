import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import NotificationList from "../NotificationList";

// Mock the date for consistent testing
const mockDate = new Date("2024-03-20T12:00:00");
const mockTimestamp = mockDate.getTime();

// Mock both Date constructor and Date.now
jest.spyOn(global, "Date").mockImplementation(() => mockDate);
Date.now = jest.fn(() => mockTimestamp);

interface Notification {
  id: string;
  title: string;
  message: string;
  level: string;
  timestamp: number;
  moreInfo?: string;
}

interface NotificationState {
  notifications: Notification[];
}

// Create a mock store with initial state
const createMockStore = (initialState: NotificationState) => {
  return configureStore({
    reducer: {
      notifications: (state = { notifications: [] }, action: any) => {
        if (action.type === "notifications/dismissNotification") {
          return {
            ...state,
            notifications: state.notifications.filter(
              (notification: Notification) => notification.id !== action.payload
            ),
          };
        }
        if (action.type === "notifications/clearAllNotifications") {
          return {
            ...state,
            notifications: [],
          };
        }
        return state;
      },
    },
    preloadedState: {
      notifications: initialState,
    },
  });
};

// Custom render function that includes providers
const renderWithProviders = (
  component: React.ReactElement,
  initialState: NotificationState
) => {
  const store = createMockStore(initialState);
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  };
};

describe("NotificationList", () => {
  it("displays empty state when there are no notifications", () => {
    const initialState = {
      notifications: [],
    };

    renderWithProviders(<NotificationList />, initialState);

    expect(screen.getByText("No notifications")).toBeInTheDocument();
  });

  it("renders notifications with correct content", () => {
    const initialState = {
      notifications: [
        {
          id: "1",
          title: "Test Notification",
          message: "Test Message",
          level: "info",
          timestamp: mockTimestamp,
        },
      ],
    };

    renderWithProviders(<NotificationList />, initialState);

    expect(screen.getByText("Test Notification")).toBeInTheDocument();
    expect(screen.getByText("Test Message")).toBeInTheDocument();
    expect(screen.getByText("12:00:00 PM")).toBeInTheDocument();
  });

  it("applies correct color coding based on notification level", () => {
    const initialState = {
      notifications: [
        {
          id: "1",
          title: "Error Notification",
          message: "Error Message",
          level: "error",
          timestamp: mockTimestamp,
        },
        {
          id: "2",
          title: "Warning Notification",
          message: "Warning Message",
          level: "warn",
          timestamp: mockTimestamp,
        },
        {
          id: "3",
          title: "Info Notification",
          message: "Info Message",
          level: "info",
          timestamp: mockTimestamp,
        },
        {
          id: "4",
          title: "Debug Notification",
          message: "Debug Message",
          level: "debug",
          timestamp: mockTimestamp,
        },
      ],
    };

    renderWithProviders(<NotificationList />, initialState);

    const listItems = screen.getAllByRole("listitem");

    expect(listItems[0]).toHaveStyle({ borderLeftColor: "error.main" });
    expect(listItems[1]).toHaveStyle({ borderLeftColor: "warning.main" });
    expect(listItems[2]).toHaveStyle({ borderLeftColor: "info.main" });
    expect(listItems[3]).toHaveStyle({ borderLeftColor: "grey.500" });
  });

  it("allows dismissing individual notifications", () => {
    const initialState = {
      notifications: [
        {
          id: "1",
          title: "Test Notification",
          message: "Test Message",
          level: "info",
          timestamp: mockTimestamp,
        },
      ],
    };

    const { store } = renderWithProviders(<NotificationList />, initialState);

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    const state = store.getState();
    expect(state.notifications.notifications).toHaveLength(0);
  });

  it("allows clearing all notifications", () => {
    const initialState = {
      notifications: [
        {
          id: "1",
          title: "First Notification",
          message: "First Message",
          level: "info",
          timestamp: mockTimestamp,
        },
        {
          id: "2",
          title: "Second Notification",
          message: "Second Message",
          level: "error",
          timestamp: mockTimestamp,
        },
      ],
    };

    const { store } = renderWithProviders(<NotificationList />, initialState);

    // Find the clear all button by its test ID
    const clearAllButton = screen.getByTestId("clear-all-button");
    expect(clearAllButton).toBeInTheDocument();
    fireEvent.click(clearAllButton);

    const state = store.getState();
    expect(state.notifications.notifications).toHaveLength(0);
  });

  it("displays more info when available", () => {
    const initialState = {
      notifications: [
        {
          id: "1",
          title: "Test Notification",
          message: "Test Message",
          level: "info",
          timestamp: mockTimestamp,
          moreInfo: "Additional information",
        },
      ],
    };

    renderWithProviders(<NotificationList />, initialState);

    expect(screen.getByText("Additional information")).toBeInTheDocument();
  });

  it("applies default color for unknown notification level", () => {
    const initialState = {
      notifications: [
        {
          id: "1",
          title: "Unknown Level Notification",
          message: "Test Message",
          level: "unknown",
          timestamp: mockTimestamp,
        },
      ],
    };

    renderWithProviders(<NotificationList />, initialState);

    const listItem = screen.getByRole("listitem");
    expect(listItem).toHaveStyle({ borderLeftColor: "grey.500" });
  });
});
