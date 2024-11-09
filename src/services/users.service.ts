import { db } from '../firebase';
import {
  collection,
  query,
  onSnapshot,
  where,
  updateDoc,
  doc,
  Timestamp,
  getDocs,
} from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userType: string;
  status: 'active' | 'suspended' | 'inactive';
  registrationDate: Date;
  lastLogin?: Date;
}

export const usersService = {
  subscribeToUsers(callback: (users: User[]) => void) {
    const usersRef = collection(db, 'users');

    return onSnapshot(usersRef, (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        registrationDate: doc.data().createdAt?.toDate() || new Date(),
        lastLogin: doc.data().lastLogin?.toDate(),
      })) as User[];

      callback(users);
    });
  },

  async getUsersByRole(role: string): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('userType', '==', role));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      registrationDate: doc.data().createdAt?.toDate() || new Date(),
      lastLogin: doc.data().lastLogin?.toDate(),
    })) as User[];
  },

  async updateUserStatus(
    userId: string,
    status: 'active' | 'suspended' | 'inactive'
  ) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  },

  async searchUsers(searchTerm: string): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    const searchTermLower = searchTerm.toLowerCase();

    return snapshot.docs
      .map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            registrationDate: doc.data().createdAt?.toDate() || new Date(),
            lastLogin: doc.data().lastLogin?.toDate(),
          }) as User
      )
      .filter((user) => {
        // Safely handle potentially undefined values
        const firstName = user.firstName?.toLowerCase() || '';
        const lastName = user.lastName?.toLowerCase() || '';
        const email = (user.email || '').toLowerCase();

        const searchString = `${firstName} ${lastName} ${email}`;
        return searchString.includes(searchTermLower);
      });
  },
};
