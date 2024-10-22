import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

interface UserData {
  firstName: string;
}

export const useUserData = () => {
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const fetchUserData = async (user: User) => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as UserData;
          setUserName(userData.firstName);
        } else {
          // If no custom user data exists, fallback to 'Student'
          setUserName('Student');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Error fetching user data');
        // Fallback to 'Student if there's an error
        setUserName('Student');
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user);
      } else {
        setUserName('');
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { userName, isLoading, error };
};
