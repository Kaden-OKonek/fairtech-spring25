import { db } from '../firebase';
import {
  collection,
  query,
  getDocs,
  where,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { Student } from '../types/student.types';
import { FormSubmission, FormStatus } from '../types/forms.types';

// Type for the form statistics accumulator
interface FormStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  needs_revision: number;
  [key: string]: number; // Index signature for dynamic access
}

const convertTimestampToDate = (timestamp: Timestamp | Date | undefined) => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
};

// Helper function to safely get form status
const getFormStatus = (status: any): FormStatus => {
  const validStatuses: FormStatus[] = [
    'pending',
    'approved',
    'rejected',
    'needs_revision',
  ];
  return validStatuses.includes(status) ? status : 'pending';
};

export const studentsService = {
  async getAllStudents(): Promise<Student[]> {
    const studentsRef = collection(db, 'students');
    const snapshot = await getDocs(studentsRef);

    const students = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const userData = doc.data();

        // Get forms stats
        const formsRef = collection(db, 'forms');
        const formsQuery = query(formsRef, where('studentId', '==', doc.id));
        const formsSnapshot = await getDocs(formsQuery);

        const formStats = formsSnapshot.docs.reduce<FormStats>(
          (acc, form) => {
            const status = getFormStatus(form.data().status);
            acc.total++;
            acc[status]++;
            return acc;
          },
          {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            needs_revision: 0,
          }
        );

        return {
          id: doc.id,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          school: userData.school || '',
          grade: userData.grade || 0,
          status: userData.status || 'active',
          registrationDate: convertTimestampToDate(
            userData.registrationCompletedAt || userData.createdAt
          ),
          formSubmissions: formStats,
        } as unknown as Student;
      })
    );

    return students;
  },

  subscribeToStudents(callback: (students: Student[]) => void) {
    const studentsRef = collection(db, 'users');
    const q = query(studentsRef, where('userType', '==', 'student'));

    return onSnapshot(q, async (snapshot) => {
      const students = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const userData = doc.data();

          const formsRef = collection(db, 'forms');
          const formsQuery = query(
            formsRef,
            where('studentId', '==', doc.id) // Filter forms by student ID
          );
          const formsSnapshot = await getDocs(formsQuery);

          const formStats = formsSnapshot.docs.reduce<FormStats>(
            (acc, form) => {
              const status = getFormStatus(form.data().status);
              acc.total++;
              acc[status]++;
              return acc;
            },
            {
              total: 0,
              pending: 0,
              approved: 0,
              rejected: 0,
              needs_revision: 0,
            }
          );

          return {
            id: doc.id,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            school: userData.school || '',
            grade: userData.grade || 0,
            status: userData.status || 'active',
            registrationDate: convertTimestampToDate(
              userData.registrationCompletedAt || userData.createdAt
            ),
            formSubmissions: formStats,
          } as unknown as Student;
        })
      );

      callback(students);
    });
  },

  async getStudentForms(studentId: string): Promise<FormSubmission[]> {
    const formsRef = collection(db, 'forms');
    const q = query(formsRef, where('studentId', '==', studentId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        uploadDate: convertTimestampToDate(data.uploadDate),
        lastUpdated: convertTimestampToDate(data.lastUpdated),
      } as FormSubmission;
    });
  },
};
