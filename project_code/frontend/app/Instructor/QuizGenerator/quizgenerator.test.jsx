import { render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import QuizGeneratorPage from "./quizgenerator";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next/font/google", () => ({
  Poppins: () => ({ className: "poppins-mock" }),
}));

describe("QuizGeneratorPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue({ push: jest.fn() });
  });

  it("renders the main heading and actions", () => {
    render(<QuizGeneratorPage />);

    expect(screen.getByText("Create a New Quiz")).toBeInTheDocument();
    expect(screen.getByText("Select a mode")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Assessment" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Practice" })).toBeInTheDocument();
  });

  it("disables Next until requirements are met in practice mode", () => {
    render(<QuizGeneratorPage />);
    const nextButton = screen.getByRole("button", { name: "Next" });
    expect(nextButton).toBeDisabled();
  });
});
