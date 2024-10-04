import React from 'react';

import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login and signup tabs', () => {
  render(<App />);
  const loginTab = screen.getByRole('tab', { name: /login/i });
  const signupTab = screen.getByRole('tab', { name: /sign up/i });
  expect(loginTab).toBeInTheDocument();
  expect(signupTab).toBeInTheDocument();
});

test('renders email and password fields', () => {
  render(<App />);
  const emailField = screen.getByLabelText(/email/i);
  const passwordField = screen.getByLabelText(/password/i);
  expect(emailField).toBeInTheDocument();
  expect(passwordField).toBeInTheDocument();
});

test('renders login button', () => {
  render(<App />);
  const loginButton = screen.getByRole('button', { name: /login/i });
  expect(loginButton).toBeInTheDocument();
});
