import { render, screen, waitFor, act } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import PracticePage from '../PracticePage';
import { BrowserRouter } from 'react-router-dom';
import { fireEvent } from '@testing-library/react';


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
    getDoc: vi.fn(async (ref: any) => ({
      exists: () => true,
      data: () => ({
        date: '2000-01-01',
        list: [],
        completed: [],
        role: 'Backend',
        learningHours: 3,
        companies: ['Google'],
      }),
    })),
    getDocs: vi.fn(async (ref: any) => ({
      docs: [
        {
          id: 'q1',
          data: () => ({
            title: 'Mock Question',
            difficulty: 'Easy',
            companies: ['Google'],
            link: 'https://leetcode.com/mock-question',
          }),
        },
      ],
    })),
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

test('renders recommended question', async () => {
  render(<WrappedPracticePage />);
  const question = await screen.findByText(/mock question/i);
  expect(question).toBeInTheDocument();
});
