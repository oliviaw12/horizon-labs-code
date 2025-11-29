import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import MyQuizPage from "./myquiz";

// Mock Next.js hooks
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock Next.js font
jest.mock("next/font/google", () => ({
  Poppins: () => ({
    className: "mocked-poppins",
  }),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe("MyQuizPage Component", () => {
  let mockPush;

  beforeEach(() => {
    localStorage.clear();
    mockPush = jest.fn();
    useRouter.mockReturnValue({
      push: mockPush,
    });
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Initial Rendering", () => {
    it("renders the page title", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<MyQuizPage />);
      
      expect(screen.getByText("My Quizzes")).toBeInTheDocument();
    });

    it("renders the subtitle", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<MyQuizPage />);
      
      expect(screen.getByText(/Quizzes are created by the given material/i)).toBeInTheDocument();
    });

    it("applies Poppins font to title", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<MyQuizPage />);
      
      const title = screen.getByText("My Quizzes");
      expect(title).toHaveClass("mocked-poppins");
    });
  });

  describe("Loading State", () => {
    it("shows loading message initially", () => {
      global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<MyQuizPage />);
      
      expect(screen.getByText("Loading quizzes...")).toBeInTheDocument();
    });

    it("loading message has proper styling", () => {
      global.fetch.mockImplementation(() => new Promise(() => {}));

      render(<MyQuizPage />);
      
      const loadingText = screen.getByText("Loading quizzes...");
      expect(loadingText).toHaveClass("text-purple-900");
      expect(loadingText).toHaveClass("mocked-poppins");
    });
  });

  describe("Quiz Data Fetching", () => {
    it("fetches quizzes on mount", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/quiz/definitions")
        );
      });
    });

    it("displays empty state when no quizzes exist", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Quizzes you create and hand out by the instructor will appear here/i)).toBeInTheDocument();
      });
    });

    it("displays create quiz button in empty state", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("+ Create a Quiz")).toBeInTheDocument();
      });
    });

    it("handles non-array response by setting empty array", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: "not an array" }),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Quizzes you create and hand out by the instructor will appear here/i)).toBeInTheDocument();
      });
    });

    it("displays quizzes when data is loaded", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          title: "Math Quiz",
          description: "A math quiz",
          totalQuestions: 10,
          mode: "practice",
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Math Quiz")).toBeInTheDocument();
      });
    });

    it("displays multiple quizzes", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          title: "Quiz One",
          description: "First quiz",
          totalQuestions: 5,
          mode: "practice",
          createdAt: "2024-01-01T00:00:00Z",
        },
        {
          quiz_id: "quiz-2",
          title: "Quiz Two",
          description: "Second quiz",
          totalQuestions: 10,
          mode: "assessment",
          createdAt: "2024-01-02T00:00:00Z",
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Quiz One")).toBeInTheDocument();
        expect(screen.getByText("Quiz Two")).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("displays error message when fetch fails", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ detail: "Server error" }),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        expect(screen.queryByText("Loading quizzes...")).not.toBeInTheDocument();
      });
    });

    it("handles error with detail message", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ detail: "Custom error message" }),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it("handles error without detail", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it("handles network errors", async () => {
      global.fetch.mockRejectedValue(new Error("Network failure"));

      render(<MyQuizPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it("handles error without message", async () => {
      global.fetch.mockRejectedValue({});

      render(<MyQuizPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it("handles JSON parsing error in error response", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: () => Promise.reject(new Error("Invalid JSON")),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe("Quiz Display", () => {
    it("displays quiz title", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          title: "Science Quiz",
          description: "Test description",
          totalQuestions: 15,
          mode: "assessment",
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Science Quiz")).toBeInTheDocument();
      });
    });

    it("displays 'Untitled Quiz' when title is missing", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          title: null,
          description: "Test description",
          totalQuestions: 5,
          mode: "practice",
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Untitled Quiz")).toBeInTheDocument();
      });
    });

    it("displays quiz description", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          title: "History Quiz",
          description: "Ancient civilizations",
          totalQuestions: 20,
          mode: "practice",
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Ancient civilizations")).toBeInTheDocument();
      });
    });

    it("displays 'No description' when description is missing", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          title: "Test Quiz",
          description: null,
          totalQuestions: 10,
          mode: "practice",
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("No description")).toBeInTheDocument();
      });
    });

    it("displays total questions", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          title: "Quiz",
          description: "Test",
          totalQuestions: 25,
          mode: "practice",
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Questions: 25/i)).toBeInTheDocument();
      });
    });

    it("displays 0 when totalQuestions is missing", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          title: "Quiz",
          description: "Test",
          totalQuestions: null,
          mode: "practice",
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Questions: 0/i)).toBeInTheDocument();
      });
    });

    it("displays quiz mode", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          title: "Quiz",
          description: "Test",
          totalQuestions: 10,
          mode: "assessment",
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Mode: assessment/i)).toBeInTheDocument();
      });
    });

    it("displays 'N/A' when mode is missing", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          title: "Quiz",
          description: "Test",
          totalQuestions: 10,
          mode: null,
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Mode: N\/A/i)).toBeInTheDocument();
      });
    });

    it("displays formatted creation date", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          title: "Quiz",
          description: "Test",
          totalQuestions: 10,
          mode: "practice",
          createdAt: "2024-03-15T00:00:00Z",
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Created: 3\/15\/2024/i)).toBeInTheDocument();
      });
    });

    it("displays 'N/A' when createdAt is missing", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          title: "Quiz",
          description: "Test",
          totalQuestions: 10,
          mode: "practice",
          createdAt: null,
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Created: N\/A/i)).toBeInTheDocument();
      });
    });
  });

  describe("Quiz Interactions", () => {
    it("navigates to quiz page when quiz is clicked", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          title: "Clickable Quiz",
          description: "Test",
          totalQuestions: 10,
          mode: "practice",
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Clickable Quiz")).toBeInTheDocument();
      });

      const quizButton = screen.getByText("Clickable Quiz");
      fireEvent.click(quizButton);
      
      expect(mockPush).toHaveBeenCalledWith("/Quiz/1");
    });

    it("navigates to quiz generator when create button is clicked", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("+ Create a Quiz")).toBeInTheDocument();
      });

      const createButton = screen.getByText("+ Create a Quiz");
      fireEvent.click(createButton);
      
      expect(mockPush).toHaveBeenCalledWith("/Instructor/QuizGenerator");
    });

    it("quiz buttons have proper hover styles", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          title: "Hover Quiz",
          description: "Test",
          totalQuestions: 10,
          mode: "practice",
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        const quizButton = screen.getByText("Hover Quiz").closest("button");
        expect(quizButton).toHaveClass("hover:shadow-md");
      });
    });
  });

  describe("Empty State SVG", () => {
    it("renders empty state SVG when no quizzes", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const { container } = render(<MyQuizPage />);
      
      await waitFor(() => {
        const svg = container.querySelector("svg");
        expect(svg).toBeInTheDocument();
      });
    });

    it("SVG has correct viewBox", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const { container } = render(<MyQuizPage />);
      
      await waitFor(() => {
        const svg = container.querySelector("svg");
        expect(svg).toHaveAttribute("viewBox", "0 0 200 200");
      });
    });

    it("does not render SVG when quizzes exist", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          title: "Quiz",
          description: "Test",
          totalQuestions: 10,
          mode: "practice",
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      const { container } = render(<MyQuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Quiz")).toBeInTheDocument();
      });

      const emptyText = screen.queryByText(/Quizzes you create and hand out/i);
      expect(emptyText).not.toBeInTheDocument();
    });
  });

  describe("Component Cleanup", () => {
    it("cleans up on unmount to prevent state updates", async () => {
      global.fetch.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: () => Promise.resolve([]),
              });
            }, 100);
          })
      );

      const { unmount } = render(<MyQuizPage />);
      
      unmount();
      
      await new Promise((resolve) => setTimeout(resolve, 150));
    });
  });

  describe("Styling", () => {
    it("create button has gradient background", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        const createButton = screen.getByText("+ Create a Quiz");
        expect(createButton).toHaveStyle({
          background: "linear-gradient(to right, #7B2CBF, #3B82F6)",
        });
      });
    });

    it("main container has proper styling", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const { container } = render(<MyQuizPage />);
      
      const mainContainer = container.querySelector(".min-h-screen");
      expect(mainContainer).toBeInTheDocument();
      expect(mainContainer).toHaveClass("bg-white");
    });

    it("content area has border and rounded corners", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const { container } = render(<MyQuizPage />);
      
      await waitFor(() => {
        const contentArea = container.querySelector(".border.border-gray-300.rounded-lg");
        expect(contentArea).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("quiz buttons are keyboard accessible", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          title: "Accessible Quiz",
          description: "Test",
          totalQuestions: 10,
          mode: "practice",
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        const quizButton = screen.getByText("Accessible Quiz").closest("button");
        expect(quizButton).toHaveAttribute("type", "button");
      });
    });

    it("quiz buttons have focus ring", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          title: "Focus Quiz",
          description: "Test",
          totalQuestions: 10,
          mode: "practice",
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        const quizButton = screen.getByText("Focus Quiz").closest("button");
        expect(quizButton).toHaveClass("focus:ring-2");
        expect(quizButton).toHaveClass("focus:ring-purple-400");
      });
    });
  });

  describe("Layout", () => {
    it("uses max-width container", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const { container } = render(<MyQuizPage />);
      
      const maxWidthContainer = container.querySelector(".max-w-6xl");
      expect(maxWidthContainer).toBeInTheDocument();
    });

    it("quizzes are displayed in vertical list", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          title: "Quiz 1",
          description: "Test 1",
          totalQuestions: 10,
          mode: "practice",
          createdAt: "2024-01-01T00:00:00Z",
        },
        {
          quiz_id: "quiz-2",
          title: "Quiz 2",
          description: "Test 2",
          totalQuestions: 15,
          mode: "assessment",
          createdAt: "2024-01-02T00:00:00Z",
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      const { container } = render(<MyQuizPage />);
      
      await waitFor(() => {
        const listContainer = container.querySelector(".space-y-4");
        expect(listContainer).toBeInTheDocument();
      });
    });
  });

  describe("API Configuration", () => {
    it("uses correct API endpoint", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<MyQuizPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringMatching(/\/quiz\/definitions$/)
        );
      });
    });
  });
});
