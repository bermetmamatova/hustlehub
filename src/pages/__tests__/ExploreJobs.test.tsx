import { render, screen, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import ExploreJobs from '../ExploreJobs';
import { BrowserRouter } from 'react-router-dom';


vi.mock('../../lib/firebase', async () => {
  const original = await vi.importActual<typeof import('../../lib/firebase')>('../../lib/firebase');
  return {
    ...original,
    auth: {
      currentUser: {
        uid: 'test-user',
        displayName: 'Test User',
        email: 'test@example.com',
      },
    },
    db: {},
    getUserProfile: vi.fn(async () => ({
      location: 'Germany',
      learningHours: 3,
    })),
  };
});


vi.mock('firebase/firestore', async () => {
  const original = await vi.importActual<typeof import('firebase/firestore')>('firebase/firestore');

  return {
    ...original,
    getDoc: vi.fn(async () => ({
      exists: () => true,
      data: () => ({ todoJobs: [] }),
    })),
    getDocs: vi.fn(async () => ({
      docs: [],
    })),
    setDoc: vi.fn(),
    doc: vi.fn((_, ...rest) => rest.join('/')),
    collection: vi.fn((_, col) => col),
    Timestamp: {
      now: () => new Date(),
    },
  };
});

vi.mock('../../api/JobsAPI', () => ({
  fetchJobs: vi.fn(async () => [
    {
      job_id: 'j1',
      job_title: 'Backend Developer',
      employer_name: 'Mock Corp',
      job_city: 'Berlin',
      job_country: 'Germany',
      job_apply_link: 'https://mockcorp.com/apply',
    },
  ]),
}));

function WrappedExploreJobs() {
  return (
    <BrowserRouter>
      <ExploreJobs />
    </BrowserRouter>
  );
}


test('displays fetched jobs in the Available Jobs section', async () => {
    render(<WrappedExploreJobs />);
  
    const jobCard = await screen.findByText(/backend developer/i);
    expect(jobCard).toBeInTheDocument();
  
    expect(screen.getByText(/mock corp/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view job/i })).toHaveAttribute(
      'href',
      'https://mockcorp.com/apply'
    );
  });
  