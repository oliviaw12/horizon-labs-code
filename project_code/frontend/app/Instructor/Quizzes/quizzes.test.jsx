import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import InstructorQuizzesPage from "./quizzes";

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

describe("InstructorQuizzesPage Component", () => {
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

      render(<InstructorQuizzesPage />);
      
      expect(screen.getByText("My Quizzes")).toBeInTheDocument();
    });

    it("renders the subtitle", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<InstructorQuizzesPage />);
      
      expect(screen.getByText(/Quizzes will simulate real tests\/exams with time limits/i)).toBeInTheDocument();
    });

    it("renders back to home button", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<InstructorQuizzesPage />);
      
      expect(screen.getByText("← Back to Home")).toBeInTheDocument();
    });

    it("renders create quiz button", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<InstructorQuizzesPage />);
      
      expect(screen.getByText("+ Create a Quiz")).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("shows loading message initially", () => {
      global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<InstructorQuizzesPage />);
      
      expect(screen.getByText("Loading quizzes...")).toBeInTheDocument();
    });
  });

  describe("Quiz Data Fetching", () => {
    it("fetches quizzes on mount", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/quiz/definitions")
        );
      });
    });

    it("displays quizzes when data is loaded", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          name: "Math Quiz",
          default_mode: "practice",
          topics: ["Algebra", "Geometry"],
          created_at: "2024-01-01T00:00:00Z",
          is_published: true,
          metadata: {
            description: "A math practice quiz",
          },
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Math Quiz")).toBeInTheDocument();
      });
    });

    it("displays empty state when no quizzes exist", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Quizzes you create will appear here")).toBeInTheDocument();
      });
    });

    it("handles non-array response by setting empty array", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: "not an array" }),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Quizzes you create will appear here")).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("displays error message when fetch fails", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ detail: "Server error" }),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Server error")).toBeInTheDocument();
      });
    });

    it("displays generic error when detail is not provided", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Unable to load quizzes.")).toBeInTheDocument();
      });
    });

    it("handles network errors", async () => {
      global.fetch.mockRejectedValue(new Error("Network failure"));

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Network failure")).toBeInTheDocument();
      });
    });

    it("handles error without message", async () => {
      global.fetch.mockRejectedValue({});

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Unable to load quizzes.")).toBeInTheDocument();
      });
    });

    it("handles JSON parsing error in error response", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: () => Promise.reject(new Error("Invalid JSON")),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Unable to load quizzes.")).toBeInTheDocument();
      });
    });
  });

  describe("Navigation", () => {
    it("navigates back to instructor home when back button is clicked", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("← Back to Home")).toBeInTheDocument();
      });

      const backButton = screen.getByText("← Back to Home");
      fireEvent.click(backButton);
      
      expect(mockPush).toHaveBeenCalledWith("/Instructor");
    });

    it("navigates to quiz generator when create button is clicked", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("+ Create a Quiz")).toBeInTheDocument();
      });

      const createButton = screen.getByText("+ Create a Quiz");
      fireEvent.click(createButton);
      
      expect(mockPush).toHaveBeenCalledWith("/Instructor/QuizGenerator");
    });
  });

  describe("Draft State Management", () => {
    it("clears draft state when creating new quiz", async () => {
      localStorage.setItem("quizConfigDraft", JSON.stringify({ title: "Old Quiz" }));
      localStorage.setItem("quizPreviewData", JSON.stringify({ id: "1" }));
      
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("+ Create a Quiz")).toBeInTheDocument();
      });

      const createButton = screen.getByText("+ Create a Quiz");
      fireEvent.click(createButton);
      
      expect(localStorage.getItem("quizConfigDraft")).toBeNull();
      expect(localStorage.getItem("quizPreviewData")).toBeNull();
    });

    it("handles localStorage errors when clearing draft state", async () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
      const removeItemSpy = jest.spyOn(Storage.prototype, "removeItem");
      removeItemSpy.mockImplementation(() => {
        throw new Error("Storage error");
      });

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("+ Create a Quiz")).toBeInTheDocument();
      });

      const createButton = screen.getByText("+ Create a Quiz");
      expect(() => fireEvent.click(createButton)).not.toThrow();
      
      removeItemSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });

  describe("Quiz Display", () => {
    it("displays quiz name", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          name: "Science Quiz",
          default_mode: "assessment",
          topics: ["Biology"],
          created_at: "2024-01-01T00:00:00Z",
          is_published: false,
          metadata: {},
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Science Quiz")).toBeInTheDocument();
      });
    });

    it("displays 'Untitled quiz' when name is missing", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          name: null,
          default_mode: "practice",
          topics: ["General"],
          created_at: "2024-01-01T00:00:00Z",
          is_published: false,
          metadata: {},
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Untitled quiz")).toBeInTheDocument();
      });
    });

    it("displays quiz description", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          name: "History Quiz",
          default_mode: "practice",
          topics: ["Ancient History"],
          created_at: "2024-01-01T00:00:00Z",
          is_published: true,
          metadata: {
            description: "Test your knowledge of ancient civilizations",
          },
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Test your knowledge of ancient civilizations")).toBeInTheDocument();
      });
    });

    it("displays 'No description provided' when description is missing", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          name: "No Desc Quiz",
          default_mode: "practice",
          topics: ["General"],
          created_at: "2024-01-01T00:00:00Z",
          is_published: false,
          metadata: {},
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("No description provided.")).toBeInTheDocument();
      });
    });

    it("displays quiz mode", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          name: "Quiz",
          default_mode: "assessment",
          topics: ["General"],
          created_at: "2024-01-01T00:00:00Z",
          is_published: false,
          metadata: {},
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Mode: assessment/i)).toBeInTheDocument();
      });
    });

    it("displays quiz topics", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          name: "Quiz",
          default_mode: "practice",
          topics: ["Math", "Physics", "Chemistry"],
          created_at: "2024-01-01T00:00:00Z",
          is_published: false,
          metadata: {},
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Topics: Math, Physics, Chemistry/i)).toBeInTheDocument();
      });
    });

    it("displays 'General' when topics are missing", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          name: "Quiz",
          default_mode: "practice",
          topics: null,
          created_at: "2024-01-01T00:00:00Z",
          is_published: false,
          metadata: {},
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Topics: General/i)).toBeInTheDocument();
      });
    });

    it("displays updated date when available", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          name: "Quiz",
          default_mode: "practice",
          topics: ["General"],
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-02-15T00:00:00Z",
          is_published: false,
          metadata: {},
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Updated: 2\/15\/2024/i)).toBeInTheDocument();
      });
    });

    it("displays created date when updated date is missing", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          name: "Quiz",
          default_mode: "practice",
          topics: ["General"],
          created_at: "2024-03-10T00:00:00Z",
          is_published: false,
          metadata: {},
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Updated: 3\/10\/2024/i)).toBeInTheDocument();
      });
    });

    it("displays 'Published' status", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          name: "Published Quiz",
          default_mode: "practice",
          topics: ["General"],
          created_at: "2024-01-01T00:00:00Z",
          is_published: true,
          metadata: {},
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Status: Published/i)).toBeInTheDocument();
      });
    });

    it("displays 'Draft' status", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          name: "Draft Quiz",
          default_mode: "practice",
          topics: ["General"],
          created_at: "2024-01-01T00:00:00Z",
          is_published: false,
          metadata: {},
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Status: Draft/i)).toBeInTheDocument();
      });
    });

    it("displays multiple quizzes", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          name: "Quiz One",
          default_mode: "practice",
          topics: ["General"],
          created_at: "2024-01-01T00:00:00Z",
          is_published: false,
          metadata: {},
        },
        {
          quiz_id: "quiz-2",
          name: "Quiz Two",
          default_mode: "assessment",
          topics: ["Advanced"],
          created_at: "2024-01-02T00:00:00Z",
          is_published: true,
          metadata: {},
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Quiz One")).toBeInTheDocument();
        expect(screen.getByText("Quiz Two")).toBeInTheDocument();
      });
    });
  });

  describe("Opening Quizzes", () => {
    it("opens practice quiz and sets draft state", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-1",
          name: "Practice Quiz",
          default_mode: "practice",
          topics: ["Math", "Science"],
          created_at: "2024-01-01T00:00:00Z",
          is_published: false,
          metadata: {
            description: "A practice quiz",
            practiceTopics: ["Algebra"],
          },
          source_filename: "slides.pdf",
          embedding_document_id: "doc-123",
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Practice Quiz")).toBeInTheDocument();
      });

      const quizButton = screen.getByText("Practice Quiz");
      fireEvent.click(quizButton);
      
      expect(mockPush).toHaveBeenCalledWith("/Instructor/Practice");
      
      const draft = JSON.parse(localStorage.getItem("quizConfigDraft"));
      expect(draft.mode).toBe("practice");
      expect(draft.title).toBe("Practice Quiz");
      expect(draft.topics).toEqual(["Algebra"]);
    });

    it("opens assessment quiz and sets draft state", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-2",
          name: "Assessment Quiz",
          default_mode: "assessment",
          topics: ["History"],
          created_at: "2024-01-01T00:00:00Z",
          is_published: true,
          assessment_max_attempts: 3,
          assessment_num_questions: 10,
          assessment_time_limit_minutes: 30,
          initial_difficulty: "hard",
          metadata: {
            description: "An assessment",
            topicsToTest: ["World War II"],
          },
          source_filename: "notes.pdf",
          embedding_document_id: "doc-456",
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Assessment Quiz")).toBeInTheDocument();
      });

      const quizButton = screen.getByText("Assessment Quiz");
      fireEvent.click(quizButton);
      
      expect(mockPush).toHaveBeenCalledWith("/Instructor/Assessment");
      
      const draft = JSON.parse(localStorage.getItem("quizConfigDraft"));
      expect(draft.mode).toBe("assessment");
      expect(draft.configuration.title).toBe("Assessment Quiz");
      expect(draft.configuration.numberOfAttempts).toBe("3");
      expect(draft.configuration.numberOfQuestions).toBe("10");
      expect(draft.configuration.timeLimit).toBe("30");
      expect(draft.configuration.difficulty).toBe("hard");
      expect(draft.configuration.topicsToTest).toEqual(["World War II"]);
    });

    it("uses metadata string values for assessment configuration", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-3",
          name: "Test Quiz",
          default_mode: "assessment",
          topics: ["General"],
          created_at: "2024-01-01T00:00:00Z",
          is_published: false,
          assessment_max_attempts: 2,
          assessment_num_questions: 15,
          assessment_time_limit_minutes: 45,
          metadata: {
            numberOfAttempts: "5",
            numberOfQuestions: "20",
            timeLimitLabel: "60",
            difficultyLabel: "easy",
          },
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Test Quiz")).toBeInTheDocument();
      });

      const quizButton = screen.getByText("Test Quiz");
      fireEvent.click(quizButton);
      
      const draft = JSON.parse(localStorage.getItem("quizConfigDraft"));
      expect(draft.configuration.numberOfAttempts).toBe("5");
      expect(draft.configuration.numberOfQuestions).toBe("20");
      expect(draft.configuration.timeLimit).toBe("60");
      expect(draft.configuration.difficulty).toBe("easy");
    });

    it("falls back to quiz topics when metadata topics are missing for practice", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-4",
          name: "Fallback Quiz",
          default_mode: "practice",
          topics: ["Default Topic"],
          created_at: "2024-01-01T00:00:00Z",
          is_published: false,
          metadata: {},
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Fallback Quiz")).toBeInTheDocument();
      });

      const quizButton = screen.getByText("Fallback Quiz");
      fireEvent.click(quizButton);
      
      const draft = JSON.parse(localStorage.getItem("quizConfigDraft"));
      expect(draft.topics).toEqual(["Default Topic"]);
    });

    it("falls back to quiz topics when metadata topics are missing for assessment", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-5",
          name: "Assessment Fallback",
          default_mode: "assessment",
          topics: ["Fallback Topic"],
          created_at: "2024-01-01T00:00:00Z",
          is_published: false,
          assessment_max_attempts: 1,
          metadata: {},
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Assessment Fallback")).toBeInTheDocument();
      });

      const quizButton = screen.getByText("Assessment Fallback");
      fireEvent.click(quizButton);
      
      const draft = JSON.parse(localStorage.getItem("quizConfigDraft"));
      expect(draft.configuration.topicsToTest).toEqual(["Fallback Topic"]);
    });

    it("uses 'General' when no topics are available for practice", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-6",
          name: "No Topics Quiz",
          default_mode: "practice",
          topics: null,
          created_at: "2024-01-01T00:00:00Z",
          is_published: false,
          metadata: {},
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("No Topics Quiz")).toBeInTheDocument();
      });

      const quizButton = screen.getByText("No Topics Quiz");
      fireEvent.click(quizButton);
      
      const draft = JSON.parse(localStorage.getItem("quizConfigDraft"));
      expect(draft.topics).toEqual(["General"]);
    });

    it("uses 'General' when no topics are available for assessment", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-7",
          name: "No Topics Assessment",
          default_mode: "assessment",
          topics: null,
          created_at: "2024-01-01T00:00:00Z",
          is_published: false,
          metadata: {},
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("No Topics Assessment")).toBeInTheDocument();
      });

      const quizButton = screen.getByText("No Topics Assessment");
      fireEvent.click(quizButton);
      
      const draft = JSON.parse(localStorage.getItem("quizConfigDraft"));
      expect(draft.configuration.topicsToTest).toEqual(["General"]);
    });

    it("defaults difficulty to 'medium' when not specified", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-8",
          name: "Default Difficulty",
          default_mode: "assessment",
          topics: ["General"],
          created_at: "2024-01-01T00:00:00Z",
          is_published: false,
          metadata: {},
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Default Difficulty")).toBeInTheDocument();
      });

      const quizButton = screen.getByText("Default Difficulty");
      fireEvent.click(quizButton);
      
      const draft = JSON.parse(localStorage.getItem("quizConfigDraft"));
      expect(draft.configuration.difficulty).toBe("medium");
    });

    it("handles localStorage error when opening quiz", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const setItemSpy = jest.spyOn(Storage.prototype, "setItem");
      setItemSpy.mockImplementation(() => {
        throw new Error("Storage full");
      });

      const mockQuizzes = [
        {
          quiz_id: "quiz-9",
          name: "Error Quiz",
          default_mode: "practice",
          topics: ["General"],
          created_at: "2024-01-01T00:00:00Z",
          is_published: false,
          metadata: {},
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Error Quiz")).toBeInTheDocument();
      });

      const quizButton = screen.getByText("Error Quiz");
      expect(() => fireEvent.click(quizButton)).not.toThrow();
      
      setItemSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it("ignores empty practice topics array and uses quiz topics", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-10",
          name: "Empty Array Quiz",
          default_mode: "practice",
          topics: ["Physics"],
          created_at: "2024-01-01T00:00:00Z",
          is_published: false,
          metadata: {
            practiceTopics: [],
          },
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Empty Array Quiz")).toBeInTheDocument();
      });

      const quizButton = screen.getByText("Empty Array Quiz");
      fireEvent.click(quizButton);
      
      const draft = JSON.parse(localStorage.getItem("quizConfigDraft"));
      expect(draft.topics).toEqual(["Physics"]);
    });

    it("ignores empty assessment topics array and uses quiz topics", async () => {
      const mockQuizzes = [
        {
          quiz_id: "quiz-11",
          name: "Empty Assessment Topics",
          default_mode: "assessment",
          topics: ["Chemistry"],
          created_at: "2024-01-01T00:00:00Z",
          is_published: false,
          metadata: {
            topicsToTest: [],
          },
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuizzes),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Empty Assessment Topics")).toBeInTheDocument();
      });

      const quizButton = screen.getByText("Empty Assessment Topics");
      fireEvent.click(quizButton);
      
      const draft = JSON.parse(localStorage.getItem("quizConfigDraft"));
      expect(draft.configuration.topicsToTest).toEqual(["Chemistry"]);
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

      const { unmount } = render(<InstructorQuizzesPage />);
      
      unmount();
      
      // Wait for the delayed response
      await new Promise((resolve) => setTimeout(resolve, 150));
      
      // No errors should occur from setState on unmounted component
    });
  });

  describe("Styling", () => {
    it("applies Poppins font class to title", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        const title = screen.getByText("My Quizzes");
        expect(title).toHaveClass("mocked-poppins");
      });
    });

    it("applies gradient to create button", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        const createButton = screen.getByText("+ Create a Quiz");
        expect(createButton).toHaveStyle({
          background: "linear-gradient(to right, #7B2CBF, #3B82F6)",
        });
      });
    });
  });

  describe("Empty State SVG", () => {
    it("renders empty state SVG when no quizzes", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const { container } = render(<InstructorQuizzesPage />);
      
      await waitFor(() => {
        const svg = container.querySelector("svg");
        expect(svg).toBeInTheDocument();
      });
    });
  });
});
