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

	test('renders login and signup tabs when not authenticated', async () => {
		renderWithRouter(<App />);
		await waitFor(() => {
			const loginTab = screen.getByRole('tab', { name: /login/i });
			const signupTab = screen.getByRole('tab', { name: /sign up/i });
			expect(loginTab).toBeInTheDocument();
			expect(signupTab).toBeInTheDocument();
		});
	});

	test('renders email and password fields when not authenticated', async () => {
		renderWithRouter(<App />);
		await waitFor(() => {
			const emailField = screen.getByLabelText(/email/i);
			const passwordField = screen.getByLabelText(/password/i);
			expect(emailField).toBeInTheDocument();
			expect(passwordField).toBeInTheDocument();
		});
	});

	test('renders login button when not authenticated', async () => {
		renderWithRouter(<App />);
		await waitFor(() => {
			const loginButton = screen.getByRole('button', { name: /login/i });
			expect(loginButton).toBeInTheDocument();
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
