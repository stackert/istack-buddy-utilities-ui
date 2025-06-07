import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import TopBar from "../TopBar";

// Define the store state type
interface RootState {
  notifications: {
    notifications: any[];
    loading: boolean;
    error: string | null;
  };
}

// Create a mock store with initial state
const createMockStore = () => {
  return configureStore<RootState>({
    reducer: {
      notifications: (
        state = { notifications: [], loading: false, error: null }
      ) => state,
    },
  });
};

// Custom render function that includes providers
const renderWithProviders = (component: React.ReactElement) => {
  const store = createMockStore();
  return render(<Provider store={store}>{component}</Provider>);
};

describe("TopBar", () => {
  it("renders the TopBar component with all main elements", () => {
    renderWithProviders(<TopBar />);

    // Check for main elements
    expect(screen.getByText("iStack Buddy")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /account of current user/i })
    ).toBeInTheDocument();
  });

  it("opens user menu when clicking on the user section", () => {
    renderWithProviders(<TopBar />);

    // Click on the user section
    const userSection = screen.getByText("John Doe");
    fireEvent.click(userSection);

    // Check if menu items are present
    expect(screen.getByText("Switch Form Context")).toBeInTheDocument();
    expect(screen.getByText("Notifications")).toBeInTheDocument();
    expect(screen.getByText("Log Out")).toBeInTheDocument();
  });

  it("toggles notifications section when clicking on Notifications menu item", () => {
    renderWithProviders(<TopBar />);

    // Open the menu
    const userSection = screen.getByText("John Doe");
    fireEvent.click(userSection);

    // Click on Notifications
    const notificationsMenuItem = screen.getByRole("menuitem", {
      name: /notifications/i,
    });
    fireEvent.click(notificationsMenuItem);

    // Check if NotificationList is rendered
    expect(screen.getByText("No notifications")).toBeInTheDocument();
  });

  it("closes menu when clicking on menu items", async () => {
    renderWithProviders(<TopBar />);

    // Open the menu
    const userSection = screen.getByText("John Doe");
    fireEvent.click(userSection);

    // Click on Switch Form Context
    const switchContextMenuItem = screen.getByRole("menuitem", {
      name: /switch form context/i,
    });
    fireEvent.click(switchContextMenuItem);

    // Wait for menu to close and verify it's not in the document
    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  it("displays user avatar with initials", () => {
    renderWithProviders(<TopBar />);

    const avatar = screen.getByText("JD");
    expect(avatar).toBeInTheDocument();
  });
});
