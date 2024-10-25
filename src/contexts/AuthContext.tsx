import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  AuthStatus,
  UserState,
  UserRole,
  UserProfile,
  AuthContextType,
} from '../types/auth.types';

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

  const updateAuthStatus = async (user: User | null) => {
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
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = onAuthStateChanged(auth, updateAuthStatus);
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      setAuthStatus((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to initialize auth listener',
      }));
    }

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

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
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await sendEmailVerification(result.user);
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await updateAuthStatus(result.user);
    } catch (error) {
      throw new Error('Registration failed');
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

      // Base registration data
      const registrationData = {
        ...userData,
        email: authStatus.user.email,
        registrationComplete: true,
        registrationCompletedAt: now,
        updatedAt: now,
        createdAt: userData.createdAt || now,
      };

      // Update main user profile
      await setDoc(userRef, registrationData, { merge: true });

      // Add to role-specific collection
      if (userData.userType === 'student') {
        const studentRef = doc(db, 'students', authStatus.user.uid);
        await setDoc(studentRef, registrationData);
      } else if (userData.userType === 'volunteer') {
        const volunteerRef = doc(db, 'volunteers', authStatus.user.uid);
        await setDoc(volunteerRef, registrationData);
      }

      await updateAuthStatus(auth.currentUser);
    } catch (error) {
      console.error('Error completing registration:', error);
      throw new Error('Failed to complete registration');
    }
  };

  const value: AuthContextType = {
    authStatus,
    signIn,
    signUp,
    logOut,
    setUserRole,
    completeRegistration,
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
