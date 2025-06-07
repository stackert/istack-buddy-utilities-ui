import { render, screen, fireEvent } from "@testing-library/react";
import HelloWorld from "../hello-world";
import Navigation from "../../components/Navigation";

// Mock the Navigation component
jest.mock("../../components/Navigation", () => {
  return function MockNavigation({ children }: { children: React.ReactNode }) {
    return <div data-testid="mock-navigation">{children}</div>;
  };
});

describe("HelloWorld Component", () => {
  it("renders without crashing", () => {
    render(<HelloWorld />);
    expect(screen.getByTestId("mock-navigation")).toBeInTheDocument();
  });

  it("renders the title", () => {
    render(<HelloWorld />);
    expect(screen.getByText("Hello World!")).toBeInTheDocument();
  });

  it("renders the form with input and submit button", () => {
    render(<HelloWorld />);

    // Check for form elements
    expect(screen.getByLabelText("Enter your text")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("updates input value when typing", () => {
    render(<HelloWorld />);
    const input = screen.getByLabelText("Enter your text");

    fireEvent.change(input, { target: { value: "test input" } });
    expect(input).toHaveValue("test input");
  });

  it("handles form submission", () => {
    const consoleSpy = jest.spyOn(console, "log");
    render(<HelloWorld />);

    const input = screen.getByLabelText("Enter your text");
    const submitButton = screen.getByRole("button", { name: "Submit" });

    // Type in the input
    fireEvent.change(input, { target: { value: "test submission" } });

    // Submit the form
    fireEvent.click(submitButton);

    // Check if console.log was called with the correct value
    expect(consoleSpy).toHaveBeenCalledWith(
      "Form submitted with value:",
      "test submission"
    );

    consoleSpy.mockRestore();
  });

  it("prevents default form submission", () => {
    const consoleSpy = jest.spyOn(console, "log");
    render(<HelloWorld />);

    const input = screen.getByLabelText("Enter your text");
    const form = screen.getByRole("form");

    // Type in the input
    fireEvent.change(input, { target: { value: "test value" } });

    // Submit the form
    fireEvent.submit(form);

    // Verify that our handler ran (console.log was called)
    expect(consoleSpy).toHaveBeenCalled();

    // Verify that the input value is preserved (form wasn't reset)
    expect(input).toHaveValue("test value");

    consoleSpy.mockRestore();
  });
});
