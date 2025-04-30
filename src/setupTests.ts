import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('react-confetti', () => ({
    default: () => null,
  }));
  