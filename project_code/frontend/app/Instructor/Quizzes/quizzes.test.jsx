import { render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import InstructorQuizzesPage from "./quizzes";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next/font/google", () => ({
  Poppins: () => ({ className: "poppins-mock" }),
}));

describe("InstructorQuizzesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue({ push: jest.fn() });
  });

  it("renders the quizzes heading", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<InstructorQuizzesPage />);

    await waitFor(() => {
      expect(screen.getByText("My Quizzes")).toBeInTheDocument();
    });
  });
});
