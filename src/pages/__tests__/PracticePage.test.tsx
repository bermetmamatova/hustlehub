import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import PracticePage from '../PracticePage';
import { BrowserRouter } from 'react-router-dom';

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
    getDoc: vi.fn(async (ref: any) => {
      if (ref.includes('meta')) {
        return {
          exists: () => true,
          data: () => ({
            date: '2000-01-01',
            list: [],
            completed: [],
          }),
        };
      }

      return {
        exists: () => true,
        data: () => ({
          role: 'Backend',
          learningHours: 3,
          companies: ['Google'],
        }),
      };
    }),
    getDocs: vi.fn(async (ref: any) => {
      if (ref.includes('dsa_questions')) {
        return {
          docs: [
            {
              id: 'q1',
              data: () => ({
                title: 'Easy Question',
                difficulty: 'Easy',
                companies: ['Google'],
                link: 'https://leetcode.com/q1',
              }),
            },
            {
              id: 'q2',
              data: () => ({
                title: 'Medium Question',
                difficulty: 'Medium',
                companies: ['Google'],
                link: 'https://leetcode.com/q2',
              }),
            },
            {
              id: 'q3',
              data: () => ({
                title: 'Hard Question',
                difficulty: 'Hard',
                companies: ['Google'],
                link: 'https://leetcode.com/q3',
              }),
            },
          ],
        };
      }
      return { docs: [] };
    }),
    setDoc: vi.fn(),
    collection: vi.fn((_, col) => col),
    doc: vi.fn((_, ...rest) => rest.join('/')),
    Timestamp: {
      now: () => new Date(),
    },
  };
});

function WrappedPracticePage() {
  return (
    <BrowserRouter>
      <PracticePage />
    </BrowserRouter>
  );
}

test('filters questions by difficulty', async () => {
  render(<WrappedPracticePage />);
  const filter = await screen.findByRole('combobox');

  // Easy filter
  fireEvent.change(filter, { target: { value: 'Easy' } });
  expect(await screen.findByText(/easy question/i)).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.queryByText(/medium question/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/hard question/i)).not.toBeInTheDocument();
  });

  // Hard filter
  fireEvent.change(filter, { target: { value: 'Hard' } });
  expect(await screen.findByText(/hard question/i)).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.queryByText(/easy question/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/medium question/i)).not.toBeInTheDocument();
  });
});