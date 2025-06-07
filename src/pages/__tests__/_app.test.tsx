import { render } from "@testing-library/react";
import App from "../_app";
import { Provider } from "react-redux";
import { store } from "../../store/store";
import { ThemeProvider } from "@mui/material/styles";
import type { NextComponentType } from "next";
import type { Router } from "next/router";

// Mock the next/router
jest.mock("next/router", () => ({
  useRouter: () => ({
    pathname: "/",
  }),
}));

// Mock the next/font/google
jest.mock("next/font/google", () => ({
  Geist: () => ({
    variable: "mock-geist-sans",
  }),
  Geist_Mono: () => ({
    variable: "mock-geist-mono",
  }),
}));

describe("App Component", () => {
  const mockComponent: NextComponentType = () => <div>Test Component</div>;
  const mockPageProps = {};
  const mockRouter = {
    pathname: "/",
    route: "/",
    query: {},
    asPath: "/",
  } as Router;

  const appProps = {
    Component: mockComponent,
    pageProps: mockPageProps,
    router: mockRouter,
  };

  it("renders without crashing", () => {
    const { container } = render(<App {...appProps} />);
    expect(container).toBeTruthy();
  });

  it("renders the child component", () => {
    const { getByText } = render(<App {...appProps} />);
    expect(getByText("Test Component")).toBeInTheDocument();
  });

  it("applies font variables to the root div", () => {
    const { container } = render(<App {...appProps} />);
    const rootDiv = container.firstChild as HTMLElement;
    expect(rootDiv.className).toContain("mock-geist-sans");
    expect(rootDiv.className).toContain("mock-geist-mono");
  });

  it("wraps the app with required providers", () => {
    const { container } = render(<App {...appProps} />);

    // The app should be wrapped in providers, so the first child should be the Provider
    const firstChild = container.firstChild as HTMLElement;
    expect(firstChild).toBeTruthy();

    // The ThemeProvider should be inside the Provider
    const themeProvider = firstChild.firstChild as HTMLElement;
    expect(themeProvider).toBeTruthy();

    // The CssBaseline should be inside the ThemeProvider
    const cssBaseline = themeProvider.firstChild;
    expect(cssBaseline).toBeTruthy();
  });
});
