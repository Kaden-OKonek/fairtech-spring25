import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// Mock the firebase hooks
jest.mock('react-firebase-hooks/auth', () => ({
  useAuthState: jest.fn(),
}));

// Import the mocked module
import { useAuthState } from 'react-firebase-hooks/auth';

// Mock Firebase
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}));

// Mock the Firebase app
jest.mock('./firebase', () => ({
  auth: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

// Mock useNavigate
const mockedUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate,
}));

// Type assertion for mocked useAuthState
const mockedUseAuthState = useAuthState as jest.MockedFunction<
  typeof useAuthState
>;

// Helper function to render the App with Router
const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
};

describe('App', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockedUseAuthState.mockReturnValue([null, false, undefined]);
    mockedUseNavigate.mockReset();
  });

  test('renders landing page when not authenticated', async () => {
    renderWithRouter(<App />);
    await waitFor(() => {
      expect(
        screen.getByText('Welcome to Southern Minnesota Science Fair!')
      ).toBeInTheDocument();
      expect(
        screen.getByAltText('Southern MN Science Fair Logo')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Why use the Southern Minnesota Science Fair Platform?'
        )
      ).toBeInTheDocument();
    });
  });

  test('renders loading state', async () => {
    mockedUseAuthState.mockReturnValue([null, true, undefined]);
    renderWithRouter(<App />);
    await waitFor(() => {
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  test('renders error state', async () => {
    mockedUseAuthState.mockReturnValue([null, false, new Error('Test error')]);
    renderWithRouter(<App />);
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
