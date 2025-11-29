import { render } from "@testing-library/react";
import { usePathname } from "next/navigation";
import ConditionalBody from "./ConditionalBody";

// Mock Next.js usePathname hook
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("ConditionalBody Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("LoginPage Route Styling", () => {
    it("applies purple background for /LoginPage route", () => {
      usePathname.mockReturnValue("/LoginPage");
      
      const { container } = render(
        <ConditionalBody>
          <div>Test Content</div>
        </ConditionalBody>
      );
      
      const body = container.querySelector("body");
      expect(body).toHaveClass("min-h-screen", "bg-purple-100");
      expect(body).not.toHaveClass("bg-gray-50");
    });

    it("applies purple background for nested LoginPage routes", () => {
      usePathname.mockReturnValue("/LoginPage/nested/path");
      
      const { container } = render(
        <ConditionalBody>
          <div>Test Content</div>
        </ConditionalBody>
      );
      
      const body = container.querySelector("body");
      expect(body).toHaveClass("min-h-screen", "bg-purple-100");
    });

    it("applies purple background for /LoginPage with query params", () => {
      usePathname.mockReturnValue("/LoginPage?redirect=true");
      
      const { container } = render(
        <ConditionalBody>
          <div>Test Content</div>
        </ConditionalBody>
      );
      
      const body = container.querySelector("body");
      expect(body).toHaveClass("min-h-screen", "bg-purple-100");
    });

    it("renders children correctly on LoginPage route", () => {
      usePathname.mockReturnValue("/LoginPage");
      
      const { getByText } = render(
        <ConditionalBody>
          <div>Login Content</div>
        </ConditionalBody>
      );
      
      expect(getByText("Login Content")).toBeInTheDocument();
    });
  });

  describe("Default Route Styling", () => {
    it("applies gray background for root route", () => {
      usePathname.mockReturnValue("/");
      
      const { container } = render(
        <ConditionalBody>
          <div>Test Content</div>
        </ConditionalBody>
      );
      
      const body = container.querySelector("body");
      expect(body).toHaveClass("min-h-screen", "bg-gray-50");
      expect(body).not.toHaveClass("bg-purple-100");
    });

    it("applies gray background for Student route", () => {
      usePathname.mockReturnValue("/Student");
      
      const { container } = render(
        <ConditionalBody>
          <div>Test Content</div>
        </ConditionalBody>
      );
      
      const body = container.querySelector("body");
      expect(body).toHaveClass("min-h-screen", "bg-gray-50");
    });

    it("applies gray background for Instructor route", () => {
      usePathname.mockReturnValue("/Instructor");
      
      const { container } = render(
        <ConditionalBody>
          <div>Test Content</div>
        </ConditionalBody>
      );
      
      const body = container.querySelector("body");
      expect(body).toHaveClass("min-h-screen", "bg-gray-50");
    });

    it("applies gray background for Quiz route", () => {
      usePathname.mockReturnValue("/Quiz");
      
      const { container } = render(
        <ConditionalBody>
          <div>Test Content</div>
        </ConditionalBody>
      );
      
      const body = container.querySelector("body");
      expect(body).toHaveClass("min-h-screen", "bg-gray-50");
    });

    it("applies gray background for nested Student routes", () => {
      usePathname.mockReturnValue("/Student/dashboard");
      
      const { container } = render(
        <ConditionalBody>
          <div>Test Content</div>
        </ConditionalBody>
      );
      
      const body = container.querySelector("body");
      expect(body).toHaveClass("min-h-screen", "bg-gray-50");
    });

    it("applies gray background for unknown routes", () => {
      usePathname.mockReturnValue("/unknown/path");
      
      const { container } = render(
        <ConditionalBody>
          <div>Test Content</div>
        </ConditionalBody>
      );
      
      const body = container.querySelector("body");
      expect(body).toHaveClass("min-h-screen", "bg-gray-50");
    });

    it("renders children correctly on default routes", () => {
      usePathname.mockReturnValue("/");
      
      const { getByText } = render(
        <ConditionalBody>
          <div>Home Content</div>
        </ConditionalBody>
      );
      
      expect(getByText("Home Content")).toBeInTheDocument();
    });
  });

  describe("Children Rendering", () => {
    it("renders single child element", () => {
      usePathname.mockReturnValue("/");
      
      const { getByText } = render(
        <ConditionalBody>
          <div>Single Child</div>
        </ConditionalBody>
      );
      
      expect(getByText("Single Child")).toBeInTheDocument();
    });

    it("renders multiple child elements", () => {
      usePathname.mockReturnValue("/");
      
      const { getByText } = render(
        <ConditionalBody>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ConditionalBody>
      );
      
      expect(getByText("Child 1")).toBeInTheDocument();
      expect(getByText("Child 2")).toBeInTheDocument();
      expect(getByText("Child 3")).toBeInTheDocument();
    });

    it("renders nested child components", () => {
      usePathname.mockReturnValue("/");
      
      const { getByText } = render(
        <ConditionalBody>
          <div>
            <span>Nested Content</span>
            <div>
              <p>Deeply Nested</p>
            </div>
          </div>
        </ConditionalBody>
      );
      
      expect(getByText("Nested Content")).toBeInTheDocument();
      expect(getByText("Deeply Nested")).toBeInTheDocument();
    });

    it("renders children with complex JSX", () => {
      usePathname.mockReturnValue("/LoginPage");
      
      const ComplexComponent = () => (
        <div>
          <h1>Title</h1>
          <p>Paragraph</p>
          <button>Click Me</button>
        </div>
      );
      
      const { getByText, getByRole } = render(
        <ConditionalBody>
          <ComplexComponent />
        </ConditionalBody>
      );
      
      expect(getByText("Title")).toBeInTheDocument();
      expect(getByText("Paragraph")).toBeInTheDocument();
      expect(getByRole("button", { name: "Click Me" })).toBeInTheDocument();
    });

    it("handles empty children", () => {
      usePathname.mockReturnValue("/");
      
      const { container } = render(
        <ConditionalBody>{null}</ConditionalBody>
      );
      
      const body = container.querySelector("body");
      expect(body).toBeInTheDocument();
      expect(body).toHaveClass("min-h-screen", "bg-gray-50");
    });

    it("renders text content as children", () => {
      usePathname.mockReturnValue("/");
      
      const { getByText } = render(
        <ConditionalBody>Plain text content</ConditionalBody>
      );
      
      expect(getByText("Plain text content")).toBeInTheDocument();
    });
  });

  describe("Route Edge Cases", () => {
    it("distinguishes between /LoginPage and /Login", () => {
      usePathname.mockReturnValue("/Login");
      
      const { container } = render(
        <ConditionalBody>
          <div>Test Content</div>
        </ConditionalBody>
      );
      
      const body = container.querySelector("body");
      expect(body).toHaveClass("bg-gray-50");
      expect(body).not.toHaveClass("bg-purple-100");
    });

    it("handles case-sensitive route matching", () => {
      usePathname.mockReturnValue("/loginpage");
      
      const { container } = render(
        <ConditionalBody>
          <div>Test Content</div>
        </ConditionalBody>
      );
      
      const body = container.querySelector("body");
      // Should not match /LoginPage (case-sensitive)
      expect(body).toHaveClass("bg-gray-50");
    });

    it("handles empty pathname", () => {
      usePathname.mockReturnValue("");
      
      const { container } = render(
        <ConditionalBody>
          <div>Test Content</div>
        </ConditionalBody>
      );
      
      const body = container.querySelector("body");
      expect(body).toHaveClass("min-h-screen", "bg-gray-50");
    });

    it("handles pathname with trailing slash", () => {
      usePathname.mockReturnValue("/LoginPage/");
      
      const { container } = render(
        <ConditionalBody>
          <div>Test Content</div>
        </ConditionalBody>
      );
      
      const body = container.querySelector("body");
      expect(body).toHaveClass("bg-purple-100");
    });

    it("handles deep nested LoginPage routes", () => {
      usePathname.mockReturnValue("/LoginPage/step1/step2/step3");
      
      const { container } = render(
        <ConditionalBody>
          <div>Test Content</div>
        </ConditionalBody>
      );
      
      const body = container.querySelector("body");
      expect(body).toHaveClass("bg-purple-100");
    });
  });

  describe("Component Re-rendering", () => {
    it("updates styling when pathname changes from default to LoginPage", () => {
      usePathname.mockReturnValue("/");
      
      const { container, rerender } = render(
        <ConditionalBody>
          <div>Test Content</div>
        </ConditionalBody>
      );
      
      let body = container.querySelector("body");
      expect(body).toHaveClass("bg-gray-50");
      
      // Change pathname
      usePathname.mockReturnValue("/LoginPage");
      
      rerender(
        <ConditionalBody>
          <div>Test Content</div>
        </ConditionalBody>
      );
      
      body = container.querySelector("body");
      expect(body).toHaveClass("bg-purple-100");
      expect(body).not.toHaveClass("bg-gray-50");
    });

    it("updates styling when pathname changes from LoginPage to default", () => {
      usePathname.mockReturnValue("/LoginPage");
      
      const { container, rerender } = render(
        <ConditionalBody>
          <div>Test Content</div>
        </ConditionalBody>
      );
      
      let body = container.querySelector("body");
      expect(body).toHaveClass("bg-purple-100");
      
      // Change pathname
      usePathname.mockReturnValue("/Student");
      
      rerender(
        <ConditionalBody>
          <div>Test Content</div>
        </ConditionalBody>
      );
      
      body = container.querySelector("body");
      expect(body).toHaveClass("bg-gray-50");
      expect(body).not.toHaveClass("bg-purple-100");
    });

    it("preserves children content across re-renders", () => {
      usePathname.mockReturnValue("/");
      
      const { getByText, rerender } = render(
        <ConditionalBody>
          <div>Persistent Content</div>
        </ConditionalBody>
      );
      
      expect(getByText("Persistent Content")).toBeInTheDocument();
      
      usePathname.mockReturnValue("/LoginPage");
      
      rerender(
        <ConditionalBody>
          <div>Persistent Content</div>
        </ConditionalBody>
      );
      
      expect(getByText("Persistent Content")).toBeInTheDocument();
    });
  });

  describe("Body Element Structure", () => {
    it("renders body element with correct structure", () => {
      usePathname.mockReturnValue("/");
      
      const { container } = render(
        <ConditionalBody>
          <div>Test</div>
        </ConditionalBody>
      );
      
      const body = container.querySelector("body");
      expect(body).toBeInTheDocument();
      expect(body.tagName).toBe("BODY");
    });

    it("always includes min-h-screen class", () => {
      const routes = ["/", "/LoginPage", "/Student", "/Instructor", "/unknown"];
      
      routes.forEach(route => {
        usePathname.mockReturnValue(route);
        
        const { container } = render(
          <ConditionalBody>
            <div>Test</div>
          </ConditionalBody>
        );
        
        const body = container.querySelector("body");
        expect(body).toHaveClass("min-h-screen");
      });
    });

    it("applies exactly two classes to body element for default routes", () => {
      usePathname.mockReturnValue("/");
      
      const { container } = render(
        <ConditionalBody>
          <div>Test</div>
        </ConditionalBody>
      );
      
      const body = container.querySelector("body");
      const classes = Array.from(body.classList);
      expect(classes).toHaveLength(2);
      expect(classes).toContain("min-h-screen");
      expect(classes).toContain("bg-gray-50");
    });

    it("applies exactly two classes to body element for LoginPage route", () => {
      usePathname.mockReturnValue("/LoginPage");
      
      const { container } = render(
        <ConditionalBody>
          <div>Test</div>
        </ConditionalBody>
      );
      
      const body = container.querySelector("body");
      const classes = Array.from(body.classList);
      expect(classes).toHaveLength(2);
      expect(classes).toContain("min-h-screen");
      expect(classes).toContain("bg-purple-100");
    });
  });

  describe("Pathname.startsWith() Coverage", () => {
    it("handles pathname that starts with /LoginPage exactly", () => {
      usePathname.mockReturnValue("/LoginPage");
      
      const { container } = render(
        <ConditionalBody>
          <div>Test</div>
        </ConditionalBody>
      );
      
      const body = container.querySelector("body");
      expect(body).toHaveClass("bg-purple-100");
    });

    it("handles pathname starting with /LoginPage followed by slash", () => {
      usePathname.mockReturnValue("/LoginPage/");
      
      const { container } = render(
        <ConditionalBody>
          <div>Test</div>
        </ConditionalBody>
      );
      
      const body = container.querySelector("body");
      expect(body).toHaveClass("bg-purple-100");
    });

    it("handles pathname not starting with /LoginPage", () => {
      usePathname.mockReturnValue("/AnotherPage");
      
      const { container } = render(
        <ConditionalBody>
          <div>Test</div>
        </ConditionalBody>
      );
      
      const body = container.querySelector("body");
      expect(body).toHaveClass("bg-gray-50");
    });

    it("handles root pathname", () => {
      usePathname.mockReturnValue("/");
      
      const { container } = render(
        <ConditionalBody>
          <div>Test</div>
        </ConditionalBody>
      );
      
      const body = container.querySelector("body");
      expect(body).toHaveClass("bg-gray-50");
    });
  });

  describe("Children Prop Coverage", () => {
    it("renders with string children", () => {
      usePathname.mockReturnValue("/");
      
      const { getByText } = render(
        <ConditionalBody>
          Simple string
        </ConditionalBody>
      );
      
      expect(getByText("Simple string")).toBeInTheDocument();
    });

    it("renders with number children", () => {
      usePathname.mockReturnValue("/");
      
      const { getByText } = render(
        <ConditionalBody>
          {42}
        </ConditionalBody>
      );
      
      expect(getByText("42")).toBeInTheDocument();
    });

    it("renders with boolean children (renders nothing)", () => {
      usePathname.mockReturnValue("/");
      
      const { container } = render(
        <ConditionalBody>
          {true}
        </ConditionalBody>
      );
      
      const body = container.querySelector("body");
      expect(body).toBeInTheDocument();
    });

    it("renders with undefined children", () => {
      usePathname.mockReturnValue("/");
      
      const { container } = render(
        <ConditionalBody>
          {undefined}
        </ConditionalBody>
      );
      
      const body = container.querySelector("body");
      expect(body).toBeInTheDocument();
    });

    it("renders with array of children", () => {
      usePathname.mockReturnValue("/LoginPage");
      
      const { getByText } = render(
        <ConditionalBody>
          {[
            <div key="1">First</div>,
            <div key="2">Second</div>,
            <div key="3">Third</div>
          ]}
        </ConditionalBody>
      );
      
      expect(getByText("First")).toBeInTheDocument();
      expect(getByText("Second")).toBeInTheDocument();
      expect(getByText("Third")).toBeInTheDocument();
    });

    it("renders with fragment children", () => {
      usePathname.mockReturnValue("/");
      
      const { getByText } = render(
        <ConditionalBody>
          <>
            <div>Fragment Child 1</div>
            <div>Fragment Child 2</div>
          </>
        </ConditionalBody>
      );
      
      expect(getByText("Fragment Child 1")).toBeInTheDocument();
      expect(getByText("Fragment Child 2")).toBeInTheDocument();
    });
  });

  describe("Complete Branch Coverage", () => {
    it("executes if branch when pathname starts with /LoginPage", () => {
      usePathname.mockReturnValue("/LoginPage/subpage");
      
      const { container } = render(
        <ConditionalBody>
          <div>Content</div>
        </ConditionalBody>
      );
      
      const body = container.querySelector("body");
      expect(body).toHaveClass("bg-purple-100");
      expect(body).not.toHaveClass("bg-gray-50");
    });

    it("executes else branch (return statement) when pathname does not start with /LoginPage", () => {
      usePathname.mockReturnValue("/Student/dashboard");
      
      const { container } = render(
        <ConditionalBody>
          <div>Content</div>
        </ConditionalBody>
      );
      
      const body = container.querySelector("body");
      expect(body).toHaveClass("bg-gray-50");
      expect(body).not.toHaveClass("bg-purple-100");
    });
  });
});
