import { db } from '../firebase';
import {
  collection,
  query,
  getDocs,
  updateDoc,
  doc,
  where,
  onSnapshot,
  orderBy,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { FormSubmission } from '../types/forms.types';

export const formsService = {
  subscribeToForms(callback: (forms: FormSubmission[]) => void) {
    const formsRef = collection(db, 'forms');
    const q = query(formsRef, orderBy('uploadDate', 'desc'));

    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const forms = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            uploadDate: doc.data().uploadDate.toDate(),
            lastUpdated: doc.data().lastUpdated.toDate(),
          }) as FormSubmission
      );
      callback(forms);
    });
  },

  async getAllForms(): Promise<FormSubmission[]> {
    const formsRef = collection(db, 'forms');
    const formsSnapshot = await getDocs(formsRef);

    return formsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          uploadDate: doc.data().uploadDate.toDate(),
          lastUpdated: doc.data().lastUpdated.toDate(),
        }) as FormSubmission
    );
  },

  async getStudentForms(studentId: string): Promise<FormSubmission[]> {
    const formsRef = collection(db, 'forms');
    const q = query(formsRef, where('studentId', '==', studentId));
    const formsSnapshot = await getDocs(q);

    return formsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          uploadDate: doc.data().uploadDate.toDate(),
          lastUpdated: doc.data().lastUpdated.toDate(),
        }) as FormSubmission
    );
  },

  async updateFormStatus(
    formId: string,
    status: FormSubmission['status'],
    comments?: string
  ): Promise<void> {
    const formRef = doc(db, 'forms', formId);
    await updateDoc(formRef, {
      status,
      comments,
      lastUpdated: Timestamp.now(),
    });
  },
};
