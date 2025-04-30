import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, test, beforeAll, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import CommunityPage from "../CommunityPage";
import { auth } from "../../lib/firebase"; 


beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});


vi.mock("../../lib/firebase", async () => {
  const original = await vi.importActual<typeof import("../../lib/firebase")>("../../lib/firebase");

  return {
    ...original,
    auth: {
      currentUser: { uid: "mock-user", displayName: "Mock User" },
      signOut: vi.fn(), 
    },
    db: {}, 
  };
});


vi.mock("firebase/firestore", async () => {
  const original = await vi.importActual<typeof import("firebase/firestore")>("firebase/firestore");

  return {
    ...original,
    collection: vi.fn(),
    onSnapshot: (query: any, onSuccess: any) => {
      onSuccess({
        forEach: (callback: any) => {
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
    expect(auth.signOut).toHaveBeenCalledTimes(1); 
  });
});
