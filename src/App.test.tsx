import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import { mockAuthContext } from './setupTests';

// Mock AuthContext
jest.mock('./contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('App', () => {
  const renderApp = (route = '/') => {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('renders landing page for unauthenticated users', () => {
    renderApp();
    expect(
      screen.getByText(/Welcome to Southern Minnesota Science Fair!/i)
    ).toBeInTheDocument();
  });

  it('shows appropriate content for authenticated users', () => {
    // Override the mock for this specific test
    jest
      .spyOn(require('./contexts/AuthContext'), 'useAuth')
      .mockImplementation(() => ({
        ...mockAuthContext,
        authStatus: {
          ...mockAuthContext.authStatus,
          state: 'COMPLETE',
          role: 'student',
          user: {
            uid: '123',
            email: 'test@test.com',
            emailVerified: true,
          },
        },
      }));
  });
});
