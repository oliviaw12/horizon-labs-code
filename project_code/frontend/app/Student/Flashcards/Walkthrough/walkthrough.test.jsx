import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter } from "next/navigation";
import FlashcardWalkthroughPage from "./walkthrough";

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

describe("FlashcardWalkthroughPage Component", () => {
  let mockPush;

  beforeEach(() => {
    mockPush = jest.fn();
    useRouter.mockReturnValue({
      push: mockPush,
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Initial Rendering", () => {
    it("renders the page title", () => {
      render(<FlashcardWalkthroughPage />);
      
      expect(screen.getByText("Discrete Math Proof Patterns")).toBeInTheDocument();
    });

    it("renders the back button", () => {
      render(<FlashcardWalkthroughPage />);
      
      expect(screen.getByText("← Back to Flashcards Lab")).toBeInTheDocument();
    });

    it("renders the static walkthrough label", () => {
      render(<FlashcardWalkthroughPage />);
      
      expect(screen.getByText("Static walkthrough")).toBeInTheDocument();
    });

    it("renders demo deck label", () => {
      render(<FlashcardWalkthroughPage />);
      
      expect(screen.getByText("Demo deck")).toBeInTheDocument();
    });

    it("renders description text", () => {
      render(<FlashcardWalkthroughPage />);
      
      expect(screen.getByText(/This mock flow shows how flashcards will feel/i)).toBeInTheDocument();
    });

    it("applies Poppins font to title", () => {
      render(<FlashcardWalkthroughPage />);
      
      const title = screen.getByText("Discrete Math Proof Patterns");
      expect(title).toHaveClass("mocked-poppins");
    });
  });

  describe("Back Button", () => {
    it("navigates back to flashcards on click", () => {
      render(<FlashcardWalkthroughPage />);
      
      const backButton = screen.getByText("← Back to Flashcards Lab");
      fireEvent.click(backButton);
      
      expect(mockPush).toHaveBeenCalledWith("/Student/Flashcards");
    });

    it("back button has proper styling", () => {
      render(<FlashcardWalkthroughPage />);
      
      const backButton = screen.getByText("← Back to Flashcards Lab");
      expect(backButton).toHaveClass("rounded-2xl");
      expect(backButton).toHaveClass("border");
    });
  });

  describe("Card Display", () => {
    it("displays first card question", () => {
      render(<FlashcardWalkthroughPage />);
      
      expect(screen.getByText(/What is the base case requirement/i)).toBeInTheDocument();
    });

    it("displays card counter", () => {
      render(<FlashcardWalkthroughPage />);
      
      expect(screen.getByText("Card 1 of 4")).toBeInTheDocument();
    });

    it("displays progress counter", () => {
      render(<FlashcardWalkthroughPage />);
      
      expect(screen.getByText(/0 marked correct • 0 need review/i)).toBeInTheDocument();
    });

    it("displays Prompt label", () => {
      render(<FlashcardWalkthroughPage />);
      
      expect(screen.getByText("Prompt")).toBeInTheDocument();
    });

    it("does not show answer initially", () => {
      render(<FlashcardWalkthroughPage />);
      
      expect(screen.queryByText(/You must show the statement holds/i)).not.toBeInTheDocument();
    });

    it("shows recall instruction text", () => {
      render(<FlashcardWalkthroughPage />);
      
      expect(screen.getByText(/Try to recall the answer before revealing/i)).toBeInTheDocument();
    });
  });

  describe("Reveal Answer Functionality", () => {
    it("renders reveal button initially", () => {
      render(<FlashcardWalkthroughPage />);
      
      expect(screen.getByText("Reveal Answer")).toBeInTheDocument();
    });

    it("shows answer when reveal button clicked", () => {
      render(<FlashcardWalkthroughPage />);
      
      const revealButton = screen.getByText("Reveal Answer");
      fireEvent.click(revealButton);
      
      expect(screen.getByText(/You must show the statement holds/i)).toBeInTheDocument();
    });

    it("shows Answer label after revealing", () => {
      render(<FlashcardWalkthroughPage />);
      
      const revealButton = screen.getByText("Reveal Answer");
      fireEvent.click(revealButton);
      
      expect(screen.getByText("Answer")).toBeInTheDocument();
    });

    it("hides reveal button after clicking", () => {
      render(<FlashcardWalkthroughPage />);
      
      const revealButton = screen.getByText("Reveal Answer");
      fireEvent.click(revealButton);
      
      expect(screen.queryByText("Reveal Answer")).not.toBeInTheDocument();
    });

    it("shows feedback buttons after revealing", () => {
      render(<FlashcardWalkthroughPage />);
      
      const revealButton = screen.getByText("Reveal Answer");
      fireEvent.click(revealButton);
      
      expect(screen.getByText("I remembered it")).toBeInTheDocument();
      expect(screen.getByText("Need to review")).toBeInTheDocument();
    });

    it("reveal button has proper styling", () => {
      render(<FlashcardWalkthroughPage />);
      
      const revealButton = screen.getByText("Reveal Answer");
      expect(revealButton).toHaveClass("bg-purple-600");
      expect(revealButton).toHaveClass("text-white");
    });
  });

  describe("Progress Tracking - Correct", () => {
    it("increments correct count when marked correct", () => {
      render(<FlashcardWalkthroughPage />);
      
      const revealButton = screen.getByText("Reveal Answer");
      fireEvent.click(revealButton);
      
      const rememberedButton = screen.getByText("I remembered it");
      fireEvent.click(rememberedButton);
      
      expect(screen.getByText(/1 marked correct • 0 need review/i)).toBeInTheDocument();
    });

    it("advances to next card when marked correct", () => {
      render(<FlashcardWalkthroughPage />);
      
      const revealButton = screen.getByText("Reveal Answer");
      fireEvent.click(revealButton);
      
      const rememberedButton = screen.getByText("I remembered it");
      fireEvent.click(rememberedButton);
      
      expect(screen.getByText(/Which combinatorics identity/i)).toBeInTheDocument();
    });

    it("resets revealed state when advancing", () => {
      render(<FlashcardWalkthroughPage />);
      
      const revealButton = screen.getByText("Reveal Answer");
      fireEvent.click(revealButton);
      
      const rememberedButton = screen.getByText("I remembered it");
      fireEvent.click(rememberedButton);
      
      expect(screen.getByText("Reveal Answer")).toBeInTheDocument();
    });

    it("updates card counter when advancing", () => {
      render(<FlashcardWalkthroughPage />);
      
      const revealButton = screen.getByText("Reveal Answer");
      fireEvent.click(revealButton);
      
      const rememberedButton = screen.getByText("I remembered it");
      fireEvent.click(rememberedButton);
      
      expect(screen.getByText("Card 2 of 4")).toBeInTheDocument();
    });

    it("remembered button has green styling", () => {
      render(<FlashcardWalkthroughPage />);
      
      const revealButton = screen.getByText("Reveal Answer");
      fireEvent.click(revealButton);
      
      const rememberedButton = screen.getByText("I remembered it");
      expect(rememberedButton).toHaveClass("bg-green-50");
      expect(rememberedButton).toHaveClass("text-green-700");
    });
  });

  describe("Progress Tracking - Need Review", () => {
    it("increments revisit count when marked for review", () => {
      render(<FlashcardWalkthroughPage />);
      
      const revealButton = screen.getByText("Reveal Answer");
      fireEvent.click(revealButton);
      
      const reviewButton = screen.getByText("Need to review");
      fireEvent.click(reviewButton);
      
      expect(screen.getByText(/0 marked correct • 1 need review/i)).toBeInTheDocument();
    });

    it("advances to next card when marked for review", () => {
      render(<FlashcardWalkthroughPage />);
      
      const revealButton = screen.getByText("Reveal Answer");
      fireEvent.click(revealButton);
      
      const reviewButton = screen.getByText("Need to review");
      fireEvent.click(reviewButton);
      
      expect(screen.getByText(/Which combinatorics identity/i)).toBeInTheDocument();
    });

    it("review button has red styling", () => {
      render(<FlashcardWalkthroughPage />);
      
      const revealButton = screen.getByText("Reveal Answer");
      fireEvent.click(revealButton);
      
      const reviewButton = screen.getByText("Need to review");
      expect(reviewButton).toHaveClass("bg-rose-50");
      expect(reviewButton).toHaveClass("text-rose-700");
    });
  });

  describe("Card Cycling", () => {
    it("shows all four cards in sequence", () => {
      render(<FlashcardWalkthroughPage />);
      
      // Card 1
      expect(screen.getByText(/What is the base case requirement/i)).toBeInTheDocument();
      fireEvent.click(screen.getByText("Reveal Answer"));
      fireEvent.click(screen.getByText("I remembered it"));
      
      // Card 2
      expect(screen.getByText(/Which combinatorics identity/i)).toBeInTheDocument();
      fireEvent.click(screen.getByText("Reveal Answer"));
      fireEvent.click(screen.getByText("I remembered it"));
      
      // Card 3
      expect(screen.getByText(/How do you prove a statement by contradiction/i)).toBeInTheDocument();
      fireEvent.click(screen.getByText("Reveal Answer"));
      fireEvent.click(screen.getByText("I remembered it"));
      
      // Card 4
      expect(screen.getByText(/What makes constructive proofs unique/i)).toBeInTheDocument();
    });

    it("cycles back to first card after last card", () => {
      render(<FlashcardWalkthroughPage />);
      
      // Go through all 4 cards
      for (let i = 0; i < 4; i++) {
        fireEvent.click(screen.getByText("Reveal Answer"));
        fireEvent.click(screen.getByText("I remembered it"));
      }
      
      // Should be back to card 1
      expect(screen.getByText(/What is the base case requirement/i)).toBeInTheDocument();
    });

    it("maintains progress count across cycle", () => {
      render(<FlashcardWalkthroughPage />);
      
      // Mark all 4 cards as correct
      for (let i = 0; i < 4; i++) {
        fireEvent.click(screen.getByText("Reveal Answer"));
        fireEvent.click(screen.getByText("I remembered it"));
      }
      
      expect(screen.getByText(/4 marked correct • 0 need review/i)).toBeInTheDocument();
    });

    it("shows card 1 of 4 after cycling", () => {
      render(<FlashcardWalkthroughPage />);
      
      // Go through all 4 cards
      for (let i = 0; i < 4; i++) {
        fireEvent.click(screen.getByText("Reveal Answer"));
        fireEvent.click(screen.getByText("I remembered it"));
      }
      
      expect(screen.getByText("Card 1 of 4")).toBeInTheDocument();
    });
  });

  describe("Mixed Progress Tracking", () => {
    it("tracks both correct and review counts", () => {
      render(<FlashcardWalkthroughPage />);
      
      // Card 1 - correct
      fireEvent.click(screen.getByText("Reveal Answer"));
      fireEvent.click(screen.getByText("I remembered it"));
      
      // Card 2 - review
      fireEvent.click(screen.getByText("Reveal Answer"));
      fireEvent.click(screen.getByText("Need to review"));
      
      // Card 3 - correct
      fireEvent.click(screen.getByText("Reveal Answer"));
      fireEvent.click(screen.getByText("I remembered it"));
      
      expect(screen.getByText(/2 marked correct • 1 need review/i)).toBeInTheDocument();
    });
  });

  describe("Deck Preview Section", () => {
    it("renders deck preview heading", () => {
      render(<FlashcardWalkthroughPage />);
      
      expect(screen.getByText("Deck preview")).toBeInTheDocument();
    });

    it("displays all 4 cards in preview", () => {
      render(<FlashcardWalkthroughPage />);
      
      expect(screen.getByText(/What is the base case requirement/i)).toBeInTheDocument();
      expect(screen.getByText(/Which combinatorics identity counts subsets/i)).toBeInTheDocument();
      expect(screen.getByText(/How do you prove a statement by contradiction/i)).toBeInTheDocument();
      expect(screen.getByText(/What makes constructive proofs unique/i)).toBeInTheDocument();
    });

    it("shows all answers in preview", () => {
      render(<FlashcardWalkthroughPage />);
      
      expect(screen.getByText(/You must show the statement holds for the first value/i)).toBeInTheDocument();
      expect(screen.getByText(/The binomial coefficient/i)).toBeInTheDocument();
      expect(screen.getByText(/Assume the opposite of what you want to prove/i)).toBeInTheDocument();
      expect(screen.getByText(/They explicitly build an example/i)).toBeInTheDocument();
    });

    it("preview cards have Question labels", () => {
      const { container } = render(<FlashcardWalkthroughPage />);
      
      const questionLabels = container.querySelectorAll('.text-purple-500');
      const questionTexts = Array.from(questionLabels).filter(el => el.textContent === "Question");
      expect(questionTexts.length).toBeGreaterThan(0);
    });

    it("renders feature description at bottom", () => {
      render(<FlashcardWalkthroughPage />);
      
      expect(screen.getByText(/In the full experience you'll be able to jump between decks/i)).toBeInTheDocument();
    });

    it("deck preview has grid layout", () => {
      const { container } = render(<FlashcardWalkthroughPage />);
      
      const grid = container.querySelector('.grid.gap-4.sm\\:grid-cols-2');
      expect(grid).toBeInTheDocument();
    });
  });

  describe("Layout and Styling", () => {
    it("page has gray background", () => {
      const { container } = render(<FlashcardWalkthroughPage />);
      
      const mainContainer = container.querySelector('.min-h-screen.bg-gray-50');
      expect(mainContainer).toBeInTheDocument();
    });

    it("content has max width container", () => {
      const { container } = render(<FlashcardWalkthroughPage />);
      
      const maxWidthContainer = container.querySelector('.max-w-4xl');
      expect(maxWidthContainer).toBeInTheDocument();
    });

    it("main card area has white background", () => {
      const { container } = render(<FlashcardWalkthroughPage />);
      
      const whiteCard = container.querySelector('.bg-white.rounded-3xl');
      expect(whiteCard).toBeInTheDocument();
    });

    it("prompt area has gray background", () => {
      const { container } = render(<FlashcardWalkthroughPage />);
      
      const promptArea = container.querySelector('.bg-gray-50.rounded-3xl');
      expect(promptArea).toBeInTheDocument();
    });

    it("answer box has white background after reveal", () => {
      const { container } = render(<FlashcardWalkthroughPage />);
      
      const revealButton = screen.getByText("Reveal Answer");
      fireEvent.click(revealButton);
      
      const answerBox = container.querySelector('.bg-white.rounded-2xl');
      expect(answerBox).toBeInTheDocument();
    });
  });

  describe("Text Styling", () => {
    it("title has proper font weight", () => {
      render(<FlashcardWalkthroughPage />);
      
      const title = screen.getByText("Discrete Math Proof Patterns");
      expect(title).toHaveClass("text-3xl");
      expect(title).toHaveClass("font-bold");
    });

    it("static walkthrough label is uppercase", () => {
      render(<FlashcardWalkthroughPage />);
      
      const label = screen.getByText("Static walkthrough");
      expect(label).toHaveClass("uppercase");
      expect(label).toHaveClass("text-xs");
    });

    it("demo deck label has purple text", () => {
      render(<FlashcardWalkthroughPage />);
      
      const label = screen.getByText("Demo deck");
      expect(label).toHaveClass("text-purple-600");
    });

    it("card question has proper font size", () => {
      render(<FlashcardWalkthroughPage />);
      
      const question = screen.getByText(/What is the base case requirement/i);
      expect(question).toHaveClass("text-xl");
      expect(question).toHaveClass("font-semibold");
    });
  });

  describe("Button Interactions", () => {
    it("reveal button is clickable", () => {
      render(<FlashcardWalkthroughPage />);
      
      const revealButton = screen.getByText("Reveal Answer");
      expect(revealButton.tagName).toBe("BUTTON");
      expect(revealButton).toHaveAttribute("type", "button");
    });

    it("remembered button is clickable", () => {
      render(<FlashcardWalkthroughPage />);
      
      fireEvent.click(screen.getByText("Reveal Answer"));
      
      const rememberedButton = screen.getByText("I remembered it");
      expect(rememberedButton.tagName).toBe("BUTTON");
      expect(rememberedButton).toHaveAttribute("type", "button");
    });

    it("review button is clickable", () => {
      render(<FlashcardWalkthroughPage />);
      
      fireEvent.click(screen.getByText("Reveal Answer"));
      
      const reviewButton = screen.getByText("Need to review");
      expect(reviewButton.tagName).toBe("BUTTON");
      expect(reviewButton).toHaveAttribute("type", "button");
    });

    it("back button is clickable", () => {
      render(<FlashcardWalkthroughPage />);
      
      const backButton = screen.getByText("← Back to Flashcards Lab");
      expect(backButton.tagName).toBe("BUTTON");
      expect(backButton).toHaveAttribute("type", "button");
    });
  });

  describe("Card Content", () => {
    it("displays correct answer for card 1", () => {
      render(<FlashcardWalkthroughPage />);
      
      fireEvent.click(screen.getByText("Reveal Answer"));
      
      expect(screen.getByText(/You must show the statement holds for the first value/i)).toBeInTheDocument();
    });

    it("displays correct answer for card 2", () => {
      render(<FlashcardWalkthroughPage />);
      
      fireEvent.click(screen.getByText("Reveal Answer"));
      fireEvent.click(screen.getByText("I remembered it"));
      fireEvent.click(screen.getByText("Reveal Answer"));
      
      expect(screen.getByText(/The binomial coefficient/i)).toBeInTheDocument();
    });

    it("displays correct answer for card 3", () => {
      render(<FlashcardWalkthroughPage />);
      
      // Advance to card 3
      for (let i = 0; i < 2; i++) {
        fireEvent.click(screen.getByText("Reveal Answer"));
        fireEvent.click(screen.getByText("I remembered it"));
      }
      
      fireEvent.click(screen.getByText("Reveal Answer"));
      
      expect(screen.getByText(/Assume the opposite of what you want to prove/i)).toBeInTheDocument();
    });

    it("displays correct answer for card 4", () => {
      render(<FlashcardWalkthroughPage />);
      
      // Advance to card 4
      for (let i = 0; i < 3; i++) {
        fireEvent.click(screen.getByText("Reveal Answer"));
        fireEvent.click(screen.getByText("I remembered it"));
      }
      
      fireEvent.click(screen.getByText("Reveal Answer"));
      
      expect(screen.getByText(/They explicitly build an example/i)).toBeInTheDocument();
    });
  });

  describe("State Management", () => {
    it("maintains independent state for index and revealed", () => {
      render(<FlashcardWalkthroughPage />);
      
      // Reveal card 1
      fireEvent.click(screen.getByText("Reveal Answer"));
      expect(screen.getByText("Answer")).toBeInTheDocument();
      
      // Advance to card 2
      fireEvent.click(screen.getByText("I remembered it"));
      
      // Card 2 should not be revealed
      expect(screen.queryByText("Answer")).not.toBeInTheDocument();
      expect(screen.getByText("Reveal Answer")).toBeInTheDocument();
    });

    it("progress persists across card changes", () => {
      render(<FlashcardWalkthroughPage />);
      
      // Mark first two cards
      fireEvent.click(screen.getByText("Reveal Answer"));
      fireEvent.click(screen.getByText("I remembered it"));
      
      fireEvent.click(screen.getByText("Reveal Answer"));
      fireEvent.click(screen.getByText("Need to review"));
      
      // Go back to first card
      fireEvent.click(screen.getByText("Reveal Answer"));
      fireEvent.click(screen.getByText("I remembered it"));
      
      fireEvent.click(screen.getByText("Reveal Answer"));
      fireEvent.click(screen.getByText("I remembered it"));
      
      // Progress should show all interactions
      expect(screen.getByText(/3 marked correct • 1 need review/i)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("buttons have proper type attribute", () => {
      render(<FlashcardWalkthroughPage />);
      
      const buttons = screen.getAllByRole("button");
      buttons.forEach(button => {
        expect(button).toHaveAttribute("type", "button");
      });
    });

    it("card counter is visible", () => {
      render(<FlashcardWalkthroughPage />);
      
      const counter = screen.getByText("Card 1 of 4");
      expect(counter).toBeVisible();
    });
  });

  describe("Responsive Layout", () => {
    it("uses responsive grid for preview", () => {
      const { container } = render(<FlashcardWalkthroughPage />);
      
      const grid = container.querySelector('.sm\\:grid-cols-2');
      expect(grid).toBeInTheDocument();
    });

    it("buttons have flex wrap", () => {
      const { container } = render(<FlashcardWalkthroughPage />);
      
      const buttonContainer = container.querySelector('.flex.flex-wrap.gap-3');
      expect(buttonContainer).toBeInTheDocument();
    });
  });
});
