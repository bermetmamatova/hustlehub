import { render, screen, waitFor } from '@testing-library/react';
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
                title: 'Mock Question',
                difficulty: 'Easy',
                companies: ['Google'],
                link: 'https://leetcode.com/mock-question',
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

test('displays a recommended question', async () => {
  render(<WrappedPracticePage />);

  const questionText = await screen.findByText((content) =>
    content.toLowerCase().includes('mock question')
  );

  expect(questionText).toBeInTheDocument();
});
