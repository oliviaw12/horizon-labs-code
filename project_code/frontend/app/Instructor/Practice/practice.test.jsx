import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import PracticePage from "./practice";

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

describe("PracticePage Component", () => {
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
      render(<PracticePage />);
      expect(screen.getByText("Practice Mode")).toBeInTheDocument();
    });

    it("renders back to quiz list button", () => {
      render(<PracticePage />);
      expect(screen.getByText("← Back to Quiz List")).toBeInTheDocument();
    });

    it("renders quiz title input", () => {
      render(<PracticePage />);
      expect(screen.getByLabelText(/Quiz Title/i)).toBeInTheDocument();
    });

    it("renders quiz description textarea", () => {
      render(<PracticePage />);
      expect(screen.getByLabelText(/Quiz Description/i)).toBeInTheDocument();
    });

    it("renders topic input field", () => {
      render(<PracticePage />);
      expect(screen.getByPlaceholderText(/e.g., Binary Trees/i)).toBeInTheDocument();
    });

    it("renders action buttons", () => {
      render(<PracticePage />);
      
      expect(screen.getByRole("button", { name: /Save Quiz/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Delete Quiz/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Preview Quiz/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Publish Quiz/i })).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("opens exit modal when back button is clicked", () => {
      render(<PracticePage />);
      const backButton = screen.getByText("← Back to Quiz List");
      
      fireEvent.click(backButton);
      
      expect(screen.getByText(/Leave without saving\?/i)).toBeInTheDocument();
    });
  });

  describe("Quiz Title Input", () => {
    it("updates title when user types", () => {
      render(<PracticePage />);
      const titleInput = screen.getByLabelText(/Quiz Title/i);
      
      fireEvent.change(titleInput, { target: { value: "Data Structures Quiz" } });
      
      expect(titleInput.value).toBe("Data Structures Quiz");
    });

    it("has correct placeholder text", () => {
      render(<PracticePage />);
      const titleInput = screen.getByLabelText(/Quiz Title/i);
      
      expect(titleInput).toHaveAttribute("placeholder", "e.g., Data Structures Practice");
    });
  });

  describe("Quiz Description Input", () => {
    it("updates description when user types", () => {
      render(<PracticePage />);
      const descriptionInput = screen.getByLabelText(/Quiz Description/i);
      
      fireEvent.change(descriptionInput, { target: { value: "Practice exercises" } });
      
      expect(descriptionInput.value).toBe("Practice exercises");
    });

    it("is a textarea element", () => {
      render(<PracticePage />);
      const descriptionInput = screen.getByLabelText(/Quiz Description/i);
      
      expect(descriptionInput.tagName).toBe("TEXTAREA");
    });
  });

  describe("Topic Management", () => {
    it("adds a topic when Add topic button is clicked", () => {
      render(<PracticePage />);
      const topicInput = screen.getByPlaceholderText(/e.g., Binary Trees/i);
      const addButton = screen.getByRole("button", { name: /Add topic/i });
      
      fireEvent.change(topicInput, { target: { value: "Algorithms" } });
      fireEvent.click(addButton);
      
      expect(screen.getByText("Algorithms")).toBeInTheDocument();
      expect(topicInput.value).toBe("");
    });

    it("adds a topic when Enter key is pressed", () => {
      render(<PracticePage />);
      const topicInput = screen.getByPlaceholderText(/e.g., Binary Trees/i);
      
      fireEvent.change(topicInput, { target: { value: "Data Structures" } });
      fireEvent.keyDown(topicInput, { key: "Enter", code: "Enter" });
      
      expect(screen.getByText("Data Structures")).toBeInTheDocument();
    });

    it("does not add empty topics", () => {
      render(<PracticePage />);
      const topicInput = screen.getByPlaceholderText(/e.g., Binary Trees/i);
      const addButton = screen.getByRole("button", { name: /Add topic/i });
      
      fireEvent.change(topicInput, { target: { value: "   " } });
      fireEvent.click(addButton);
      
      expect(
        screen.getByText(/No specific topics added/i)
      ).toBeInTheDocument();
    });

    it("does not add duplicate topics", () => {
      render(<PracticePage />);
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
      render(<PracticePage />);
      const topicInput = screen.getByPlaceholderText(/e.g., Binary Trees/i);
      const addButton = screen.getByRole("button", { name: /Add topic/i });
      
      fireEvent.change(topicInput, { target: { value: "  Graphs  " } });
      fireEvent.click(addButton);
      
      expect(screen.getByText("Graphs")).toBeInTheDocument();
    });

    it("removes topic when Remove button is clicked", () => {
      render(<PracticePage />);
      const topicInput = screen.getByPlaceholderText(/e.g., Binary Trees/i);
      const addButton = screen.getByRole("button", { name: /Add topic/i });
      
      fireEvent.change(topicInput, { target: { value: "Trees" } });
      fireEvent.click(addButton);
      
      expect(screen.getByText("Trees")).toBeInTheDocument();
      
      const removeButton = screen.getByRole("button", { name: /Remove/i });
      fireEvent.click(removeButton);
      
      expect(screen.queryByText("Trees")).not.toBeInTheDocument();
    });

    it("shows message when no topics are added", () => {
      render(<PracticePage />);
      
      expect(
        screen.getByText(/No specific topics added. Questions will cover the source material broadly./i)
      ).toBeInTheDocument();
    });

    it("disables Add topic button when input is empty", () => {
      render(<PracticePage />);
      const addButton = screen.getByRole("button", { name: /Add topic/i });
      
      expect(addButton).toBeDisabled();
    });

    it("enables Add topic button when input has text", () => {
      render(<PracticePage />);
      const topicInput = screen.getByPlaceholderText(/e.g., Binary Trees/i);
      const addButton = screen.getByRole("button", { name: /Add topic/i });
      
      fireEvent.change(topicInput, { target: { value: "Testing" } });
      
      expect(addButton).not.toBeDisabled();
    });
  });

  describe("Preview Quiz Functionality", () => {
    it("shows alert when title is missing for preview", () => {
      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
      render(<PracticePage />);
      
      const previewButton = screen.getByRole("button", { name: /Preview Quiz/i });
      fireEvent.click(previewButton);
      
      expect(alertSpy).toHaveBeenCalledWith("Please enter a quiz title.");
      alertSpy.mockRestore();
    });

    it("attempts to save before previewing", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ quiz_id: "quiz-123", is_published: false }),
      });

      render(<PracticePage />);
      
      const titleInput = screen.getByLabelText(/Quiz Title/i);
      fireEvent.change(titleInput, { target: { value: "Test Quiz" } });
      
      const previewButton = screen.getByRole("button", { name: /Preview Quiz/i });
      fireEvent.click(previewButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe("Save Quiz Functionality", () => {
    it("shows alert when title is missing for save", () => {
      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
      render(<PracticePage />);
      
      const saveButton = screen.getByRole("button", { name: /Save Quiz/i });
      fireEvent.click(saveButton);
      
      expect(alertSpy).toHaveBeenCalledWith("Please enter a quiz title.");
      alertSpy.mockRestore();
    });

    it("makes API call when saving quiz", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ quiz_id: "quiz-123", is_published: false }),
      });

      render(<PracticePage />);
      
      const titleInput = screen.getByLabelText(/Quiz Title/i);
      fireEvent.change(titleInput, { target: { value: "My Quiz" } });
      
      const saveButton = screen.getByRole("button", { name: /Save Quiz/i });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/quiz/definitions"),
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
          })
        );
      });
    });

    it("displays success message after successful save", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ quiz_id: "quiz-123", is_published: false }),
      });

      render(<PracticePage />);
      
      const titleInput = screen.getByLabelText(/Quiz Title/i);
      fireEvent.change(titleInput, { target: { value: "My Quiz" } });
      
      const saveButton = screen.getByRole("button", { name: /Save Quiz/i });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText("Saved to your list.")).toBeInTheDocument();
      });
    });

    it("shows alert when save fails", async () => {
      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
      global.fetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ detail: "Save failed" }),
      });

      render(<PracticePage />);
      
      const titleInput = screen.getByLabelText(/Quiz Title/i);
      fireEvent.change(titleInput, { target: { value: "My Quiz" } });
      
      const saveButton = screen.getByRole("button", { name: /Save Quiz/i });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled();
      });
      
      alertSpy.mockRestore();
    });
  });

  describe("Delete Quiz Functionality", () => {
    it("shows alert when trying to delete unsaved quiz", () => {
      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
      render(<PracticePage />);
      
      const deleteButton = screen.getByRole("button", { name: /Delete Quiz/i });
      fireEvent.click(deleteButton);
      
      expect(alertSpy).toHaveBeenCalledWith("Save this quiz first before trying to delete it.");
      alertSpy.mockRestore();
    });

    it("opens delete modal when deleting saved quiz", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ quiz_id: "quiz-123", is_published: false }),
      });

      render(<PracticePage />);
      
      // Save the quiz first
      const titleInput = screen.getByLabelText(/Quiz Title/i);
      fireEvent.change(titleInput, { target: { value: "To Delete" } });
      
      const saveButton = screen.getByRole("button", { name: /Save Quiz/i });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText("Saved to your list.")).toBeInTheDocument();
      });
      
      // Now try to delete
      const deleteButton = screen.getByRole("button", { name: /Delete Quiz/i });
      fireEvent.click(deleteButton);
      
      expect(screen.getByText(/Delete this quiz\?/i)).toBeInTheDocument();
    });

    it("closes delete modal when Cancel is clicked", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ quiz_id: "quiz-123", is_published: false }),
      });

      render(<PracticePage />);
      
      // Save and open delete modal
      const titleInput = screen.getByLabelText(/Quiz Title/i);
      fireEvent.change(titleInput, { target: { value: "To Delete" } });
      
      const saveButton = screen.getByRole("button", { name: /Save Quiz/i });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText("Saved to your list.")).toBeInTheDocument();
      });
      
      const deleteButton = screen.getByRole("button", { name: /Delete Quiz/i });
      fireEvent.click(deleteButton);
      
      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      fireEvent.click(cancelButton);
      
      expect(screen.queryByText(/Delete this quiz\?/i)).not.toBeInTheDocument();
    });
  });

  describe("Publish/Unpublish Functionality", () => {
    it("shows 'Publish Quiz' button when quiz is not published", () => {
      render(<PracticePage />);
      
      expect(screen.getByRole("button", { name: /Publish Quiz/i })).toBeInTheDocument();
    });

    it("toggles to 'Unpublish Quiz' after publishing", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ quiz_id: "quiz-123", is_published: true }),
      });

      render(<PracticePage />);
      
      const titleInput = screen.getByLabelText(/Quiz Title/i);
      fireEvent.change(titleInput, { target: { value: "Publish Test" } });
      
      const publishButton = screen.getByRole("button", { name: /Publish Quiz/i });
      fireEvent.click(publishButton);
      
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Unpublish Quiz/i })).toBeInTheDocument();
      });
    });

    it("shows success message after publishing", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ quiz_id: "quiz-123", is_published: true }),
      });

      render(<PracticePage />);
      
      const titleInput = screen.getByLabelText(/Quiz Title/i);
      fireEvent.change(titleInput, { target: { value: "Publish Test" } });
      
      const publishButton = screen.getByRole("button", { name: /Publish Quiz/i });
      fireEvent.click(publishButton);
      
      await waitFor(() => {
        expect(screen.getByText("Quiz published.")).toBeInTheDocument();
      });
    });
  });

  describe("LocalStorage Draft Management", () => {
    it("persists form data to localStorage on change", async () => {
      render(<PracticePage />);
      
      const titleInput = screen.getByLabelText(/Quiz Title/i);
      fireEvent.change(titleInput, { target: { value: "Test Quiz" } });
      
      await waitFor(() => {
        const draft = JSON.parse(localStorage.getItem("quizConfigDraft") || "{}");
        expect(draft.title).toBe("Test Quiz");
        expect(draft.mode).toBe("practice");
      });
    });

    it("loads draft from localStorage on mount", () => {
      const draft = {
        mode: "practice",
        title: "Saved Quiz",
        description: "Saved description",
        topics: ["Topic 1", "Topic 2"],
      };
      localStorage.setItem("quizConfigDraft", JSON.stringify(draft));
      
      render(<PracticePage />);
      
      expect(screen.getByLabelText(/Quiz Title/i).value).toBe("Saved Quiz");
      expect(screen.getByLabelText(/Quiz Description/i).value).toBe("Saved description");
      expect(screen.getByText("Topic 1")).toBeInTheDocument();
      expect(screen.getByText("Topic 2")).toBeInTheDocument();
    });

    it("ignores non-practice drafts from localStorage", () => {
      const draft = {
        mode: "assessment",
        title: "Assessment Quiz",
      };
      localStorage.setItem("quizConfigDraft", JSON.stringify(draft));
      
      render(<PracticePage />);
      
      expect(screen.getByLabelText(/Quiz Title/i).value).toBe("");
    });

    it("loads source filename from quizGeneratorSeed", () => {
      const seed = {
        filename: "lecture_slides.pdf",
        documentId: "doc123",
      };
      localStorage.setItem("quizGeneratorSeed", JSON.stringify(seed));
      
      render(<PracticePage />);
      
      expect(screen.getByText(/Using slides: lecture_slides.pdf/i)).toBeInTheDocument();
    });
  });

  describe("Exit Modal", () => {
    it("shows exit modal when back button is clicked", () => {
      render(<PracticePage />);
      
      const backButton = screen.getByText("← Back to Quiz List");
      fireEvent.click(backButton);
      
      expect(screen.getByText(/Leave without saving\?/i)).toBeInTheDocument();
    });

    it("closes exit modal when Stay on Page is clicked", () => {
      render(<PracticePage />);
      
      const backButton = screen.getByText("← Back to Quiz List");
      fireEvent.click(backButton);
      
      const stayButton = screen.getByRole("button", { name: /close dialog/i });
      fireEvent.click(stayButton);
      
      expect(screen.queryByText(/Leave without saving\?/i)).not.toBeInTheDocument();
    });

    it("navigates when Leave Without Saving is clicked", () => {
      render(<PracticePage />);
      
      const backButton = screen.getByText("← Back to Quiz List");
      fireEvent.click(backButton);
      
      const leaveButton = screen.getByRole("button", { name: /Leave Without Saving/i });
      fireEvent.click(leaveButton);
      
      expect(mockPush).toHaveBeenCalledWith("/Instructor/Quizzes");
    });

    it("saves and navigates when Save & Exit is clicked", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ quiz_id: "quiz-123", is_published: false }),
      });

      render(<PracticePage />);
      
      const titleInput = screen.getByLabelText(/Quiz Title/i);
      fireEvent.change(titleInput, { target: { value: "Exit Test" } });
      
      const backButton = screen.getByText("← Back to Quiz List");
      fireEvent.click(backButton);
      
      const saveExitButton = screen.getByRole("button", { name: /Save & Exit/i });
      fireEvent.click(saveExitButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/Instructor/Quizzes");
      });
    });
  });

  describe("Styling and Layout", () => {
    it("applies Poppins font class to title", () => {
      render(<PracticePage />);
      const title = screen.getByText("Practice Mode");
      expect(title).toHaveClass("mocked-poppins");
    });

    it("applies gradient to Preview button", () => {
      render(<PracticePage />);
      const previewButton = screen.getByRole("button", { name: /Preview Quiz/i });
      expect(previewButton).toHaveStyle({
        background: expect.stringContaining("gradient"),
      });
    });

    it("renders within max-width container", () => {
      const { container } = render(<PracticePage />);
      const maxWidthDiv = container.querySelector(".max-w-4xl");
      expect(maxWidthDiv).toBeInTheDocument();
    });
  });

  describe("Required Field Indicators", () => {
    it("shows asterisks for required fields", () => {
      render(<PracticePage />);
      
      const requiredLabels = screen.getAllByText("*", { selector: "span.text-red-500" });
      expect(requiredLabels.length).toBeGreaterThan(0);
    });
  });

  describe("Component Cleanup", () => {
    it("cleans up timeout on unmount", () => {
      jest.useFakeTimers();
      const { unmount } = render(<PracticePage />);
      
      unmount();
      
      jest.runAllTimers();
      jest.useRealTimers();
    });
  });

  describe("Error Handling", () => {
    it("handles invalid JSON in localStorage gracefully", () => {
      localStorage.setItem("quizConfigDraft", "invalid json");
      
      expect(() => render(<PracticePage />)).not.toThrow();
    });

    it("handles network errors gracefully", async () => {
      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
      global.fetch.mockRejectedValue(new Error("Network error"));

      render(<PracticePage />);
      
      const titleInput = screen.getByLabelText(/Quiz Title/i);
      fireEvent.change(titleInput, { target: { value: "Error Test" } });
      
      const saveButton = screen.getByRole("button", { name: /Save Quiz/i });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled();
      });
      
      alertSpy.mockRestore();
    });
  });

  describe("Accessibility", () => {
    it("has proper labels for all form inputs", () => {
      render(<PracticePage />);
      
      expect(screen.getByLabelText(/Quiz Title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Quiz Description/i)).toBeInTheDocument();
    });

    it("all buttons are keyboard accessible", () => {
      render(<PracticePage />);
      
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toBeEnabled();
      });
    });
  });

  describe("API Payload", () => {
    it("sends correct payload structure", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ quiz_id: "quiz-123", is_published: false }),
      });

      render(<PracticePage />);
      
      const titleInput = screen.getByLabelText(/Quiz Title/i);
      fireEvent.change(titleInput, { target: { value: "API Test" } });
      
      const saveButton = screen.getByRole("button", { name: /Save Quiz/i });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        const callArgs = global.fetch.mock.calls[0];
        const body = JSON.parse(callArgs[1].body);
        
        expect(body).toHaveProperty("quiz_id");
        expect(body).toHaveProperty("name", "API Test");
        expect(body).toHaveProperty("default_mode", "practice");
        expect(body).toHaveProperty("topics");
      });
    });

    it("uses 'General' topic when no topics added", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ quiz_id: "quiz-123", is_published: false }),
      });

      render(<PracticePage />);
      
      const titleInput = screen.getByLabelText(/Quiz Title/i);
      fireEvent.change(titleInput, { target: { value: "No Topics" } });
      
      const saveButton = screen.getByRole("button", { name: /Save Quiz/i });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        const callArgs = global.fetch.mock.calls[0];
        const body = JSON.parse(callArgs[1].body);
        
        expect(body.topics).toContain("General");
      });
    });
  });
});
