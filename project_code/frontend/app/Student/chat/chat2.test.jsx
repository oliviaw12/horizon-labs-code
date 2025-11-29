import { render, screen, fireEvent } from "@testing-library/react";
import ChatPage from "./chat2";

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
});
