// src/pages/__tests__/LogoutButtonCommunity.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, test, beforeAll, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import CommunityPage from "../CommunityPage";
import { auth } from "../../lib/firebase"; // ✅ correct import!

// Fake ResizeObserver for recharts or framer-motion
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// 🛠 Full mock firebase/auth + db
vi.mock("../../lib/firebase", async () => {
  const original = await vi.importActual<typeof import("../../lib/firebase")>("../../lib/firebase");

  return {
    ...original,
    auth: {
      currentUser: { uid: "mock-user", displayName: "Mock User" },
      signOut: vi.fn(), // 🔥 important
    },
    db: {}, // dummy
  };
});

// 🛠 Mock firebase/firestore
vi.mock("firebase/firestore", async () => {
  const original = await vi.importActual<typeof import("firebase/firestore")>("firebase/firestore");

  return {
    ...original,
    collection: vi.fn(),
    onSnapshot: (query: any, onSuccess: any) => {
      onSuccess({
        forEach: (callback: any) => {
          // Simulate empty posts
        },
      });
      return () => {};
    },
    orderBy: vi.fn(),
    query: vi.fn(),
    doc: vi.fn(),
    serverTimestamp: () => new Date(),
    Timestamp: {
      fromDate: (date: Date) => ({ toDate: () => date }),
    },
  };
});

function WrappedCommunityPage() {
  return (
    <BrowserRouter>
      <CommunityPage />
    </BrowserRouter>
  );
}

test("allows user to logout from Community Page", async () => {
  render(<WrappedCommunityPage />);

  const logoutButton = await screen.findByRole("button", { name: /log out/i });
  expect(logoutButton).toBeInTheDocument();

  fireEvent.click(logoutButton);

  await waitFor(() => {
    expect(auth.signOut).toHaveBeenCalledTimes(1); // ✅ Correct use now!
  });
});
