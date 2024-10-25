import '@testing-library/jest-dom';

// TextEncoder/Decoder polyfill (needed for Firebase)
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Minimal browser API mocks
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
});

// Simplified Firebase mocks
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
  })),
  onAuthStateChanged: jest.fn((auth, cb) => {
    cb(null);
    return jest.fn();
  }),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(),
}));

// Common test utilities
export const mockAuthContext = {
  authStatus: {
    isLoading: false,
    user: null,
    error: null,
    state: 'UNAUTHENTICATED',
    role: null,
    metadata: {},
  },
  signIn: jest.fn(),
  signUp: jest.fn(),
  logOut: jest.fn(),
  setUserRole: jest.fn(),
  completeRegistration: jest.fn(),
  refreshStatus: jest.fn(),
};
