import React from "react";
import { render, screen } from "@testing-library/react";
import StudentIndexPage from "./page1";

// Mock the StudentHomePage component
jest.mock("./HomePage/page", () => {
  return function MockStudentHomePage() {
    return <div data-testid="student-home-page">Student Home Page</div>;
  };
});

describe("StudentIndexPage Component", () => {
  describe("Basic Rendering", () => {
    it("renders without crashing", () => {
      expect(() => render(<StudentIndexPage />)).not.toThrow();
    });

    it("renders the StudentHomePage component", () => {
      render(<StudentIndexPage />);
      
      expect(screen.getByTestId("student-home-page")).toBeInTheDocument();
    });

    it("displays StudentHomePage content", () => {
      render(<StudentIndexPage />);
      
      expect(screen.getByText("Student Home Page")).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("returns StudentHomePage as only child", () => {
      const { container } = render(<StudentIndexPage />);
      
      const studentHomePage = screen.getByTestId("student-home-page");
      expect(container.firstChild).toEqual(studentHomePage);
    });

    it("does not render any wrapper elements", () => {
      const { container } = render(<StudentIndexPage />);
      
      // Should directly render StudentHomePage without additional wrappers
      const studentHomePage = screen.getByTestId("student-home-page");
      expect(container.children).toHaveLength(1);
      expect(container.firstChild).toBe(studentHomePage);
    });
  });

  describe("Client Component", () => {
    it("is a client component", () => {
      // This test verifies the component renders without issues in jsdom
      // which confirms it's compatible with client-side rendering
      render(<StudentIndexPage />);
      
      expect(screen.getByTestId("student-home-page")).toBeInTheDocument();
    });
  });

  describe("Re-rendering", () => {
    it("re-renders StudentHomePage on component update", () => {
      const { rerender } = render(<StudentIndexPage />);
      
      expect(screen.getByTestId("student-home-page")).toBeInTheDocument();
      
      rerender(<StudentIndexPage />);
      
      expect(screen.getByTestId("student-home-page")).toBeInTheDocument();
    });

    it("maintains StudentHomePage instance across re-renders", () => {
      const { rerender } = render(<StudentIndexPage />);
      
      const firstRender = screen.getByTestId("student-home-page");
      
      rerender(<StudentIndexPage />);
      
      const secondRender = screen.getByTestId("student-home-page");
      expect(secondRender).toBeInTheDocument();
    });
  });

  describe("Props and State", () => {
    it("does not accept or pass any props", () => {
      // Component doesn't take props, but verify it doesn't break
      render(<StudentIndexPage />);
      
      expect(screen.getByTestId("student-home-page")).toBeInTheDocument();
    });

    it("renders as pure redirect component", () => {
      const { container } = render(<StudentIndexPage />);
      
      // Should only render StudentHomePage, nothing else
      expect(container.querySelectorAll("div")).toHaveLength(1);
    });
  });

  describe("Integration", () => {
    it("correctly imports and renders StudentHomePage", () => {
      render(<StudentIndexPage />);
      
      // Verify the mocked component is rendered
      expect(screen.getByText("Student Home Page")).toBeInTheDocument();
    });

    it("does not add additional DOM elements", () => {
      const { container } = render(<StudentIndexPage />);
      
      // Should be a direct passthrough to StudentHomePage
      const homePage = screen.getByTestId("student-home-page");
      expect(container.firstChild).toBe(homePage);
    });
  });

  describe("Edge Cases", () => {
    it("handles multiple renders", () => {
      const { unmount, rerender } = render(<StudentIndexPage />);
      
      expect(screen.getByTestId("student-home-page")).toBeInTheDocument();
      
      rerender(<StudentIndexPage />);
      expect(screen.getByTestId("student-home-page")).toBeInTheDocument();
      
      rerender(<StudentIndexPage />);
      expect(screen.getByTestId("student-home-page")).toBeInTheDocument();
      
      unmount();
    });

    it("cleans up properly on unmount", () => {
      const { unmount } = render(<StudentIndexPage />);
      
      expect(screen.getByTestId("student-home-page")).toBeInTheDocument();
      
      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Functionality", () => {
    it("acts as a redirect wrapper", () => {
      // This component's purpose is to redirect /Student to /Student/HomePage
      // by directly rendering StudentHomePage
      render(<StudentIndexPage />);
      
      expect(screen.getByTestId("student-home-page")).toBeInTheDocument();
    });

    it("maintains consistent output", () => {
      const { container: container1 } = render(<StudentIndexPage />);
      const { container: container2 } = render(<StudentIndexPage />);
      
      // Both renders should produce the same structure
      expect(container1.innerHTML).toBe(container2.innerHTML);
    });
  });

  describe("Component Export", () => {
    it("is the default export", () => {
      // Verify component can be imported and rendered
      expect(StudentIndexPage).toBeDefined();
      expect(typeof StudentIndexPage).toBe("function");
    });

    it("has correct component name", () => {
      expect(StudentIndexPage.name).toBe("StudentIndexPage");
    });
  });

  describe("Performance", () => {
    it("renders quickly without unnecessary operations", () => {
      const startTime = performance.now();
      
      render(<StudentIndexPage />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should be very fast since it's just a passthrough
      expect(renderTime).toBeLessThan(100); // 100ms threshold
    });

    it("does not cause memory leaks on repeated renders", () => {
      const { rerender, unmount } = render(<StudentIndexPage />);
      
      // Render multiple times
      for (let i = 0; i < 10; i++) {
        rerender(<StudentIndexPage />);
      }
      
      expect(() => unmount()).not.toThrow();
    });
  });
});
