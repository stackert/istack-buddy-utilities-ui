import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Navigation from "../Navigation";
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

describe("Navigation", () => {
  beforeEach(() => {
    // Mock router pathname
    (useRouter as jest.Mock).mockReturnValue({
      pathname: "/",
    });
  });

  it("renders with initial state", () => {
    renderWithProviders(<Navigation>Test Content</Navigation>);

    // Check if drawer is initially open
    const drawer = screen.getByTestId("ChevronLeftIcon").closest("button");
    expect(drawer).toBeInTheDocument();

    // Check if menu items are rendered
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Hello World")).toBeInTheDocument();
    expect(screen.getByText("Example 1")).toBeInTheDocument();

    // Check if content is rendered
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("toggles drawer when menu button is clicked", () => {
    renderWithProviders(<Navigation>Test Content</Navigation>);

    // Initially drawer should be open
    const drawer = screen.getByTestId("ChevronLeftIcon").closest("button");
    expect(drawer).toBeInTheDocument();

    // Initially menu button should be hidden (drawer is open)
    const menuButton = screen.getByLabelText("open drawer");
    expect(menuButton).not.toBeVisible();

    // Click the chevron button to close drawer
    if (drawer) {
      fireEvent.click(drawer);
    }

    // Menu button should be visible (drawer is closed)
    expect(menuButton).toBeVisible();

    // Click the menu button to open drawer
    fireEvent.click(menuButton);

    // Menu button should be hidden again (drawer is open)
    expect(menuButton).not.toBeVisible();
  });

  it("dispatches notification when drawer is toggled", () => {
    const { store } = renderWithProviders(
      <Navigation>Test Content</Navigation>
    );

    // Click the menu button to toggle drawer
    const menuButton = screen.getByLabelText("open drawer");
    fireEvent.click(menuButton);

    // Check if notification was added to store
    const state = store.getState();
    expect(state.notifications.notifications).toHaveLength(1);

    const notification = state.notifications.notifications[0];
    expect(notification).toHaveProperty("title");
    expect(notification).toHaveProperty("message");
    expect(notification).toHaveProperty("level");
    expect(notification).toHaveProperty("moreInfo");
    expect(notification).toHaveProperty("isSticky");
  });

  it("highlights active menu item based on current route", () => {
    // Mock router to return a specific pathname
    (useRouter as jest.Mock).mockReturnValue({
      pathname: "/hello-world",
    });

    renderWithProviders(<Navigation>Test Content</Navigation>);

    // Find the active menu item
    const activeMenuItem = screen.getByText("Hello World").closest("a");
    expect(activeMenuItem).toHaveClass("Mui-selected");

    // Other menu items should not be selected
    const otherMenuItem = screen.getByText("Home").closest("a");
    expect(otherMenuItem).not.toHaveClass("Mui-selected");
  });

  it("renders menu items with correct icons and links", () => {
    renderWithProviders(<Navigation>Test Content</Navigation>);

    // Check if all menu items have icons
    const menuItems = screen.getAllByRole("link");
    menuItems.forEach((item) => {
      const icon = item.querySelector("[data-testid='HomeIcon']");
      expect(icon).toBeInTheDocument();
    });

    // Check if links are correct
    const homeLink = screen.getByText("Home").closest("a");
    expect(homeLink).toHaveAttribute("href", "/");

    const helloWorldLink = screen.getByText("Hello World").closest("a");
    expect(helloWorldLink).toHaveAttribute("href", "/hello-world");

    const exampleLink = screen.getByText("Example 1").closest("a");
    expect(exampleLink).toHaveAttribute("href", "/example-1");
  });
});
