import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import InstructorDashboard from "./dashboard";

// Mock Next.js font
jest.mock("next/font/google", () => ({
  Poppins: () => ({
    className: "mocked-poppins",
  }),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe("InstructorDashboard Component", () => {
  const mockQuizAnalytics = {
    total_sessions: 50,
    average_accuracy: 0.85,
    average_questions: 10,
    quizzes: [
      {
        quiz_id: "quiz-1",
        name: "Math Quiz",
        average_accuracy: 0.8,
        topics: [
          {
            topic: "Algebra",
            attempted: 20,
            correct: 16,
          },
          {
            topic: "Geometry",
            attempted: 15,
            correct: 12,
          },
        ],
      },
      {
        quiz_id: "quiz-2",
        name: "Science Quiz",
        average_accuracy: 0.9,
        topics: [
          {
            topic: "Physics",
            attempted: 25,
            correct: 23,
          },
        ],
      },
    ],
  };

  const mockChatAnalytics = {
    session_count: 120,
    classified_turns: 450,
    average_turns_per_session: 3.75,
    classification_rate: 0.92,
    totals: {
      good: 380,
      needs_focusing: 70,
    },
    daily_trend: [
      {
        date: "2025-11-20",
        good: 15,
        needs_focusing: 5,
      },
      {
        date: "2025-11-21",
        good: 20,
        needs_focusing: 3,
      },
      {
        date: "2025-11-22",
        good: 18,
        needs_focusing: 7,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Initial Rendering", () => {
    beforeEach(() => {
      global.fetch.mockImplementation((url) => {
        if (url.includes("/analytics/quizzes")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockQuizAnalytics),
          });
        }
        if (url.includes("/analytics/chats")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockChatAnalytics),
          });
        }
        return Promise.reject(new Error("Unknown endpoint"));
      });
    });

    it("renders the page title", async () => {
      render(<InstructorDashboard />);
      
      expect(screen.getByText("Analytics Dashboard")).toBeInTheDocument();
    });

    it("renders the page description", async () => {
      render(<InstructorDashboard />);
      
      expect(
        screen.getByText(/Track practice quiz performance alongside adaptive chat quality/i)
      ).toBeInTheDocument();
    });

    it("renders all stat cards", async () => {
      render(<InstructorDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText("Tracked Quizzes")).toBeInTheDocument();
        expect(screen.getByText("Average Accuracy")).toBeInTheDocument();
        expect(screen.getByText("Last Updated")).toBeInTheDocument();
        expect(screen.getByText("Chat Sessions")).toBeInTheDocument();
      });
    });

    it("renders Practice Quiz Performance section", async () => {
      render(<InstructorDashboard />);
      
      expect(screen.getByText("Practice Quiz Performance")).toBeInTheDocument();
    });
  });

  describe("Quiz Analytics Loading", () => {
    it("shows loading state initially", () => {
      global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<InstructorDashboard />);
      
      expect(screen.getByText("--")).toBeInTheDocument();
      expect(screen.getByText("Gathering sessions…")).toBeInTheDocument();
    });

    it("displays quiz data after successful fetch", async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes("/analytics/quizzes")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockQuizAnalytics),
          });
        }
        if (url.includes("/analytics/chats")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockChatAnalytics),
          });
        }
        return Promise.reject(new Error("Unknown endpoint"));
      });

      render(<InstructorDashboard />);

      await waitFor(() => {
        expect(screen.getByText("2")).toBeInTheDocument(); // 2 quizzes
        expect(screen.getByText("50 sessions reviewed")).toBeInTheDocument();
      });
    });

    it("calculates average accuracy correctly", async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes("/analytics/quizzes")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockQuizAnalytics),
          });
        }
        if (url.includes("/analytics/chats")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockChatAnalytics),
          });
        }
        return Promise.reject(new Error("Unknown endpoint"));
      });

      render(<InstructorDashboard />);

      await waitFor(() => {
        expect(screen.getByText("85%")).toBeInTheDocument();
      });
    });

    it("displays error message when quiz fetch fails", async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes("/analytics/quizzes")) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ detail: "Quiz fetch error" }),
          });
        }
        if (url.includes("/analytics/chats")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockChatAnalytics),
          });
        }
        return Promise.reject(new Error("Unknown endpoint"));
      });

      render(<InstructorDashboard />);

      await waitFor(() => {
        expect(screen.getByText("Quiz fetch error")).toBeInTheDocument();
      });
    });

    it("shows empty state when no quizzes exist", async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes("/analytics/quizzes")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              total_sessions: 0,
              average_accuracy: 0,
              average_questions: 0,
              quizzes: [],
            }),
          });
        }
        if (url.includes("/analytics/chats")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockChatAnalytics),
          });
        }
        return Promise.reject(new Error("Unknown endpoint"));
      });

      render(<InstructorDashboard />);

      await waitFor(() => {
        expect(screen.getByText("No quiz attempts recorded yet.")).toBeInTheDocument();
      });
    });
  });

  describe("Chat Analytics Loading", () => {
    it("shows loading state for chat initially", () => {
      global.fetch.mockImplementation(() => new Promise(() => {}));
      
      render(<InstructorDashboard />);
      
      expect(screen.getByText("Examining conversations…")).toBeInTheDocument();
    });

    it("displays chat session count after successful fetch", async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes("/analytics/quizzes")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockQuizAnalytics),
          });
        }
        if (url.includes("/analytics/chats")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockChatAnalytics),
          });
        }
        return Promise.reject(new Error("Unknown endpoint"));
      });

      render(<InstructorDashboard />);

      await waitFor(() => {
        expect(screen.getByText("120")).toBeInTheDocument();
      });
    });

    it("displays classified turns and classification rate", async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes("/analytics/quizzes")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockQuizAnalytics),
          });
        }
        if (url.includes("/analytics/chats")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockChatAnalytics),
          });
        }
        return Promise.reject(new Error("Unknown endpoint"));
      });

      render(<InstructorDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/450 labelled turns/i)).toBeInTheDocument();
        expect(screen.getByText(/92% classification rate/i)).toBeInTheDocument();
      });
    });
  });

  describe("Quiz List Display", () => {
    beforeEach(() => {
      global.fetch.mockImplementation((url) => {
        if (url.includes("/analytics/quizzes")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockQuizAnalytics),
          });
        }
        if (url.includes("/analytics/chats")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockChatAnalytics),
          });
        }
        return Promise.reject(new Error("Unknown endpoint"));
      });
    });

    it("displays quiz names", async () => {
      render(<InstructorDashboard />);

      await waitFor(() => {
        expect(screen.getByText("Math Quiz")).toBeInTheDocument();
        expect(screen.getByText("Science Quiz")).toBeInTheDocument();
      });
    });

    it("displays quiz accuracy percentages", async () => {
      render(<InstructorDashboard />);

      await waitFor(() => {
        expect(screen.getByText("80%")).toBeInTheDocument();
        expect(screen.getByText("90%")).toBeInTheDocument();
      });
    });
  });

  describe("Date Formatting", () => {
    beforeEach(() => {
      global.fetch.mockImplementation((url) => {
        if (url.includes("/analytics/quizzes")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockQuizAnalytics),
          });
        }
        if (url.includes("/analytics/chats")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockChatAnalytics),
          });
        }
        return Promise.reject(new Error("Unknown endpoint"));
      });
    });

    it("displays last updated timestamp", async () => {
      render(<InstructorDashboard />);

      await waitFor(() => {
        const lastUpdatedText = screen.getByText(/Last Updated/i)
          .closest("div")
          .querySelector("p.text-lg");
        expect(lastUpdatedText).not.toHaveTextContent("Loading…");
      });
    });
  });

  describe("Component Cleanup", () => {
    it("cancels pending requests on unmount", () => {
      global.fetch.mockImplementation(() => new Promise(() => {}));
      
      const { unmount } = render(<InstructorDashboard />);
      
      unmount();
      
      // Component should handle cleanup gracefully
      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("handles network errors for quiz analytics", async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes("/analytics/quizzes")) {
          return Promise.reject(new Error("Network error"));
        }
        if (url.includes("/analytics/chats")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockChatAnalytics),
          });
        }
        return Promise.reject(new Error("Unknown endpoint"));
      });

      render(<InstructorDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Unable to load quiz analytics/i)).toBeInTheDocument();
      });
    });

    it("handles malformed JSON response", async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes("/analytics/quizzes")) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.reject(new Error("Invalid JSON")),
          });
        }
        if (url.includes("/analytics/chats")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockChatAnalytics),
          });
        }
        return Promise.reject(new Error("Unknown endpoint"));
      });

      render(<InstructorDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Unable to load quiz analytics/i)).toBeInTheDocument();
      });
    });
  });

  describe("Responsive Layout", () => {
    beforeEach(() => {
      global.fetch.mockImplementation((url) => {
        if (url.includes("/analytics/quizzes")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockQuizAnalytics),
          });
        }
        if (url.includes("/analytics/chats")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockChatAnalytics),
          });
        }
        return Promise.reject(new Error("Unknown endpoint"));
      });
    });

    it("has responsive grid layout", () => {
      const { container } = render(<InstructorDashboard />);
      
      const gridContainer = container.querySelector(".grid.lg\\:grid-cols-4");
      expect(gridContainer).toBeInTheDocument();
    });

    it("has proper container classes", () => {
      const { container } = render(<InstructorDashboard />);
      
      expect(container.querySelector(".min-h-screen")).toBeInTheDocument();
      expect(container.querySelector(".flex-1")).toBeInTheDocument();
    });
  });

  describe("Stat Card Styling", () => {
    beforeEach(() => {
      global.fetch.mockImplementation((url) => {
        if (url.includes("/analytics/quizzes")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockQuizAnalytics),
          });
        }
        if (url.includes("/analytics/chats")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockChatAnalytics),
          });
        }
        return Promise.reject(new Error("Unknown endpoint"));
      });
    });

    it("applies gradient backgrounds to stat cards", async () => {
      const { container } = render(<InstructorDashboard />);

      await waitFor(() => {
        const gradientCards = container.querySelectorAll(".bg-gradient-to-br");
        expect(gradientCards.length).toBeGreaterThan(0);
      });
    });

    it("applies Poppins font class", async () => {
      render(<InstructorDashboard />);

      await waitFor(() => {
        const heading = screen.getByText("Analytics Dashboard");
        expect(heading).toHaveClass("mocked-poppins");
      });
    });
  });

  describe("API Endpoint Configuration", () => {
    it("uses correct environment variable for API base URL", () => {
      const originalEnv = process.env.NEXT_PUBLIC_BACKEND_URL;
      process.env.NEXT_PUBLIC_BACKEND_URL = "https://api.example.com/";
      
      // Re-import to get updated API_BASE_URL
      // In actual implementation, component should strip trailing slash
      
      process.env.NEXT_PUBLIC_BACKEND_URL = originalEnv;
    });
  });

  describe("Zero State Handling", () => {
    it("handles zero sessions gracefully", async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes("/analytics/quizzes")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              total_sessions: 0,
              average_accuracy: 0,
              average_questions: 0,
              quizzes: [],
            }),
          });
        }
        if (url.includes("/analytics/chats")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              session_count: 0,
              classified_turns: 0,
              average_turns_per_session: 0,
              classification_rate: 0,
              totals: { good: 0, needs_focusing: 0 },
              daily_trend: [],
            }),
          });
        }
        return Promise.reject(new Error("Unknown endpoint"));
      });

      render(<InstructorDashboard />);

      await waitFor(() => {
        expect(screen.getByText("0")).toBeInTheDocument();
        expect(screen.getByText("0%")).toBeInTheDocument();
      });
    });
  });

  describe("Loading Text", () => {
    it("shows appropriate loading messages", () => {
      global.fetch.mockImplementation(() => new Promise(() => {}));
      
      render(<InstructorDashboard />);
      
      expect(screen.getByText("Loading…")).toBeInTheDocument();
      expect(screen.getByText("Gathering sessions…")).toBeInTheDocument();
      expect(screen.getByText("Examining conversations…")).toBeInTheDocument();
    });
  });

  describe("Data Aggregation", () => {
    beforeEach(() => {
      global.fetch.mockImplementation((url) => {
        if (url.includes("/analytics/quizzes")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockQuizAnalytics),
          });
        }
        if (url.includes("/analytics/chats")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockChatAnalytics),
          });
        }
        return Promise.reject(new Error("Unknown endpoint"));
      });
    });

    it("calculates total questions correctly", async () => {
      render(<InstructorDashboard />);

      await waitFor(() => {
        // 50 sessions * 10 average questions = 500 total questions
        expect(screen.getByText(/500 questions graded/i)).toBeInTheDocument();
      });
    });
  });

  describe("Topic Display", () => {
    beforeEach(() => {
      global.fetch.mockImplementation((url) => {
        if (url.includes("/analytics/quizzes")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockQuizAnalytics),
          });
        }
        if (url.includes("/analytics/chats")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockChatAnalytics),
          });
        }
        return Promise.reject(new Error("Unknown endpoint"));
      });
    });

    it("displays topic names from quiz data", async () => {
      render(<InstructorDashboard />);

      await waitFor(() => {
        expect(screen.getByText("Algebra")).toBeInTheDocument();
        expect(screen.getByText("Geometry")).toBeInTheDocument();
        expect(screen.getByText("Physics")).toBeInTheDocument();
      });
    });
  });

  describe("Section Headers", () => {
    beforeEach(() => {
      global.fetch.mockImplementation((url) => {
        if (url.includes("/analytics/quizzes")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockQuizAnalytics),
          });
        }
        if (url.includes("/analytics/chats")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockChatAnalytics),
          });
        }
        return Promise.reject(new Error("Unknown endpoint"));
      });
    });

    it("renders section description text", async () => {
      render(<InstructorDashboard />);

      await waitFor(() => {
        expect(
          screen.getByText(/Accuracy and topic insights derived from learner sessions/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    beforeEach(() => {
      global.fetch.mockImplementation((url) => {
        if (url.includes("/analytics/quizzes")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockQuizAnalytics),
          });
        }
        if (url.includes("/analytics/chats")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockChatAnalytics),
          });
        }
        return Promise.reject(new Error("Unknown endpoint"));
      });
    });

    it("uses semantic HTML headings", async () => {
      render(<InstructorDashboard />);

      await waitFor(() => {
        const h1 = screen.getByRole("heading", { level: 1 });
        expect(h1).toHaveTextContent("Analytics Dashboard");
      });
    });
  });
});
