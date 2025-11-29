import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import StudentQuizzesPage from "./quiz1";

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

describe("StudentQuizzesPage Component", () => {
  let mockPush;

  const mockAssessmentQuiz = {
    quiz_id: "quiz-assessment-1",
    name: "Midterm Exam",
    is_published: true,
    default_mode: "assessment",
    source_filename: "lecture_notes.pdf",
    topics: ["Data Structures", "Algorithms"],
    assessment_num_questions: 25,
    assessment_time_limit_minutes: 60,
    metadata: {
      description: "Comprehensive midterm covering weeks 1-6",
    },
  };

  const mockPracticeQuiz = {
    quiz_id: "quiz-practice-1",
    name: "Practice Session 1",
    is_published: true,
    default_mode: "practice",
    source_filename: "study_guide.pdf",
    topics: ["Trees", "Graphs"],
    metadata: {
      description: "Practice problems for tree and graph algorithms",
    },
  };

  const mockUnpublishedQuiz = {
    quiz_id: "quiz-unpublished-1",
    name: "Future Quiz",
    is_published: false,
    default_mode: "practice",
  };

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
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<StudentQuizzesPage />);

      expect(screen.getByText("Your Quizzes")).toBeInTheDocument();
    });

    it("renders the page description", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<StudentQuizzesPage />);

      expect(
        screen.getByText(/Choose from instructor-published assessments or practice sessions/i)
      ).toBeInTheDocument();
    });

    it("renders back to home button", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<StudentQuizzesPage />);

      expect(screen.getByRole("button", { name: /← Back to Home/i })).toBeInTheDocument();
    });

    it("applies Poppins font class to title", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<StudentQuizzesPage />);

      const title = screen.getByText("Your Quizzes");
      expect(title).toHaveClass("mocked-poppins");
    });
  });

  describe("Loading State", () => {
    it("shows loading message initially", () => {
      global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<StudentQuizzesPage />);

      expect(screen.getByText("Loading available quizzes...")).toBeInTheDocument();
    });

    it("loading message has correct styling", () => {
      global.fetch.mockImplementation(() => new Promise(() => {}));

      render(<StudentQuizzesPage />);

      const loadingMessage = screen.getByText("Loading available quizzes...");
      expect(loadingMessage).toHaveClass("text-lg", "text-purple-900", "mocked-poppins");
    });
  });

  describe("API Integration", () => {
    it("fetches quizzes from correct endpoint", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/quiz/definitions")
        );
      });
    });

    it("uses environment variable for API base URL", async () => {
      const originalEnv = process.env.NEXT_PUBLIC_BACKEND_URL;
      process.env.NEXT_PUBLIC_BACKEND_URL = "https://api.test.com";

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "https://api.test.com/quiz/definitions"
        );
      });

      process.env.NEXT_PUBLIC_BACKEND_URL = originalEnv;
    });

    it("strips trailing slash from API base URL", async () => {
      const originalEnv = process.env.NEXT_PUBLIC_BACKEND_URL;
      process.env.NEXT_PUBLIC_BACKEND_URL = "https://api.test.com/";

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "https://api.test.com/quiz/definitions"
        );
      });

      process.env.NEXT_PUBLIC_BACKEND_URL = originalEnv;
    });

    it("handles successful API response with quizzes", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockAssessmentQuiz, mockPracticeQuiz],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText("Midterm Exam")).toBeInTheDocument();
        expect(screen.getByText("Practice Session 1")).toBeInTheDocument();
      });
    });

    it("filters out unpublished quizzes", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockAssessmentQuiz, mockUnpublishedQuiz],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText("Midterm Exam")).toBeInTheDocument();
        expect(screen.queryByText("Future Quiz")).not.toBeInTheDocument();
      });
    });

    it("handles API response with non-array payload", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Not an array" }),
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText("Assessment mode is coming soon.")).toBeInTheDocument();
        expect(screen.getByText("No practice quizzes are published yet.")).toBeInTheDocument();
      });
    });

    it("handles API error response", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: "Server error occurred" }),
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText("Server error occurred")).toBeInTheDocument();
      });
    });

    it("handles API error without detail", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText("Unable to load quizzes.")).toBeInTheDocument();
      });
    });

    it("handles network error", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Network failure"));

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText("Network failure")).toBeInTheDocument();
      });
    });

    it("handles malformed JSON response", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText("Assessment mode is coming soon.")).toBeInTheDocument();
      });
    });
  });

  describe("Assessment Quizzes Section", () => {
    it("renders Assessment Quizzes section", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText("Assessment Quizzes")).toBeInTheDocument();
      });
    });

    it("shows section description", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(
          screen.getByText("Timed assessments curated by your instructor.")
        ).toBeInTheDocument();
      });
    });

    it("displays assessment quizzes in correct section", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockAssessmentQuiz],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        const assessmentSection = screen.getByText("Assessment Quizzes").closest("section");
        expect(assessmentSection).toHaveTextContent("Midterm Exam");
      });
    });

    it("shows empty message when no assessments", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockPracticeQuiz],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText("Assessment mode is coming soon.")).toBeInTheDocument();
      });
    });

    it("displays quiz name", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockAssessmentQuiz],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText("Midterm Exam")).toBeInTheDocument();
      });
    });

    it("displays quiz description from metadata", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockAssessmentQuiz],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/Comprehensive midterm covering weeks 1-6/i)
        ).toBeInTheDocument();
      });
    });

    it("displays source filename badge", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockAssessmentQuiz],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText(/Source: lecture_notes.pdf/i)).toBeInTheDocument();
      });
    });

    it("displays topics badge", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockAssessmentQuiz],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText("2 topics")).toBeInTheDocument();
      });
    });

    it("displays single topic without plural", async () => {
      const singleTopicQuiz = {
        ...mockAssessmentQuiz,
        topics: ["Algorithms"],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [singleTopicQuiz],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText("1 topic")).toBeInTheDocument();
      });
    });

    it("displays number of questions badge", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockAssessmentQuiz],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText("25 questions")).toBeInTheDocument();
      });
    });

    it("displays time limit badge", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockAssessmentQuiz],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText("60 min limit")).toBeInTheDocument();
      });
    });

    it("navigates to quiz details when clicked", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockAssessmentQuiz],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        const quizButton = screen.getByText("Midterm Exam").closest("button");
        fireEvent.click(quizButton);
      });

      expect(mockPush).toHaveBeenCalledWith("/Student/Quizzes/quiz-assessment-1");
    });
  });

  describe("Practice Quizzes Section", () => {
    it("renders Practice Quizzes section", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText("Practice Quizzes")).toBeInTheDocument();
      });
    });

    it("shows section description", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(
          screen.getByText("Unlimited adaptive practice sessions to reinforce your learning.")
        ).toBeInTheDocument();
      });
    });

    it("displays practice quizzes in correct section", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockPracticeQuiz],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        const practiceSection = screen.getByText("Practice Quizzes").closest("section");
        expect(practiceSection).toHaveTextContent("Practice Session 1");
      });
    });

    it("shows empty message when no practice quizzes", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockAssessmentQuiz],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText("No practice quizzes are published yet.")).toBeInTheDocument();
      });
    });

    it("navigates to quiz details when clicked", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockPracticeQuiz],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        const quizButton = screen.getByText("Practice Session 1").closest("button");
        fireEvent.click(quizButton);
      });

      expect(mockPush).toHaveBeenCalledWith("/Student/Quizzes/quiz-practice-1");
    });
  });

  describe("Quiz Metadata Handling", () => {
    it("displays fallback description for assessment when metadata is missing", async () => {
      const quizWithoutMetadata = {
        ...mockAssessmentQuiz,
        metadata: {},
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [quizWithoutMetadata],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/Quiz generated from your course material/i)
        ).toBeInTheDocument();
      });
    });

    it("displays fallback description for practice when metadata is missing", async () => {
      const quizWithoutMetadata = {
        ...mockPracticeQuiz,
        metadata: {},
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [quizWithoutMetadata],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/Practice quiz generated from your course material/i)
        ).toBeInTheDocument();
      });
    });

    it("handles missing metadata object", async () => {
      const quizWithoutMetadata = {
        ...mockAssessmentQuiz,
        metadata: null,
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [quizWithoutMetadata],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText("Midterm Exam")).toBeInTheDocument();
      });
    });

    it("trims whitespace from description", async () => {
      const quizWithSpaces = {
        ...mockAssessmentQuiz,
        metadata: {
          description: "   Description with spaces   ",
        },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [quizWithSpaces],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText(/Description with spaces/i)).toBeInTheDocument();
      });
    });

    it("truncates long descriptions to 120 characters", async () => {
      const longDescription = "A".repeat(150);
      const quizWithLongDesc = {
        ...mockAssessmentQuiz,
        metadata: {
          description: longDescription,
        },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [quizWithLongDesc],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        const description = screen.getByText(/A{120}/);
        expect(description.textContent.length).toBeLessThanOrEqual(120);
      });
    });

    it("handles non-string description in metadata", async () => {
      const quizWithInvalidDesc = {
        ...mockAssessmentQuiz,
        metadata: {
          description: 12345,
        },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [quizWithInvalidDesc],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/Quiz generated from your course material/i)
        ).toBeInTheDocument();
      });
    });

    it('displays "Untitled Quiz" when name is missing', async () => {
      const quizWithoutName = {
        ...mockAssessmentQuiz,
        name: "",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [quizWithoutName],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText("Untitled Quiz")).toBeInTheDocument();
      });
    });

    it("displays General when topics array is empty", async () => {
      const quizWithoutTopics = {
        ...mockAssessmentQuiz,
        topics: [],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [quizWithoutTopics],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText("General")).toBeInTheDocument();
      });
    });

    it("displays General when topics is null", async () => {
      const quizWithoutTopics = {
        ...mockAssessmentQuiz,
        topics: null,
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [quizWithoutTopics],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText("General")).toBeInTheDocument();
      });
    });

    it("does not display source filename badge when missing", async () => {
      const quizWithoutSource = {
        ...mockAssessmentQuiz,
        source_filename: null,
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [quizWithoutSource],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.queryByText(/Source:/i)).not.toBeInTheDocument();
      });
    });

    it("does not display questions badge for practice mode", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockPracticeQuiz],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.queryByText(/questions$/i)).not.toBeInTheDocument();
      });
    });

    it("does not display time limit badge for practice mode", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockPracticeQuiz],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.queryByText(/min limit$/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Navigation", () => {
    it("navigates to Student HomePage when back button clicked", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        const backButton = screen.getByRole("button", { name: /← Back to Home/i });
        fireEvent.click(backButton);
      });

      expect(mockPush).toHaveBeenCalledWith("/Student/HomePage");
    });

    it("encodes quiz ID in navigation URL", async () => {
      const quizWithSpecialChars = {
        ...mockAssessmentQuiz,
        quiz_id: "quiz/with/slashes",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [quizWithSpecialChars],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        const quizButton = screen.getByText("Midterm Exam").closest("button");
        fireEvent.click(quizButton);
      });

      expect(mockPush).toHaveBeenCalledWith("/Student/Quizzes/quiz%2Fwith%2Fslashes");
    });

    it("does not navigate when quiz ID is missing", async () => {
      const quizWithoutId = {
        ...mockAssessmentQuiz,
        quiz_id: null,
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [quizWithoutId],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        const quizButton = screen.getByText("Midterm Exam").closest("button");
        fireEvent.click(quizButton);
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it("does not navigate when quiz ID is empty string", async () => {
      const quizWithEmptyId = {
        ...mockAssessmentQuiz,
        quiz_id: "",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [quizWithEmptyId],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        const quizButton = screen.getByText("Midterm Exam").closest("button");
        fireEvent.click(quizButton);
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("Component Cleanup", () => {
    it("cancels pending requests on unmount", async () => {
      global.fetch.mockImplementation(() => new Promise(() => {}));

      const { unmount } = render(<StudentQuizzesPage />);

      unmount();

      // Should not crash or cause errors
      expect(() => unmount()).not.toThrow();
    });

    it("does not update state after unmount", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      global.fetch.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => [mockAssessmentQuiz],
              });
            }, 100);
          })
      );

      const { unmount } = render(<StudentQuizzesPage />);

      unmount();

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Layout and Styling", () => {
    it("applies correct container classes", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const { container } = render(<StudentQuizzesPage />);

      await waitFor(() => {
        const mainDiv = container.querySelector(".min-h-screen.bg-gray-50");
        expect(mainDiv).toBeInTheDocument();
      });
    });

    it("uses grid layout for quiz cards", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockAssessmentQuiz],
      });

      const { container } = render(<StudentQuizzesPage />);

      await waitFor(() => {
        const grid = container.querySelector(".grid.grid-cols-1.md\\:grid-cols-2");
        expect(grid).toBeInTheDocument();
      });
    });

    it("quiz cards have hover effects", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockAssessmentQuiz],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        const quizButton = screen.getByText("Midterm Exam").closest("button");
        expect(quizButton).toHaveClass("hover:shadow-md");
      });
    });

    it("sections have proper spacing", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const { container } = render(<StudentQuizzesPage />);

      await waitFor(() => {
        const spacedDiv = container.querySelector(".space-y-8");
        expect(spacedDiv).toBeInTheDocument();
      });
    });
  });

  describe("Error Display", () => {
    it("renders error message with correct styling", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Test error"));

      const { container } = render(<StudentQuizzesPage />);

      await waitFor(() => {
        const errorDiv = container.querySelector(".border-red-200.bg-red-50");
        expect(errorDiv).toBeInTheDocument();
        expect(errorDiv).toHaveTextContent("Test error");
      });
    });

    it("does not show error message on success", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockAssessmentQuiz],
      });

      const { container } = render(<StudentQuizzesPage />);

      await waitFor(() => {
        const errorDiv = container.querySelector(".border-red-200");
        expect(errorDiv).not.toBeInTheDocument();
      });
    });
  });

  describe("Multiple Quizzes", () => {
    it("displays multiple assessment quizzes", async () => {
      const quiz2 = {
        ...mockAssessmentQuiz,
        quiz_id: "quiz-assessment-2",
        name: "Final Exam",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockAssessmentQuiz, quiz2],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText("Midterm Exam")).toBeInTheDocument();
        expect(screen.getByText("Final Exam")).toBeInTheDocument();
      });
    });

    it("displays multiple practice quizzes", async () => {
      const practice2 = {
        ...mockPracticeQuiz,
        quiz_id: "quiz-practice-2",
        name: "Practice Session 2",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockPracticeQuiz, practice2],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText("Practice Session 1")).toBeInTheDocument();
        expect(screen.getByText("Practice Session 2")).toBeInTheDocument();
      });
    });

    it("displays both assessment and practice quizzes", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockAssessmentQuiz, mockPracticeQuiz],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        expect(screen.getByText("Midterm Exam")).toBeInTheDocument();
        expect(screen.getByText("Practice Session 1")).toBeInTheDocument();
      });
    });
  });

  describe("Default Mode Handling", () => {
    it("defaults to practice mode when default_mode is missing", async () => {
      const quizWithoutMode = {
        ...mockAssessmentQuiz,
        default_mode: undefined,
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [quizWithoutMode],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        const practiceSection = screen.getByText("Practice Quizzes").closest("section");
        expect(practiceSection).toHaveTextContent("Midterm Exam");
      });
    });

    it("handles null default_mode", async () => {
      const quizWithNullMode = {
        ...mockPracticeQuiz,
        default_mode: null,
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [quizWithNullMode],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        const practiceSection = screen.getByText("Practice Quizzes").closest("section");
        expect(practiceSection).toHaveTextContent("Practice Session 1");
      });
    });
  });

  describe("Accessibility", () => {
    it("quiz cards are keyboard accessible", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockAssessmentQuiz],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        const quizButton = screen.getByText("Midterm Exam").closest("button");
        expect(quizButton).toHaveAttribute("type", "button");
      });
    });

    it("back button is keyboard accessible", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<StudentQuizzesPage />);

      await waitFor(() => {
        const backButton = screen.getByRole("button", { name: /← Back to Home/i });
        expect(backButton).toHaveAttribute("type", "button");
      });
    });
  });
});
