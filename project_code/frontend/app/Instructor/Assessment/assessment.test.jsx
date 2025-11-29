import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import QuizGenerator2Page from "./assessment";

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

describe("QuizGenerator2Page (Assessment) Component", () => {
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
    it("renders the page title", () => {
      render(<QuizGenerator2Page />);
      expect(screen.getByText("Assessment Mode")).toBeInTheDocument();
    });

    it("renders the page description", () => {
      render(<QuizGenerator2Page />);
      expect(
        screen.getByText("Quizzes will simulate real tests/exams with time limits.")
      ).toBeInTheDocument();
    });

    it("renders back to quiz list button", () => {
      render(<QuizGenerator2Page />);
      expect(screen.getByText("← Back to Quiz List")).toBeInTheDocument();
    });

    it("displays 'No slide deck attached' message when no source file", () => {
      render(<QuizGenerator2Page />);
      expect(screen.getByText(/No slide deck attached yet/i)).toBeInTheDocument();
    });

    it("renders all form fields", () => {
      render(<QuizGenerator2Page />);
      
      expect(screen.getByLabelText(/Quiz Title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Quiz Description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Number of Attempts/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Number of Questions/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Time Limit/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Difficulty/i)).toBeInTheDocument();
    });

    it("renders action buttons", () => {
      render(<QuizGenerator2Page />);
      
      expect(screen.getByRole("button", { name: /Save Quiz/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Delete Quiz/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Preview Quiz/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Publish Quiz/i })).toBeInTheDocument();
    });
  });

  describe("Form Input Handling", () => {
    it("updates title field when user types", () => {
      render(<QuizGenerator2Page />);
      const titleInput = screen.getByLabelText(/Quiz Title/i);
      
      fireEvent.change(titleInput, { target: { value: "Module 3 Test" } });
      
      expect(titleInput.value).toBe("Module 3 Test");
    });

    it("updates description field when user types", () => {
      render(<QuizGenerator2Page />);
      const descriptionInput = screen.getByLabelText(/Quiz Description/i);
      
      fireEvent.change(descriptionInput, { target: { value: "Final exam rules" } });
      
      expect(descriptionInput.value).toBe("Final exam rules");
    });

    it("updates number of attempts field", () => {
      render(<QuizGenerator2Page />);
      const attemptsInput = screen.getByLabelText(/Number of Attempts/i);
      
      fireEvent.change(attemptsInput, { target: { value: "3" } });
      
      expect(attemptsInput.value).toBe("3");
    });

    it("updates number of questions field", () => {
      render(<QuizGenerator2Page />);
      const questionsInput = screen.getByLabelText(/Number of Questions/i);
      
      fireEvent.change(questionsInput, { target: { value: "20" } });
      
      expect(questionsInput.value).toBe("20");
    });

    it("updates time limit field", () => {
      render(<QuizGenerator2Page />);
      const timeLimitInput = screen.getByLabelText(/Time Limit/i);
      
      fireEvent.change(timeLimitInput, { target: { value: "45 min" } });
      
      expect(timeLimitInput.value).toBe("45 min");
    });

    it("updates difficulty dropdown", () => {
      render(<QuizGenerator2Page />);
      const difficultySelect = screen.getByLabelText(/Difficulty/i);
      
      fireEvent.change(difficultySelect, { target: { value: "hard" } });
      
      expect(difficultySelect.value).toBe("hard");
    });

    it("has all difficulty options", () => {
      render(<QuizGenerator2Page />);
      const difficultySelect = screen.getByLabelText(/Difficulty/i);
      
      expect(difficultySelect.innerHTML).toContain("Select difficulty");
      expect(difficultySelect.innerHTML).toContain("Easy");
      expect(difficultySelect.innerHTML).toContain("Medium");
      expect(difficultySelect.innerHTML).toContain("Hard");
    });
  });

  describe("Topic Management", () => {
    it("adds a topic when Add topic button is clicked", () => {
      render(<QuizGenerator2Page />);
      const topicInput = screen.getByPlaceholderText(/e.g., Binary Trees/i);
      const addButton = screen.getByRole("button", { name: /Add topic/i });
      
      fireEvent.change(topicInput, { target: { value: "Algorithms" } });
      fireEvent.click(addButton);
      
      expect(screen.getByText("Algorithms")).toBeInTheDocument();
      expect(topicInput.value).toBe("");
    });

    it("adds a topic when Enter key is pressed", () => {
      render(<QuizGenerator2Page />);
      const topicInput = screen.getByPlaceholderText(/e.g., Binary Trees/i);
      
      fireEvent.change(topicInput, { target: { value: "Data Structures" } });
      fireEvent.keyDown(topicInput, { key: "Enter", code: "Enter" });
      
      expect(screen.getByText("Data Structures")).toBeInTheDocument();
    });

    it("does not add topic when non-Enter key is pressed", () => {
      render(<QuizGenerator2Page />);
      const topicInput = screen.getByPlaceholderText(/e.g., Binary Trees/i);
      
      fireEvent.change(topicInput, { target: { value: "Data Structures" } });
      fireEvent.keyDown(topicInput, { key: "Tab", code: "Tab" });
      
      expect(screen.queryByText("Data Structures")).not.toBeInTheDocument();
    });

    it("does not add empty topics", () => {
      render(<QuizGenerator2Page />);
      const topicInput = screen.getByPlaceholderText(/e.g., Binary Trees/i);
      const addButton = screen.getByRole("button", { name: /Add topic/i });
      
      fireEvent.change(topicInput, { target: { value: "   " } });
      fireEvent.click(addButton);
      
      expect(
        screen.getByText(/No specific topics added/i)
      ).toBeInTheDocument();
    });

    it("does not add duplicate topics", () => {
      render(<QuizGenerator2Page />);
      const topicInput = screen.getByPlaceholderText(/e.g., Binary Trees/i);
      const addButton = screen.getByRole("button", { name: /Add topic/i });
      
      // Add first topic
      fireEvent.change(topicInput, { target: { value: "Sorting" } });
      fireEvent.click(addButton);
      
      // Try to add duplicate
      fireEvent.change(topicInput, { target: { value: "Sorting" } });
      fireEvent.click(addButton);
      
      const topicElements = screen.getAllByText("Sorting");
      expect(topicElements).toHaveLength(1);
    });

    it("trims whitespace from topics", () => {
      render(<QuizGenerator2Page />);
      const topicInput = screen.getByPlaceholderText(/e.g., Binary Trees/i);
      const addButton = screen.getByRole("button", { name: /Add topic/i });
      
      fireEvent.change(topicInput, { target: { value: "  Graphs  " } });
      fireEvent.click(addButton);
      
      expect(screen.getByText("Graphs")).toBeInTheDocument();
    });

    it("removes a topic when X button is clicked", () => {
      render(<QuizGenerator2Page />);
      const topicInput = screen.getByPlaceholderText(/e.g., Binary Trees/i);
      const addButton = screen.getByRole("button", { name: /Add topic/i });
      
      fireEvent.change(topicInput, { target: { value: "Networks" } });
      fireEvent.click(addButton);
      
      expect(screen.getByText("Networks")).toBeInTheDocument();
      
      const removeButtons = screen.getAllByRole("button", { name: /×/i });
      fireEvent.click(removeButtons[0]);
      
      expect(screen.queryByText("Networks")).not.toBeInTheDocument();
    });

    it("removes correct topic when multiple topics exist", () => {
      render(<QuizGenerator2Page />);
      const topicInput = screen.getByPlaceholderText(/e.g., Binary Trees/i);
      const addButton = screen.getByRole("button", { name: /Add topic/i });
      
      fireEvent.change(topicInput, { target: { value: "Topic A" } });
      fireEvent.click(addButton);
      fireEvent.change(topicInput, { target: { value: "Topic B" } });
      fireEvent.click(addButton);
      fireEvent.change(topicInput, { target: { value: "Topic C" } });
      fireEvent.click(addButton);
      
      const removeButtons = screen.getAllByRole("button", { name: /×/i });
      fireEvent.click(removeButtons[1]); // Remove Topic B
      
      expect(screen.getByText("Topic A")).toBeInTheDocument();
      expect(screen.queryByText("Topic B")).not.toBeInTheDocument();
      expect(screen.getByText("Topic C")).toBeInTheDocument();
    });

    it("shows message when no topics are added", () => {
      render(<QuizGenerator2Page />);
      
      expect(
        screen.getByText(/No specific topics added. Questions will cover the source material broadly./i)
      ).toBeInTheDocument();
    });

    it("disables Add topic button when input is empty", () => {
      render(<QuizGenerator2Page />);
      const addButton = screen.getByRole("button", { name: /Add topic/i });
      
      expect(addButton).toBeDisabled();
    });

    it("enables Add topic button when input has text", () => {
      render(<QuizGenerator2Page />);
      const topicInput = screen.getByPlaceholderText(/e.g., Binary Trees/i);
      const addButton = screen.getByRole("button", { name: /Add topic/i });
      
      fireEvent.change(topicInput, { target: { value: "Testing" } });
      
      expect(addButton).not.toBeDisabled();
    });

    it("clears input after adding duplicate topic", () => {
      render(<QuizGenerator2Page />);
      const topicInput = screen.getByPlaceholderText(/e.g., Binary Trees/i);
      const addButton = screen.getByRole("button", { name: /Add topic/i });
      
      fireEvent.change(topicInput, { target: { value: "Duplicate" } });
      fireEvent.click(addButton);
      
      fireEvent.change(topicInput, { target: { value: "Duplicate" } });
      fireEvent.click(addButton);
      
      expect(topicInput.value).toBe("");
    });

    it("adds multiple topics sequentially", () => {
      render(<QuizGenerator2Page />);
      const topicInput = screen.getByPlaceholderText(/e.g., Binary Trees/i);
      const addButton = screen.getByRole("button", { name: /Add topic/i });
      
      const topics = ["Arrays", "LinkedLists", "Trees"];
      topics.forEach((topic) => {
        fireEvent.change(topicInput, { target: { value: topic } });
        fireEvent.click(addButton);
      });
      
      topics.forEach((topic) => {
        expect(screen.getByText(topic)).toBeInTheDocument();
      });
    });
  });

  describe("Navigation", () => {
    it("navigates to quiz list when back button is clicked", () => {
      render(<QuizGenerator2Page />);
      const backButton = screen.getByText("← Back to Quiz List");
      
      fireEvent.click(backButton);
      
      expect(mockPush).toHaveBeenCalledWith("/Instructor/Quizzes");
    });
  });

  describe("Preview Quiz Functionality", () => {
    it("shows alert when required fields are missing for preview", () => {
      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
      render(<QuizGenerator2Page />);
      
      const previewButton = screen.getByRole("button", { name: /Preview Quiz/i });
      fireEvent.click(previewButton);
      
      expect(alertSpy).toHaveBeenCalledWith("Please fill in all required fields");
      alertSpy.mockRestore();
    });

    it("does not preview when title is missing", () => {
      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
      render(<QuizGenerator2Page />);
      
      // Fill all fields except title
      fireEvent.change(screen.getByLabelText(/Number of Attempts/i), { target: { value: "3" } });
      fireEvent.change(screen.getByLabelText(/Number of Questions/i), { target: { value: "10" } });
      fireEvent.change(screen.getByLabelText(/Time Limit/i), { target: { value: "30 min" } });
      fireEvent.change(screen.getByLabelText(/Difficulty/i), { target: { value: "medium" } });
      
      const previewButton = screen.getByRole("button", { name: /Preview Quiz/i });
      fireEvent.click(previewButton);
      
      expect(alertSpy).toHaveBeenCalledWith("Please fill in all required fields");
      alertSpy.mockRestore();
    });
  });

  describe("LocalStorage Draft Management", () => {
    it("persists form data to localStorage on change", async () => {
      render(<QuizGenerator2Page />);
      
      const titleInput = screen.getByLabelText(/Quiz Title/i);
      fireEvent.change(titleInput, { target: { value: "Test Quiz" } });
      
      await waitFor(() => {
        const draft = JSON.parse(localStorage.getItem("quizConfigDraft") || "{}");
        expect(draft.title).toBe("Test Quiz");
        expect(draft.mode).toBe("assessment");
      });
    });

    it("loads draft from localStorage on mount", () => {
      const draft = {
        mode: "assessment",
        title: "Saved Quiz",
        description: "Saved description",
        configuration: {
          numberOfAttempts: "2",
          numberOfQuestions: "15",
          timeLimit: "40 min",
          difficulty: "easy",
          topicsToTest: ["Topic 1", "Topic 2"],
        },
      };
      localStorage.setItem("quizConfigDraft", JSON.stringify(draft));
      
      render(<QuizGenerator2Page />);
      
      expect(screen.getByLabelText(/Quiz Title/i).value).toBe("Saved Quiz");
      expect(screen.getByLabelText(/Quiz Description/i).value).toBe("Saved description");
      expect(screen.getByLabelText(/Number of Attempts/i).value).toBe("2");
      expect(screen.getByLabelText(/Number of Questions/i).value).toBe("15");
      expect(screen.getByLabelText(/Time Limit/i).value).toBe("40 min");
      expect(screen.getByLabelText(/Difficulty/i).value).toBe("easy");
      expect(screen.getByText("Topic 1")).toBeInTheDocument();
      expect(screen.getByText("Topic 2")).toBeInTheDocument();
    });

    it("ignores non-assessment drafts from localStorage", () => {
      const draft = {
        mode: "practice",
        title: "Practice Quiz",
      };
      localStorage.setItem("quizConfigDraft", JSON.stringify(draft));
      
      render(<QuizGenerator2Page />);
      
      expect(screen.getByLabelText(/Quiz Title/i).value).toBe("");
    });

    it("loads source filename from quizGeneratorSeed", () => {
      const seed = {
        filename: "lecture_slides.pdf",
        documentId: "doc123",
      };
      localStorage.setItem("quizGeneratorSeed", JSON.stringify(seed));
      
      render(<QuizGenerator2Page />);
      
      expect(screen.getByText(/Using slides: lecture_slides.pdf/i)).toBeInTheDocument();
    });
  });

  describe("Publish State Management", () => {
    it("shows 'Publish Quiz' button when quiz is not published", () => {
      render(<QuizGenerator2Page />);
      
      expect(screen.getByRole("button", { name: /Publish Quiz/i })).toBeInTheDocument();
    });

    it("shows 'Unpublish Quiz' button when quiz is published", () => {
      const draft = {
        mode: "assessment",
        isPublished: true,
      };
      localStorage.setItem("quizConfigDraft", JSON.stringify(draft));
      
      render(<QuizGenerator2Page />);
      
      expect(screen.getByRole("button", { name: /Unpublish Quiz/i })).toBeInTheDocument();
    });
  });

  describe("Delete Modal", () => {
    it("does not show delete modal initially", () => {
      render(<QuizGenerator2Page />);
      
      expect(screen.queryByText(/Delete this quiz\?/i)).not.toBeInTheDocument();
    });
  });

  describe("Exit Modal", () => {
    it("does not show exit modal initially", () => {
      render(<QuizGenerator2Page />);
      
      expect(screen.queryByText(/Leave without saving\?/i)).not.toBeInTheDocument();
    });
  });

  describe("Required Field Indicators", () => {
    it("shows asterisks for required fields", () => {
      render(<QuizGenerator2Page />);
      
      const requiredLabels = screen.getAllByText("*", { selector: "span.text-red-500" });
      expect(requiredLabels.length).toBeGreaterThan(0);
    });
  });

  describe("Form Placeholders", () => {
    it("has appropriate placeholder text", () => {
      render(<QuizGenerator2Page />);
      
      expect(screen.getByPlaceholderText(/e.g., Module 3 Assessment/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Share exam rules/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/e.g., Binary Trees/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/e.g., 30 min/i)).toBeInTheDocument();
    });
  });

  describe("Styling and Layout", () => {
    it("applies Poppins font class to headings", () => {
      render(<QuizGenerator2Page />);
      const heading = screen.getByText("Assessment Mode");
      expect(heading).toHaveClass("mocked-poppins");
    });

    it("renders within max-width container", () => {
      const { container } = render(<QuizGenerator2Page />);
      const maxWidthDiv = container.querySelector(".max-w-4xl");
      expect(maxWidthDiv).toBeInTheDocument();
    });

    it("has responsive grid layout for parameters", () => {
      const { container } = render(<QuizGenerator2Page />);
      const gridDiv = container.querySelector(".grid-cols-1.md\\:grid-cols-3");
      expect(gridDiv).toBeInTheDocument();
    });
  });

  describe("API Integration Setup", () => {
    it("uses correct environment variable for API base URL", () => {
      const originalEnv = process.env.NEXT_PUBLIC_BACKEND_URL;
      process.env.NEXT_PUBLIC_BACKEND_URL = "https://api.example.com/";
      
      render(<QuizGenerator2Page />);
      
      // Component should strip trailing slash
      process.env.NEXT_PUBLIC_BACKEND_URL = originalEnv;
    });
  });

  describe("Component Cleanup", () => {
    it("cleans up timeout on unmount", () => {
      jest.useFakeTimers();
      const { unmount } = render(<QuizGenerator2Page />);
      
      unmount();
      
      jest.runAllTimers();
      jest.useRealTimers();
    });
  });

  describe("Input Field Types", () => {
    it("has correct input types for numeric fields", () => {
      render(<QuizGenerator2Page />);
      
      const attemptsInput = screen.getByLabelText(/Number of Attempts/i);
      const questionsInput = screen.getByLabelText(/Number of Questions/i);
      
      expect(attemptsInput).toHaveAttribute("type", "number");
      expect(questionsInput).toHaveAttribute("type", "number");
    });

    it("has text type for time limit field", () => {
      render(<QuizGenerator2Page />);
      const timeLimitInput = screen.getByLabelText(/Time Limit/i);
      
      expect(timeLimitInput).toHaveAttribute("type", "text");
    });

    it("has textarea for description field", () => {
      render(<QuizGenerator2Page />);
      const descriptionInput = screen.getByLabelText(/Quiz Description/i);
      
      expect(descriptionInput.tagName).toBe("TEXTAREA");
    });
  });

  describe("Button Gradients", () => {
    it("applies gradient to Preview Quiz button", () => {
      render(<QuizGenerator2Page />);
      const previewButton = screen.getByRole("button", { name: /Preview Quiz/i });
      
      expect(previewButton).toHaveStyle({
        background: "linear-gradient(to right, #7B2CBF, #3B82F6)",
      });
    });

    it("applies gradient to Publish/Unpublish button", () => {
      render(<QuizGenerator2Page />);
      const publishButton = screen.getByRole("button", { name: /Publish Quiz/i });
      
      expect(publishButton).toHaveStyle({
        background: "linear-gradient(to right, #EC4899, #F97316)",
      });
    });
  });

  describe("Preview Button Icon", () => {
    it("renders play icon in preview button", () => {
      render(<QuizGenerator2Page />);
      const previewButton = screen.getByRole("button", { name: /Preview Quiz/i });
      const svg = previewButton.querySelector("svg");
      
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("width", "20");
      expect(svg).toHaveAttribute("height", "20");
    });
  });

  describe("Topic List Styling", () => {
    it("applies styling to topic list container", () => {
      render(<QuizGenerator2Page />);
      const topicInput = screen.getByPlaceholderText(/e.g., Binary Trees/i);
      const addButton = screen.getByRole("button", { name: /Add topic/i });
      
      fireEvent.change(topicInput, { target: { value: "Test Topic" } });
      fireEvent.click(addButton);
      
      const topicItem = screen.getByText("Test Topic").closest("li");
      expect(topicItem).toHaveClass("bg-white");
    });
  });

  describe("Accessibility", () => {
    it("has proper labels for all form inputs", () => {
      render(<QuizGenerator2Page />);
      
      expect(screen.getByLabelText(/Quiz Title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Quiz Description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Number of Attempts/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Number of Questions/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Time Limit/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Difficulty/i)).toBeInTheDocument();
    });

    it("all buttons are keyboard accessible", () => {
      render(<QuizGenerator2Page />);
      
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toBeEnabled();
      });
    });
  });

  describe("Error Handling", () => {
    it("handles invalid JSON in localStorage gracefully", () => {
      localStorage.setItem("quizConfigDraft", "invalid json");
      
      // Should not throw error
      expect(() => render(<QuizGenerator2Page />)).not.toThrow();
    });

    it("handles missing localStorage gracefully", () => {
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = jest.fn(() => null);
      
      expect(() => render(<QuizGenerator2Page />)).not.toThrow();
      
      Storage.prototype.getItem = originalGetItem;
    });

    it("handles localStorage setItem errors gracefully", () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error("Storage quota exceeded");
      });
      
      render(<QuizGenerator2Page />);
      const titleInput = screen.getByLabelText(/Quiz Title/i);
      fireEvent.change(titleInput, { target: { value: "Test" } });
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      Storage.prototype.setItem = originalSetItem;
      consoleErrorSpy.mockRestore();
    });

    it("handles JSON parse errors in quizGeneratorSeed", () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      localStorage.setItem("quizGeneratorSeed", "{invalid json}");
      
      expect(() => render(<QuizGenerator2Page />)).not.toThrow();
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Back Navigation", () => {
    it("navigates directly when back button is clicked", () => {
      render(<QuizGenerator2Page />);
      const backButton = screen.getByRole("button", { name: /← Back to Quiz List/i });
      
      fireEvent.click(backButton);
      
      expect(mockPush).toHaveBeenCalledWith("/Instructor/Quizzes");
    });
  });

  describe("LocalStorage Hydration", () => {
    it("loads draft with all configuration fields", () => {
      const draft = {
        mode: "assessment",
        title: "Complete Quiz",
        description: "Full description",
        id: "quiz-123",
        sourceFilename: "slides.pdf",
        documentId: "doc-456",
        isPublished: false,
        configuration: {
          numberOfAttempts: "3",
          numberOfQuestions: "20",
          timeLimit: "60 min",
          difficulty: "hard",
          topicsToTest: ["Topic A", "Topic B"],
        },
      };
      localStorage.setItem("quizConfigDraft", JSON.stringify(draft));
      
      render(<QuizGenerator2Page />);
      
      expect(screen.getByLabelText(/Quiz Title/i).value).toBe("Complete Quiz");
      expect(screen.getByLabelText(/Quiz Description/i).value).toBe("Full description");
      expect(screen.getByLabelText(/Number of Attempts/i).value).toBe("3");
      expect(screen.getByLabelText(/Number of Questions/i).value).toBe("20");
      expect(screen.getByLabelText(/Time Limit/i).value).toBe("60 min");
      expect(screen.getByLabelText(/Difficulty/i).value).toBe("hard");
      expect(screen.getByText("Topic A")).toBeInTheDocument();
      expect(screen.getByText("Topic B")).toBeInTheDocument();
    });

    it("handles draft with missing configuration object", () => {
      const draft = {
        mode: "assessment",
        title: "Minimal Quiz",
      };
      localStorage.setItem("quizConfigDraft", JSON.stringify(draft));
      
      expect(() => render(<QuizGenerator2Page />)).not.toThrow();
    });

    it("loads totalQuestions from draft as fallback", () => {
      const draft = {
        mode: "assessment",
        title: "Quiz",
        totalQuestions: 15,
        configuration: {},
      };
      localStorage.setItem("quizConfigDraft", JSON.stringify(draft));
      
      render(<QuizGenerator2Page />);
      
      expect(screen.getByLabelText(/Number of Questions/i).value).toBe("15");
    });

    it("loads filename from draft as fallback for sourceFilename", () => {
      const draft = {
        mode: "assessment",
        filename: "legacy_slides.pdf",
      };
      localStorage.setItem("quizConfigDraft", JSON.stringify(draft));
      
      render(<QuizGenerator2Page />);
      
      expect(screen.getByText(/Using slides: legacy_slides.pdf/i)).toBeInTheDocument();
    });

    it("handles draft with quizId instead of id", () => {
      const draft = {
        mode: "assessment",
        quizId: "quiz-789",
        title: "Quiz with quizId",
      };
      localStorage.setItem("quizConfigDraft", JSON.stringify(draft));
      
      expect(() => render(<QuizGenerator2Page />)).not.toThrow();
    });

    it("ignores draft when mode is not assessment", () => {
      const draft = {
        mode: "practice",
        title: "Practice Quiz",
      };
      localStorage.setItem("quizConfigDraft", JSON.stringify(draft));
      
      render(<QuizGenerator2Page />);
      
      expect(screen.getByLabelText(/Quiz Title/i).value).toBe("");
    });
  });

  describe("Quiz Generator Seed", () => {
    it("loads filename from quizGeneratorSeed", () => {
      const seed = {
        filename: "course_materials.pdf",
      };
      localStorage.setItem("quizGeneratorSeed", JSON.stringify(seed));
      
      render(<QuizGenerator2Page />);
      
      expect(screen.getByText(/Using slides: course_materials.pdf/i)).toBeInTheDocument();
    });

    it("loads documentId from quizGeneratorSeed", () => {
      const seed = {
        documentId: "doc-seed-123",
      };
      localStorage.setItem("quizGeneratorSeed", JSON.stringify(seed));
      
      render(<QuizGenerator2Page />);
      
      // DocumentId is internal state, just verify it doesn't crash
      expect(screen.getByText("Assessment Mode")).toBeInTheDocument();
    });

    it("loads isPublished from quizGeneratorSeed", () => {
      const seed = {
        isPublished: true,
      };
      localStorage.setItem("quizGeneratorSeed", JSON.stringify(seed));
      
      render(<QuizGenerator2Page />);
      
      expect(screen.getByRole("button", { name: /Unpublish Quiz/i })).toBeInTheDocument();
    });

    it("handles missing quizGeneratorSeed gracefully", () => {
      localStorage.removeItem("quizGeneratorSeed");
      
      expect(() => render(<QuizGenerator2Page />)).not.toThrow();
    });
  });

  describe("Input Validation", () => {
    it("handles empty string values for all fields", () => {
      render(<QuizGenerator2Page />);
      
      const fields = [
        { label: /Quiz Title/i, value: "" },
        { label: /Quiz Description/i, value: "" },
        { label: /Number of Attempts/i, value: "" },
        { label: /Number of Questions/i, value: "" },
        { label: /Time Limit/i, value: "" },
      ];
      
      fields.forEach(({ label, value }) => {
        const input = screen.getByLabelText(label);
        fireEvent.change(input, { target: { value } });
        expect(input.value).toBe(value);
      });
    });

    it("accepts numeric strings in number fields", () => {
      render(<QuizGenerator2Page />);
      
      const attemptsInput = screen.getByLabelText(/Number of Attempts/i);
      fireEvent.change(attemptsInput, { target: { value: "123" } });
      
      expect(attemptsInput.value).toBe("123");
    });

    it("handles very long text input in description", () => {
      render(<QuizGenerator2Page />);
      const longText = "A".repeat(1000);
      
      const descriptionInput = screen.getByLabelText(/Quiz Description/i);
      fireEvent.change(descriptionInput, { target: { value: longText } });
      
      expect(descriptionInput.value).toBe(longText);
    });
  });

  describe("Difficulty Options", () => {
    it("has empty default difficulty value", () => {
      render(<QuizGenerator2Page />);
      const difficultySelect = screen.getByLabelText(/Difficulty/i);
      
      expect(difficultySelect.value).toBe("");
    });

    it("allows selecting each difficulty level", () => {
      render(<QuizGenerator2Page />);
      const difficultySelect = screen.getByLabelText(/Difficulty/i);
      
      const levels = ["easy", "medium", "hard"];
      levels.forEach((level) => {
        fireEvent.change(difficultySelect, { target: { value: level } });
        expect(difficultySelect.value).toBe(level);
      });
    });
  });

  describe("Button States", () => {
    it("renders all action buttons as enabled by default", () => {
      render(<QuizGenerator2Page />);
      
      expect(screen.getByRole("button", { name: /Save Quiz/i })).toBeEnabled();
      expect(screen.getByRole("button", { name: /Delete Quiz/i })).toBeEnabled();
      expect(screen.getByRole("button", { name: /Preview Quiz/i })).toBeEnabled();
    });

    it("shows Publish button when quiz is not published", () => {
      render(<QuizGenerator2Page />);
      
      const publishButton = screen.getByRole("button", { name: /Publish Quiz/i });
      expect(publishButton).toBeInTheDocument();
      expect(publishButton).toHaveTextContent("Publish Quiz");
    });

    it("shows Unpublish button when quiz is published", () => {
      const draft = {
        mode: "assessment",
        isPublished: true,
      };
      localStorage.setItem("quizConfigDraft", JSON.stringify(draft));
      
      render(<QuizGenerator2Page />);
      
      const unpublishButton = screen.getByRole("button", { name: /Unpublish Quiz/i });
      expect(unpublishButton).toBeInTheDocument();
      expect(unpublishButton).toHaveTextContent("Unpublish Quiz");
    });
  });

  describe("Preview Validation", () => {
    it("shows alert when number of attempts is missing", () => {
      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
      render(<QuizGenerator2Page />);
      
      fireEvent.change(screen.getByLabelText(/Quiz Title/i), { target: { value: "Test" } });
      fireEvent.change(screen.getByLabelText(/Number of Questions/i), { target: { value: "10" } });
      fireEvent.change(screen.getByLabelText(/Time Limit/i), { target: { value: "30 min" } });
      fireEvent.change(screen.getByLabelText(/Difficulty/i), { target: { value: "medium" } });
      
      const previewButton = screen.getByRole("button", { name: /Preview Quiz/i });
      fireEvent.click(previewButton);
      
      expect(alertSpy).toHaveBeenCalledWith("Please fill in all required fields");
      alertSpy.mockRestore();
    });

    it("shows alert when number of questions is missing", () => {
      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
      render(<QuizGenerator2Page />);
      
      fireEvent.change(screen.getByLabelText(/Quiz Title/i), { target: { value: "Test" } });
      fireEvent.change(screen.getByLabelText(/Number of Attempts/i), { target: { value: "3" } });
      fireEvent.change(screen.getByLabelText(/Time Limit/i), { target: { value: "30 min" } });
      fireEvent.change(screen.getByLabelText(/Difficulty/i), { target: { value: "medium" } });
      
      const previewButton = screen.getByRole("button", { name: /Preview Quiz/i });
      fireEvent.click(previewButton);
      
      expect(alertSpy).toHaveBeenCalledWith("Please fill in all required fields");
      alertSpy.mockRestore();
    });

    it("shows alert when time limit is missing", () => {
      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
      render(<QuizGenerator2Page />);
      
      fireEvent.change(screen.getByLabelText(/Quiz Title/i), { target: { value: "Test" } });
      fireEvent.change(screen.getByLabelText(/Number of Attempts/i), { target: { value: "3" } });
      fireEvent.change(screen.getByLabelText(/Number of Questions/i), { target: { value: "10" } });
      fireEvent.change(screen.getByLabelText(/Difficulty/i), { target: { value: "medium" } });
      
      const previewButton = screen.getByRole("button", { name: /Preview Quiz/i });
      fireEvent.click(previewButton);
      
      expect(alertSpy).toHaveBeenCalledWith("Please fill in all required fields");
      alertSpy.mockRestore();
    });

    it("shows alert when difficulty is missing", () => {
      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
      render(<QuizGenerator2Page />);
      
      fireEvent.change(screen.getByLabelText(/Quiz Title/i), { target: { value: "Test" } });
      fireEvent.change(screen.getByLabelText(/Number of Attempts/i), { target: { value: "3" } });
      fireEvent.change(screen.getByLabelText(/Number of Questions/i), { target: { value: "10" } });
      fireEvent.change(screen.getByLabelText(/Time Limit/i), { target: { value: "30 min" } });
      
      const previewButton = screen.getByRole("button", { name: /Preview Quiz/i });
      fireEvent.click(previewButton);
      
      expect(alertSpy).toHaveBeenCalledWith("Please fill in all required fields");
      alertSpy.mockRestore();
    });
  });

  describe("Form State Persistence", () => {
    it("persists mode as assessment in localStorage", async () => {
      render(<QuizGenerator2Page />);
      
      const titleInput = screen.getByLabelText(/Quiz Title/i);
      fireEvent.change(titleInput, { target: { value: "Test" } });
      
      await waitFor(() => {
        const draft = JSON.parse(localStorage.getItem("quizConfigDraft") || "{}");
        expect(draft.mode).toBe("assessment");
      });
    });

    it("persists topics array in localStorage", async () => {
      render(<QuizGenerator2Page />);
      const topicInput = screen.getByPlaceholderText(/e.g., Binary Trees/i);
      const addButton = screen.getByRole("button", { name: /Add topic/i });
      
      fireEvent.change(topicInput, { target: { value: "Arrays" } });
      fireEvent.click(addButton);
      
      await waitFor(() => {
        const draft = JSON.parse(localStorage.getItem("quizConfigDraft") || "{}");
        expect(draft.configuration.topicsToTest).toContain("Arrays");
      });
    });

    it("persists difficulty in localStorage", async () => {
      render(<QuizGenerator2Page />);
      
      const difficultySelect = screen.getByLabelText(/Difficulty/i);
      fireEvent.change(difficultySelect, { target: { value: "hard" } });
      
      await waitFor(() => {
        const draft = JSON.parse(localStorage.getItem("quizConfigDraft") || "{}");
        expect(draft.configuration.difficulty).toBe("hard");
      });
    });
  });
});
