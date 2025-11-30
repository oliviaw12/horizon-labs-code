import { render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import MyQuizPage from "./page";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next/font/google", () => ({
  Poppins: () => ({ className: "poppins-mock" }),
}));

describe("MyQuizPage", () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    useRouter.mockReturnValue({ push: jest.fn() });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("renders the heading", () => {
    render(<MyQuizPage />);
    expect(screen.getByText(/My Quizzes/i)).toBeInTheDocument();
  });
});
