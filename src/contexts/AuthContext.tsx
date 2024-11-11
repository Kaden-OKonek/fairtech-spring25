import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  User,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  getAuth,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, functions } from '../firebase';
import {
  AuthStatus,
  UserState,
  UserRole,
  UserProfile,
  AuthContextType,
} from '../types/auth.types';
import { httpsCallable } from 'firebase/functions';

const initialAuthStatus: AuthStatus = {
  state: UserState.UNAUTHENTICATED,
  role: null,
  isLoading: true,
  error: null,
  user: null,
  metadata: {},
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>(initialAuthStatus);

  const determineUserState = (user: User | null, metadata?: any): UserState => {
    if (!user) return UserState.UNAUTHENTICATED;
    if (!user.emailVerified) return UserState.UNVERIFIED;
    if (!metadata?.userType) return UserState.UNREGISTERED;
    if (!metadata?.registrationComplete) return UserState.INCOMPLETE;
    return UserState.COMPLETE;
  };

  const updateAuthStatus = useCallback(async (user: User | null) => {
    try {
      if (!user) {
        setAuthStatus({
          ...initialAuthStatus,
          isLoading: false,
        });
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const metadata = userDoc.exists() ? userDoc.data() : {};

      setAuthStatus({
        state: determineUserState(user, metadata),
        role: metadata?.userType || null,
        isLoading: false,
        error: null,
        user: {
          uid: user.uid,
          email: user.email!,
          emailVerified: user.emailVerified,
        },
        metadata,
      });
    } catch (error) {
      setAuthStatus((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to fetch user status',
      }));
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, updateAuthStatus);
    return () => unsubscribe();
  }, [updateAuthStatus]);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await updateAuthStatus(result.user);
    } catch (error) {
      throw new Error('Authentication failed');
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (password.length < 6) {
        throw new Error('Password should be at least 6 characters');
      }

      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Send email verification
      await sendEmailVerification(result.user);

      // Create initial user document
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
      });

      await updateAuthStatus(result.user);
    } catch (error: any) {
      console.error('Signup error:', error);

      // Handle specific Firebase auth errors
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Email already in use');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error(
          'Email/password accounts are not enabled. Please contact support.'
        );
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak');
      }

      // If it's not a known error, throw the original
      throw error;
    }
  };

  const logOut = async () => {
    try {
      setAuthStatus((prev) => ({ ...prev, isLoading: true }));
      await signOut(auth);
      setAuthStatus({
        ...initialAuthStatus,
        isLoading: false,
      });
    } catch (error) {
      setAuthStatus((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Logout failed',
      }));
    }
  };

  const setUserRole = async (role: UserRole) => {
    if (!authStatus.user?.uid) throw new Error('No authenticated user');

    await setDoc(
      doc(db, 'users', authStatus.user.uid),
      {
        userType: role,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    await updateAuthStatus(auth.currentUser);
  };

  const completeRegistration = async (userData: Partial<UserProfile>) => {
    if (!authStatus.user?.uid) throw new Error('No authenticated user');

    try {
      const userRef = doc(db, 'users', authStatus.user.uid);
      const now = new Date();

      // Create unified user document with role-specific data
      const registrationData = {
        ...userData,
        email: authStatus.user.email,
        registrationComplete: true,
        registrationCompletedAt: now,
        updatedAt: now,
        status: 'active',
      };

      // Update user document
      await setDoc(userRef, registrationData, { merge: true });

      await updateAuthStatus(auth.currentUser);
    } catch (error) {
      console.error('Error completing registration:', error);
      throw new Error('Failed to complete registration');
    }
  };

  const checkSuperAdmin = useCallback(async () => {
    const auth = getAuth();
    if (!auth.currentUser) return false;

    try {
      const checkSuperAdminFunc = httpsCallable(
        functions,
        'checkSuperAdminStatus'
      );
      const result = await checkSuperAdminFunc();
      return (result.data as { isSuperAdmin: boolean }).isSuperAdmin;
    } catch (error) {
      console.error('Error checking super admin status:', error);
      return false;
    }
  }, []);

  const value: AuthContextType = {
    authStatus,
    signIn,
    signUp,
    logOut,
    setUserRole,
    completeRegistration,
    checkSuperAdmin,
    refreshStatus: () => updateAuthStatus(auth.currentUser),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
