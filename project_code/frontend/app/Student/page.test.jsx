import { render, screen } from "@testing-library/react";
import StudentIndexPage from "./page1";

jest.mock("./HomePage/page", () => () => <div data-testid="home">Student Home</div>, {
  virtual: true,
});

describe("StudentIndexPage", () => {
  it("renders the student home page", () => {
    render(<StudentIndexPage />);
    expect(screen.getByTestId("home")).toBeInTheDocument();
  });

  it("renders without additional wrappers", () => {
    const { container } = render(<StudentIndexPage />);
    expect(container.firstChild).toBe(screen.getByTestId("home"));
  });
});
