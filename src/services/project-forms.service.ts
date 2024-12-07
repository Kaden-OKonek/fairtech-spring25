import { db, storage } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  Timestamp,
  onSnapshot,
  arrayUnion,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  FormSubmission,
  FormType,
  ProjectContext,
  ReviewStatus,
  ReviewerRole,
  FormVersion,
  Review,
} from '../types/forms.types';

const convertForm = (
  doc: QueryDocumentSnapshot<DocumentData>
): FormSubmission => {
  const data = doc.data();
  return {
    id: doc.id,
    studentId: data.studentId,
    studentName: data.studentName,
    title: data.title,
    fileName: data.fileName,
    formType: data.formType,
    projectContext: {
      ...data.projectContext,
      assignedAt: data.projectContext.assignedAt.toDate(),
    },
    uploadDate: data.uploadDate.toDate(),
    lastUpdated: data.lastUpdated.toDate(),
    currentVersion: data.currentVersion,
    versions: data.versions.map((version: any) => ({
      ...version,
      uploadedAt: version.uploadedAt.toDate(),
      reviews: version.reviews.map((review: any) => ({
        ...review,
        timestamp: review.timestamp.toDate(),
      })),
    })),
    reviewers: data.reviewers.map((reviewer: any) => ({
      ...reviewer,
      assignedAt: reviewer.assignedAt.toDate(),
      completedAt: reviewer.completedAt?.toDate(),
    })),
    status: data.status,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    isRequired: data.isRequired || false,
  };
};

