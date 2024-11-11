import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock for AuthContext
jest.mock('./contexts/AuthContext', () => ({
  useAuth: () => ({
    authStatus: {
      state: 'UNAUTHENTICATED',
      role: null,
      isLoading: false,
      error: null,
      user: null,
      metadata: {},
    },
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock for ThemeProvider
jest.mock('./theme/ThemeProvider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('App', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const renderApp = (route = '/') => {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );
  };

  describe('Landing Page', () => {
    it('shows important sections', () => {
      renderApp();
      expect(screen.getByText(/Why Use Our Platform?/i)).toBeInTheDocument();
      expect(screen.getByText(/Ready to Get Started?/i)).toBeInTheDocument();
    });

    it('displays feature cards', () => {
      renderApp();
      expect(screen.getByText(/Easy Registration/i)).toBeInTheDocument();
      expect(screen.getByText(/Project Management/i)).toBeInTheDocument();
      expect(screen.getByText(/Fair Day Support/i)).toBeInTheDocument();
    });
  });

  describe('Authentication Flow', () => {
    it('shows student dashboard for authenticated students', () => {
      // Override the mock for this specific test
      jest
        .spyOn(require('./contexts/AuthContext'), 'useAuth')
        .mockImplementation(() => ({
          authStatus: {
            state: 'COMPLETE',
            role: 'student',
            isLoading: false,
            error: null,
            user: {
              uid: '123',
              email: 'test@test.com',
              emailVerified: true,
            },
            metadata: {},
          },
        }));
      renderApp();
      // Add assertions for student dashboard
    });
  });
});
