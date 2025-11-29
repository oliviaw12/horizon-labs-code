import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import QuizScorePage from "./score";

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

// Mock ConditionalHeader
jest.mock("../../components/ConditionalHeader", () => {
  return function MockConditionalHeader() {
    return <div data-testid="conditional-header">Header</div>;
  };
});

// Mock fetch globally
global.fetch = jest.fn();

describe("QuizScorePage Component", () => {
  let mockPush;

  beforeEach(() => {
    localStorage.clear();
    mockPush = jest.fn();
    useRouter.mockReturnValue({
      push: mockPush,
    });
    jest.clearAllMocks();
    global.fetch.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Initial Rendering", () => {
    it("renders loading state initially", () => {
      render(<QuizScorePage />);
      
      expect(screen.getByText("Calculating results...")).toBeInTheDocument();
    });

    it("renders ConditionalHeader", () => {
      render(<QuizScorePage />);
      
      expect(screen.getByTestId("conditional-header")).toBeInTheDocument();
    });

    it("loading state has proper styling", () => {
      render(<QuizScorePage />);
      
      const loadingText = screen.getByText("Calculating results...");
      expect(loadingText).toHaveClass("text-purple-900");
      expect(loadingText).toHaveClass("mocked-poppins");
    });
  });

  describe("Score Calculation", () => {
    it("calculates score from localStorage data", async () => {
      const questions = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const responses = [
        { isCorrect: true },
        { isCorrect: false },
        { isCorrect: true },
      ];

      localStorage.setItem("quizPreviewQuestions", JSON.stringify(questions));
      localStorage.setItem("quizPreviewResponses", JSON.stringify(responses));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("67%")).toBeInTheDocument();
      });
    });

    it("displays correct answers count", async () => {
      const questions = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
      const responses = [
        { isCorrect: true },
        { isCorrect: true },
        { isCorrect: false },
        { isCorrect: true },
      ];

      localStorage.setItem("quizPreviewQuestions", JSON.stringify(questions));
      localStorage.setItem("quizPreviewResponses", JSON.stringify(responses));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("3/4 questions")).toBeInTheDocument();
      });
    });

    it("displays 0% for all incorrect answers", async () => {
      const questions = [{ id: 1 }, { id: 2 }];
      const responses = [
        { isCorrect: false },
        { isCorrect: false },
      ];

      localStorage.setItem("quizPreviewQuestions", JSON.stringify(questions));
      localStorage.setItem("quizPreviewResponses", JSON.stringify(responses));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("0%")).toBeInTheDocument();
      });
    });

    it("displays 100% for all correct answers", async () => {
      const questions = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const responses = [
        { isCorrect: true },
        { isCorrect: true },
        { isCorrect: true },
      ];

      localStorage.setItem("quizPreviewQuestions", JSON.stringify(questions));
      localStorage.setItem("quizPreviewResponses", JSON.stringify(responses));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("100%")).toBeInTheDocument();
      });
    });

    it("handles empty quiz data gracefully", async () => {
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([]));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("0%")).toBeInTheDocument();
        expect(screen.getByText("0/0 questions")).toBeInTheDocument();
      });
    });

    it("handles missing localStorage data", async () => {
      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("0%")).toBeInTheDocument();
      });
    });

    it("handles invalid JSON in localStorage", async () => {
      localStorage.setItem("quizPreviewQuestions", "invalid json");
      localStorage.setItem("quizPreviewResponses", "invalid json");

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("0%")).toBeInTheDocument();
      });
    });

    it("rounds percentage to nearest integer", async () => {
      const questions = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const responses = [
        { isCorrect: true },
        { isCorrect: false },
        { isCorrect: false },
      ];

      localStorage.setItem("quizPreviewQuestions", JSON.stringify(questions));
      localStorage.setItem("quizPreviewResponses", JSON.stringify(responses));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("33%")).toBeInTheDocument();
      });
    });
  });

  describe("Quiz Metadata", () => {
    it("loads quiz metadata from localStorage", async () => {
      const quizMeta = {
        quizId: "quiz-123",
        title: "Test Quiz",
        isPublished: false,
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("100%")).toBeInTheDocument();
      });
    });

    it("handles missing quiz metadata", async () => {
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("100%")).toBeInTheDocument();
      });
    });

    it("uses isPublished status from metadata", async () => {
      const quizMeta = {
        quizId: "quiz-123",
        isPublished: true,
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("Unpublish Quiz")).toBeInTheDocument();
      });
    });

    it("defaults to unpublished when metadata missing", async () => {
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("Publish Quiz")).toBeInTheDocument();
      });
    });
  });

  describe("Edit Quiz Button", () => {
    it("renders edit quiz button", async () => {
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("Edit Quiz")).toBeInTheDocument();
      });
    });

    it("navigates to quiz generator on click", async () => {
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("Edit Quiz")).toBeInTheDocument();
      });

      const editButton = screen.getByText("Edit Quiz");
      fireEvent.click(editButton);
      
      expect(mockPush).toHaveBeenCalledWith("/Instructor/QuizGenerator");
    });

    it("edit button has gradient background", async () => {
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        const editButton = screen.getByText("Edit Quiz");
        expect(editButton).toHaveStyle({
          background: "linear-gradient(to right, #7B2CBF, #3B82F6)",
        });
      });
    });

    it("edit button has hover effect", async () => {
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        const editButton = screen.getByText("Edit Quiz");
        expect(editButton).toHaveClass("hover:scale-105");
      });
    });
  });

  describe("Publish Button - Initial State", () => {
    it("renders publish button", async () => {
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("Publish Quiz")).toBeInTheDocument();
      });
    });

    it("shows 'Unpublish Quiz' when already published", async () => {
      const quizMeta = {
        quizId: "quiz-123",
        isPublished: true,
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("Unpublish Quiz")).toBeInTheDocument();
      });
    });

    it("publish button is disabled when no quiz ID", async () => {
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        const publishButton = screen.getByText("Publish Quiz");
        expect(publishButton).toBeDisabled();
      });
    });

    it("shows helper text when no quiz ID", async () => {
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Save this quiz first to enable publishing/i)).toBeInTheDocument();
      });
    });

    it("publish button is enabled when quiz ID exists", async () => {
      const quizMeta = {
        quizId: "quiz-123",
        isPublished: false,
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        const publishButton = screen.getByText("Publish Quiz");
        expect(publishButton).not.toBeDisabled();
      });
    });
  });

  describe("Publish Functionality", () => {
    it("publishes quiz successfully", async () => {
      const quizMeta = {
        quizId: "quiz-123",
        isPublished: false,
      };

      const definitionData = {
        quiz_id: "quiz-123",
        name: "Test Quiz",
        topics: ["Math"],
        default_mode: "practice",
        initial_difficulty: "medium",
        assessment_num_questions: 10,
        assessment_time_limit_minutes: 30,
        assessment_max_attempts: 3,
        embedding_document_id: "doc-1",
        source_filename: "test.pdf",
        is_published: false,
        metadata: null,
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(definitionData),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ ...definitionData, is_published: true }),
        });

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("Publish Quiz")).toBeInTheDocument();
      });

      const publishButton = screen.getByText("Publish Quiz");
      fireEvent.click(publishButton);
      
      await waitFor(() => {
        expect(screen.getByText("Quiz published. Learners can now access it.")).toBeInTheDocument();
      });
    });

    it("unpublishes quiz successfully", async () => {
      const quizMeta = {
        quizId: "quiz-123",
        isPublished: true,
      };

      const definitionData = {
        quiz_id: "quiz-123",
        name: "Test Quiz",
        topics: ["Math"],
        default_mode: "practice",
        initial_difficulty: "medium",
        assessment_num_questions: 10,
        assessment_time_limit_minutes: 30,
        assessment_max_attempts: 3,
        embedding_document_id: "doc-1",
        source_filename: "test.pdf",
        is_published: true,
        metadata: null,
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(definitionData),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ ...definitionData, is_published: false }),
        });

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("Unpublish Quiz")).toBeInTheDocument();
      });

      const unpublishButton = screen.getByText("Unpublish Quiz");
      fireEvent.click(unpublishButton);
      
      await waitFor(() => {
        expect(screen.getByText("Quiz moved back to draft.")).toBeInTheDocument();
      });
    });

    it("handles publish without quiz ID", async () => {
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        const publishButton = screen.getByText("Publish Quiz");
        expect(publishButton).toBeDisabled();
      });
    });

    it("handles definition fetch error - 404", async () => {
      const quizMeta = {
        quizId: "quiz-123",
        isPublished: false,
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ detail: "Quiz not found" }),
      });

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("Publish Quiz")).toBeInTheDocument();
      });

      const publishButton = screen.getByText("Publish Quiz");
      fireEvent.click(publishButton);
      
      await waitFor(() => {
        expect(screen.getByText("Save this quiz before publishing.")).toBeInTheDocument();
      });
    });

    it("handles definition fetch error - generic", async () => {
      const quizMeta = {
        quizId: "quiz-123",
        isPublished: false,
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ detail: "Server error" }),
      });

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("Publish Quiz")).toBeInTheDocument();
      });

      const publishButton = screen.getByText("Publish Quiz");
      fireEvent.click(publishButton);
      
      await waitFor(() => {
        expect(screen.getByText("Server error")).toBeInTheDocument();
      });
    });

    it("handles publish request error", async () => {
      const quizMeta = {
        quizId: "quiz-123",
        isPublished: false,
      };

      const definitionData = {
        quiz_id: "quiz-123",
        name: "Test Quiz",
        topics: ["Math"],
        default_mode: "practice",
        initial_difficulty: "medium",
        assessment_num_questions: 10,
        assessment_time_limit_minutes: 30,
        assessment_max_attempts: 3,
        embedding_document_id: "doc-1",
        source_filename: "test.pdf",
        is_published: false,
        metadata: null,
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(definitionData),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ detail: "Unable to publish" }),
        });

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("Publish Quiz")).toBeInTheDocument();
      });

      const publishButton = screen.getByText("Publish Quiz");
      fireEvent.click(publishButton);
      
      await waitFor(() => {
        expect(screen.getByText("Unable to publish")).toBeInTheDocument();
      });
    });

    it("prevents multiple simultaneous publish clicks", async () => {
      const quizMeta = {
        quizId: "quiz-123",
        isPublished: false,
      };

      const definitionData = {
        quiz_id: "quiz-123",
        name: "Test Quiz",
        topics: ["Math"],
        default_mode: "practice",
        initial_difficulty: "medium",
        assessment_num_questions: 10,
        assessment_time_limit_minutes: 30,
        assessment_max_attempts: 3,
        embedding_document_id: "doc-1",
        source_filename: "test.pdf",
        is_published: false,
        metadata: null,
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("Publish Quiz")).toBeInTheDocument();
      });

      const publishButton = screen.getByText("Publish Quiz");
      fireEvent.click(publishButton);
      fireEvent.click(publishButton);
      fireEvent.click(publishButton);
      
      // Should only trigger once
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Publish Notice Timeout", () => {
    it("clears notice after 4 seconds", async () => {
      const quizMeta = {
        quizId: "quiz-123",
        isPublished: false,
      };

      const definitionData = {
        quiz_id: "quiz-123",
        name: "Test Quiz",
        topics: ["Math"],
        default_mode: "practice",
        initial_difficulty: "medium",
        assessment_num_questions: 10,
        assessment_time_limit_minutes: 30,
        assessment_max_attempts: 3,
        embedding_document_id: "doc-1",
        source_filename: "test.pdf",
        is_published: false,
        metadata: null,
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(definitionData),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ ...definitionData, is_published: true }),
        });

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("Publish Quiz")).toBeInTheDocument();
      });

      const publishButton = screen.getByText("Publish Quiz");
      fireEvent.click(publishButton);
      
      await waitFor(() => {
        expect(screen.getByText("Quiz published. Learners can now access it.")).toBeInTheDocument();
      });

      jest.advanceTimersByTime(4000);
      
      await waitFor(() => {
        expect(screen.queryByText("Quiz published. Learners can now access it.")).not.toBeInTheDocument();
      });
    });

    it("clears previous timeout when showing new notice", async () => {
      const quizMeta = {
        quizId: "quiz-123",
        isPublished: false,
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
      });

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("Publish Quiz")).toBeInTheDocument();
      });

      const publishButton = screen.getByText("Publish Quiz");
      fireEvent.click(publishButton);
      
      await waitFor(() => {
        expect(screen.getByText("Save this quiz before publishing.")).toBeInTheDocument();
      });

      // Advance time partially
      jest.advanceTimersByTime(2000);
      
      // Trigger another notice
      fireEvent.click(publishButton);
      
      await waitFor(() => {
        expect(screen.getByText("Save this quiz before publishing.")).toBeInTheDocument();
      });
    });
  });

  describe("Publish State Fetching", () => {
    it("fetches publish state when metadata missing isPublished", async () => {
      const quizMeta = {
        quizId: "quiz-123",
        // isPublished is undefined
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ is_published: true }),
      });

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/quiz/definitions/quiz-123")
        );
      });
    });

    it("does not fetch publish state when already defined", async () => {
      const quizMeta = {
        quizId: "quiz-123",
        isPublished: true,
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("Unpublish Quiz")).toBeInTheDocument();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("handles fetch error gracefully", async () => {
      const quizMeta = {
        quizId: "quiz-123",
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      global.fetch.mockRejectedValueOnce(new Error("Network error"));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("Publish Quiz")).toBeInTheDocument();
      });
    });
  });

  describe("LocalStorage Updates", () => {
    it("updates localStorage on successful publish", async () => {
      const quizMeta = {
        quizId: "quiz-123",
        isPublished: false,
      };

      const definitionData = {
        quiz_id: "quiz-123",
        name: "Test Quiz",
        topics: ["Math"],
        default_mode: "practice",
        initial_difficulty: "medium",
        assessment_num_questions: 10,
        assessment_time_limit_minutes: 30,
        assessment_max_attempts: 3,
        embedding_document_id: "doc-1",
        source_filename: "test.pdf",
        is_published: false,
        metadata: null,
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(definitionData),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ ...definitionData, is_published: true }),
        });

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("Publish Quiz")).toBeInTheDocument();
      });

      const publishButton = screen.getByText("Publish Quiz");
      fireEvent.click(publishButton);
      
      await waitFor(() => {
        const storedData = JSON.parse(localStorage.getItem("quizPreviewData"));
        expect(storedData.isPublished).toBe(true);
      });
    });
  });

  describe("Score Circle Styling", () => {
    it("score circle has gradient background", async () => {
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      const { container } = render(<QuizScorePage />);
      
      await waitFor(() => {
        const scoreCircle = container.querySelector(".w-64.h-64.rounded-full");
        expect(scoreCircle).toHaveStyle({
          background: "linear-gradient(135deg, #EC4899, #F472B6)",
        });
      });
    });

    it("displays 'Your Score' label", async () => {
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("Your Score")).toBeInTheDocument();
      });
    });
  });

  describe("Component Layout", () => {
    it("has min-h-screen background", async () => {
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      const { container } = render(<QuizScorePage />);
      
      const mainContainer = container.querySelector(".min-h-screen.bg-pink-50");
      expect(mainContainer).toBeInTheDocument();
    });

    it("buttons are in flex column layout", async () => {
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      const { container } = render(<QuizScorePage />);
      
      await waitFor(() => {
        const buttonContainer = container.querySelector(".flex.flex-col.gap-4");
        expect(buttonContainer).toBeInTheDocument();
      });
    });
  });

  describe("Publish Button Styling", () => {
    it("publish button has gradient background", async () => {
      const quizMeta = {
        quizId: "quiz-123",
        isPublished: false,
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        const publishButton = screen.getByText("Publish Quiz");
        expect(publishButton).toHaveStyle({
          background: "linear-gradient(to right, #EC4899, #F97316)",
        });
      });
    });

    it("disabled button has opacity class", async () => {
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        const publishButton = screen.getByText("Publish Quiz");
        expect(publishButton).toHaveClass("disabled:opacity-60");
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles quiz with ID property instead of quizId", async () => {
      const quizMeta = {
        id: "quiz-456",
        isPublished: false,
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        const publishButton = screen.getByText("Publish Quiz");
        expect(publishButton).not.toBeDisabled();
      });
    });

    it("handles responses with null isCorrect values", async () => {
      const questions = [{ id: 1 }, { id: 2 }];
      const responses = [
        { isCorrect: null },
        { isCorrect: true },
      ];

      localStorage.setItem("quizPreviewQuestions", JSON.stringify(questions));
      localStorage.setItem("quizPreviewResponses", JSON.stringify(responses));

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("50%")).toBeInTheDocument();
      });
    });

    it("handles definition with empty topics array", async () => {
      const quizMeta = {
        quizId: "quiz-123",
        isPublished: false,
      };

      const definitionData = {
        quiz_id: "quiz-123",
        name: "Test Quiz",
        topics: [],
        default_mode: "practice",
        initial_difficulty: "medium",
        assessment_num_questions: 10,
        assessment_time_limit_minutes: 30,
        assessment_max_attempts: 3,
        embedding_document_id: "doc-1",
        source_filename: "test.pdf",
        is_published: false,
        metadata: null,
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(definitionData),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ ...definitionData, is_published: true }),
        });

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("Publish Quiz")).toBeInTheDocument();
      });

      const publishButton = screen.getByText("Publish Quiz");
      fireEvent.click(publishButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/quiz/definitions"),
          expect.objectContaining({
            method: "POST",
            body: expect.stringContaining('"topics":["General"]'),
          })
        );
      });
    });
  });

  describe("Component Unmount", () => {
    it("cleans up timeout on unmount", async () => {
      const quizMeta = {
        quizId: "quiz-123",
        isPublished: false,
      };

      const definitionData = {
        quiz_id: "quiz-123",
        name: "Test Quiz",
        topics: ["Math"],
        default_mode: "practice",
        initial_difficulty: "medium",
        assessment_num_questions: 10,
        assessment_time_limit_minutes: 30,
        assessment_max_attempts: 3,
        embedding_document_id: "doc-1",
        source_filename: "test.pdf",
        is_published: false,
        metadata: null,
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(definitionData),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ ...definitionData, is_published: true }),
        });

      const { unmount } = render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(screen.getByText("Publish Quiz")).toBeInTheDocument();
      });

      const publishButton = screen.getByText("Publish Quiz");
      fireEvent.click(publishButton);
      
      await waitFor(() => {
        expect(screen.getByText("Quiz published. Learners can now access it.")).toBeInTheDocument();
      });

      unmount();
      
      jest.advanceTimersByTime(4000);
    });
  });

  describe("API Endpoints", () => {
    it("uses correct definition endpoint", async () => {
      const quizMeta = {
        quizId: "quiz-123",
      };

      localStorage.setItem("quizPreviewData", JSON.stringify(quizMeta));
      localStorage.setItem("quizPreviewQuestions", JSON.stringify([{ id: 1 }]));
      localStorage.setItem("quizPreviewResponses", JSON.stringify([{ isCorrect: true }]));

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ is_published: false }),
      });

      render(<QuizScorePage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringMatching(/\/quiz\/definitions\/quiz-123$/)
        );
      });
    });
  });
});
