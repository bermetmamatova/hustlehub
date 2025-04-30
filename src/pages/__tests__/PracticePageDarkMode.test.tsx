import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import PracticePage from "../PracticePage";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../lib/firebase", async () => {
  const actual = await vi.importActual<typeof import("../../lib/firebase")>("../../lib/firebase");
  return {
    ...actual,
    auth: { currentUser: { uid: "test-user", displayName: "Test User" } },
    db: {},
  };
});

vi.mock("firebase/firestore", async () => {
  const actual = await vi.importActual<typeof import("firebase/firestore")>("firebase/firestore");
  return {
    ...actual,
    collection: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(() =>
      Promise.resolve({
        data: () => ({
          role: "developer",
          learningHours: 2,
          companies: ["Amazon"],
        }),
      })
    ),
    getDocs: vi.fn(() =>
      Promise.resolve({
        docs: [
          { id: "mockQuestion1", data: () => ({ title: "Mock Question 1" }) },
          { id: "mockQuestion2", data: () => ({ title: "Mock Question 2" }) },
        ],
        forEach(callback: any) {
          this.docs.forEach(callback);
        },
      })
    ),
  };
});

function WrappedPracticePage() {
  return (
    <BrowserRouter>
      <PracticePage />
    </BrowserRouter>
  );
}

describe("PracticePage Dark Mode Toggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should toggle dark mode when clicking the dark mode button", async () => {
    render(<WrappedPracticePage />);

    await screen.findByText(/Welcome back, Test User/i);

    const darkModeButton = await screen.findByRole("button", { name: /switch to dark mode/i });
    expect(darkModeButton).toBeInTheDocument();


    fireEvent.click(darkModeButton);


    await waitFor(() => {
      expect(screen.getByRole("button", { name: /switch to light mode/i })).toBeInTheDocument();
    });


    fireEvent.click(screen.getByRole("button", { name: /switch to light mode/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /switch to dark mode/i })).toBeInTheDocument();
    });
  });
});
