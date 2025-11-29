import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import QuizGeneratorPage from "./quizgenerator";

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

// Mock crypto.randomUUID
const mockRandomUUID = jest.fn(() => "mock-uuid-123");
global.crypto = {
  randomUUID: mockRandomUUID,
};

describe("QuizGeneratorPage Component", () => {
  let mockPush;

  beforeEach(() => {
    localStorage.clear();
    mockPush = jest.fn();
    useRouter.mockReturnValue({
      push: mockPush,
    });
    jest.clearAllMocks();
    global.fetch.mockClear();
    mockRandomUUID.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Initial Rendering", () => {
    it("renders the page title", () => {
      render(<QuizGeneratorPage />);
      expect(screen.getByText("Create a New Quiz")).toBeInTheDocument();
    });

    it("renders the logo image", () => {
      render(<QuizGeneratorPage />);
      const logo = screen.getByAltText("Graduation Cap");
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute("src", "/logo1.png");
    });

    it("renders back to quiz list button", () => {
      render(<QuizGeneratorPage />);
      expect(screen.getByText("← Back to Quiz List")).toBeInTheDocument();
    });

    it("renders mode selection text", () => {
      render(<QuizGeneratorPage />);
      expect(screen.getByText("Select a mode")).toBeInTheDocument();
    });

    it("renders Assessment mode button", () => {
      render(<QuizGeneratorPage />);
      expect(screen.getByRole("button", { name: /Assessment/i })).toBeInTheDocument();
    });

    it("renders Practice mode button", () => {
      render(<QuizGeneratorPage />);
      expect(screen.getByRole("button", { name: /Practice/i })).toBeInTheDocument();
    });

    it("renders file upload section", () => {
      render(<QuizGeneratorPage />);
      expect(screen.getByText("Upload Slides/Notes")).toBeInTheDocument();
    });

    it("renders file format support text", () => {
      render(<QuizGeneratorPage />);
      expect(screen.getByText("Supports PDF/PPTX")).toBeInTheDocument();
    });

    it("renders Ingest File button", () => {
      render(<QuizGeneratorPage />);
      expect(screen.getByRole("button", { name: /Ingest File/i })).toBeInTheDocument();
    });

    it("renders Next button", () => {
      render(<QuizGeneratorPage />);
      expect(screen.getByRole("button", { name: /Next/i })).toBeInTheDocument();
    });
  });

  describe("Default State", () => {
    it("starts with Practice mode selected", () => {
      render(<QuizGeneratorPage />);
      const practiceButton = screen.getByRole("button", { name: /Practice/i });
      expect(practiceButton).toHaveClass("ring-4");
    });

    it("disables Ingest button when no file is uploaded", () => {
      render(<QuizGeneratorPage />);
      const ingestButton = screen.getByRole("button", { name: /Ingest File/i });
      expect(ingestButton).toBeDisabled();
    });

    it("disables Next button initially", () => {
      render(<QuizGeneratorPage />);
      const nextButton = screen.getByRole("button", { name: /Next/i });
      expect(nextButton).toBeDisabled();
    });
  });

  describe("Mode Selection", () => {
    it("switches to Assessment mode when clicked", () => {
      render(<QuizGeneratorPage />);
      const assessmentButton = screen.getByRole("button", { name: /Assessment/i });
      
      fireEvent.click(assessmentButton);
      
      expect(assessmentButton).toHaveClass("ring-4");
    });

    it("switches to Practice mode when clicked", () => {
      render(<QuizGeneratorPage />);
      const practiceButton = screen.getByRole("button", { name: /Practice/i });
      
      fireEvent.click(practiceButton);
      
      expect(practiceButton).toHaveClass("ring-4");
    });

    it("shows Assessment ring styling when selected", () => {
      render(<QuizGeneratorPage />);
      const assessmentButton = screen.getByRole("button", { name: /Assessment/i });
      
      fireEvent.click(assessmentButton);
      
      expect(assessmentButton).toHaveClass("ring-purple-300");
    });

    it("shows Practice ring styling when selected", () => {
      render(<QuizGeneratorPage />);
      const practiceButton = screen.getByRole("button", { name: /Practice/i });
      
      expect(practiceButton).toHaveClass("ring-orange-300");
    });

    it("clears ingest error when mode is changed", () => {
      render(<QuizGeneratorPage />);
      
      // Trigger an error by clicking Next without file in Practice mode
      const nextButton = screen.getByRole("button", { name: /Next/i });
      const practiceButton = screen.getByRole("button", { name: /Practice/i });
      
      fireEvent.click(practiceButton);
      fireEvent.click(nextButton);
      
      // Switch to Assessment mode
      const assessmentButton = screen.getByRole("button", { name: /Assessment/i });
      fireEvent.click(assessmentButton);
      
      // Error should be cleared
      expect(screen.queryByText(/Please upload a file before continuing/i)).not.toBeInTheDocument();
    });
  });

  describe("File Upload", () => {
    it("displays uploaded file name", () => {
      render(<QuizGeneratorPage />);
      const fileInput = screen.getByLabelText(/Upload Slides\/Notes/i);
      
      const file = new File(["content"], "test-slides.pdf", { type: "application/pdf" });
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      expect(screen.getByText("test-slides.pdf")).toBeInTheDocument();
    });

    it("enables Ingest button after file upload", () => {
      render(<QuizGeneratorPage />);
      const fileInput = screen.getByLabelText(/Upload Slides\/Notes/i);
      const ingestButton = screen.getByRole("button", { name: /Ingest File/i });
      
      const file = new File(["content"], "notes.pdf", { type: "application/pdf" });
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      expect(ingestButton).not.toBeDisabled();
    });

    it("accepts PDF files", () => {
      render(<QuizGeneratorPage />);
      const fileInput = screen.getByLabelText(/Upload Slides\/Notes/i);
      
      expect(fileInput).toHaveAttribute("accept", ".pdf,.pptx");
    });

    it("clears ingest error when new file is uploaded", () => {
      render(<QuizGeneratorPage />);
      const fileInput = screen.getByLabelText(/Upload Slides\/Notes/i);
      const nextButton = screen.getByRole("button", { name: /Next/i });
      
      // Trigger error
      fireEvent.click(nextButton);
      
      // Upload file
      const file = new File(["content"], "new.pdf", { type: "application/pdf" });
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      expect(screen.queryByText(/Please upload a file before continuing/i)).not.toBeInTheDocument();
    });

    it("clears success message when new file is uploaded", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          document_id: "doc-123",
          slide_count: 10,
          chunk_count: 25,
        }),
      });

      render(<QuizGeneratorPage />);
      const fileInput = screen.getByLabelText(/Upload Slides\/Notes/i);
      const ingestButton = screen.getByRole("button", { name: /Ingest File/i });
      
      // Upload and ingest first file
      const file1 = new File(["content"], "first.pdf", { type: "application/pdf" });
      fireEvent.change(fileInput, { target: { files: [file1] } });
      fireEvent.click(ingestButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Ingested 10 slides/i)).toBeInTheDocument();
      });
      
      // Upload second file
      const file2 = new File(["content"], "second.pdf", { type: "application/pdf" });
      fireEvent.change(fileInput, { target: { files: [file2] } });
      
      expect(screen.queryByText(/Ingested 10 slides/i)).not.toBeInTheDocument();
    });
  });

  describe("File Ingestion", () => {
    it("shows ingesting state when processing file", async () => {
      global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<QuizGeneratorPage />);
      const fileInput = screen.getByLabelText(/Upload Slides\/Notes/i);
      const ingestButton = screen.getByRole("button", { name: /Ingest File/i });
      
      const file = new File(["content"], "test.pdf", { type: "application/pdf" });
      fireEvent.change(fileInput, { target: { files: [file] } });
      fireEvent.click(ingestButton);
      
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Ingesting\.\.\./i })).toBeInTheDocument();
      });
    });

    it("disables Ingest button while ingesting", async () => {
      global.fetch.mockImplementation(() => new Promise(() => {}));
      
      render(<QuizGeneratorPage />);
      const fileInput = screen.getByLabelText(/Upload Slides\/Notes/i);
      const ingestButton = screen.getByRole("button", { name: /Ingest File/i });
      
      const file = new File(["content"], "test.pdf", { type: "application/pdf" });
      fireEvent.change(fileInput, { target: { files: [file] } });
      fireEvent.click(ingestButton);
      
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Ingesting\.\.\./i })).toBeDisabled();
      });
    });

    it("sends correct FormData to API", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          document_id: "doc-123",
          slide_count: 5,
          chunk_count: 10,
        }),
      });

      render(<QuizGeneratorPage />);
      const fileInput = screen.getByLabelText(/Upload Slides\/Notes/i);
      const ingestButton = screen.getByRole("button", { name: /Ingest File/i });
      
      const file = new File(["content"], "slides.pdf", { type: "application/pdf" });
      fireEvent.change(fileInput, { target: { files: [file] } });
      fireEvent.click(ingestButton);
      
      await waitFor(() => {
        const callArgs = global.fetch.mock.calls[0];
        expect(callArgs[0]).toContain("/ingest/upload");
        expect(callArgs[1].method).toBe("POST");
        expect(callArgs[1].body).toBeInstanceOf(FormData);
      });
    });

    it("displays success message after ingestion", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          document_id: "doc-123",
          slide_count: 15,
          chunk_count: 30,
        }),
      });

      render(<QuizGeneratorPage />);
      const fileInput = screen.getByLabelText(/Upload Slides\/Notes/i);
      const ingestButton = screen.getByRole("button", { name: /Ingest File/i });
      
      const file = new File(["content"], "test.pdf", { type: "application/pdf" });
      fireEvent.change(fileInput, { target: { files: [file] } });
      fireEvent.click(ingestButton);
      
      await waitFor(() => {
        expect(screen.getByText("Ingested 15 slides (30 chunks).")).toBeInTheDocument();
      });
    });

    it("displays generic message when slide count is not available", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          document_id: "doc-123",
          chunk_count: 20,
        }),
      });

      render(<QuizGeneratorPage />);
      const fileInput = screen.getByLabelText(/Upload Slides\/Notes/i);
      const ingestButton = screen.getByRole("button", { name: /Ingest File/i });
      
      const file = new File(["content"], "test.pdf", { type: "application/pdf" });
      fireEvent.change(fileInput, { target: { files: [file] } });
      fireEvent.click(ingestButton);
      
      await waitFor(() => {
        expect(screen.getByText("Ingested the uploaded file (20 chunks).")).toBeInTheDocument();
      });
    });

    it("displays error message when ingestion fails", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ detail: "Invalid file format" }),
      });

      render(<QuizGeneratorPage />);
      const fileInput = screen.getByLabelText(/Upload Slides\/Notes/i);
      const ingestButton = screen.getByRole("button", { name: /Ingest File/i });
      
      const file = new File(["content"], "bad.pdf", { type: "application/pdf" });
      fireEvent.change(fileInput, { target: { files: [file] } });
      fireEvent.click(ingestButton);
      
      await waitFor(() => {
        expect(screen.getByText("Invalid file format")).toBeInTheDocument();
      });
    });

    it("handles network errors gracefully", async () => {
      global.fetch.mockRejectedValue(new Error("Network error"));

      render(<QuizGeneratorPage />);
      const fileInput = screen.getByLabelText(/Upload Slides\/Notes/i);
      const ingestButton = screen.getByRole("button", { name: /Ingest File/i });
      
      const file = new File(["content"], "test.pdf", { type: "application/pdf" });
      fireEvent.change(fileInput, { target: { files: [file] } });
      fireEvent.click(ingestButton);
      
      await waitFor(() => {
        expect(screen.getByText("Network error")).toBeInTheDocument();
      });
    });

    it("shows error when trying to ingest without file", async () => {
      render(<QuizGeneratorPage />);
      const ingestButton = screen.getByRole("button", { name: /Ingest File/i });
      
      // Manually enable the button to test the handler
      ingestButton.disabled = false;
      fireEvent.click(ingestButton);
      
      await waitFor(() => {
        expect(screen.getByText("Please upload a file to ingest.")).toBeInTheDocument();
      });
    });

    it("deletes previous document before ingesting new one", async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            document_id: "doc-1",
            slide_count: 5,
            chunk_count: 10,
          }),
        })
        .mockResolvedValueOnce({ ok: true }) // DELETE
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            document_id: "doc-2",
            slide_count: 8,
            chunk_count: 15,
          }),
        });

      render(<QuizGeneratorPage />);
      const fileInput = screen.getByLabelText(/Upload Slides\/Notes/i);
      const ingestButton = screen.getByRole("button", { name: /Ingest File/i });
      
      // First ingestion
      const file1 = new File(["content"], "first.pdf", { type: "application/pdf" });
      fireEvent.change(fileInput, { target: { files: [file1] } });
      fireEvent.click(ingestButton);
      
      await waitFor(() => {
        expect(screen.getByText("Ingested 5 slides (10 chunks).")).toBeInTheDocument();
      });
      
      // Second ingestion
      const file2 = new File(["content"], "second.pdf", { type: "application/pdf" });
      fireEvent.change(fileInput, { target: { files: [file2] } });
      fireEvent.click(ingestButton);
      
      await waitFor(() => {
        const deleteCalls = global.fetch.mock.calls.filter(call => 
          call[0].includes("/ingest/document") && call[1]?.method === "DELETE"
        );
        expect(deleteCalls.length).toBe(1);
      });
    });
  });

  describe("Next Button Functionality", () => {
    it("enables Next button in Assessment mode without file", () => {
      render(<QuizGeneratorPage />);
      const assessmentButton = screen.getByRole("button", { name: /Assessment/i });
      const nextButton = screen.getByRole("button", { name: /Next/i });
      
      fireEvent.click(assessmentButton);
      
      expect(nextButton).not.toBeDisabled();
    });

    it("requires file upload for Practice mode", () => {
      render(<QuizGeneratorPage />);
      const practiceButton = screen.getByRole("button", { name: /Practice/i });
      const nextButton = screen.getByRole("button", { name: /Next/i });
      
      fireEvent.click(practiceButton);
      fireEvent.click(nextButton);
      
      expect(screen.getByText("Please upload a file before continuing.")).toBeInTheDocument();
    });

    it("requires ingestion for Practice mode", async () => {
      render(<QuizGeneratorPage />);
      const fileInput = screen.getByLabelText(/Upload Slides\/Notes/i);
      const nextButton = screen.getByRole("button", { name: /Next/i });
      
      const file = new File(["content"], "test.pdf", { type: "application/pdf" });
      fireEvent.change(fileInput, { target: { files: [file] } });
      fireEvent.click(nextButton);
      
      expect(screen.getByText("Please ingest your latest upload before continuing.")).toBeInTheDocument();
    });

    it("navigates to Assessment page in Assessment mode", () => {
      render(<QuizGeneratorPage />);
      const assessmentButton = screen.getByRole("button", { name: /Assessment/i });
      const nextButton = screen.getByRole("button", { name: /Next/i });
      
      fireEvent.click(assessmentButton);
      fireEvent.click(nextButton);
      
      expect(mockPush).toHaveBeenCalledWith("/Instructor/Assessment");
    });

    it("navigates to Practice page in Practice mode", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          document_id: "doc-123",
          slide_count: 10,
          chunk_count: 20,
        }),
      });

      render(<QuizGeneratorPage />);
      const fileInput = screen.getByLabelText(/Upload Slides\/Notes/i);
      const ingestButton = screen.getByRole("button", { name: /Ingest File/i });
      const nextButton = screen.getByRole("button", { name: /Next/i });
      
      const file = new File(["content"], "test.pdf", { type: "application/pdf" });
      fireEvent.change(fileInput, { target: { files: [file] } });
      fireEvent.click(ingestButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Ingested 10 slides/i)).toBeInTheDocument();
      });
      
      fireEvent.click(nextButton);
      
      expect(mockPush).toHaveBeenCalledWith("/Instructor/Practice");
    });

    it("saves seed data to localStorage before navigation", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          document_id: "doc-123",
          slide_count: 10,
          chunk_count: 20,
        }),
      });

      render(<QuizGeneratorPage />);
      const fileInput = screen.getByLabelText(/Upload Slides\/Notes/i);
      const ingestButton = screen.getByRole("button", { name: /Ingest File/i });
      const nextButton = screen.getByRole("button", { name: /Next/i });
      
      const file = new File(["content"], "slides.pdf", { type: "application/pdf" });
      fireEvent.change(fileInput, { target: { files: [file] } });
      fireEvent.click(ingestButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Ingested 10 slides/i)).toBeInTheDocument();
      });
      
      fireEvent.click(nextButton);
      
      const seed = JSON.parse(localStorage.getItem("quizGeneratorSeed") || "{}");
      expect(seed.mode).toBe("practice");
      expect(seed.filename).toBe("slides.pdf");
      expect(seed.documentId).toBe("doc-123");
    });

    it("clears quiz drafts before navigation", async () => {
      localStorage.setItem("quizConfigDraft", JSON.stringify({ title: "Test" }));
      localStorage.setItem("quizPreviewData", JSON.stringify({ id: "1" }));
      
      render(<QuizGeneratorPage />);
      const assessmentButton = screen.getByRole("button", { name: /Assessment/i });
      const nextButton = screen.getByRole("button", { name: /Next/i });
      
      fireEvent.click(assessmentButton);
      fireEvent.click(nextButton);
      
      expect(localStorage.getItem("quizConfigDraft")).toBeNull();
      expect(localStorage.getItem("quizPreviewData")).toBeNull();
    });
  });

  describe("Session ID Management", () => {
    it("generates session ID if not present", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          document_id: "doc-123",
          slide_count: 10,
          chunk_count: 20,
        }),
      });

      render(<QuizGeneratorPage />);
      const fileInput = screen.getByLabelText(/Upload Slides\/Notes/i);
      const ingestButton = screen.getByRole("button", { name: /Ingest File/i });
      
      const file = new File(["content"], "test.pdf", { type: "application/pdf" });
      fireEvent.change(fileInput, { target: { files: [file] } });
      fireEvent.click(ingestButton);
      
      await waitFor(() => {
        expect(mockRandomUUID).toHaveBeenCalled();
        expect(localStorage.getItem("quizGeneratorSessionId")).toBe("mock-uuid-123");
      });
    });

    it("reuses existing session ID", async () => {
      localStorage.setItem("quizGeneratorSessionId", "existing-session");
      
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          document_id: "doc-123",
          slide_count: 10,
          chunk_count: 20,
        }),
      });

      render(<QuizGeneratorPage />);
      const fileInput = screen.getByLabelText(/Upload Slides\/Notes/i);
      const ingestButton = screen.getByRole("button", { name: /Ingest File/i });
      
      const file = new File(["content"], "test.pdf", { type: "application/pdf" });
      fireEvent.change(fileInput, { target: { files: [file] } });
      fireEvent.click(ingestButton);
      
      await waitFor(() => {
        expect(mockRandomUUID).not.toHaveBeenCalled();
        expect(localStorage.getItem("quizGeneratorSessionId")).toBe("existing-session");
      });
    });

    it("saves session ID in seed data", async () => {
      localStorage.setItem("quizGeneratorSessionId", "test-session-123");
      
      render(<QuizGeneratorPage />);
      const assessmentButton = screen.getByRole("button", { name: /Assessment/i });
      const nextButton = screen.getByRole("button", { name: /Next/i });
      
      fireEvent.click(assessmentButton);
      fireEvent.click(nextButton);
      
      const seed = JSON.parse(localStorage.getItem("quizGeneratorSeed") || "{}");
      expect(seed.sessionId).toBe("test-session-123");
    });
  });

  describe("Exit Modal", () => {
    it("opens exit modal when back button is clicked", () => {
      render(<QuizGeneratorPage />);
      const backButton = screen.getByText("← Back to Quiz List");
      
      fireEvent.click(backButton);
      
      expect(screen.getByText("Leave setup?")).toBeInTheDocument();
    });

    it("shows warning message in exit modal", () => {
      render(<QuizGeneratorPage />);
      const backButton = screen.getByText("← Back to Quiz List");
      
      fireEvent.click(backButton);
      
      expect(screen.getByText(/You haven't created a quiz yet/i)).toBeInTheDocument();
    });

    it("closes modal when Stay Here is clicked", () => {
      render(<QuizGeneratorPage />);
      const backButton = screen.getByText("← Back to Quiz List");
      
      fireEvent.click(backButton);
      
      const stayButton = screen.getByRole("button", { name: /Stay Here/i });
      fireEvent.click(stayButton);
      
      expect(screen.queryByText("Leave setup?")).not.toBeInTheDocument();
    });

    it("navigates to quiz list when Leave is clicked", async () => {
      render(<QuizGeneratorPage />);
      const backButton = screen.getByText("← Back to Quiz List");
      
      fireEvent.click(backButton);
      
      const leaveButton = screen.getByRole("button", { name: /Leave/i });
      fireEvent.click(leaveButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/Instructor/Quizzes");
      });
    });

    it("deletes ingested document when exiting", async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            document_id: "doc-123",
            slide_count: 10,
            chunk_count: 20,
          }),
        })
        .mockResolvedValueOnce({ ok: true }); // DELETE

      render(<QuizGeneratorPage />);
      const fileInput = screen.getByLabelText(/Upload Slides\/Notes/i);
      const ingestButton = screen.getByRole("button", { name: /Ingest File/i });
      
      const file = new File(["content"], "test.pdf", { type: "application/pdf" });
      fireEvent.change(fileInput, { target: { files: [file] } });
      fireEvent.click(ingestButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Ingested 10 slides/i)).toBeInTheDocument();
      });
      
      const backButton = screen.getByText("← Back to Quiz List");
      fireEvent.click(backButton);
      
      const leaveButton = screen.getByRole("button", { name: /Leave/i });
      fireEvent.click(leaveButton);
      
      await waitFor(() => {
        const deleteCalls = global.fetch.mock.calls.filter(call => 
          call[0].includes("/ingest/document/doc-123") && call[1]?.method === "DELETE"
        );
        expect(deleteCalls.length).toBe(1);
      });
    });

    it("navigates even if document deletion fails", async () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
      
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            document_id: "doc-123",
            slide_count: 10,
            chunk_count: 20,
          }),
        })
        .mockRejectedValueOnce(new Error("Delete failed"));

      render(<QuizGeneratorPage />);
      const fileInput = screen.getByLabelText(/Upload Slides\/Notes/i);
      const ingestButton = screen.getByRole("button", { name: /Ingest File/i });
      
      const file = new File(["content"], "test.pdf", { type: "application/pdf" });
      fireEvent.change(fileInput, { target: { files: [file] } });
      fireEvent.click(ingestButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Ingested 10 slides/i)).toBeInTheDocument();
      });
      
      const backButton = screen.getByText("← Back to Quiz List");
      fireEvent.click(backButton);
      
      const leaveButton = screen.getByRole("button", { name: /Leave/i });
      fireEvent.click(leaveButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/Instructor/Quizzes");
      });
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe("Styling and Layout", () => {
    it("applies Poppins font class to title", () => {
      render(<QuizGeneratorPage />);
      const title = screen.getByText("Create a New Quiz");
      expect(title).toHaveClass("mocked-poppins");
    });

    it("applies gradient to Assessment button", () => {
      render(<QuizGeneratorPage />);
      const assessmentButton = screen.getByRole("button", { name: /Assessment/i });
      expect(assessmentButton).toHaveStyle({
        background: "linear-gradient(to right, #7B2CBF, #9333EA)",
      });
    });

    it("applies gradient to Practice button", () => {
      render(<QuizGeneratorPage />);
      const practiceButton = screen.getByRole("button", { name: /Practice/i });
      expect(practiceButton).toHaveStyle({
        background: "linear-gradient(to right, #FF6B35, #F97316)",
      });
    });

    it("shows disabled styling on Next button when conditions not met", () => {
      render(<QuizGeneratorPage />);
      const nextButton = screen.getByRole("button", { name: /Next/i });
      
      expect(nextButton).toHaveClass("disabled:opacity-50");
    });
  });

  describe("Error Handling", () => {
    it("handles localStorage errors gracefully", () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const setItemSpy = jest.spyOn(Storage.prototype, "setItem");
      setItemSpy.mockImplementation(() => {
        throw new Error("Storage full");
      });

      render(<QuizGeneratorPage />);
      const assessmentButton = screen.getByRole("button", { name: /Assessment/i });
      const nextButton = screen.getByRole("button", { name: /Next/i });
      
      fireEvent.click(assessmentButton);
      
      expect(() => fireEvent.click(nextButton)).not.toThrow();
      
      setItemSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it("handles API response without JSON body", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: () => Promise.reject(new Error("No JSON")),
      });

      render(<QuizGeneratorPage />);
      const fileInput = screen.getByLabelText(/Upload Slides\/Notes/i);
      const ingestButton = screen.getByRole("button", { name: /Ingest File/i });
      
      const file = new File(["content"], "test.pdf", { type: "application/pdf" });
      fireEvent.change(fileInput, { target: { files: [file] } });
      fireEvent.click(ingestButton);
      
      await waitFor(() => {
        expect(screen.getByText("File ingestion failed.")).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("all buttons are keyboard accessible", () => {
      render(<QuizGeneratorPage />);
      
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveAttribute("type", "button");
      });
    });

    it("file input has label association", () => {
      render(<QuizGeneratorPage />);
      const fileInput = screen.getByLabelText(/Upload Slides\/Notes/i);
      
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute("type", "file");
    });

    it("modal has proper structure", () => {
      render(<QuizGeneratorPage />);
      const backButton = screen.getByText("← Back to Quiz List");
      
      fireEvent.click(backButton);
      
      expect(screen.getByRole("button", { name: /Stay Here/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Leave/i })).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles file selection cancellation", () => {
      render(<QuizGeneratorPage />);
      const fileInput = screen.getByLabelText(/Upload Slides\/Notes/i);
      
      fireEvent.change(fileInput, { target: { files: [] } });
      
      expect(screen.getByText("Upload Slides/Notes")).toBeInTheDocument();
    });

    it("validates file is ingested matches uploaded file", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          document_id: "doc-123",
          slide_count: 10,
          chunk_count: 20,
        }),
      });

      render(<QuizGeneratorPage />);
      const fileInput = screen.getByLabelText(/Upload Slides\/Notes/i);
      const ingestButton = screen.getByRole("button", { name: /Ingest File/i });
      const nextButton = screen.getByRole("button", { name: /Next/i });
      
      // Upload and ingest first file
      const file1 = new File(["content"], "first.pdf", { type: "application/pdf" });
      fireEvent.change(fileInput, { target: { files: [file1] } });
      fireEvent.click(ingestButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Ingested 10 slides/i)).toBeInTheDocument();
      });
      
      // Upload different file without ingesting
      const file2 = new File(["content"], "second.pdf", { type: "application/pdf" });
      fireEvent.change(fileInput, { target: { files: [file2] } });
      
      fireEvent.click(nextButton);
      
      expect(screen.getByText("Please ingest your latest upload before continuing.")).toBeInTheDocument();
    });
  });
});
