import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { usePathname, useRouter } from "next/navigation";
import ConditionalHeader from "./ConditionalHeader";

// Mock Next.js hooks
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock Next.js Image and Link components
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }) => {
    return <a href={href}>{children}</a>;
  },
}));

describe("ConditionalHeader Component", () => {
  let mockPush;

  beforeEach(() => {
    localStorage.clear();
    mockPush = jest.fn();
    useRouter.mockReturnValue({
      push: mockPush,
    });
    jest.clearAllMocks();
  });

  describe("Rendering Based on Route", () => {
    it("renders header on Student route", () => {
      usePathname.mockReturnValue("/Student");
      render(<ConditionalHeader />);
      
      expect(screen.getByAltText("Learn LLM")).toBeInTheDocument();
      expect(screen.getByAltText("Account")).toBeInTheDocument();
    });

    it("renders header on Instructor route", () => {
      usePathname.mockReturnValue("/Instructor");
      render(<ConditionalHeader />);
      
      expect(screen.getByAltText("Learn LLM")).toBeInTheDocument();
      expect(screen.getByAltText("Account")).toBeInTheDocument();
    });

    it("renders header on LoginPage route", () => {
      usePathname.mockReturnValue("/LoginPage");
      render(<ConditionalHeader />);
      
      expect(screen.getByAltText("Learn LLM")).toBeInTheDocument();
      expect(screen.getByAltText("Account")).toBeInTheDocument();
    });

    it("renders header on homepage without profile", () => {
      usePathname.mockReturnValue("/");
      render(<ConditionalHeader />);
      
      expect(screen.getByAltText("Learn LLM")).toBeInTheDocument();
      expect(screen.queryByAltText("Account")).not.toBeInTheDocument();
    });

    it("does not render header on Score page", () => {
      usePathname.mockReturnValue("/Quiz/Score");
      const { container } = render(<ConditionalHeader />);
      
      expect(container.firstChild).toBeNull();
    });

    it("does not render header on any page containing Score", () => {
      usePathname.mockReturnValue("/Student/Quiz/Score/Final");
      const { container } = render(<ConditionalHeader />);
      
      expect(container.firstChild).toBeNull();
    });

    it("renders header on default/unknown routes", () => {
      usePathname.mockReturnValue("/unknown/route");
      render(<ConditionalHeader />);
      
      expect(screen.getByAltText("Learn LLM")).toBeInTheDocument();
    });
  });

  describe("Background Styling", () => {
    it("applies white background for Student route", () => {
      usePathname.mockReturnValue("/Student");
      const { container } = render(<ConditionalHeader />);
      
      const header = container.querySelector("header");
      expect(header).toHaveClass("bg-white");
    });

    it("applies white background for Instructor route", () => {
      usePathname.mockReturnValue("/Instructor");
      const { container } = render(<ConditionalHeader />);
      
      const header = container.querySelector("header");
      expect(header).toHaveClass("bg-white");
    });

    it("applies purple background for LoginPage route", () => {
      usePathname.mockReturnValue("/LoginPage");
      const { container } = render(<ConditionalHeader />);
      
      const header = container.querySelector("header");
      expect(header).toHaveClass("bg-purple-100");
    });

    it("applies white background for homepage", () => {
      usePathname.mockReturnValue("/");
      const { container } = render(<ConditionalHeader />);
      
      const header = container.querySelector("header");
      expect(header).toHaveClass("bg-white");
    });

    it("applies white background for unknown routes", () => {
      usePathname.mockReturnValue("/unknown");
      const { container } = render(<ConditionalHeader />);
      
      const header = container.querySelector("header");
      expect(header).toHaveClass("bg-white");
    });
  });

  describe("Logo Display", () => {
    it("displays logo with correct src", () => {
      usePathname.mockReturnValue("/Student");
      render(<ConditionalHeader />);
      
      const logo = screen.getByAltText("Learn LLM");
      expect(logo).toHaveAttribute("src", "/logo2.png");
    });

    it("displays logo with correct dimensions", () => {
      usePathname.mockReturnValue("/Student");
      render(<ConditionalHeader />);
      
      const logo = screen.getByAltText("Learn LLM");
      expect(logo).toHaveAttribute("width", "230");
      expect(logo).toHaveAttribute("height", "150");
    });

    it("logo is wrapped in a link to homepage", () => {
      usePathname.mockReturnValue("/Student");
      render(<ConditionalHeader />);
      
      const logo = screen.getByAltText("Learn LLM");
      const link = logo.closest("a");
      expect(link).toHaveAttribute("href", "/");
    });

    it("logo has priority loading", () => {
      usePathname.mockReturnValue("/Student");
      render(<ConditionalHeader />);
      
      const logo = screen.getByAltText("Learn LLM");
      expect(logo).toHaveAttribute("priority");
    });
  });

  describe("Profile Image Display", () => {
    it("displays student profile image by default", () => {
      usePathname.mockReturnValue("/Student");
      render(<ConditionalHeader />);
      
      const profile = screen.getByAltText("Account");
      expect(profile).toHaveAttribute("src", "/profile.png");
    });

    it("displays instructor profile image on Instructor route", () => {
      usePathname.mockReturnValue("/Instructor");
      render(<ConditionalHeader />);
      
      const profile = screen.getByAltText("Account");
      expect(profile).toHaveAttribute("src", "/instru.png");
    });

    it("displays student profile when role is student in localStorage", () => {
      localStorage.setItem("role", "student");
      usePathname.mockReturnValue("/Student");
      render(<ConditionalHeader />);
      
      const profile = screen.getByAltText("Account");
      expect(profile).toHaveAttribute("src", "/profile.png");
    });

    it("displays instructor profile when on Instructor route regardless of localStorage", () => {
      localStorage.setItem("role", "student");
      usePathname.mockReturnValue("/Instructor");
      render(<ConditionalHeader />);
      
      const profile = screen.getByAltText("Account");
      expect(profile).toHaveAttribute("src", "/instru.png");
    });

    it("does not display profile image on homepage", () => {
      usePathname.mockReturnValue("/");
      render(<ConditionalHeader />);
      
      expect(screen.queryByAltText("Account")).not.toBeInTheDocument();
    });

    it("profile image has correct dimensions", () => {
      usePathname.mockReturnValue("/Student");
      render(<ConditionalHeader />);
      
      const profile = screen.getByAltText("Account");
      expect(profile).toHaveAttribute("width", "150");
      expect(profile).toHaveAttribute("height", "150");
    });
  });

  describe("Role Management from localStorage", () => {
    it("loads student role from localStorage", async () => {
      localStorage.setItem("role", "student");
      usePathname.mockReturnValue("/Student");
      
      render(<ConditionalHeader />);
      
      await waitFor(() => {
        const profile = screen.getByAltText("Account");
        expect(profile).toHaveAttribute("src", "/profile.png");
      });
    });

    it("loads instructor role from localStorage", async () => {
      localStorage.setItem("role", "instructor");
      usePathname.mockReturnValue("/Student");
      
      render(<ConditionalHeader />);
      
      await waitFor(() => {
        const profile = screen.getByAltText("Account");
        expect(profile).toHaveAttribute("src", "/instru.png");
      });
    });

    it("defaults to student when localStorage has invalid value", async () => {
      localStorage.setItem("role", "invalid");
      usePathname.mockReturnValue("/Student");
      
      render(<ConditionalHeader />);
      
      await waitFor(() => {
        const profile = screen.getByAltText("Account");
        expect(profile).toHaveAttribute("src", "/profile.png");
      });
    });

    it("defaults to student when localStorage is empty", async () => {
      usePathname.mockReturnValue("/Student");
      
      render(<ConditionalHeader />);
      
      await waitFor(() => {
        const profile = screen.getByAltText("Account");
        expect(profile).toHaveAttribute("src", "/profile.png");
      });
    });
  });

  describe("Role Event Listener", () => {
    it("updates profile image when role-updated event is dispatched", async () => {
      usePathname.mockReturnValue("/Student");
      render(<ConditionalHeader />);
      
      // Initially should show student profile
      let profile = screen.getByAltText("Account");
      expect(profile).toHaveAttribute("src", "/profile.png");
      
      // Dispatch role-updated event
      window.dispatchEvent(new CustomEvent("role-updated", { detail: "instructor" }));
      
      await waitFor(() => {
        profile = screen.getByAltText("Account");
        expect(profile).toHaveAttribute("src", "/instru.png");
      });
    });

    it("updates profile image to student when event is dispatched", async () => {
      localStorage.setItem("role", "instructor");
      usePathname.mockReturnValue("/Student");
      render(<ConditionalHeader />);
      
      await waitFor(() => {
        const profile = screen.getByAltText("Account");
        expect(profile).toHaveAttribute("src", "/instru.png");
      });
      
      // Dispatch role-updated event
      window.dispatchEvent(new CustomEvent("role-updated", { detail: "student" }));
      
      await waitFor(() => {
        const profile = screen.getByAltText("Account");
        expect(profile).toHaveAttribute("src", "/profile.png");
      });
    });

    it("ignores invalid role values in events", async () => {
      usePathname.mockReturnValue("/Student");
      render(<ConditionalHeader />);
      
      const profile = screen.getByAltText("Account");
      expect(profile).toHaveAttribute("src", "/profile.png");
      
      // Dispatch event with invalid role
      window.dispatchEvent(new CustomEvent("role-updated", { detail: "invalid" }));
      
      await waitFor(() => {
        const updatedProfile = screen.getByAltText("Account");
        expect(updatedProfile).toHaveAttribute("src", "/profile.png");
      });
    });

    it("removes event listener on unmount", () => {
      usePathname.mockReturnValue("/Student");
      const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
      
      const { unmount } = render(<ConditionalHeader />);
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith("role-updated", expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });
  });

  describe("Profile Click Navigation", () => {
    it("navigates to /Student when student profile is clicked", () => {
      localStorage.setItem("role", "student");
      usePathname.mockReturnValue("/LoginPage");
      render(<ConditionalHeader />);
      
      const profileButton = screen.getByLabelText("Open account home");
      fireEvent.click(profileButton);
      
      expect(mockPush).toHaveBeenCalledWith("/Student");
    });

    it("navigates to /Instructor when instructor profile is clicked", () => {
      localStorage.setItem("role", "instructor");
      usePathname.mockReturnValue("/LoginPage");
      render(<ConditionalHeader />);
      
      const profileButton = screen.getByLabelText("Open account home");
      fireEvent.click(profileButton);
      
      expect(mockPush).toHaveBeenCalledWith("/Instructor");
    });

    it("navigates to /Instructor when on Instructor route", () => {
      localStorage.setItem("role", "student");
      usePathname.mockReturnValue("/Instructor");
      render(<ConditionalHeader />);
      
      const profileButton = screen.getByLabelText("Open account home");
      fireEvent.click(profileButton);
      
      expect(mockPush).toHaveBeenCalledWith("/Instructor");
    });

    it("navigates to /Instructor when on nested Instructor route", () => {
      localStorage.setItem("role", "student");
      usePathname.mockReturnValue("/Instructor/dashboard");
      render(<ConditionalHeader />);
      
      const profileButton = screen.getByLabelText("Open account home");
      fireEvent.click(profileButton);
      
      expect(mockPush).toHaveBeenCalledWith("/Instructor");
    });

    it("navigates to /Student when on Student route", () => {
      usePathname.mockReturnValue("/Student");
      render(<ConditionalHeader />);
      
      const profileButton = screen.getByLabelText("Open account home");
      fireEvent.click(profileButton);
      
      expect(mockPush).toHaveBeenCalledWith("/Student");
    });

    it("profile button has correct aria-label", () => {
      usePathname.mockReturnValue("/Student");
      render(<ConditionalHeader />);
      
      expect(screen.getByLabelText("Open account home")).toBeInTheDocument();
    });
  });

  describe("Header Structure and Styling", () => {
    it("applies correct header classes", () => {
      usePathname.mockReturnValue("/Student");
      const { container } = render(<ConditionalHeader />);
      
      const header = container.querySelector("header");
      expect(header).toHaveClass("flex", "items-center", "justify-between", "px-10", "py-4");
    });

    it("logo link has correct classes", () => {
      usePathname.mockReturnValue("/Student");
      render(<ConditionalHeader />);
      
      const logo = screen.getByAltText("Learn LLM");
      const link = logo.closest("a");
      expect(link).toHaveClass("flex", "items-center", "gap-3");
    });

    it("profile button has correct classes", () => {
      usePathname.mockReturnValue("/Student");
      render(<ConditionalHeader />);
      
      const profileButton = screen.getByLabelText("Open account home");
      expect(profileButton).toHaveClass("flex", "items-center", "gap-3");
    });
  });

  describe("Route Edge Cases", () => {
    it("handles nested Student routes", () => {
      usePathname.mockReturnValue("/Student/dashboard/profile");
      render(<ConditionalHeader />);
      
      expect(screen.getByAltText("Learn LLM")).toBeInTheDocument();
      expect(screen.getByAltText("Account")).toBeInTheDocument();
    });

    it("handles nested Instructor routes", () => {
      usePathname.mockReturnValue("/Instructor/analytics/reports");
      render(<ConditionalHeader />);
      
      expect(screen.getByAltText("Learn LLM")).toBeInTheDocument();
      expect(screen.getByAltText("Account")).toBeInTheDocument();
    });

    it("handles nested LoginPage routes", () => {
      usePathname.mockReturnValue("/LoginPage/step2");
      const { container } = render(<ConditionalHeader />);
      
      const header = container.querySelector("header");
      expect(header).toHaveClass("bg-purple-100");
    });

    it("hides header on nested Score routes", () => {
      usePathname.mockReturnValue("/Student/Quiz/Score");
      const { container } = render(<ConditionalHeader />);
      
      expect(container.firstChild).toBeNull();
    });

    it("hides header when Score appears anywhere in path", () => {
      usePathname.mockReturnValue("/ScorePage");
      const { container } = render(<ConditionalHeader />);
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Component Re-rendering", () => {
    it("updates header when route changes", () => {
      usePathname.mockReturnValue("/Student");
      const { container, rerender } = render(<ConditionalHeader />);
      
      let header = container.querySelector("header");
      expect(header).toHaveClass("bg-white");
      
      usePathname.mockReturnValue("/LoginPage");
      rerender(<ConditionalHeader />);
      
      header = container.querySelector("header");
      expect(header).toHaveClass("bg-purple-100");
    });

    it("removes header when navigating to Score page", () => {
      usePathname.mockReturnValue("/Student");
      const { container, rerender } = render(<ConditionalHeader />);
      
      expect(container.querySelector("header")).toBeInTheDocument();
      
      usePathname.mockReturnValue("/Score");
      rerender(<ConditionalHeader />);
      
      expect(container.firstChild).toBeNull();
    });

    it("shows header when navigating away from Score page", () => {
      usePathname.mockReturnValue("/Score");
      const { container, rerender } = render(<ConditionalHeader />);
      
      expect(container.firstChild).toBeNull();
      
      usePathname.mockReturnValue("/Student");
      rerender(<ConditionalHeader />);
      
      expect(container.querySelector("header")).toBeInTheDocument();
    });

    it("updates profile visibility on route change", () => {
      usePathname.mockReturnValue("/Student");
      const { rerender } = render(<ConditionalHeader />);
      
      expect(screen.getByAltText("Account")).toBeInTheDocument();
      
      usePathname.mockReturnValue("/");
      rerender(<ConditionalHeader />);
      
      expect(screen.queryByAltText("Account")).not.toBeInTheDocument();
    });
  });

  describe("Effective Role Logic", () => {
    it("uses instructor role when on Instructor route regardless of state", () => {
      localStorage.setItem("role", "student");
      usePathname.mockReturnValue("/Instructor/analytics");
      render(<ConditionalHeader />);
      
      const profile = screen.getByAltText("Account");
      expect(profile).toHaveAttribute("src", "/instru.png");
      
      const profileButton = screen.getByLabelText("Open account home");
      fireEvent.click(profileButton);
      
      expect(mockPush).toHaveBeenCalledWith("/Instructor");
    });

    it("uses state role when not on Instructor route", () => {
      localStorage.setItem("role", "instructor");
      usePathname.mockReturnValue("/Student");
      
      render(<ConditionalHeader />);
      
      // Wait for localStorage to be loaded
      waitFor(() => {
        const profile = screen.getByAltText("Account");
        expect(profile).toHaveAttribute("src", "/instru.png");
      });
    });

    it("instructor flow overrides role state", () => {
      localStorage.setItem("role", "student");
      usePathname.mockReturnValue("/Instructor");
      render(<ConditionalHeader />);
      
      // Should show instructor profile despite student in localStorage
      const profile = screen.getByAltText("Account");
      expect(profile).toHaveAttribute("src", "/instru.png");
    });
  });

  describe("LocalStorage Edge Cases", () => {
    it("ignores localStorage when value is null", async () => {
      localStorage.setItem("role", null);
      usePathname.mockReturnValue("/Student");
      
      render(<ConditionalHeader />);
      
      await waitFor(() => {
        const profile = screen.getByAltText("Account");
        expect(profile).toHaveAttribute("src", "/profile.png");
      });
    });

    it("ignores localStorage when value is undefined", async () => {
      localStorage.removeItem("role");
      usePathname.mockReturnValue("/Student");
      
      render(<ConditionalHeader />);
      
      await waitFor(() => {
        const profile = screen.getByAltText("Account");
        expect(profile).toHaveAttribute("src", "/profile.png");
      });
    });

    it("ignores localStorage when value is not instructor or student", async () => {
      localStorage.setItem("role", "admin");
      usePathname.mockReturnValue("/Student");
      
      render(<ConditionalHeader />);
      
      await waitFor(() => {
        const profile = screen.getByAltText("Account");
        expect(profile).toHaveAttribute("src", "/profile.png");
      });
    });

    it("ignores localStorage when value is empty string", async () => {
      localStorage.setItem("role", "");
      usePathname.mockReturnValue("/Student");
      
      render(<ConditionalHeader />);
      
      await waitFor(() => {
        const profile = screen.getByAltText("Account");
        expect(profile).toHaveAttribute("src", "/profile.png");
      });
    });

    it("ignores localStorage when value has wrong casing", async () => {
      localStorage.setItem("role", "Instructor");
      usePathname.mockReturnValue("/Student");
      
      render(<ConditionalHeader />);
      
      await waitFor(() => {
        const profile = screen.getByAltText("Account");
        expect(profile).toHaveAttribute("src", "/profile.png");
      });
    });
  });

  describe("Role Event Edge Cases", () => {
    it("ignores role-updated event when detail is undefined", async () => {
      usePathname.mockReturnValue("/Student");
      render(<ConditionalHeader />);
      
      const profile = screen.getByAltText("Account");
      expect(profile).toHaveAttribute("src", "/profile.png");
      
      // Dispatch event with undefined detail
      window.dispatchEvent(new CustomEvent("role-updated", { detail: undefined }));
      
      await waitFor(() => {
        const updatedProfile = screen.getByAltText("Account");
        expect(updatedProfile).toHaveAttribute("src", "/profile.png");
      });
    });

    it("ignores role-updated event when detail is null", async () => {
      usePathname.mockReturnValue("/Student");
      render(<ConditionalHeader />);
      
      const profile = screen.getByAltText("Account");
      expect(profile).toHaveAttribute("src", "/profile.png");
      
      // Dispatch event with null detail
      window.dispatchEvent(new CustomEvent("role-updated", { detail: null }));
      
      await waitFor(() => {
        const updatedProfile = screen.getByAltText("Account");
        expect(updatedProfile).toHaveAttribute("src", "/profile.png");
      });
    });

    it("ignores role-updated event when detail is empty string", async () => {
      usePathname.mockReturnValue("/Student");
      render(<ConditionalHeader />);
      
      const profile = screen.getByAltText("Account");
      expect(profile).toHaveAttribute("src", "/profile.png");
      
      window.dispatchEvent(new CustomEvent("role-updated", { detail: "" }));
      
      await waitFor(() => {
        const updatedProfile = screen.getByAltText("Account");
        expect(updatedProfile).toHaveAttribute("src", "/profile.png");
      });
    });

    it("ignores role-updated event when detail is a number", async () => {
      usePathname.mockReturnValue("/Student");
      render(<ConditionalHeader />);
      
      const profile = screen.getByAltText("Account");
      expect(profile).toHaveAttribute("src", "/profile.png");
      
      window.dispatchEvent(new CustomEvent("role-updated", { detail: 123 }));
      
      await waitFor(() => {
        const updatedProfile = screen.getByAltText("Account");
        expect(updatedProfile).toHaveAttribute("src", "/profile.png");
      });
    });

    it("ignores role-updated event when detail is an object", async () => {
      usePathname.mockReturnValue("/Student");
      render(<ConditionalHeader />);
      
      const profile = screen.getByAltText("Account");
      expect(profile).toHaveAttribute("src", "/profile.png");
      
      window.dispatchEvent(new CustomEvent("role-updated", { detail: { role: "instructor" } }));
      
      await waitFor(() => {
        const updatedProfile = screen.getByAltText("Account");
        expect(updatedProfile).toHaveAttribute("src", "/profile.png");
      });
    });

    it("handles event without detail property", async () => {
      usePathname.mockReturnValue("/Student");
      render(<ConditionalHeader />);
      
      const profile = screen.getByAltText("Account");
      expect(profile).toHaveAttribute("src", "/profile.png");
      
      // Dispatch event without detail
      window.dispatchEvent(new CustomEvent("role-updated"));
      
      await waitFor(() => {
        const updatedProfile = screen.getByAltText("Account");
        expect(updatedProfile).toHaveAttribute("src", "/profile.png");
      });
    });
  });

  describe("SSR Compatibility", () => {
    it("handles server-side rendering gracefully", () => {
      const originalWindow = global.window;
      delete global.window;
      
      usePathname.mockReturnValue("/Student");
      
      // Should not crash during SSR
      expect(() => render(<ConditionalHeader />)).not.toThrow();
      
      global.window = originalWindow;
    });
  });

  describe("Default Route Behavior", () => {
    it("renders header with default styling for unmatched routes", () => {
      usePathname.mockReturnValue("/random/unmatched/route");
      const { container } = render(<ConditionalHeader />);
      
      const header = container.querySelector("header");
      expect(header).toHaveClass("bg-white");
      expect(screen.getByAltText("Account")).toBeInTheDocument();
    });

    it("uses default showProfile=true for unmatched routes", () => {
      usePathname.mockReturnValue("/some/other/path");
      render(<ConditionalHeader />);
      
      expect(screen.getByAltText("Account")).toBeInTheDocument();
    });

    it("profile button works on default route", () => {
      usePathname.mockReturnValue("/some/path");
      render(<ConditionalHeader />);
      
      const profileButton = screen.getByLabelText("Open account home");
      fireEvent.click(profileButton);
      
      expect(mockPush).toHaveBeenCalledWith("/Student");
    });
  });

  describe("Image Priority Attribute", () => {
    it("logo image has priority attribute set to true", () => {
      usePathname.mockReturnValue("/Student");
      render(<ConditionalHeader />);
      
      const logo = screen.getByAltText("Learn LLM");
      expect(logo).toHaveAttribute("priority");
    });

    it("profile image has priority attribute set to true", () => {
      usePathname.mockReturnValue("/Student");
      render(<ConditionalHeader />);
      
      const profile = screen.getByAltText("Account");
      expect(profile).toHaveAttribute("priority");
    });
  });

  describe("RenderHeader Function Coverage", () => {
    it("renders with custom background and default showProfile", () => {
      usePathname.mockReturnValue("/LoginPage");
      const { container } = render(<ConditionalHeader />);
      
      const header = container.querySelector("header");
      expect(header).toHaveClass("bg-purple-100");
      expect(screen.getByAltText("Account")).toBeInTheDocument();
    });

    it("renders with default background and custom showProfile=false", () => {
      usePathname.mockReturnValue("/");
      const { container } = render(<ConditionalHeader />);
      
      const header = container.querySelector("header");
      expect(header).toHaveClass("bg-white");
      expect(screen.queryByAltText("Account")).not.toBeInTheDocument();
    });

    it("renders with both default parameters", () => {
      usePathname.mockReturnValue("/Student");
      const { container } = render(<ConditionalHeader />);
      
      const header = container.querySelector("header");
      expect(header).toHaveClass("bg-white");
      expect(screen.getByAltText("Account")).toBeInTheDocument();
    });
  });

  describe("pathname.includes() Coverage", () => {
    it("returns null for path with Score in the middle", () => {
      usePathname.mockReturnValue("/Student/Score/Results");
      const { container } = render(<ConditionalHeader />);
      
      expect(container.firstChild).toBeNull();
    });

    it("returns null for path ending with Score", () => {
      usePathname.mockReturnValue("/Quiz/Final/Score");
      const { container } = render(<ConditionalHeader />);
      
      expect(container.firstChild).toBeNull();
    });

    it("returns null for path starting with Score", () => {
      usePathname.mockReturnValue("/Score/Details");
      const { container } = render(<ConditionalHeader />);
      
      expect(container.firstChild).toBeNull();
    });

    it("returns null when Score is the entire path", () => {
      usePathname.mockReturnValue("/Score");
      const { container } = render(<ConditionalHeader />);
      
      expect(container.firstChild).toBeNull();
    });

    it("renders header when path contains similar word but not Score", () => {
      usePathname.mockReturnValue("/Scoreboard");
      render(<ConditionalHeader />);
      
      expect(screen.getByAltText("Learn LLM")).toBeInTheDocument();
    });
  });

  describe("pathname.startsWith() Coverage", () => {
    it("matches Student route exactly", () => {
      usePathname.mockReturnValue("/Student");
      const { container } = render(<ConditionalHeader />);
      
      const header = container.querySelector("header");
      expect(header).toHaveClass("bg-white");
      expect(screen.getByAltText("Account")).toBeInTheDocument();
    });

    it("does not match when Student is not at start", () => {
      usePathname.mockReturnValue("/Home/Student");
      const { container } = render(<ConditionalHeader />);
      
      // Should use default route, not Student route
      const header = container.querySelector("header");
      expect(header).toBeInTheDocument();
    });

    it("matches Instructor route exactly", () => {
      usePathname.mockReturnValue("/Instructor");
      const { container } = render(<ConditionalHeader />);
      
      const header = container.querySelector("header");
      expect(header).toHaveClass("bg-white");
      expect(screen.getByAltText("Account")).toBeInTheDocument();
    });

    it("does not match when Instructor is not at start", () => {
      usePathname.mockReturnValue("/Home/Instructor");
      const { container } = render(<ConditionalHeader />);
      
      // Should use default route
      expect(screen.getByAltText("Learn LLM")).toBeInTheDocument();
    });

    it("matches LoginPage route exactly", () => {
      usePathname.mockReturnValue("/LoginPage");
      const { container } = render(<ConditionalHeader />);
      
      const header = container.querySelector("header");
      expect(header).toHaveClass("bg-purple-100");
    });

    it("does not match when LoginPage is not at start", () => {
      usePathname.mockReturnValue("/Home/LoginPage");
      const { container } = render(<ConditionalHeader />);
      
      const header = container.querySelector("header");
      expect(header).not.toHaveClass("bg-purple-100");
      expect(header).toHaveClass("bg-white");
    });
  });

  describe("Ternary Operator Coverage", () => {
    it("effectiveRole ternary - instructor branch", () => {
      usePathname.mockReturnValue("/Instructor");
      render(<ConditionalHeader />);
      
      const profile = screen.getByAltText("Account");
      expect(profile).toHaveAttribute("src", "/instru.png");
    });

    it("effectiveRole ternary - student branch", () => {
      usePathname.mockReturnValue("/Student");
      render(<ConditionalHeader />);
      
      const profile = screen.getByAltText("Account");
      expect(profile).toHaveAttribute("src", "/profile.png");
    });

    it("handleProfileClick destination ternary - instructor branch", () => {
      localStorage.setItem("role", "instructor");
      usePathname.mockReturnValue("/Student");
      
      render(<ConditionalHeader />);
      
      waitFor(() => {
        const profileButton = screen.getByLabelText("Open account home");
        fireEvent.click(profileButton);
        
        expect(mockPush).toHaveBeenCalledWith("/Instructor");
      });
    });

    it("handleProfileClick destination ternary - student branch", () => {
      localStorage.setItem("role", "student");
      usePathname.mockReturnValue("/Student");
      
      render(<ConditionalHeader />);
      
      const profileButton = screen.getByLabelText("Open account home");
      fireEvent.click(profileButton);
      
      expect(mockPush).toHaveBeenCalledWith("/Student");
    });

    it("image src ternary in profile button - instructor branch", () => {
      localStorage.setItem("role", "instructor");
      usePathname.mockReturnValue("/Student");
      
      render(<ConditionalHeader />);
      
      waitFor(() => {
        const profile = screen.getByAltText("Account");
        expect(profile).toHaveAttribute("src", "/instru.png");
      });
    });

    it("image src ternary in profile button - student branch", () => {
      localStorage.setItem("role", "student");
      usePathname.mockReturnValue("/Student");
      
      render(<ConditionalHeader />);
      
      const profile = screen.getByAltText("Account");
      expect(profile).toHaveAttribute("src", "/profile.png");
    });
  });

  describe("Conditional Rendering Coverage", () => {
    it("renders profile button when showProfile is true", () => {
      usePathname.mockReturnValue("/Student");
      render(<ConditionalHeader />);
      
      expect(screen.getByAltText("Account")).toBeInTheDocument();
      expect(screen.getByLabelText("Open account home")).toBeInTheDocument();
    });

    it("does not render profile button when showProfile is false", () => {
      usePathname.mockReturnValue("/");
      render(<ConditionalHeader />);
      
      expect(screen.queryByAltText("Account")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Open account home")).not.toBeInTheDocument();
    });
  });
});
