import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RoleSwitch from "./RoleSwitch";

describe("RoleSwitch Component", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear any event listeners
    jest.clearAllMocks();
  });

  describe("Initial Rendering", () => {
    it("renders the component with role label", () => {
      render(<RoleSwitch />);
      expect(screen.getByText("Role:")).toBeInTheDocument();
    });

    it("renders both Student and Instructor buttons", () => {
      render(<RoleSwitch />);
      expect(screen.getByRole("button", { name: "Student" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Instructor" })).toBeInTheDocument();
    });

    it("defaults to student role when no localStorage value exists", () => {
      render(<RoleSwitch />);
      const studentButton = screen.getByRole("button", { name: "Student" });
      const instructorButton = screen.getByRole("button", { name: "Instructor" });
      
      // Student button should have active styling
      expect(studentButton).toHaveClass("bg-black", "text-white");
      // Instructor button should have inactive styling
      expect(instructorButton).toHaveClass("bg-white");
      expect(instructorButton).not.toHaveClass("bg-black");
    });
  });

  describe("LocalStorage Integration", () => {
    it("loads student role from localStorage on mount", () => {
      localStorage.setItem("role", "student");
      render(<RoleSwitch />);
      
      const studentButton = screen.getByRole("button", { name: "Student" });
      expect(studentButton).toHaveClass("bg-black", "text-white");
    });

    it("loads instructor role from localStorage on mount", () => {
      localStorage.setItem("role", "instructor");
      render(<RoleSwitch />);
      
      const instructorButton = screen.getByRole("button", { name: "Instructor" });
      expect(instructorButton).toHaveClass("bg-black", "text-white");
    });

    it("defaults to student when localStorage has invalid value", () => {
      localStorage.setItem("role", "invalid-role");
      render(<RoleSwitch />);
      
      const studentButton = screen.getByRole("button", { name: "Student" });
      expect(studentButton).toHaveClass("bg-black", "text-white");
    });

    it("saves role to localStorage when changed", async () => {
      render(<RoleSwitch />);
      const instructorButton = screen.getByRole("button", { name: "Instructor" });
      
      fireEvent.click(instructorButton);
      
      await waitFor(() => {
        expect(localStorage.getItem("role")).toBe("instructor");
      });
    });
  });

  describe("Role Switching", () => {
    it("switches from student to instructor when instructor button is clicked", () => {
      render(<RoleSwitch />);
      const instructorButton = screen.getByRole("button", { name: "Instructor" });
      
      fireEvent.click(instructorButton);
      
      expect(instructorButton).toHaveClass("bg-black", "text-white");
      const studentButton = screen.getByRole("button", { name: "Student" });
      expect(studentButton).toHaveClass("bg-white");
      expect(studentButton).not.toHaveClass("bg-black");
    });

    it("switches from instructor to student when student button is clicked", () => {
      localStorage.setItem("role", "instructor");
      render(<RoleSwitch />);
      
      const studentButton = screen.getByRole("button", { name: "Student" });
      fireEvent.click(studentButton);
      
      expect(studentButton).toHaveClass("bg-black", "text-white");
      const instructorButton = screen.getByRole("button", { name: "Instructor" });
      expect(instructorButton).toHaveClass("bg-white");
      expect(instructorButton).not.toHaveClass("bg-black");
    });

    it("allows clicking the same role button multiple times", () => {
      render(<RoleSwitch />);
      const studentButton = screen.getByRole("button", { name: "Student" });
      
      fireEvent.click(studentButton);
      fireEvent.click(studentButton);
      fireEvent.click(studentButton);
      
      expect(studentButton).toHaveClass("bg-black", "text-white");
    });
  });

  describe("Custom Event Dispatching", () => {
    it("dispatches role-updated event when role changes to instructor", async () => {
      const eventHandler = jest.fn();
      window.addEventListener("role-updated", eventHandler);
      
      render(<RoleSwitch />);
      const instructorButton = screen.getByRole("button", { name: "Instructor" });
      
      fireEvent.click(instructorButton);
      
      await waitFor(() => {
        expect(eventHandler).toHaveBeenCalled();
        const event = eventHandler.mock.calls[eventHandler.mock.calls.length - 1][0];
        expect(event.detail).toBe("instructor");
      });
      
      window.removeEventListener("role-updated", eventHandler);
    });

    it("dispatches role-updated event when role changes to student", async () => {
      localStorage.setItem("role", "instructor");
      const eventHandler = jest.fn();
      window.addEventListener("role-updated", eventHandler);
      
      render(<RoleSwitch />);
      const studentButton = screen.getByRole("button", { name: "Student" });
      
      fireEvent.click(studentButton);
      
      await waitFor(() => {
        expect(eventHandler).toHaveBeenCalled();
        const event = eventHandler.mock.calls[eventHandler.mock.calls.length - 1][0];
        expect(event.detail).toBe("student");
      });
      
      window.removeEventListener("role-updated", eventHandler);
    });

    it("dispatches role-updated event on initial mount with default role", async () => {
      const eventHandler = jest.fn();
      window.addEventListener("role-updated", eventHandler);
      
      render(<RoleSwitch />);
      
      await waitFor(() => {
        expect(eventHandler).toHaveBeenCalled();
        const event = eventHandler.mock.calls[0][0];
        expect(event.detail).toBe("student");
      });
      
      window.removeEventListener("role-updated", eventHandler);
    });
  });

  describe("Styling and Accessibility", () => {
    it("applies correct active styles to student button", () => {
      render(<RoleSwitch />);
      const studentButton = screen.getByRole("button", { name: "Student" });
      
      expect(studentButton).toHaveClass(
        "px-3",
        "py-1",
        "rounded-full",
        "border",
        "text-sm",
        "bg-black",
        "text-white"
      );
    });

    it("applies correct inactive styles to instructor button", () => {
      render(<RoleSwitch />);
      const instructorButton = screen.getByRole("button", { name: "Instructor" });
      
      expect(instructorButton).toHaveClass(
        "px-3",
        "py-1",
        "rounded-full",
        "border",
        "text-sm",
        "bg-white"
      );
    });

    it("has proper container styling", () => {
      const { container } = render(<RoleSwitch />);
      const divElement = container.firstChild;
      
      expect(divElement).toHaveClass("flex", "items-center", "gap-2");
    });

    it("buttons are clickable and accessible", () => {
      render(<RoleSwitch />);
      const studentButton = screen.getByRole("button", { name: "Student" });
      const instructorButton = screen.getByRole("button", { name: "Instructor" });
      
      expect(studentButton).toBeEnabled();
      expect(instructorButton).toBeEnabled();
    });
  });

  describe("Edge Cases", () => {
    it("handles rapid role switching", async () => {
      render(<RoleSwitch />);
      const studentButton = screen.getByRole("button", { name: "Student" });
      const instructorButton = screen.getByRole("button", { name: "Instructor" });
      
      fireEvent.click(instructorButton);
      fireEvent.click(studentButton);
      fireEvent.click(instructorButton);
      fireEvent.click(studentButton);
      
      await waitFor(() => {
        expect(studentButton).toHaveClass("bg-black", "text-white");
        expect(localStorage.getItem("role")).toBe("student");
      });
    });

    it("persists role across re-renders", () => {
      const { rerender } = render(<RoleSwitch />);
      const instructorButton = screen.getByRole("button", { name: "Instructor" });
      
      fireEvent.click(instructorButton);
      rerender(<RoleSwitch />);
      
      const rerenderedInstructorButton = screen.getByRole("button", { name: "Instructor" });
      expect(rerenderedInstructorButton).toHaveClass("bg-black", "text-white");
    });
  });
});
