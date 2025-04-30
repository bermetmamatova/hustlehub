import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, test, expect } from 'vitest';
import CommunityPage from '../CommunityPage';
import { BrowserRouter } from 'react-router-dom';

function WrappedCommunityPage() {
  return (
    <BrowserRouter>
      <CommunityPage />
    </BrowserRouter>
  );
}

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
  const mockAddDoc = vi.fn();
  (globalThis as any).mockAddDoc = mockAddDoc;

  return {
    ...original,
    addDoc: mockAddDoc,
    onSnapshot: (query: any, onSuccess: any) => {
      onSuccess({
        forEach: (callback: any) => {},
      });
      return () => {};
    },
    collection: vi.fn(),
    orderBy: vi.fn(),
    doc: vi.fn(),
    serverTimestamp: () => new Date(),
    Timestamp: {
      fromDate: (date: Date) => ({ toDate: () => date }),
    },
  };
});

test('allows user to post a new community experience', async () => {
    render(<WrappedCommunityPage />);
  
    const locationInputs = screen.getAllByPlaceholderText(/location/i);
    fireEvent.change(locationInputs[0], { target: { value: 'Berlin' } });
  
    const levelInputs = screen.getAllByPlaceholderText(/level/i);
    fireEvent.change(levelInputs[0], { target: { value: 'Junior' } });
  
    const companyInputs = screen.getAllByPlaceholderText(/company/i);
    fireEvent.change(companyInputs[0], { target: { value: 'Amazon' } });
  
    const positionInputs = screen.getAllByPlaceholderText(/position/i);
    fireEvent.change(positionInputs[0], { target: { value: 'Backend Engineer' } });
  
    fireEvent.change(
      screen.getByPlaceholderText(/describe your interview experience/i),
      { target: { value: 'Insightful and tough!' } }
    );
  
    const postBtn = screen.getByRole('button', { name: /post experience/i });
    fireEvent.click(postBtn);
  
    await waitFor(() => {
      expect((globalThis as any).mockAddDoc).toHaveBeenCalled();
    });
  });
  