export const projectFormsService = {
  // Subscribe to forms for a project
  subscribeToProjectForms(
    projectId: string,
    callback: (forms: FormSubmission[]) => void
  ): () => void {
    const formsRef = collection(db, 'forms');
    const q = query(
      formsRef,
      where('projectContext.projectId', '==', projectId)
    );

    return onSnapshot(q, (snapshot) => {
      const forms = snapshot.docs.map(convertForm);
      callback(forms);
    });
  },

  // Upload a new form
  async uploadForm(
    projectContext: ProjectContext,
    file: File,
    formType: FormType,
    title: string,
    uploaderId: string,
    studentId: string,
    studentName: string,
    isRequired: boolean = false
  ): Promise<string> {
    const timestamp = new Date();
    const filePath = `projects/${projectContext.projectId}/forms/${timestamp.getTime()}_${file.name}`;
    const storageRef = ref(storage, filePath);

    // Upload file
    const uploadResult = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(uploadResult.ref);

    // Create initial version
    const initialVersion: FormVersion = {
      versionNumber: 1,
      fileUrl: downloadURL,
      uploadedAt: timestamp,
      uploadedBy: uploaderId,
      reviews: [],
      status: 'pending',
    };

    // Create form document
    const docRef = await addDoc(collection(db, 'forms'), {
      title,
      fileName: file.name,
      formType,
      projectContext: {
        ...projectContext,
        assignedAt: Timestamp.fromDate(timestamp),
      },
      uploadDate: Timestamp.fromDate(timestamp),
      lastUpdated: Timestamp.fromDate(timestamp),
      currentVersion: 0,
      versions: [
        {
          ...initialVersion,
          uploadedAt: Timestamp.fromDate(timestamp),
        },
      ],
      reviewers: [],
      status: 'pending',
      createdAt: Timestamp.fromDate(timestamp),
      updatedAt: Timestamp.fromDate(timestamp),
      studentId,
      studentName,
      isRequired,
    });

    return docRef.id;
  },

  // Upload a new version
  async uploadNewVersion(
    formId: string,
    file: File,
    uploaderId: string
  ): Promise<void> {
    const formRef = doc(db, 'forms', formId);
    const formDoc = await getDoc(formRef);

    if (!formDoc.exists()) throw new Error('Form not found');

    const form = convertForm(formDoc);
    const timestamp = new Date();
    const newVersionNumber = form.versions.length + 1;

    const filePath = `projects/${form.projectContext.projectId}/forms/${timestamp.getTime()}_v${newVersionNumber}_${file.name}`;
    const storageRef = ref(storage, filePath);

    const uploadResult = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(uploadResult.ref);

    const newVersion: FormVersion = {
      versionNumber: newVersionNumber,
      fileUrl: downloadURL,
      uploadedAt: timestamp,
      uploadedBy: uploaderId,
      reviews: [],
      status: 'pending',
    };

    await updateDoc(formRef, {
      versions: [
        ...form.versions,
        {
          ...newVersion,
          uploadedAt: Timestamp.fromDate(timestamp),
        },
      ],
      currentVersion: newVersionNumber - 1,
      status: 'pending',
      lastUpdated: Timestamp.fromDate(timestamp),
      updatedAt: Timestamp.fromDate(timestamp),
      fileName: file.name,
    });
  },

  // Assign a reviewer
  async assignReviewer(
    formId: string,
    reviewerId: string,
    reviewerName: string,
    role: ReviewerRole
  ): Promise<void> {
    const formRef = doc(db, 'forms', formId);
    const timestamp = new Date();

    await updateDoc(formRef, {
      reviewers: arrayUnion({
        userId: reviewerId,
        name: reviewerName,
        role,
        assignedAt: Timestamp.fromDate(timestamp),
        status: 'pending',
      }),
      status: 'in_review',
      updatedAt: Timestamp.fromDate(timestamp),
    });
  },

  // Submit a review
  async submitReview(
    formId: string,
    review: Omit<Review, 'timestamp'>,
    status: ReviewStatus
  ): Promise<void> {
    try {
      const formRef = doc(db, 'forms', formId);
      const formDoc = await getDoc(formRef);

      if (!formDoc.exists()) {
        throw new Error('Form not found');
      }

      const form = formDoc.data() as FormSubmission;
      const timestamp = new Date();

      // Create the complete review object
      const newReview = {
        ...review,
        timestamp,
      };

      // Get the current version's reviews and add the new one
      const updatedVersions = [...form.versions];
      updatedVersions[form.currentVersion] = {
        ...updatedVersions[form.currentVersion],
        reviews: [...updatedVersions[form.currentVersion].reviews, newReview],
        status: status, // Update version status
      };

      // Update reviewer status
      const updatedReviewers = form.reviewers.map((reviewer) =>
        reviewer.userId === review.reviewerId
          ? {
              ...reviewer,
              status: 'completed',
              completedAt: Timestamp.fromDate(timestamp),
            }
          : reviewer
      );

      // Update the form document
      await updateDoc(formRef, {
        versions: updatedVersions.map((version) => ({
          ...version,
          reviews: version.reviews.map((review) => ({
            ...review,
            timestamp:
              review.timestamp instanceof Date
                ? Timestamp.fromDate(review.timestamp)
                : review.timestamp,
          })),
        })),
        reviewers: updatedReviewers,
        status,
        lastUpdated: Timestamp.fromDate(timestamp),
        updatedAt: Timestamp.fromDate(timestamp),
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  },

  // Get form with all versions and reviews
  async getFormDetails(formId: string): Promise<FormSubmission | null> {
    const formRef = doc(db, 'forms', formId);
    const formDoc = await getDoc(formRef);

    if (!formDoc.exists()) return null;
    return convertForm(formDoc);
  },

  // Get all forms for a reviewer
  async getReviewerForms(reviewerId: string): Promise<FormSubmission[]> {
    const formsRef = collection(db, 'forms');
    const q = query(
      formsRef,
      where('reviewers', 'array-contains', { userId: reviewerId })
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(convertForm);
  },

  // Get review statistics for a form
  async getFormReviewStats(formId: string): Promise<{
    totalReviews: number;
    completedReviews: number;
    currentStatus: ReviewStatus;
    lastReviewDate?: Date;
  }> {
    const formDoc = await this.getFormDetails(formId);
    if (!formDoc) throw new Error('Form not found');

    const currentVersion = formDoc.versions[formDoc.currentVersion];
    const reviews = currentVersion.reviews;

    return {
      totalReviews: formDoc.reviewers.length,
      completedReviews: reviews.length,
      currentStatus: formDoc.status,
      lastReviewDate:
        reviews.length > 0
          ? new Date(Math.max(...reviews.map((r) => r.timestamp.getTime())))
          : undefined,
    };
  },

  // Check if a form requires revision
  async doesFormNeedRevision(formId: string): Promise<boolean> {
    const formDoc = await this.getFormDetails(formId);
    if (!formDoc) return false;

    const currentVersion = formDoc.versions[formDoc.currentVersion];
    return currentVersion.reviews.some(
      (review) => review.status === 'needs_revision'
    );
  },

  // Get all forms that need attention from an admin
  async getFormsNeedingAttention(): Promise<FormSubmission[]> {
    const formsRef = collection(db, 'forms');
    const q = query(formsRef, where('status', 'in', ['pending', 'in_review']));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(convertForm);
  },

  // Get complete review history for a form
  async getReviewHistory(formId: string): Promise<
    {
      version: number;
      reviews: Array<Review & { versionStatus: ReviewStatus }>;
    }[]
  > {
    const formDoc = await this.getFormDetails(formId);
    if (!formDoc) throw new Error('Form not found');

    return formDoc.versions.map((version, index) => ({
      version: index + 1,
      reviews: version.reviews.map((review) => ({
        ...review,
        versionStatus: version.status,
      })),
    }));
  },
};
