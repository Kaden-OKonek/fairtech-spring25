import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  arrayUnion,
  increment,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import {
  FormSubmission,
  ReviewStatus,
  ReviewerRole,
  FormVersion,
} from '../types/forms.types';

interface ReviewerData {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: ReviewerRole;
  assignedAt: Date;
  status: 'pending' | 'completed';
  completedAt?: Date;
}

export const formsService = {
  // Subscribe to forms with realtime updates
  subscribeToForms(
    userId: string,
    role: string,
    callback: (forms: FormSubmission[]) => void
  ) {
    const formsRef = collection(db, 'forms');
    let q = query(formsRef, orderBy('updatedAt', 'desc')); // Default query

    // Different queries based on user role
    if (role === 'student') {
      q = query(
        formsRef,
        where('studentId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
    } // Admin users will see all forms (default query)

    return onSnapshot(q, (snapshot) => {
      const forms = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          uploadDate: data.uploadDate.toDate(),
          lastUpdated: data.lastUpdated.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          versions: data.versions.map((version: any) => ({
            ...version,
            uploadedAt: version.uploadedAt.toDate(),
            reviews: version.reviews.map((review: any) => ({
              ...review,
              timestamp: review.timestamp.toDate(),
            })),
          })),
        } as FormSubmission;
      });

      callback(forms);
    });
  },

  // Submit a new form
  async submitNewForm(
    studentId: string,
    studentName: string,
    title: string,
    file: File,
    formType: string
  ): Promise<string> {
    try {
      // 1. Upload file to storage
      const timestamp = new Date();
      const storageRef = ref(
        storage,
        `forms/${studentId}/${timestamp.getTime()}_${file.name}`
      );
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // 2. Create form document
      const newVersion: FormVersion = {
        versionNumber: 1,
        fileUrl: downloadURL,
        uploadedAt: timestamp,
        uploadedBy: studentId,
        reviews: [],
        status: 'pending',
      };

      const newForm: Omit<FormSubmission, 'id'> = {
        studentId,
        studentName,
        title,
        fileName: file.name,
        uploadDate: timestamp,
        lastUpdated: timestamp,
        currentVersion: 0,
        versions: [newVersion],
        reviewers: [],
        createdAt: timestamp,
        updatedAt: timestamp,
        status: 'pending',
        formType,
      };

      const docRef = await addDoc(collection(db, 'forms'), {
        ...newForm,
        uploadDate: Timestamp.fromDate(timestamp),
        lastUpdated: Timestamp.fromDate(timestamp),
        createdAt: Timestamp.fromDate(timestamp),
        updatedAt: Timestamp.fromDate(timestamp),
        versions: [
          {
            ...newVersion,
            uploadedAt: Timestamp.fromDate(timestamp),
          },
        ],
      });

      return docRef.id;
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    }
  },

  // Upload a new version
  async uploadNewVersion(
    formId: string,
    file: File,
    studentId: string
  ): Promise<void> {
    try {
      const formRef = doc(db, 'forms', formId);
      const formDoc = await getDoc(formRef);

      if (!formDoc.exists()) {
        throw new Error('Form not found');
      }

      const form = formDoc.data() as FormSubmission;
      const newVersionNumber = form.versions.length + 1;
      const timestamp = new Date();

      // 1. Upload new file version
      const storageRef = ref(
        storage,
        `forms/${studentId}/${timestamp.getTime()}_v${newVersionNumber}_${file.name}`
      );
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // 2. Create new version object
      const newVersion: FormVersion = {
        versionNumber: newVersionNumber,
        fileUrl: downloadURL,
        uploadedAt: timestamp,
        uploadedBy: studentId,
        reviews: [],
        status: 'pending',
      };

      // 3. Update form document
      await updateDoc(formRef, {
        versions: arrayUnion({
          ...newVersion,
          uploadedAt: Timestamp.fromDate(timestamp),
        }),
        currentVersion: increment(1),
        status: 'pending',
        lastUpdated: Timestamp.fromDate(timestamp),
        updatedAt: Timestamp.fromDate(timestamp),
        fileName: file.name,
      });
    } catch (error) {
      console.error('Error uploading new version:', error);
      throw error;
    }
  },

  // Assign reviewer - only admin users can be assigned
  async assignReviewer(
    formId: string,
    reviewerId: string,
    role: ReviewerRole
  ): Promise<void> {
    try {
      // First verify that the reviewer is an admin
      const reviewerRef = doc(db, 'users', reviewerId);
      const reviewerDoc = await getDoc(reviewerRef);
      const reviewerData = reviewerDoc.data();

      if (!reviewerDoc.exists() || reviewerData?.userType !== 'admin') {
        throw new Error('Only admin users can be assigned as reviewers');
      }

      const formRef = doc(db, 'forms', formId);
      const timestamp = new Date();

      // Store more reviewer data upfront
      const newReviewer: ReviewerData = {
        userId: reviewerId,
        firstName: reviewerData.firstName || '',
        lastName: reviewerData.lastName || '',
        email: reviewerData.email || '',
        role,
        assignedAt: timestamp,
        status: 'pending',
      };

      await updateDoc(formRef, {
        reviewers: arrayUnion({
          ...newReviewer,
          assignedAt: Timestamp.fromDate(timestamp),
        }),
        updatedAt: Timestamp.fromDate(timestamp),
        lastUpdated: Timestamp.fromDate(timestamp),
        status: 'in_review',
      });
    } catch (error) {
      console.error('Error assigning reviewer:', error);
      throw error;
    }
  },

  // Submit review - only admin users can submit reviews
  async submitReview(
    formId: string,
    reviewerId: string,
    reviewerRole: ReviewerRole,
    status: ReviewStatus,
    comments: string
  ): Promise<void> {
    try {
      // Get reviewer data for the review
      const reviewerRef = doc(db, 'users', reviewerId);
      const reviewerDoc = await getDoc(reviewerRef);
      const reviewerData = reviewerDoc.data();

      if (!reviewerDoc.exists() || reviewerData?.userType !== 'admin') {
        throw new Error('Only admin users can submit reviews');
      }

      const formRef = doc(db, 'forms', formId);
      const formDoc = await getDoc(formRef);

      if (!formDoc.exists()) {
        throw new Error('Form not found');
      }

      const form = formDoc.data() as FormSubmission;
      const timestamp = new Date();
      const currentVersion = form.versions[form.currentVersion];

      // Add review with reviewer details
      currentVersion.reviews.push({
        reviewerId,
        reviewerName: `${reviewerData.firstName} ${reviewerData.lastName}`,
        reviewerEmail: reviewerData.email,
        timestamp,
        status,
        comments,
        role: reviewerRole,
      });

      // Update reviewer status
      const reviewerIndex = form.reviewers.findIndex(
        (r) => r.userId === reviewerId
      );
      if (reviewerIndex !== -1) {
        form.reviewers[reviewerIndex].status = 'completed';
        form.reviewers[reviewerIndex].completedAt = timestamp;
      }

      // Determine overall form status based on reviews
      let newStatus: ReviewStatus = status;
      if (form.reviewers.every((r) => r.status === 'completed')) {
        const allReviews = currentVersion.reviews;
        if (allReviews.some((r) => r.status === 'rejected')) {
          newStatus = 'rejected';
        } else if (allReviews.some((r) => r.status === 'needs_revision')) {
          newStatus = 'needs_revision';
        } else if (allReviews.every((r) => r.status === 'approved')) {
          newStatus = 'approved';
        }
      } else {
        newStatus = 'in_review';
      }

      // Update form
      await updateDoc(formRef, {
        versions: form.versions.map((version) => ({
          ...version,
          reviews: version.reviews.map((review) => ({
            ...review,
            timestamp:
              review.timestamp instanceof Date
                ? Timestamp.fromDate(review.timestamp)
                : review.timestamp,
          })),
        })),
        reviewers: form.reviewers.map((reviewer) => ({
          ...reviewer,
          assignedAt:
            reviewer.assignedAt instanceof Date
              ? Timestamp.fromDate(reviewer.assignedAt)
              : reviewer.assignedAt,
          completedAt:
            reviewer.completedAt instanceof Date
              ? Timestamp.fromDate(reviewer.completedAt)
              : reviewer.completedAt,
        })),
        status: newStatus,
        updatedAt: Timestamp.fromDate(timestamp),
        lastUpdated: Timestamp.fromDate(timestamp),
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  },
};
