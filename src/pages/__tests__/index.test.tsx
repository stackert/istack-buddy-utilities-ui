import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Home from "../index";
import { useRouter } from "next/router";

// Mock next/router
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// Mock the logger service
jest.mock("../../services/logger", () => ({
  logger: {
    debug: jest.fn(),
  },
  ELoggerTags: {
    DEV_DEBUG: "DEV_DEBUG",
  },
}));

// Create a mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      notifications: (
        state = { notifications: [], activeToasts: [] },
        action: any
      ) => {
        if (action.type === "notifications/addNotification") {
          return {
            ...state,
            notifications: [...state.notifications, action.payload],
            activeToasts: [...state.activeToasts, action.payload],
          };
        }
        if (action.type === "notifications/removeToast") {
          return {
            ...state,
            activeToasts: state.activeToasts.filter(
              (toast: any) => toast.id !== action.payload
            ),
          };
        }
        return state;
      },
    },
    preloadedState: {
      notifications: {
        notifications: [],
        activeToasts: [],
      },
    },
  });
};

// Custom render function that includes providers
const renderWithProviders = (component: React.ReactElement) => {
  const store = createMockStore();
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  };
};

describe("Home Page", () => {
  beforeEach(() => {
    // Mock router pathname
    (useRouter as jest.Mock).mockReturnValue({
      pathname: "/",
    });
  });

  it("renders the welcome message", () => {
    renderWithProviders(<Home />);

    // Check if welcome message is displayed
    const welcomeMessage = screen.getByText("Welcome to the Home Page");
    expect(welcomeMessage).toBeInTheDocument();
    expect(welcomeMessage.tagName).toBe("H1");
  });

  it("renders within a container with max width", () => {
    renderWithProviders(<Home />);

    // Check if content is within a container with maxWidth="sm"
    const container = screen
      .getByText("Welcome to the Home Page")
      .closest('div[class*="MuiContainer"]');
    expect(container).toBeInTheDocument();
  });

  it("renders with Navigation component", () => {
    renderWithProviders(<Home />);

    // Check if Navigation component is rendered
    // We can verify this by checking for elements that are part of the Navigation
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Hello World")).toBeInTheDocument();
    expect(screen.getByText("Example 1")).toBeInTheDocument();
  });

  it("renders content in a flex container", () => {
    renderWithProviders(<Home />);

    // Check if content is in a flex container
    const flexContainer = screen
      .getByText("Welcome to the Home Page")
      .closest("div");
    expect(flexContainer).toHaveStyle({
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    });
  });
});
