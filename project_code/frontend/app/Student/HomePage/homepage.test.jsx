import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter } from "next/navigation";
import StudentHomePage from "./homepage";

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

describe("StudentHomePage Component", () => {
  let mockPush;

  beforeEach(() => {
    mockPush = jest.fn();
    useRouter.mockReturnValue({
      push: mockPush,
    });
    jest.clearAllMocks();
    
    // Mock Date to have consistent output
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-03-15'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe("Initial Rendering", () => {
    it("renders the page", () => {
      render(<StudentHomePage />);
      
      expect(screen.getByText("Welcome Student")).toBeInTheDocument();
    });

    it("renders the current date", () => {
      render(<StudentHomePage />);
      
      expect(screen.getByText("March 15, 2024")).toBeInTheDocument();
    });

    it("applies Poppins font to title", () => {
      render(<StudentHomePage />);
      
      const title = screen.getByText("Welcome Student");
      expect(title).toHaveClass("mocked-poppins");
    });

    it("applies Poppins font to date", () => {
      render(<StudentHomePage />);
      
      const date = screen.getByText("March 15, 2024");
      expect(date).toHaveClass("mocked-poppins");
    });
  });

  describe("Chat Option", () => {
    it("renders chat card", () => {
      render(<StudentHomePage />);
      
      expect(screen.getByText("Chat with AI Assistant")).toBeInTheDocument();
    });

    it("renders chat description", () => {
      render(<StudentHomePage />);
      
      expect(screen.getByText(/Get help with your questions and learn with our adaptive AI coach/i)).toBeInTheDocument();
    });

    it("renders Start Chatting link text", () => {
      render(<StudentHomePage />);
      
      expect(screen.getByText("Start Chatting")).toBeInTheDocument();
    });

    it("renders chat icon", () => {
      render(<StudentHomePage />);
      
      const chatIcon = screen.getByAltText("Chat");
      expect(chatIcon).toHaveAttribute("src", "/chat.png");
    });

    it("navigates to chat page on click", () => {
      render(<StudentHomePage />);
      
      const chatCard = screen.getByText("Chat with AI Assistant").closest("button");
      fireEvent.click(chatCard);
      
      expect(mockPush).toHaveBeenCalledWith("/Student/chat");
    });

    it("chat card has gradient background", () => {
      render(<StudentHomePage />);
      
      const chatCard = screen.getByText("Chat with AI Assistant").closest("button");
      expect(chatCard).toHaveClass("bg-gradient-to-br");
      expect(chatCard).toHaveClass("from-purple-50");
      expect(chatCard).toHaveClass("to-purple-100");
    });

    it("chat icon container has purple background", () => {
      render(<StudentHomePage />);
      
      const chatIcon = screen.getByAltText("Chat");
      const iconContainer = chatIcon.parentElement;
      expect(iconContainer).toHaveClass("bg-purple-500");
    });

    it("chat card has hover effects", () => {
      render(<StudentHomePage />);
      
      const chatCard = screen.getByText("Chat with AI Assistant").closest("button");
      expect(chatCard).toHaveClass("hover:scale-105");
      expect(chatCard).toHaveClass("hover:shadow-xl");
    });

    it("chat arrow has hover animation", () => {
      const { container } = render(<StudentHomePage />);
      
      const chatCard = screen.getByText("Chat with AI Assistant").closest("button");
      const arrow = chatCard.querySelector("svg path");
      expect(arrow).toBeInTheDocument();
    });
  });

  describe("Quiz Option", () => {
    it("renders quiz card", () => {
      render(<StudentHomePage />);
      
      expect(screen.getByText("Assessment & Practice Quizzes")).toBeInTheDocument();
    });

    it("renders quiz description", () => {
      render(<StudentHomePage />);
      
      expect(screen.getByText(/Run timed assessments or adaptive practice sessions/i)).toBeInTheDocument();
    });

    it("renders View Quizzes link text", () => {
      render(<StudentHomePage />);
      
      expect(screen.getByText("View Quizzes")).toBeInTheDocument();
    });

    it("renders quiz icon", () => {
      render(<StudentHomePage />);
      
      const quizIcon = screen.getByAltText("Quiz");
      expect(quizIcon).toHaveAttribute("src", "/Qbubble.png");
    });

    it("navigates to quizzes page on click", () => {
      render(<StudentHomePage />);
      
      const quizCard = screen.getByText("Assessment & Practice Quizzes").closest("button");
      fireEvent.click(quizCard);
      
      expect(mockPush).toHaveBeenCalledWith("/Student/Quizzes");
    });

    it("quiz card has gradient background", () => {
      render(<StudentHomePage />);
      
      const quizCard = screen.getByText("Assessment & Practice Quizzes").closest("button");
      expect(quizCard).toHaveClass("bg-gradient-to-br");
      expect(quizCard).toHaveClass("from-blue-50");
      expect(quizCard).toHaveClass("to-blue-100");
    });

    it("quiz icon container has blue gradient", () => {
      render(<StudentHomePage />);
      
      const quizIcon = screen.getByAltText("Quiz");
      const iconContainer = quizIcon.parentElement;
      expect(iconContainer).toHaveClass("bg-gradient-to-r");
      expect(iconContainer).toHaveClass("from-blue-500");
    });

    it("quiz card has hover effects", () => {
      render(<StudentHomePage />);
      
      const quizCard = screen.getByText("Assessment & Practice Quizzes").closest("button");
      expect(quizCard).toHaveClass("hover:scale-105");
      expect(quizCard).toHaveClass("hover:border-blue-400");
    });

    it("quiz button has type attribute", () => {
      render(<StudentHomePage />);
      
      const quizCard = screen.getByText("Assessment & Practice Quizzes").closest("button");
      expect(quizCard).toHaveAttribute("type", "button");
    });
  });

  describe("Flashcards Option", () => {
    it("renders flashcards card", () => {
      render(<StudentHomePage />);
      
      expect(screen.getByText("Flashcards Lab")).toBeInTheDocument();
    });

    it("renders Preview badge", () => {
      render(<StudentHomePage />);
      
      expect(screen.getByText("Preview")).toBeInTheDocument();
    });

    it("renders flashcards description", () => {
      render(<StudentHomePage />);
      
      expect(screen.getByText(/Generate decks from course files and rehearse with active recall/i)).toBeInTheDocument();
    });

    it("renders Open Flashcards link text", () => {
      render(<StudentHomePage />);
      
      expect(screen.getByText("Open Flashcards")).toBeInTheDocument();
    });

    it("renders flashcards icon as SVG", () => {
      const { container } = render(<StudentHomePage />);
      
      const flashcardsCard = screen.getByText("Flashcards Lab").closest("button");
      const svg = flashcardsCard.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("navigates to flashcards page on click", () => {
      render(<StudentHomePage />);
      
      const flashcardsCard = screen.getByText("Flashcards Lab").closest("button");
      fireEvent.click(flashcardsCard);
      
      expect(mockPush).toHaveBeenCalledWith("/Student/Flashcards");
    });

    it("flashcards card has gradient background", () => {
      render(<StudentHomePage />);
      
      const flashcardsCard = screen.getByText("Flashcards Lab").closest("button");
      expect(flashcardsCard).toHaveClass("bg-gradient-to-br");
      expect(flashcardsCard).toHaveClass("from-emerald-50");
      expect(flashcardsCard).toHaveClass("to-emerald-100");
    });

    it("flashcards icon container has emerald gradient", () => {
      const { container } = render(<StudentHomePage />);
      
      const flashcardsCard = screen.getByText("Flashcards Lab").closest("button");
      const iconContainer = flashcardsCard.querySelector(".bg-gradient-to-r");
      expect(iconContainer).toHaveClass("from-emerald-500");
      expect(iconContainer).toHaveClass("to-teal-500");
    });

    it("Preview badge has emerald styling", () => {
      render(<StudentHomePage />);
      
      const badge = screen.getByText("Preview");
      expect(badge).toHaveClass("bg-emerald-100");
      expect(badge).toHaveClass("text-emerald-700");
    });

    it("flashcards card has hover effects", () => {
      render(<StudentHomePage />);
      
      const flashcardsCard = screen.getByText("Flashcards Lab").closest("button");
      expect(flashcardsCard).toHaveClass("hover:scale-105");
      expect(flashcardsCard).toHaveClass("hover:border-emerald-400");
    });

    it("flashcards button has type attribute", () => {
      render(<StudentHomePage />);
      
      const flashcardsCard = screen.getByText("Flashcards Lab").closest("button");
      expect(flashcardsCard).toHaveAttribute("type", "button");
    });

    it("SVG icon has correct viewBox", () => {
      const { container } = render(<StudentHomePage />);
      
      const flashcardsCard = screen.getByText("Flashcards Lab").closest("button");
      const svg = flashcardsCard.querySelector("svg");
      expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    });

    it("SVG has 4 rect elements for flashcard grid", () => {
      const { container } = render(<StudentHomePage />);
      
      const flashcardsCard = screen.getByText("Flashcards Lab").closest("button");
      const rects = flashcardsCard.querySelectorAll("rect");
      expect(rects.length).toBe(4);
    });
  });

  describe("Layout and Styling", () => {
    it("page has white background", () => {
      const { container } = render(<StudentHomePage />);
      
      const mainContainer = container.querySelector(".min-h-screen.bg-white");
      expect(mainContainer).toBeInTheDocument();
    });

    it("uses grid layout for options", () => {
      const { container } = render(<StudentHomePage />);
      
      const grid = container.querySelector(".grid.grid-cols-1.md\\:grid-cols-2");
      expect(grid).toBeInTheDocument();
    });

    it("renders left border panel", () => {
      const { container } = render(<StudentHomePage />);
      
      const leftPanel = container.querySelector(".xl\\:block.w-80.bg-white.border-r");
      expect(leftPanel).toBeInTheDocument();
    });

    it("renders right decorative panel", () => {
      const { container } = render(<StudentHomePage />);
      
      const rightPanel = container.querySelector(".bg-purple-100.border-l");
      expect(rightPanel).toBeInTheDocument();
    });

    it("renders gradient decoration", () => {
      render(<StudentHomePage />);
      
      const gradient = screen.getByAltText("Gradient decoration");
      expect(gradient).toHaveAttribute("src", "/gradient1.png");
    });

    it("gradient is positioned at bottom left", () => {
      render(<StudentHomePage />);
      
      const gradient = screen.getByAltText("Gradient decoration");
      expect(gradient).toHaveClass("fixed");
      expect(gradient).toHaveClass("bottom-0");
      expect(gradient).toHaveClass("left-0");
    });

    it("content has max width", () => {
      const { container } = render(<StudentHomePage />);
      
      const maxWidthContainer = container.querySelector(".max-w-4xl");
      expect(maxWidthContainer).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("uses responsive flex direction", () => {
      const { container } = render(<StudentHomePage />);
      
      const flexContainer = container.querySelector(".xl\\:flex-row");
      expect(flexContainer).toBeInTheDocument();
    });

    it("left panel hidden on mobile", () => {
      const { container } = render(<StudentHomePage />);
      
      const leftPanel = container.querySelector(".hidden.xl\\:block");
      expect(leftPanel).toBeInTheDocument();
    });

    it("right panel hidden on small screens", () => {
      const { container } = render(<StudentHomePage />);
      
      const rightPanel = container.querySelector(".hidden.lg\\:block");
      expect(rightPanel).toBeInTheDocument();
    });

    it("title has responsive font sizes", () => {
      render(<StudentHomePage />);
      
      const title = screen.getByText("Welcome Student");
      expect(title).toHaveClass("text-3xl");
      expect(title).toHaveClass("sm:text-4xl");
      expect(title).toHaveClass("md:text-5xl");
    });

    it("date has responsive font size", () => {
      render(<StudentHomePage />);
      
      const date = screen.getByText("March 15, 2024");
      expect(date).toHaveClass("text-base");
      expect(date).toHaveClass("sm:text-lg");
    });

    it("gradient has responsive width", () => {
      render(<StudentHomePage />);
      
      const gradient = screen.getByAltText("Gradient decoration");
      expect(gradient).toHaveClass("w-40");
      expect(gradient).toHaveClass("sm:w-56");
      expect(gradient).toHaveClass("lg:w-72");
    });
  });

  describe("Card Styling Details", () => {
    it("all cards have rounded corners", () => {
      render(<StudentHomePage />);
      
      const chatCard = screen.getByText("Chat with AI Assistant").closest("button");
      const quizCard = screen.getByText("Assessment & Practice Quizzes").closest("button");
      const flashcardsCard = screen.getByText("Flashcards Lab").closest("button");
      
      expect(chatCard).toHaveClass("rounded-2xl");
      expect(quizCard).toHaveClass("rounded-2xl");
      expect(flashcardsCard).toHaveClass("rounded-2xl");
    });

    it("all cards have border", () => {
      render(<StudentHomePage />);
      
      const chatCard = screen.getByText("Chat with AI Assistant").closest("button");
      const quizCard = screen.getByText("Assessment & Practice Quizzes").closest("button");
      const flashcardsCard = screen.getByText("Flashcards Lab").closest("button");
      
      expect(chatCard).toHaveClass("border-2");
      expect(quizCard).toHaveClass("border-2");
      expect(flashcardsCard).toHaveClass("border-2");
    });

    it("all cards have padding", () => {
      render(<StudentHomePage />);
      
      const chatCard = screen.getByText("Chat with AI Assistant").closest("button");
      const quizCard = screen.getByText("Assessment & Practice Quizzes").closest("button");
      const flashcardsCard = screen.getByText("Flashcards Lab").closest("button");
      
      expect(chatCard).toHaveClass("p-8");
      expect(quizCard).toHaveClass("p-8");
      expect(flashcardsCard).toHaveClass("p-8");
    });

    it("all icon containers have shadow", () => {
      const { container } = render(<StudentHomePage />);
      
      const chatIcon = screen.getByAltText("Chat").parentElement;
      const quizIcon = screen.getByAltText("Quiz").parentElement;
      
      expect(chatIcon).toHaveClass("shadow-lg");
      expect(quizIcon).toHaveClass("shadow-lg");
    });

    it("all icon containers have group hover scale", () => {
      const { container } = render(<StudentHomePage />);
      
      const chatIcon = screen.getByAltText("Chat").parentElement;
      const quizIcon = screen.getByAltText("Quiz").parentElement;
      
      expect(chatIcon).toHaveClass("group-hover:scale-110");
      expect(quizIcon).toHaveClass("group-hover:scale-110");
    });
  });

  describe("Text Content", () => {
    it("chat title has proper styling", () => {
      render(<StudentHomePage />);
      
      const chatTitle = screen.getByText("Chat with AI Assistant");
      expect(chatTitle).toHaveClass("text-2xl");
      expect(chatTitle).toHaveClass("font-bold");
      expect(chatTitle).toHaveClass("text-purple-900");
    });

    it("quiz title has proper styling", () => {
      render(<StudentHomePage />);
      
      const quizTitle = screen.getByText("Assessment & Practice Quizzes");
      expect(quizTitle).toHaveClass("text-2xl");
      expect(quizTitle).toHaveClass("font-bold");
      expect(quizTitle).toHaveClass("text-blue-900");
    });

    it("flashcards title has proper styling", () => {
      render(<StudentHomePage />);
      
      const flashcardsTitle = screen.getByText("Flashcards Lab");
      expect(flashcardsTitle).toHaveClass("text-2xl");
      expect(flashcardsTitle).toHaveClass("font-bold");
      expect(flashcardsTitle).toHaveClass("text-emerald-900");
    });

    it("all descriptions have gray text", () => {
      render(<StudentHomePage />);
      
      const chatDesc = screen.getByText(/Get help with your questions/i);
      const quizDesc = screen.getByText(/Run timed assessments/i);
      const flashcardsDesc = screen.getByText(/Generate decks from course files/i);
      
      expect(chatDesc).toHaveClass("text-gray-600");
      expect(quizDesc).toHaveClass("text-gray-600");
      expect(flashcardsDesc).toHaveClass("text-gray-600");
    });
  });

  describe("Accessibility", () => {
    it("all clickable cards are buttons", () => {
      render(<StudentHomePage />);
      
      const chatCard = screen.getByText("Chat with AI Assistant").closest("button");
      const quizCard = screen.getByText("Assessment & Practice Quizzes").closest("button");
      const flashcardsCard = screen.getByText("Flashcards Lab").closest("button");
      
      expect(chatCard.tagName).toBe("BUTTON");
      expect(quizCard.tagName).toBe("BUTTON");
      expect(flashcardsCard.tagName).toBe("BUTTON");
    });

    it("images have alt text", () => {
      render(<StudentHomePage />);
      
      const chatIcon = screen.getByAltText("Chat");
      const quizIcon = screen.getByAltText("Quiz");
      const gradient = screen.getByAltText("Gradient decoration");
      
      expect(chatIcon).toBeInTheDocument();
      expect(quizIcon).toBeInTheDocument();
      expect(gradient).toBeInTheDocument();
    });

    it("icons have proper dimensions", () => {
      render(<StudentHomePage />);
      
      const chatIcon = screen.getByAltText("Chat");
      const quizIcon = screen.getByAltText("Quiz");
      
      expect(chatIcon).toHaveClass("w-8");
      expect(chatIcon).toHaveClass("h-8");
      expect(quizIcon).toHaveClass("w-8");
      expect(quizIcon).toHaveClass("h-8");
    });
  });

  describe("Date Formatting", () => {
    it("formats date with month name", () => {
      render(<StudentHomePage />);
      
      const date = screen.getByText("March 15, 2024");
      expect(date).toBeInTheDocument();
    });

    it("updates date based on current date", () => {
      jest.setSystemTime(new Date('2024-12-25'));
      
      const { rerender } = render(<StudentHomePage />);
      rerender(<StudentHomePage />);
      
      expect(screen.getByText("December 25, 2024")).toBeInTheDocument();
    });
  });

  describe("Navigation Handlers", () => {
    it("handleChat navigates correctly", () => {
      render(<StudentHomePage />);
      
      const chatCard = screen.getByText("Chat with AI Assistant").closest("button");
      fireEvent.click(chatCard);
      
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/Student/chat");
    });

    it("handleQuiz navigates correctly", () => {
      render(<StudentHomePage />);
      
      const quizCard = screen.getByText("Assessment & Practice Quizzes").closest("button");
      fireEvent.click(quizCard);
      
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/Student/Quizzes");
    });

    it("handleFlashcards navigates correctly", () => {
      render(<StudentHomePage />);
      
      const flashcardsCard = screen.getByText("Flashcards Lab").closest("button");
      fireEvent.click(flashcardsCard);
      
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/Student/Flashcards");
    });

    it("multiple clicks call push multiple times", () => {
      render(<StudentHomePage />);
      
      const chatCard = screen.getByText("Chat with AI Assistant").closest("button");
      fireEvent.click(chatCard);
      fireEvent.click(chatCard);
      
      expect(mockPush).toHaveBeenCalledTimes(2);
    });
  });

  describe("Arrow Icons", () => {
    it("all cards have arrow icons", () => {
      const { container } = render(<StudentHomePage />);
      
      const arrows = container.querySelectorAll('svg path[d*="M9 5l7 7-7 7"]');
      expect(arrows.length).toBe(3);
    });

    it("arrows have hover translation", () => {
      const { container } = render(<StudentHomePage />);
      
      const arrows = container.querySelectorAll('.group-hover\\:translate-x-1');
      expect(arrows.length).toBeGreaterThan(0);
    });
  });

  describe("Color Schemes", () => {
    it("chat uses purple theme", () => {
      render(<StudentHomePage />);
      
      const chatCard = screen.getByText("Chat with AI Assistant").closest("button");
      expect(chatCard).toHaveClass("border-purple-200");
      
      const chatLink = screen.getByText("Start Chatting");
      expect(chatLink).toHaveClass("text-purple-600");
    });

    it("quiz uses blue theme", () => {
      render(<StudentHomePage />);
      
      const quizCard = screen.getByText("Assessment & Practice Quizzes").closest("button");
      expect(quizCard).toHaveClass("border-blue-200");
      
      const quizLink = screen.getByText("View Quizzes");
      expect(quizLink).toHaveClass("text-blue-600");
    });

    it("flashcards uses emerald theme", () => {
      render(<StudentHomePage />);
      
      const flashcardsCard = screen.getByText("Flashcards Lab").closest("button");
      expect(flashcardsCard).toHaveClass("border-emerald-200");
      
      const flashcardsLink = screen.getByText("Open Flashcards");
      expect(flashcardsLink).toHaveClass("text-emerald-600");
    });
  });

  describe("Group Hover Effects", () => {
    it("cards use group class", () => {
      render(<StudentHomePage />);
      
      const chatCard = screen.getByText("Chat with AI Assistant").closest("button");
      expect(chatCard).toHaveClass("group");
    });

    it("icon containers respond to group hover", () => {
      const { container } = render(<StudentHomePage />);
      
      const iconContainers = container.querySelectorAll('.group-hover\\:scale-110');
      expect(iconContainers.length).toBeGreaterThan(0);
    });
  });
});
