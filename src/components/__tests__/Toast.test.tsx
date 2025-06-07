import { render, screen, fireEvent, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Toast from "../Toast";
import { LogLevel } from "../../services/logger";

// Mock the logger
jest.mock("../../services/logger", () => ({
  logger: {
    debug: jest.fn(),
  },
  ELoggerTags: {
    DEV_DEBUG: "DEV_DEBUG",
  },
}));

interface ToastState {
  activeToasts: Array<{
    id: string;
    title: string;
    message: string;
    level: LogLevel;
  }>;
}

// Create a mock store with initial state
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      notifications: (
        state: ToastState = { activeToasts: [] },
        action: any
      ) => {
        if (action.type === "notifications/addToast") {
          return {
            ...state,
            activeToasts: [...state.activeToasts, action.payload],
          };
        }
        if (action.type === "notifications/removeToast") {
          return {
            ...state,
            activeToasts: state.activeToasts.filter(
              (toast) => toast.id !== action.payload
            ),
          };
        }
        return state;
      },
    },
    preloadedState: {
      notifications: {
        activeToasts: [],
        ...initialState,
      },
    },
  });
};

// Custom render function that includes providers
const renderWithProviders = (
  component: React.ReactElement,
  initialState = {}
) => {
  const store = createMockStore(initialState);
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  };
};

describe("Toast", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders a toast with correct content", () => {
    const initialState = {
      activeToasts: [
        {
          id: "1",
          title: "Test Title",
          message: "Test Message",
          level: "info" as LogLevel,
        },
      ],
    };

    renderWithProviders(<Toast />, initialState);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Message")).toBeInTheDocument();
  });

  it("auto-dismisses toast after 5 seconds", () => {
    const initialState = {
      activeToasts: [
        {
          id: "1",
          title: "Test Title",
          message: "Test Message",
          level: "info" as LogLevel,
        },
      ],
    };

    const { store } = renderWithProviders(<Toast />, initialState);

    // Fast-forward 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Check if toast was removed
    const state = store.getState();
    expect(state.notifications.activeToasts).toHaveLength(0);
  });

  it("allows manual dismissal of toast", () => {
    const initialState = {
      activeToasts: [
        {
          id: "1",
          title: "Test Title",
          message: "Test Message",
          level: "info" as LogLevel,
        },
      ],
    };

    const { store } = renderWithProviders(<Toast />, initialState);

    // Find and click the close button
    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);

    // Check if toast was removed
    const state = store.getState();
    expect(state.notifications.activeToasts).toHaveLength(0);
  });

  it("displays multiple toasts with correct spacing", () => {
    const initialState = {
      activeToasts: [
        {
          id: "1",
          title: "First Toast",
          message: "First Message",
          level: "info" as LogLevel,
        },
        {
          id: "2",
          title: "Second Toast",
          message: "Second Message",
          level: "error" as LogLevel,
        },
      ],
    };

    renderWithProviders(<Toast />, initialState);

    expect(screen.getByText("First Toast")).toBeInTheDocument();
    expect(screen.getByText("Second Toast")).toBeInTheDocument();
    expect(screen.getByText("First Message")).toBeInTheDocument();
    expect(screen.getByText("Second Message")).toBeInTheDocument();
  });

  it("applies correct severity styles based on log level", () => {
    const initialState = {
      activeToasts: [
        {
          id: "1",
          title: "Error Toast",
          message: "Error Message",
          level: "error" as LogLevel,
        },
        {
          id: "2",
          title: "Warning Toast",
          message: "Warning Message",
          level: "warn" as LogLevel,
        },
        {
          id: "3",
          title: "Info Toast",
          message: "Info Message",
          level: "info" as LogLevel,
        },
        {
          id: "4",
          title: "Debug Toast",
          message: "Debug Message",
          level: "debug" as LogLevel,
        },
      ],
    };

    renderWithProviders(<Toast />, initialState);

    const errorAlert = screen
      .getByText("Error Toast")
      .closest('[role="alert"]');
    const warningAlert = screen
      .getByText("Warning Toast")
      .closest('[role="alert"]');
    const infoAlert = screen.getByText("Info Toast").closest('[role="alert"]');
    const debugAlert = screen
      .getByText("Debug Toast")
      .closest('[role="alert"]');

    // Log the actual classes for debugging
    console.log("Error Alert Classes:", errorAlert?.className);
    console.log("Warning Alert Classes:", warningAlert?.className);
    console.log("Info Alert Classes:", infoAlert?.className);
    console.log("Debug Alert Classes:", debugAlert?.className);

    // Check for the correct severity classes
    expect(errorAlert).toHaveClass("MuiAlert-filledError");
    expect(warningAlert).toHaveClass("MuiAlert-filledWarning");
    expect(infoAlert).toHaveClass("MuiAlert-filledInfo");
    expect(debugAlert).toHaveClass("MuiAlert-filledSuccess");
  });

  it("applies info severity style for unknown log level", () => {
    const initialState = {
      activeToasts: [
        {
          id: "1",
          title: "Unknown Level Toast",
          message: "Unknown Level Message",
          level: "unknown" as LogLevel, // This will trigger the default case
        },
      ],
    };

    renderWithProviders(<Toast />, initialState);

    const unknownAlert = screen
      .getByText("Unknown Level Toast")
      .closest('[role="alert"]');
    expect(unknownAlert).toHaveClass("MuiAlert-filledInfo");
  });
});
