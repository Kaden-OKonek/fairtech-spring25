import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

type UserType = 'student' | 'teacher' | 'judge' | 'volunteer' | null;

interface UserTypeContextType {
  userType: UserType;
  setUserType: React.Dispatch<React.SetStateAction<UserType>>;
  isRegistrationComplete: boolean;
  setIsRegistrationComplete: React.Dispatch<React.SetStateAction<boolean>>;
  checkRegistrationStatus: () => Promise<void>;
}

const UserTypeContext = createContext<UserTypeContextType | undefined>(
  undefined
);

export const UserTypeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userType, setUserType] = useState<UserType>(null);
  const [isRegistrationComplete, setIsRegistrationComplete] =
    useState<boolean>(false);
  const [user] = useAuthState(auth);

  const checkRegistrationStatus = useCallback(async () => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserType(userData.userType as UserType);
        setIsRegistrationComplete(!!userData.registrationComplete);
      } else {
        setUserType(null);
        setIsRegistrationComplete(false);
      }
    } else {
      setUserType(null);
      setIsRegistrationComplete(false);
    }
  }, [user]);

  useEffect(() => {
    checkRegistrationStatus();
  }, [checkRegistrationStatus]);

  return (
    <UserTypeContext.Provider
      value={{
        userType,
        setUserType,
        isRegistrationComplete,
        setIsRegistrationComplete,
        checkRegistrationStatus,
      }}
    >
      {children}
    </UserTypeContext.Provider>
  );
};

export const useUserType = () => {
  const context = useContext(UserTypeContext);
  if (context === undefined) {
    throw new Error('useUserType must be used within a UserTypeProvider');
  }
  return context;
};
