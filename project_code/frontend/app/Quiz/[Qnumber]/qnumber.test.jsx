import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import QuizPage from "./qnumber";

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

describe("QuizPage Component", () => {
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

  describe("Initial Rendering and Loading", () => {
    it("renders loading state initially", () => {
      render(<QuizPage />);
      
      expect(screen.getByText("Loading question...")).toBeInTheDocument();
    });

    it("loading state has proper styling", () => {
      render(<QuizPage />);
      
      const loadingText = screen.getByText("Loading question...");
      expect(loadingText).toHaveClass("text-purple-900");
      expect(loadingText).toHaveClass("mocked-poppins");
    });

    it("has pink background in loading state", () => {
      const { container } = render(<QuizPage />);
      
      const mainContainer = container.querySelector(".min-h-screen.bg-pink-50");
      expect(mainContainer).toBeInTheDocument();
    });
  });

  describe("Session Initialization", () => {
    it("creates new session and fetches first question", async () => {
      const quizMeta = {
        quizId: "quiz-123",
        mode: "practice",
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));

      const mockQuestion = {
        question_id: "q1",
        prompt: "What is 2+2?",
        choices: ["3", "4", "5", "6"],
        topic: "Math",
        difficulty: "easy",
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ session_id: "session-123" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockQuestion),
        });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("What is 2+2?")).toBeInTheDocument();
      });
    });

    it("uses stored session if available", async () => {
      const quizMeta = {
        quizId: "quiz-123",
        mode: "practice",
      };

      const storedSession = {
        sessionId: "stored-session",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test Question",
        choices: ["A", "B", "C", "D"],
        topic: "General",
        difficulty: "medium",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuestion),
      });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Test Question")).toBeInTheDocument();
      });

      // Should not call session start endpoint
      expect(global.fetch).not.toHaveBeenCalledWith(
        expect.stringContaining("/session/start"),
        expect.anything()
      );
    });

    it("handles missing quiz ID error", async () => {
      localStorage.setItem("quizPreviewData", JSON.stringify({}));

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/No questions are available/i)).toBeInTheDocument();
      });
    });
  });

  describe("Question Display", () => {
    it("displays question prompt", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "What is the capital of France?",
        choices: ["London", "Paris", "Berlin", "Madrid"],
        topic: "Geography",
        difficulty: "easy",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuestion),
      });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("What is the capital of France?")).toBeInTheDocument();
      });
    });

    it("displays answer options with letter labels", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test question",
        choices: ["Option One", "Option Two", "Option Three"],
        topic: "General",
        difficulty: "medium",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuestion),
      });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/A\./)).toBeInTheDocument();
        expect(screen.getByText("Option One")).toBeInTheDocument();
        expect(screen.getByText(/B\./)).toBeInTheDocument();
        expect(screen.getByText("Option Two")).toBeInTheDocument();
        expect(screen.getByText(/C\./)).toBeInTheDocument();
        expect(screen.getByText("Option Three")).toBeInTheDocument();
      });
    });

    it("displays question number and count", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test",
        choices: ["A", "B"],
        topic: "General",
        difficulty: "medium",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuestion),
      });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Question 1 \/ 1/)).toBeInTheDocument();
      });
    });

    it("displays mode label for practice", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test",
        choices: ["A", "B"],
        topic: "General",
        difficulty: "medium",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuestion),
      });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Practice Quiz Preview/)).toBeInTheDocument();
      });
    });

    it("displays mode label for assessment", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "assessment" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "assessment",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test",
        choices: ["A", "B"],
        topic: "General",
        difficulty: "medium",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuestion),
      });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Assessment Quiz Preview/)).toBeInTheDocument();
      });
    });
  });

  describe("Question Metadata Display", () => {
    it("displays current difficulty", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "hard",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test",
        choices: ["A", "B"],
        topic: "General",
        difficulty: "hard",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuestion),
      });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Current difficulty:/)).toBeInTheDocument();
        expect(screen.getByText(/hard/i)).toBeInTheDocument();
      });
    });

    it("displays topic", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["Science"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test",
        choices: ["A", "B"],
        topic: "Science",
        difficulty: "medium",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuestion),
      });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Topic:/)).toBeInTheDocument();
        expect(screen.getByText("Science")).toBeInTheDocument();
      });
    });

    it("displays source information with slide number", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice", sourceFilename: "lecture.pdf" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test",
        choices: ["A", "B"],
        topic: "General",
        difficulty: "medium",
        source_metadata: {
          slide_number: 5,
          slide_title: "Introduction",
        },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuestion),
      });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Slide 5 · Introduction · lecture\.pdf/)).toBeInTheDocument();
      });
    });
  });

  describe("Answer Selection", () => {
    it("allows selecting an answer option", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test question",
        choices: ["First", "Second", "Third"],
        topic: "General",
        difficulty: "medium",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuestion),
      });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("First")).toBeInTheDocument();
      });

      const firstOption = screen.getByText("First").closest("button");
      fireEvent.click(firstOption);
      
      expect(firstOption).toHaveClass("bg-purple-200");
    });

    it("changes selection when clicking different option", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test",
        choices: ["Option A", "Option B"],
        topic: "General",
        difficulty: "medium",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuestion),
      });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Option A")).toBeInTheDocument();
      });

      const optionA = screen.getByText("Option A").closest("button");
      const optionB = screen.getByText("Option B").closest("button");
      
      fireEvent.click(optionA);
      expect(optionA).toHaveClass("bg-purple-200");
      
      fireEvent.click(optionB);
      expect(optionB).toHaveClass("bg-purple-200");
      expect(optionA).not.toHaveClass("bg-purple-200");
    });

    it("submit button is disabled when no answer selected", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test",
        choices: ["A", "B"],
        topic: "General",
        difficulty: "medium",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuestion),
      });

      render(<QuizPage />);
      
      await waitFor(() => {
        const submitButton = screen.getByText("Submit Answer");
        expect(submitButton).toBeDisabled();
      });
    });

    it("submit button is enabled when answer selected", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test",
        choices: ["Answer A", "Answer B"],
        topic: "General",
        difficulty: "medium",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuestion),
      });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Answer A")).toBeInTheDocument();
      });

      const optionA = screen.getByText("Answer A").closest("button");
      fireEvent.click(optionA);
      
      const submitButton = screen.getByText("Submit Answer");
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("Answer Submission", () => {
    it("submits answer and shows feedback", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "What is 2+2?",
        choices: ["3", "4", "5"],
        topic: "Math",
        difficulty: "easy",
      };

      const mockResponse = {
        is_correct: true,
        selected_answer: "4",
        correct_answer: "4",
        correct_rationale: "2+2 equals 4",
        incorrect_rationales: {},
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockQuestion),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("What is 2+2?")).toBeInTheDocument();
      });

      const correctOption = screen.getByText("4").closest("button");
      fireEvent.click(correctOption);
      
      const submitButton = screen.getByText("Submit Answer");
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Correct — nice work!/)).toBeInTheDocument();
      });
    });

    it("shows incorrect feedback for wrong answer", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "What is 2+2?",
        choices: ["3", "4", "5"],
        topic: "Math",
        difficulty: "easy",
      };

      const mockResponse = {
        is_correct: false,
        selected_answer: "3",
        correct_answer: "4",
        correct_rationale: "2+2 equals 4",
        incorrect_rationales: {
          "3": "This is incorrect. 2+2 is not 3.",
        },
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockQuestion),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("What is 2+2?")).toBeInTheDocument();
      });

      const wrongOption = screen.getByText("3").closest("button");
      fireEvent.click(wrongOption);
      
      const submitButton = screen.getByText("Submit Answer");
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Not quite — review the explanations below/)).toBeInTheDocument();
      });
    });

    it("displays correct answer in feedback", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test",
        choices: ["Wrong", "Right"],
        topic: "General",
        difficulty: "medium",
      };

      const mockResponse = {
        is_correct: false,
        selected_answer: "Wrong",
        correct_answer: "Right",
        correct_rationale: "Right is correct",
        incorrect_rationales: {},
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockQuestion),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Test")).toBeInTheDocument();
      });

      const wrongOption = screen.getByText("Wrong").closest("button");
      fireEvent.click(wrongOption);
      
      const submitButton = screen.getByText("Submit Answer");
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Correct answer:/)).toBeInTheDocument();
        expect(screen.getByText("Right")).toBeInTheDocument();
      });
    });

    it("disables option buttons after submission", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test",
        choices: ["A", "B"],
        topic: "General",
        difficulty: "medium",
      };

      const mockResponse = {
        is_correct: true,
        selected_answer: "A",
        correct_answer: "A",
        correct_rationale: "A is correct",
        incorrect_rationales: {},
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockQuestion),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Test")).toBeInTheDocument();
      });

      const optionA = screen.getByText("A").closest("button");
      fireEvent.click(optionA);
      
      const submitButton = screen.getByText("Submit Answer");
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(optionA).toBeDisabled();
      });
    });
  });

  describe("Navigation Between Questions", () => {
    it("previous button is disabled on first question", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test",
        choices: ["A", "B"],
        topic: "General",
        difficulty: "medium",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuestion),
      });

      render(<QuizPage />);
      
      await waitFor(() => {
        const prevButton = screen.getByText("Previous Question");
        expect(prevButton).toBeDisabled();
      });
    });

    it("shows 'Next Question' button after submitting answer", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test",
        choices: ["A", "B"],
        topic: "General",
        difficulty: "medium",
      };

      const mockResponse = {
        is_correct: true,
        selected_answer: "A",
        correct_answer: "A",
        correct_rationale: "Correct",
        incorrect_rationales: {},
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockQuestion),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Test")).toBeInTheDocument();
      });

      const optionA = screen.getByText("A").closest("button");
      fireEvent.click(optionA);
      
      const submitButton = screen.getByText("Submit Answer");
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText("Next Question")).toBeInTheDocument();
      });
    });

    it("fetches new question when clicking Next Question", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion1 = {
        question_id: "q1",
        prompt: "Question 1",
        choices: ["A", "B"],
        topic: "General",
        difficulty: "medium",
      };

      const mockResponse1 = {
        is_correct: true,
        selected_answer: "A",
        correct_answer: "A",
        correct_rationale: "Correct",
        incorrect_rationales: {},
      };

      const mockQuestion2 = {
        question_id: "q2",
        prompt: "Question 2",
        choices: ["C", "D"],
        topic: "General",
        difficulty: "medium",
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockQuestion1),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse1),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockQuestion2),
        });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Question 1")).toBeInTheDocument();
      });

      const optionA = screen.getByText("A").closest("button");
      fireEvent.click(optionA);
      
      const submitButton = screen.getByText("Submit Answer");
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText("Next Question")).toBeInTheDocument();
      });

      const nextButton = screen.getByText("Next Question");
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText("Question 2")).toBeInTheDocument();
      });
    });
  });

  describe("Difficulty and Topic Selection", () => {
    it("displays difficulty selector", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test",
        choices: ["A", "B"],
        topic: "General",
        difficulty: "medium",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuestion),
      });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Next question difficulty:/)).toBeInTheDocument();
      });
    });

    it("allows changing difficulty", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test",
        choices: ["A", "B"],
        topic: "General",
        difficulty: "medium",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuestion),
      });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Test")).toBeInTheDocument();
      });

      const difficultySelect = screen.getByDisplayValue("Medium");
      fireEvent.change(difficultySelect, { target: { value: "hard" } });
      
      expect(difficultySelect.value).toBe("hard");
    });

    it("displays topic selector", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice", topicsToTest: ["Math", "Science"] };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["Math", "Science"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test",
        choices: ["A", "B"],
        topic: "Math",
        difficulty: "medium",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuestion),
      });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Next question topic:/)).toBeInTheDocument();
      });
    });

    it("allows changing topic", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice", topicsToTest: ["Math", "Science"] };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["Math", "Science"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test",
        choices: ["A", "B"],
        topic: "Math",
        difficulty: "medium",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuestion),
      });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Test")).toBeInTheDocument();
      });

      const topicSelect = screen.getByDisplayValue("Math");
      fireEvent.change(topicSelect, { target: { value: "Science" } });
      
      expect(topicSelect.value).toBe("Science");
    });
  });

  describe("Back to Configuration", () => {
    it("renders back button", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test",
        choices: ["A", "B"],
        topic: "General",
        difficulty: "medium",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuestion),
      });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("← Back to Configuration")).toBeInTheDocument();
      });
    });

    it("navigates to practice page for practice mode", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test",
        choices: ["A", "B"],
        topic: "General",
        difficulty: "medium",
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockQuestion),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({}),
        });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Test")).toBeInTheDocument();
      });

      const backButton = screen.getByText("← Back to Configuration");
      fireEvent.click(backButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/Instructor/Practice");
      });
    });

    it("navigates to assessment page for assessment mode", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "assessment" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "assessment",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test",
        choices: ["A", "B"],
        topic: "General",
        difficulty: "medium",
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockQuestion),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({}),
        });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Test")).toBeInTheDocument();
      });

      const backButton = screen.getByText("← Back to Configuration");
      fireEvent.click(backButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/Instructor/Assessment");
      });
    });
  });

  describe("Error Handling", () => {
    it("displays error when session creation fails", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));

      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ detail: "Unable to create session" }),
      });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Unable to create session/)).toBeInTheDocument();
      });
    });

    it("displays rate limit notice", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ detail: "Rate limit exceeded" }),
      });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/temporary content generation limit/)).toBeInTheDocument();
      });
    });

    it("closes rate limit modal", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ detail: "Rate limit" }),
      });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/temporary content generation limit/)).toBeInTheDocument();
      });

      const gotItButton = screen.getByText("Got it");
      fireEvent.click(gotItButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/temporary content generation limit/)).not.toBeInTheDocument();
      });
    });

    it("handles 404 error for expired session", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
      });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/session expired/i)).toBeInTheDocument();
      });
    });
  });

  describe("Option Styling", () => {
    it("correct option has green background after submission", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test",
        choices: ["Wrong", "Right"],
        topic: "General",
        difficulty: "medium",
      };

      const mockResponse = {
        is_correct: false,
        selected_answer: "Wrong",
        correct_answer: "Right",
        correct_rationale: "Right is correct",
        incorrect_rationales: { Wrong: "Wrong is incorrect" },
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockQuestion),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Test")).toBeInTheDocument();
      });

      const wrongOption = screen.getByText("Wrong").closest("button");
      fireEvent.click(wrongOption);
      
      const submitButton = screen.getByText("Submit Answer");
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const rightOption = screen.getByText("Right").closest("button");
        expect(rightOption).toHaveClass("bg-green-50");
        expect(rightOption).toHaveClass("border-green-500");
      });
    });

    it("incorrect selected option has red background", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test",
        choices: ["Wrong", "Right"],
        topic: "General",
        difficulty: "medium",
      };

      const mockResponse = {
        is_correct: false,
        selected_answer: "Wrong",
        correct_answer: "Right",
        correct_rationale: "Right is correct",
        incorrect_rationales: { Wrong: "Wrong is incorrect" },
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockQuestion),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Test")).toBeInTheDocument();
      });

      const wrongOption = screen.getByText("Wrong").closest("button");
      fireEvent.click(wrongOption);
      
      const submitButton = screen.getByText("Submit Answer");
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(wrongOption).toHaveClass("bg-red-50");
        expect(wrongOption).toHaveClass("border-red-400");
      });
    });
  });

  describe("Component Cleanup", () => {
    it("cleans up session on pagehide event", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test",
        choices: ["A", "B"],
        topic: "General",
        difficulty: "medium",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuestion),
      });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Test")).toBeInTheDocument();
      });

      // Simulate pagehide event
      window.dispatchEvent(new Event("pagehide"));
      
      // Should attempt to cleanup
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/session/session-123"),
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  describe("Empty State", () => {
    it("displays empty state with back button when no questions", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));

      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ detail: "No questions available" }),
      });

      render(<QuizPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Back to Configuration")).toBeInTheDocument();
      });
    });
  });

  describe("Button Gradients", () => {
    it("submit button has gradient background", async () => {
      const quizMeta = { quizId: "quiz-123", mode: "practice" };
      const storedSession = {
        sessionId: "session-123",
        quizId: "quiz-123",
        mode: "practice",
        initialDifficulty: "medium",
        topics: ["General"],
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewSession", JSON.stringify(storedSession));

      const mockQuestion = {
        question_id: "q1",
        prompt: "Test",
        choices: ["A", "B"],
        topic: "General",
        difficulty: "medium",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuestion),
      });

      render(<QuizPage />);
      
      await waitFor(() => {
        const submitButton = screen.getByText("Submit Answer");
        expect(submitButton).toHaveStyle({
          background: "linear-gradient(to right, #EC4899, #F97316)",
        });
      });
    });
  });
});
