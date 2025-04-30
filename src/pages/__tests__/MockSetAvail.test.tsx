import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, test, expect } from 'vitest';
import MockConnectPage from '../MockConnectPage';
import { BrowserRouter } from 'react-router-dom';

function WrappedMockConnectPage() {
  return (
    <BrowserRouter>
      <MockConnectPage />
    </BrowserRouter>
  );
}

vi.mock('../../lib/firebase', async () => {
  const original = await vi.importActual<typeof import('../../lib/firebase')>('../../lib/firebase');
  return {
    ...original,
    auth: { currentUser: { uid: 'test-user', displayName: 'Test User', email: 'test@example.com' } },
    db: {},
  };
});

vi.mock('firebase/firestore', async () => {
  const original = await vi.importActual<typeof import('firebase/firestore')>('firebase/firestore');
  const addDoc = vi.fn();

  (globalThis as any).mockAddDoc = addDoc;

  return {
    ...original,
    addDoc,
    getDocs: vi.fn(() => Promise.resolve({
      docs: [],
    })),
    collection: vi.fn(),
    doc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    deleteDoc: vi.fn(),
    updateDoc: vi.fn(),
    Timestamp: {
      now: () => new Date(),
    },
  };
});

test('allows user to set availability and shows it below', async () => {
  render(<WrappedMockConnectPage />);

  fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'Test User' } });
  fireEvent.change(screen.getByPlaceholderText(/target company/i), { target: { value: 'Google' } });
  fireEvent.change(screen.getByDisplayValue('CET'), { target: { value: 'IST' } });

  const dateInputs = screen.getAllByDisplayValue('');
  fireEvent.change(dateInputs[0], { target: { value: '2024-12-31' } }); 
  fireEvent.change(dateInputs[1], { target: { value: '15:00' } }); 

  const addButton = screen.getByRole('button', { name: '' }); 
  fireEvent.click(addButton);

  await waitFor(() => {
    expect((globalThis as any).mockAddDoc).toHaveBeenCalled();
  });
});