import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import PolicyPage from "./policy";

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

describe("PolicyPage Component", () => {
  let mockPush;

  beforeEach(() => {
    mockPush = jest.fn();
    useRouter.mockReturnValue({
      push: mockPush,
    });
    jest.clearAllMocks();
  });

  describe("Initial Rendering", () => {
    it("renders the page title", () => {
      render(<PolicyPage />);
      expect(screen.getByText("AI & Content Scope")).toBeInTheDocument();
    });

    it("renders the page description", () => {
      render(<PolicyPage />);
      expect(
        screen.getByText(/Preview how you might align the assistant experience/i)
      ).toBeInTheDocument();
    });

    it("renders Site-wide policy windows section", () => {
      render(<PolicyPage />);
      expect(screen.getByText("Site-wide policy windows")).toBeInTheDocument();
    });

    it("renders Chat Settings section", () => {
      render(<PolicyPage />);
      expect(screen.getByText("Chat Settings")).toBeInTheDocument();
    });

    it("renders Guidance & Friction section", () => {
      render(<PolicyPage />);
      expect(screen.getByText("Guidance & Friction")).toBeInTheDocument();
    });

    it("renders Content Scope section", () => {
      render(<PolicyPage />);
      expect(screen.getByText("Content Scope")).toBeInTheDocument();
    });
  });

  describe("Policy Form", () => {
    it("renders policy form inputs", () => {
      render(<PolicyPage />);
      
      expect(screen.getByText("Window starts")).toBeInTheDocument();
      expect(screen.getByText("Window ends")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("e.g., Midterm blackout")).toBeInTheDocument();
    });

    it("renders all service options", () => {
      render(<PolicyPage />);
      
      expect(screen.getByText("Adaptive chat")).toBeInTheDocument();
      expect(screen.getByText("Practice quizzes")).toBeInTheDocument();
      expect(screen.getByText("Assessment quizzes")).toBeInTheDocument();
      expect(screen.getByText("Flashcards")).toBeInTheDocument();
    });

    it("updates policy name when typing", () => {
      render(<PolicyPage />);
      const nameInput = screen.getByPlaceholderText("e.g., Midterm blackout");
      
      fireEvent.change(nameInput, { target: { value: "Exam Week" } });
      
      expect(nameInput.value).toBe("Exam Week");
    });

    it("toggles service selection", () => {
      render(<PolicyPage />);
      const chatCheckbox = screen.getByRole("checkbox", { name: /Adaptive chat/i });
      
      expect(chatCheckbox).not.toBeChecked();
      
      fireEvent.click(chatCheckbox);
      
      expect(chatCheckbox).toBeChecked();
    });

    it("shows 'Add policy' button initially", () => {
      render(<PolicyPage />);
      
      expect(screen.getByRole("button", { name: "Add policy" })).toBeInTheDocument();
    });

    it("does not add policy without required fields", () => {
      render(<PolicyPage />);
      const addButton = screen.getByRole("button", { name: "Add policy" });
      
      fireEvent.click(addButton);
      
      // Should still show empty state
      expect(screen.getByText("No policies added yet.")).toBeInTheDocument();
    });

    it("adds policy with all required fields", () => {
      render(<PolicyPage />);
      
      // Fill in required fields
      const startInputs = screen.getAllByDisplayValue("");
      fireEvent.change(startInputs[0], { target: { value: "2025-12-01T09:00" } });
      fireEvent.change(startInputs[1], { target: { value: "2025-12-05T17:00" } });
      
      // Select a service
      const chatCheckbox = screen.getByRole("checkbox", { name: /Adaptive chat/i });
      fireEvent.click(chatCheckbox);
      
      // Submit
      const addButton = screen.getByRole("button", { name: "Add policy" });
      fireEvent.click(addButton);
      
      // Should show in policy list
      expect(screen.queryByText("No policies added yet.")).not.toBeInTheDocument();
    });
  });

  describe("Policy List", () => {
    it("shows empty state when no policies exist", () => {
      render(<PolicyPage />);
      
      expect(screen.getByText("No policies added yet.")).toBeInTheDocument();
    });

    it("displays policy after adding", () => {
      render(<PolicyPage />);
      
      // Add a policy
      const inputs = screen.getAllByDisplayValue("");
      fireEvent.change(inputs[0], { target: { value: "2025-12-01T09:00" } });
      fireEvent.change(inputs[1], { target: { value: "2025-12-05T17:00" } });
      
      const nameInput = screen.getByPlaceholderText("e.g., Midterm blackout");
      fireEvent.change(nameInput, { target: { value: "Test Policy" } });
      
      const chatCheckbox = screen.getByRole("checkbox", { name: /Adaptive chat/i });
      fireEvent.click(chatCheckbox);
      
      const addButton = screen.getByRole("button", { name: "Add policy" });
      fireEvent.click(addButton);
      
      expect(screen.getByText("Test Policy")).toBeInTheDocument();
    });

    it("shows Untitled policy when no name provided", () => {
      render(<PolicyPage />);
      
      const inputs = screen.getAllByDisplayValue("");
      fireEvent.change(inputs[0], { target: { value: "2025-12-01T09:00" } });
      fireEvent.change(inputs[1], { target: { value: "2025-12-05T17:00" } });
      
      const chatCheckbox = screen.getByRole("checkbox", { name: /Adaptive chat/i });
      fireEvent.click(chatCheckbox);
      
      const addButton = screen.getByRole("button", { name: "Add policy" });
      fireEvent.click(addButton);
      
      expect(screen.getByText("Untitled policy")).toBeInTheDocument();
    });

    it("displays Edit and Delete buttons for each policy", () => {
      render(<PolicyPage />);
      
      // Add a policy
      const inputs = screen.getAllByDisplayValue("");
      fireEvent.change(inputs[0], { target: { value: "2025-12-01T09:00" } });
      fireEvent.change(inputs[1], { target: { value: "2025-12-05T17:00" } });
      
      const chatCheckbox = screen.getByRole("checkbox", { name: /Adaptive chat/i });
      fireEvent.click(chatCheckbox);
      
      const addButton = screen.getByRole("button", { name: "Add policy" });
      fireEvent.click(addButton);
      
      expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    });

    it("deletes policy when Delete button is clicked", () => {
      render(<PolicyPage />);
      
      // Add a policy
      const inputs = screen.getAllByDisplayValue("");
      fireEvent.change(inputs[0], { target: { value: "2025-12-01T09:00" } });
      fireEvent.change(inputs[1], { target: { value: "2025-12-05T17:00" } });
      
      const nameInput = screen.getByPlaceholderText("e.g., Midterm blackout");
      fireEvent.change(nameInput, { target: { value: "Delete Me" } });
      
      const chatCheckbox = screen.getByRole("checkbox", { name: /Adaptive chat/i });
      fireEvent.click(chatCheckbox);
      
      const addButton = screen.getByRole("button", { name: "Add policy" });
      fireEvent.click(addButton);
      
      expect(screen.getByText("Delete Me")).toBeInTheDocument();
      
      // Delete it
      const deleteButton = screen.getByRole("button", { name: "Delete" });
      fireEvent.click(deleteButton);
      
      expect(screen.queryByText("Delete Me")).not.toBeInTheDocument();
      expect(screen.getByText("No policies added yet.")).toBeInTheDocument();
    });

    it("loads policy into form when Edit is clicked", () => {
      render(<PolicyPage />);
      
      // Add a policy
      const inputs = screen.getAllByDisplayValue("");
      fireEvent.change(inputs[0], { target: { value: "2025-12-01T09:00" } });
      fireEvent.change(inputs[1], { target: { value: "2025-12-05T17:00" } });
      
      const nameInput = screen.getByPlaceholderText("e.g., Midterm blackout");
      fireEvent.change(nameInput, { target: { value: "Edit Me" } });
      
      const chatCheckbox = screen.getByRole("checkbox", { name: /Adaptive chat/i });
      fireEvent.click(chatCheckbox);
      
      const addButton = screen.getByRole("button", { name: "Add policy" });
      fireEvent.click(addButton);
      
      // Click Edit
      const editButton = screen.getByRole("button", { name: "Edit" });
      fireEvent.click(editButton);
      
      // Form should show Update policy button
      expect(screen.getByRole("button", { name: "Update policy" })).toBeInTheDocument();
    });

    it("resets form when Reset button is clicked", () => {
      render(<PolicyPage />);
      
      const nameInput = screen.getByPlaceholderText("e.g., Midterm blackout");
      fireEvent.change(nameInput, { target: { value: "Test" } });
      
      const resetButton = screen.getByRole("button", { name: "Reset" });
      fireEvent.click(resetButton);
      
      expect(nameInput.value).toBe("");
    });
  });

  describe("Guidance Toggle", () => {
    it("renders guidance toggle switch", () => {
      render(<PolicyPage />);
      
      const toggle = screen.getByRole("button", { pressed: true });
      expect(toggle).toBeInTheDocument();
    });

    it("toggles guidance on and off", () => {
      render(<PolicyPage />);
      
      const toggle = screen.getByRole("button", { pressed: true });
      expect(toggle).toHaveClass("bg-purple-600");
      
      fireEvent.click(toggle);
      
      expect(toggle).toHaveClass("bg-gray-300");
      expect(toggle).toHaveAttribute("aria-pressed", "false");
    });

    it("disables friction level when guidance is off", () => {
      render(<PolicyPage />);
      
      const toggle = screen.getByRole("button", { pressed: true });
      fireEvent.click(toggle);
      
      const frictionSelect = screen.getByRole("combobox", { name: "" });
      expect(frictionSelect).toBeDisabled();
    });
  });

  describe("Friction Level", () => {
    it("renders friction level dropdown", () => {
      render(<PolicyPage />);
      
      const frictionSelect = screen.getAllByRole("combobox")[0];
      expect(frictionSelect).toBeInTheDocument();
    });

    it("changes friction level when selected", () => {
      render(<PolicyPage />);
      
      const frictionSelect = screen.getAllByRole("combobox")[0];
      
      fireEvent.change(frictionSelect, { target: { value: "5" } });
      
      expect(frictionSelect.value).toBe("5");
    });

    it("has options from 1 to 10", () => {
      render(<PolicyPage />);
      
      const frictionSelect = screen.getAllByRole("combobox")[0];
      const options = Array.from(frictionSelect.options).map(opt => opt.value);
      
      expect(options).toHaveLength(10);
      expect(options).toContain("1");
      expect(options).toContain("10");
    });
  });

  describe("Check Difficulty Slider", () => {
    it("renders check difficulty slider", () => {
      render(<PolicyPage />);
      
      const slider = screen.getByRole("slider");
      expect(slider).toBeInTheDocument();
    });

    it("displays current difficulty value", () => {
      render(<PolicyPage />);
      
      expect(screen.getByText("50")).toBeInTheDocument();
    });

    it("updates difficulty value when slider changes", () => {
      render(<PolicyPage />);
      
      const slider = screen.getByRole("slider");
      
      fireEvent.change(slider, { target: { value: "75" } });
      
      expect(screen.getByText("75")).toBeInTheDocument();
    });

    it("disables slider when guidance is off", () => {
      render(<PolicyPage />);
      
      const toggle = screen.getByRole("button", { pressed: true });
      fireEvent.click(toggle);
      
      const slider = screen.getByRole("slider");
      expect(slider).toBeDisabled();
    });
  });

  describe("Content Scope", () => {
    it("renders content scope dropdown", () => {
      render(<PolicyPage />);
      
      expect(screen.getByText("Content usage mode")).toBeInTheDocument();
    });

    it("shows course_only option by default", () => {
      render(<PolicyPage />);
      
      expect(screen.getByText("Course content only")).toBeInTheDocument();
    });

    it("changes content scope when selected", () => {
      render(<PolicyPage />);
      
      const scopeSelects = screen.getAllByRole("combobox");
      const scopeSelect = scopeSelects.find(select => 
        select.querySelector('option[value="course_only"]')
      );
      
      fireEvent.change(scopeSelect, { target: { value: "allow_external" } });
      
      expect(screen.getByText("Allow external sources")).toBeInTheDocument();
    });

    it("displays description for selected scope", () => {
      render(<PolicyPage />);
      
      expect(
        screen.getByText(/Responses are grounded solely in uploaded course files/i)
      ).toBeInTheDocument();
    });
  });

  describe("Focus Files", () => {
    it("shows empty state for focus files", () => {
      render(<PolicyPage />);
      
      const noFilesMessages = screen.getAllByText("No files uploaded yet");
      expect(noFilesMessages.length).toBeGreaterThan(0);
    });

    it("adds focus file when button is clicked", () => {
      render(<PolicyPage />);
      
      const addButtons = screen.getAllByText("Add example file");
      fireEvent.click(addButtons[0]);
      
      expect(screen.getByText("focus_1.pdf")).toBeInTheDocument();
    });

    it("adds multiple focus files", () => {
      render(<PolicyPage />);
      
      const addButtons = screen.getAllByText("Add example file");
      fireEvent.click(addButtons[0]);
      fireEvent.click(addButtons[0]);
      
      expect(screen.getByText("focus_1.pdf")).toBeInTheDocument();
      expect(screen.getByText("focus_2.pdf")).toBeInTheDocument();
    });

    it("toggles focus file selection", () => {
      render(<PolicyPage />);
      
      const addButtons = screen.getAllByText("Add example file");
      fireEvent.click(addButtons[0]);
      
      const checkbox = screen.getByRole("checkbox", { checked: true });
      expect(checkbox).toBeChecked();
      
      fireEvent.click(checkbox);
      
      expect(checkbox).not.toBeChecked();
    });

    it("deletes focus file when Delete is clicked", () => {
      render(<PolicyPage />);
      
      const addButtons = screen.getAllByText("Add example file");
      fireEvent.click(addButtons[0]);
      
      expect(screen.getByText("focus_1.pdf")).toBeInTheDocument();
      
      const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
      fireEvent.click(deleteButtons[0]);
      
      expect(screen.queryByText("focus_1.pdf")).not.toBeInTheDocument();
    });
  });

  describe("Deny Files", () => {
    it("shows empty state for deny files", () => {
      render(<PolicyPage />);
      
      const noFilesMessages = screen.getAllByText("No files uploaded yet");
      expect(noFilesMessages.length).toBeGreaterThan(0);
    });

    it("adds deny file when button is clicked", () => {
      render(<PolicyPage />);
      
      const addButtons = screen.getAllByText("Add example file");
      fireEvent.click(addButtons[1]);
      
      expect(screen.getByText("deny_1.pdf")).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("applies Poppins font class to title", () => {
      render(<PolicyPage />);
      
      const title = screen.getByText("AI & Content Scope");
      expect(title).toHaveClass("mocked-poppins");
    });

    it("applies gradient to Add policy button", () => {
      render(<PolicyPage />);
      
      const addButton = screen.getByRole("button", { name: "Add policy" });
      expect(addButton).toHaveClass("bg-gradient-to-r", "from-purple-500", "to-purple-700");
    });

    it("applies hover effects to buttons", () => {
      render(<PolicyPage />);
      
      const addButton = screen.getByRole("button", { name: "Add policy" });
      expect(addButton).toHaveClass("hover:shadow-lg", "hover:scale-105");
    });
  });

  describe("Layout Structure", () => {
    it("has responsive flex layout", () => {
      const { container } = render(<PolicyPage />);
      
      expect(container.querySelector(".min-h-screen")).toBeInTheDocument();
      expect(container.querySelector(".flex-1")).toBeInTheDocument();
    });

    it("renders left border panel", () => {
      const { container } = render(<PolicyPage />);
      
      const leftPanel = container.querySelector(".xl\\:block.w-80.border-r");
      expect(leftPanel).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper heading hierarchy", () => {
      render(<PolicyPage />);
      
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("AI & Content Scope");
    });

    it("checkboxes are accessible", () => {
      render(<PolicyPage />);
      
      const chatCheckbox = screen.getByRole("checkbox", { name: /Adaptive chat/i });
      expect(chatCheckbox).toBeEnabled();
    });

    it("buttons are keyboard accessible", () => {
      render(<PolicyPage />);
      
      const addButton = screen.getByRole("button", { name: "Add policy" });
      expect(addButton).toBeEnabled();
    });

    it("toggle has aria-pressed attribute", () => {
      render(<PolicyPage />);
      
      const toggle = screen.getByRole("button", { pressed: true });
      expect(toggle).toHaveAttribute("aria-pressed");
    });
  });

  describe("Form Validation", () => {
    it("requires start date to add policy", () => {
      render(<PolicyPage />);
      
      const inputs = screen.getAllByDisplayValue("");
      fireEvent.change(inputs[1], { target: { value: "2025-12-05T17:00" } });
      
      const chatCheckbox = screen.getByRole("checkbox", { name: /Adaptive chat/i });
      fireEvent.click(chatCheckbox);
      
      const addButton = screen.getByRole("button", { name: "Add policy" });
      fireEvent.click(addButton);
      
      expect(screen.getByText("No policies added yet.")).toBeInTheDocument();
    });

    it("requires end date to add policy", () => {
      render(<PolicyPage />);
      
      const inputs = screen.getAllByDisplayValue("");
      fireEvent.change(inputs[0], { target: { value: "2025-12-01T09:00" } });
      
      const chatCheckbox = screen.getByRole("checkbox", { name: /Adaptive chat/i });
      fireEvent.click(chatCheckbox);
      
      const addButton = screen.getByRole("button", { name: "Add policy" });
      fireEvent.click(addButton);
      
      expect(screen.getByText("No policies added yet.")).toBeInTheDocument();
    });

    it("requires at least one service to add policy", () => {
      render(<PolicyPage />);
      
      const inputs = screen.getAllByDisplayValue("");
      fireEvent.change(inputs[0], { target: { value: "2025-12-01T09:00" } });
      fireEvent.change(inputs[1], { target: { value: "2025-12-05T17:00" } });
      
      const addButton = screen.getByRole("button", { name: "Add policy" });
      fireEvent.click(addButton);
      
      expect(screen.getByText("No policies added yet.")).toBeInTheDocument();
    });
  });

  describe("Service Selection UI", () => {
    it("highlights selected services", () => {
      render(<PolicyPage />);
      
      const chatLabel = screen.getByText("Adaptive chat").closest("label");
      expect(chatLabel).toHaveClass("border-gray-200", "bg-white");
      
      const chatCheckbox = screen.getByRole("checkbox", { name: /Adaptive chat/i });
      fireEvent.click(chatCheckbox);
      
      expect(chatLabel).toHaveClass("border-purple-400", "bg-purple-50");
    });

    it("allows multiple services to be selected", () => {
      render(<PolicyPage />);
      
      const chatCheckbox = screen.getByRole("checkbox", { name: /Adaptive chat/i });
      const quizCheckbox = screen.getByRole("checkbox", { name: /Practice quizzes/i });
      
      fireEvent.click(chatCheckbox);
      fireEvent.click(quizCheckbox);
      
      expect(chatCheckbox).toBeChecked();
      expect(quizCheckbox).toBeChecked();
    });
  });

  describe("Edge Cases", () => {
    it("handles rapid policy additions", () => {
      render(<PolicyPage />);
      
      for (let i = 0; i < 3; i++) {
        const inputs = screen.getAllByDisplayValue("");
        fireEvent.change(inputs[0], { target: { value: "2025-12-01T09:00" } });
        fireEvent.change(inputs[1], { target: { value: "2025-12-05T17:00" } });
        
        const chatCheckbox = screen.getByRole("checkbox", { name: /Adaptive chat/i });
        if (!chatCheckbox.checked) {
          fireEvent.click(chatCheckbox);
        }
        
        const addButton = screen.getByRole("button", { name: /Add policy|Update policy/i });
        fireEvent.click(addButton);
      }
      
      const policies = screen.getAllByText("Untitled policy");
      expect(policies.length).toBeGreaterThan(0);
    });

    it("maintains form state across interactions", () => {
      render(<PolicyPage />);
      
      const nameInput = screen.getByPlaceholderText("e.g., Midterm blackout");
      fireEvent.change(nameInput, { target: { value: "Persistent" } });
      
      const toggle = screen.getByRole("button", { pressed: true });
      fireEvent.click(toggle);
      fireEvent.click(toggle);
      
      expect(nameInput.value).toBe("Persistent");
    });
  });

  describe("Policy Display", () => {
    it("formats policy dates correctly", () => {
      render(<PolicyPage />);
      
      const inputs = screen.getAllByDisplayValue("");
      fireEvent.change(inputs[0], { target: { value: "2025-12-01T09:00" } });
      fireEvent.change(inputs[1], { target: { value: "2025-12-05T17:00" } });
      
      const chatCheckbox = screen.getByRole("checkbox", { name: /Adaptive chat/i });
      fireEvent.click(chatCheckbox);
      
      const addButton = screen.getByRole("button", { name: "Add policy" });
      fireEvent.click(addButton);
      
      // Should show formatted dates
      const dateElements = screen.getAllByText(/12\/1\/2025|12\/5\/2025/i);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it("displays selected services in policy", () => {
      render(<PolicyPage />);
      
      const inputs = screen.getAllByDisplayValue("");
      fireEvent.change(inputs[0], { target: { value: "2025-12-01T09:00" } });
      fireEvent.change(inputs[1], { target: { value: "2025-12-05T17:00" } });
      
      const chatCheckbox = screen.getByRole("checkbox", { name: /Adaptive chat/i });
      fireEvent.click(chatCheckbox);
      
      const addButton = screen.getByRole("button", { name: "Add policy" });
      fireEvent.click(addButton);
      
      expect(screen.getByText(/Services blocked: Adaptive chat/i)).toBeInTheDocument();
    });
  });
});
