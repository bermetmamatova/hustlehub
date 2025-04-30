import { render, screen, waitFor } from '@testing-library/react';
import { vi, test, expect } from 'vitest';
import CommunityPage from '../CommunityPage';
import { BrowserRouter } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';

vi.mock('../../lib/firebase', async () => {
  const original = await vi.importActual<typeof import('../../lib/firebase')>('../../lib/firebase');
  return {
    ...original,
    auth: { currentUser: { uid: 'test-user', displayName: 'Test User' } },
    db: {},
  };
});

vi.mock('firebase/firestore', async () => {
  const original = await vi.importActual<typeof import('firebase/firestore')>('firebase/firestore');

  return {
    ...original,
    onSnapshot: (query: any, onSuccess: any) => {
      const mockPosts = [
        {
          id: 'post1',
          username: 'John Doe',
          userId: 'user123',
          location: 'Berlin',
          jobLevel: 'Senior',
          company: 'Google',
          position: 'SWE',
          experienceText: 'Great experience with tough questions.',
          createdAt: Timestamp.fromDate(new Date()),
          likes: 3,
          likedBy: [],
        },
      ];

      onSuccess({
        forEach: (callback: any) => {
          mockPosts.forEach((post) => callback({ id: post.id, data: () => post }));
        },
      });

      return () => {};
    },
    query: vi.fn(),
    collection: vi.fn(),
    orderBy: vi.fn(),
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

test('displays community posts after loading', async () => {
  render(<WrappedCommunityPage />);

  await waitFor(() => {
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/great experience/i)).toBeInTheDocument();
    expect(screen.getByText(/Berlin/i)).toBeInTheDocument();
    expect(screen.getByText(/Senior/i)).toBeInTheDocument();
    expect(screen.getByText(/Google/i)).toBeInTheDocument();
    expect(screen.getByText(/SWE/i)).toBeInTheDocument();
  });
});