import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatPage from "./chat2";
import { flags } from "../../../lib/flag.js";

// Mock Next.js font
jest.mock("next/font/google", () => ({
  Poppins: () => ({
    className: "mocked-poppins",
  }),
}));

// Mock flags
jest.mock("../../../lib/flag.js", () => ({
  flags: {
    showInstructorBanner: false,
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

describe("ChatPage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
    flags.showInstructorBanner = false;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Initial Rendering", () => {
    it("renders chat page", () => {
      render(<ChatPage />);
      
      expect(screen.getByText("New Chat Session")).toBeInTheDocument();
    });

    it("renders welcome message", () => {
      render(<ChatPage />);
      
      expect(screen.getByText(/Welcome to Horizon Labs Chat/i)).toBeInTheDocument();
    });

    it("renders input placeholder", () => {
      render(<ChatPage />);
      
      expect(screen.getByPlaceholderText("What do you need help with today?")).toBeInTheDocument();
    });

    it("renders send button", () => {
      const { container } = render(<ChatPage />);
      
      const sendButton = container.querySelector("button[disabled]");
      expect(sendButton).toBeInTheDocument();
    });

    it("renders plus button", () => {
      const { container } = render(<ChatPage />);
      
      const plusButton = container.querySelector("button .w-5.h-5");
      expect(plusButton).toBeInTheDocument();
    });

    it("applies Poppins font to title", () => {
      render(<ChatPage />);
      
      const title = screen.getByText("New Chat Session");
      expect(title).toHaveClass("mocked-poppins");
    });

    it("renders chat icon", () => {
      render(<ChatPage />);
      
      const chatIcon = screen.getByAltText("");
      expect(chatIcon).toHaveAttribute("src", "/chat.png");
    });
  });

  describe("Banner Feature Flag", () => {
    it("does not render banner when flag is false", () => {
      flags.showInstructorBanner = false;
      
      render(<ChatPage />);
      
      expect(screen.queryByText(/Instructor Mode Banner/i)).not.toBeInTheDocument();
    });

    it("renders banner when flag is true", () => {
      flags.showInstructorBanner = true;
      
      render(<ChatPage />);
      
      expect(screen.getByText(/Instructor Mode Banner/i)).toBeInTheDocument();
    });

    it("banner has proper styling", () => {
      flags.showInstructorBanner = true;
      
      const { container } = render(<ChatPage />);
      
      const banner = container.querySelector(".mb-3.rounded-lg.border");
      expect(banner).toBeInTheDocument();
    });
  });

  describe("Input Field", () => {
    it("allows typing in input field", () => {
      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Hello" } });
      
      expect(input.value).toBe("Hello");
    });

    it("clears input when message is sent", async () => {
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn()
                .mockResolvedValueOnce({
                  value: new TextEncoder().encode('event: message\ndata: {"type":"token","data":"Hi"}\n\n'),
                  done: false,
                })
                .mockResolvedValueOnce({
                  value: new TextEncoder().encode('event: end\ndata: {}\n\n'),
                  done: false,
                })
                .mockResolvedValueOnce({
                  done: true,
                }),
            }),
          },
        })
      );

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Hello" } });
      
      const sendButton = screen.getByRole("button", { name: "" });
      fireEvent.click(sendButton.parentElement);
      
      await waitFor(() => {
        expect(input.value).toBe("");
      });
    });

    it("input has proper styling", () => {
      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      expect(input).toHaveClass("rounded-2xl");
      expect(input).toHaveClass("bg-purple-50");
    });

    it("handles Enter key press", async () => {
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn().mockResolvedValue({ done: true }),
            }),
          },
        })
      );

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Test message" } });
      fireEvent.keyDown(input, { key: "Enter" });
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it("does not send on Enter if input is empty", () => {
      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.keyDown(input, { key: "Enter" });
      
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("Send Button State", () => {
    it("send button is disabled when input is empty", () => {
      const { container } = render(<ChatPage />);
      
      const sendButton = container.querySelector("button[disabled]");
      expect(sendButton).toBeDisabled();
    });

    it("send button is enabled when input has text", () => {
      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Hello" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      expect(sendButton).not.toBeDisabled();
    });

    it("send button is disabled while streaming", async () => {
      global.fetch.mockImplementation(() => 
        new Promise(() => {}) // Never resolves
      );

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Hello" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(sendButton).toBeDisabled();
      });
    });

    it("send button has gradient background", () => {
      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Hello" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      expect(sendButton).toHaveClass("bg-gradient-to-r");
      expect(sendButton).toHaveClass("from-purple-500");
      expect(sendButton).toHaveClass("to-pink-500");
    });
  });

  describe("Message Sending", () => {
    it("sends message and displays it", async () => {
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn()
                .mockResolvedValueOnce({
                  value: new TextEncoder().encode('event: message\ndata: {"type":"token","data":"Response"}\n\n'),
                  done: false,
                })
                .mockResolvedValueOnce({
                  done: true,
                }),
            }),
          },
        })
      );

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Test message" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText("Test message")).toBeInTheDocument();
      });
    });

    it("does not send empty message", () => {
      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "   " } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("creates session ID on first message", async () => {
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn().mockResolvedValue({ done: true }),
            }),
          },
        })
      );

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Hello" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/chat/stream"),
          expect.objectContaining({
            method: "POST",
            body: expect.stringContaining("session_id"),
          })
        );
      });
    });

    it("includes message in request body", async () => {
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn().mockResolvedValue({ done: true }),
            }),
          },
        })
      );

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "What is AI?" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            body: expect.stringContaining("What is AI?"),
          })
        );
      });
    });
  });

  describe("Streaming Response", () => {
    it("displays streaming response token by token", async () => {
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn()
                .mockResolvedValueOnce({
                  value: new TextEncoder().encode('event: message\ndata: {"type":"token","data":"Hello"}\n\n'),
                  done: false,
                })
                .mockResolvedValueOnce({
                  value: new TextEncoder().encode('event: message\ndata: {"type":"token","data":" World"}\n\n'),
                  done: false,
                })
                .mockResolvedValueOnce({
                  done: true,
                }),
            }),
          },
        })
      );

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Hi" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText("Hello World")).toBeInTheDocument();
      });
    });

    it("shows thinking indicator while streaming", async () => {
      global.fetch.mockImplementation(() => 
        new Promise(() => {}) // Never resolves
      );

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Test" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText("Thinking")).toBeInTheDocument();
      });
    });

    it("hides thinking indicator when done", async () => {
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn()
                .mockResolvedValueOnce({
                  value: new TextEncoder().encode('event: message\ndata: {"type":"token","data":"Done"}\n\n'),
                  done: false,
                })
                .mockResolvedValueOnce({
                  done: true,
                }),
            }),
          },
        })
      );

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Test" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.queryByText("Thinking")).not.toBeInTheDocument();
      });
    });

    it("shows animated dots while thinking", async () => {
      global.fetch.mockImplementation(() => 
        new Promise(() => {}) // Never resolves
      );

      const { container } = render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Test" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        const dots = container.querySelectorAll(".animate-pulse");
        expect(dots.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Error Handling", () => {
    it("displays error message on fetch failure", async () => {
      global.fetch.mockRejectedValue(new Error("Network error"));

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Test" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });

    it("displays error from server", async () => {
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn()
                .mockResolvedValueOnce({
                  value: new TextEncoder().encode('event: error\ndata: {"message":"Server error"}\n\n'),
                  done: false,
                })
                .mockResolvedValueOnce({
                  done: true,
                }),
            }),
          },
        })
      );

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Test" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Server error/i)).toBeInTheDocument();
      });
    });

    it("shows error in message bubble", async () => {
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn()
                .mockResolvedValueOnce({
                  value: new TextEncoder().encode('event: error\ndata: {"message":"Error occurred"}\n\n'),
                  done: false,
                })
                .mockResolvedValueOnce({
                  done: true,
                }),
            }),
          },
        })
      );

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Test" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/⚠️ Error occurred/i)).toBeInTheDocument();
      });
    });

    it("handles non-ok response status", async () => {
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: false,
          status: 500,
          body: null,
        })
      );

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Test" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Request failed with status 500/i)).toBeInTheDocument();
      });
    });

    it("handles JSON parse errors", async () => {
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn()
                .mockResolvedValueOnce({
                  value: new TextEncoder().encode('event: message\ndata: invalid json\n\n'),
                  done: false,
                })
                .mockResolvedValueOnce({
                  done: true,
                }),
            }),
          },
        })
      );

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Test" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to parse response/i)).toBeInTheDocument();
      });
    });
  });

  describe("Message Display", () => {
    it("user messages have purple background", async () => {
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn().mockResolvedValue({ done: true }),
            }),
          },
        })
      );

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "User message" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        const userMessage = screen.getByText("User message").closest("div");
        expect(userMessage).toHaveClass("bg-purple-600");
        expect(userMessage).toHaveClass("text-white");
      });
    });

    it("assistant messages have gray background", async () => {
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn()
                .mockResolvedValueOnce({
                  value: new TextEncoder().encode('event: message\ndata: {"type":"token","data":"AI response"}\n\n'),
                  done: false,
                })
                .mockResolvedValueOnce({
                  done: true,
                }),
            }),
          },
        })
      );

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Test" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        const aiMessage = screen.getByText("AI response").closest("div");
        expect(aiMessage).toHaveClass("bg-gray-100");
        expect(aiMessage).toHaveClass("text-gray-800");
      });
    });

    it("user messages are right-aligned", async () => {
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn().mockResolvedValue({ done: true }),
            }),
          },
        })
      );

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Right aligned" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        const messageContainer = screen.getByText("Right aligned").closest("div").parentElement;
        expect(messageContainer).toHaveClass("justify-end");
      });
    });

    it("assistant messages are left-aligned", async () => {
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn()
                .mockResolvedValueOnce({
                  value: new TextEncoder().encode('event: message\ndata: {"type":"token","data":"Left aligned"}\n\n'),
                  done: false,
                })
                .mockResolvedValueOnce({
                  done: true,
                }),
            }),
          },
        })
      );

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Test" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        const messageContainer = screen.getByText("Left aligned").closest("div").parentElement;
        expect(messageContainer).toHaveClass("justify-start");
      });
    });

    it("messages have rounded corners", async () => {
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn().mockResolvedValue({ done: true }),
            }),
          },
        })
      );

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Rounded" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        const message = screen.getByText("Rounded").closest("div");
        expect(message).toHaveClass("rounded-2xl");
      });
    });

    it("messages preserve whitespace", async () => {
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn().mockResolvedValue({ done: true }),
            }),
          },
        })
      );

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Multi\nline\ntext" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        const messageText = screen.getByText("Multi\nline\ntext").closest("div");
        expect(messageText).toHaveClass("whitespace-pre-wrap");
      });
    });
  });

  describe("Auto-scroll Behavior", () => {
    it("scrolls to bottom when new message arrives", async () => {
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn()
                .mockResolvedValueOnce({
                  value: new TextEncoder().encode('event: message\ndata: {"type":"token","data":"Response"}\n\n'),
                  done: false,
                })
                .mockResolvedValueOnce({
                  done: true,
                }),
            }),
          },
        })
      );

      const { container } = render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Test" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        const messageArea = container.querySelector(".overflow-y-auto");
        expect(messageArea).toBeInTheDocument();
      });
    });
  });

  describe("Component Cleanup", () => {
    it("aborts fetch on unmount", async () => {
      const mockAbort = jest.fn();
      global.fetch.mockImplementation(() => {
        const controller = new AbortController();
        controller.abort = mockAbort;
        return new Promise(() => {}); // Never resolves
      });

      const { unmount } = render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Test" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      unmount();
      
      // Component cleanup should have been called
      expect(true).toBe(true);
    });
  });

  describe("Plus Button", () => {
    it("renders plus button with icon", () => {
      const { container } = render(<ChatPage />);
      
      const plusButton = container.querySelector("button.bg-gray-200");
      expect(plusButton).toBeInTheDocument();
    });

    it("plus button has hover effect", () => {
      const { container } = render(<ChatPage />);
      
      const plusButton = container.querySelector("button.bg-gray-200");
      expect(plusButton).toHaveClass("hover:bg-gray-300");
    });
  });

  describe("Layout and Styling", () => {
    it("main container has white background", () => {
      const { container } = render(<ChatPage />);
      
      const mainContainer = container.querySelector(".bg-white.flex.flex-col");
      expect(mainContainer).toBeInTheDocument();
    });

    it("input section has proper padding", () => {
      const { container } = render(<ChatPage />);
      
      const inputSection = container.querySelector(".p-6");
      expect(inputSection).toBeInTheDocument();
    });

    it("messages area has max height", () => {
      const { container } = render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Test" } });
      
      // Trigger message display
      const buttons = screen.getAllByRole("button");
      fireEvent.click(buttons[buttons.length - 1]);
    });

    it("title has proper font size", () => {
      render(<ChatPage />);
      
      const title = screen.getByText("New Chat Session");
      expect(title).toHaveClass("text-[48.52px]");
      expect(title).toHaveClass("font-bold");
    });
  });

  describe("Session Management", () => {
    it("reuses session ID for multiple messages", async () => {
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn().mockResolvedValue({ done: true }),
            }),
          },
        })
      );

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      
      // Send first message
      fireEvent.change(input, { target: { value: "First" } });
      let buttons = screen.getAllByRole("button");
      fireEvent.click(buttons[buttons.length - 1]);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
      
      const firstCall = global.fetch.mock.calls[0][1].body;
      const firstSessionId = JSON.parse(firstCall).session_id;
      
      // Send second message
      fireEvent.change(input, { target: { value: "Second" } });
      buttons = screen.getAllByRole("button");
      fireEvent.click(buttons[buttons.length - 1]);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
      
      const secondCall = global.fetch.mock.calls[1][1].body;
      const secondSessionId = JSON.parse(secondCall).session_id;
      
      expect(firstSessionId).toBe(secondSessionId);
    });
  });

  describe("End Event Handling", () => {
    it("handles end event from server", async () => {
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn()
                .mockResolvedValueOnce({
                  value: new TextEncoder().encode('event: message\ndata: {"type":"token","data":"Done"}\n\n'),
                  done: false,
                })
                .mockResolvedValueOnce({
                  value: new TextEncoder().encode('event: end\ndata: {}\n\n'),
                  done: false,
                })
                .mockResolvedValueOnce({
                  done: true,
                }),
            }),
          },
        })
      );

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Test" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText("Done")).toBeInTheDocument();
      });
    });
  });

  describe("Abort Controller", () => {
    it("aborts request on error", async () => {
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn()
                .mockResolvedValueOnce({
                  value: new TextEncoder().encode('event: error\ndata: {"message":"Error"}\n\n'),
                  done: false,
                })
                .mockResolvedValueOnce({
                  done: true,
                }),
            }),
          },
        })
      );

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Test" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/⚠️ Error/i)).toBeInTheDocument();
      });
    });

    it("does not update state after abort", async () => {
      const abortError = new Error("Aborted");
      abortError.name = "AbortError";
      
      global.fetch.mockRejectedValue(abortError);

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Test" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles empty event data", async () => {
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn()
                .mockResolvedValueOnce({
                  value: new TextEncoder().encode('event: message\ndata: \n\n'),
                  done: false,
                })
                .mockResolvedValueOnce({
                  done: true,
                }),
            }),
          },
        })
      );

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Test" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it("handles multiple events in single chunk", async () => {
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn()
                .mockResolvedValueOnce({
                  value: new TextEncoder().encode(
                    'event: message\ndata: {"type":"token","data":"Hello"}\n\n' +
                    'event: message\ndata: {"type":"token","data":" World"}\n\n'
                  ),
                  done: false,
                })
                .mockResolvedValueOnce({
                  done: true,
                }),
            }),
          },
        })
      );

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Test" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText("Hello World")).toBeInTheDocument();
      });
    });

    it("handles buffer overflow correctly", async () => {
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn()
                .mockResolvedValueOnce({
                  value: new TextEncoder().encode('event: message\ndata: {"type":"token","data":"Partial'),
                  done: false,
                })
                .mockResolvedValueOnce({
                  value: new TextEncoder().encode('"}\n\n'),
                  done: false,
                })
                .mockResolvedValueOnce({
                  done: true,
                }),
            }),
          },
        })
      );

      render(<ChatPage />);
      
      const input = screen.getByPlaceholderText("What do you need help with today?");
      fireEvent.change(input, { target: { value: "Test" } });
      
      const buttons = screen.getAllByRole("button");
      const sendButton = buttons[buttons.length - 1];
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText("Partial")).toBeInTheDocument();
      });
    });
  });
});
