import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatPage from "./chat2";
const { TextEncoder, TextDecoder } = require("util");

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}
if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder;
}

jest.mock("next/font/google", () => ({
  Poppins: () => ({ className: "poppins-mock" }),
}));

jest.mock("../../../lib/flag.js", () => ({
  flags: { showInstructorBanner: false },
}));

describe("ChatPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  const mockStreamResponse = (events = [], { ok = true, status = 200 } = {}) => {
    const encoder = new TextEncoder();
    const chunks = events.map((evt) => encoder.encode(evt));
    let index = 0;
    return {
      ok,
      status,
      body: {
        getReader: () => ({
          read: jest.fn().mockImplementation(() => {
            if (index < chunks.length) {
              return Promise.resolve({ value: chunks[index++], done: false });
            }
            return Promise.resolve({ value: undefined, done: true });
          }),
        }),
      },
    };
  };

  const getSendButton = () => {
    const buttons = screen.getAllByRole("button");
    return buttons[buttons.length - 1];
  };

  it("renders the chat heading", () => {
    render(<ChatPage />);
    expect(screen.getByText("New Chat Session")).toBeInTheDocument();
  });

  it("disables send button when input is empty", () => {
    render(<ChatPage />);
    const buttons = screen.getAllByRole("button");
    const sendButton = buttons[buttons.length - 1];
    expect(sendButton).toBeDisabled();
  });

  it("enables send button when text is entered", () => {
    render(<ChatPage />);
    const input = screen.getByPlaceholderText("What do you need help with today?");
    const buttons = screen.getAllByRole("button");
    const sendButton = buttons[buttons.length - 1];

    fireEvent.change(input, { target: { value: "Hello" } });
    expect(sendButton).not.toBeDisabled();
  });

  it("streams assistant tokens and clears loading state", async () => {
    const events = [
      'data: {"type":"token","data":"Hello"}\n\n',
      'data: {"type":"token","data":"!"}\n\n',
      "event: end\ndata: {}\n\n",
    ];
    global.fetch.mockResolvedValue(mockStreamResponse(events));

    render(<ChatPage />);
    const input = screen.getByPlaceholderText("What do you need help with today?");
    fireEvent.change(input, { target: { value: "Hello there" } });
    fireEvent.click(getSendButton());

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/chat/stream"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("Hello there"),
      })
    );

    await screen.findByText("Hello there"); // user message
    await screen.findByText("Hello!"); // combined assistant tokens
    await waitFor(() => expect(screen.queryByText("Thinking")).not.toBeInTheDocument());
  });

  it("shows server error messages from the stream", async () => {
    const events = ['event: error\ndata: {"message":"Server exploded"}\n\n'];
    global.fetch.mockResolvedValue(mockStreamResponse(events));

    render(<ChatPage />);
    const input = screen.getByPlaceholderText("What do you need help with today?");
    fireEvent.change(input, { target: { value: "Trigger error" } });
    fireEvent.click(getSendButton());

    await screen.findByText(/⚠️ Server exploded/);
    expect(screen.getByText("Server exploded")).toBeInTheDocument();
  });

  it("handles malformed streaming data gracefully", async () => {
    const events = ["data: {not-json}\n\n"];
    global.fetch.mockResolvedValue(mockStreamResponse(events));

    render(<ChatPage />);
    const input = screen.getByPlaceholderText("What do you need help with today?");
    fireEvent.change(input, { target: { value: "Bad data" } });
    fireEvent.click(getSendButton());

    const errors = await screen.findAllByText(/Failed to parse response from server/i);
    expect(errors.length).toBeGreaterThan(0);
  });
});
