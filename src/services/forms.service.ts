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
  Unsubscribe,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import {
  FormSubmission,
  ReviewStatus,
  ReviewerRole,
  FormVersion,
  FormType,
  FormRequirement,
  ProjectContext,
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
  // Legacy method for backward compatibility - Will be removed in future update
  subscribeToForms(
    userId: string,
    role: string,
    callback: (forms: FormSubmission[]) => void
  ): Unsubscribe {
    const formsRef = collection(db, 'forms');
    let q = query(formsRef, orderBy('updatedAt', 'desc')); // Default query

    if (role === 'student') {
      q = query(
        formsRef,
        where('studentId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
    }

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

  // Legacy method for backward compatibility - Will be removed in future update
  async submitNewForm(
    studentId: string,
    studentName: string,
    title: string,
    file: File,
    formType: string
  ): Promise<string> {
    try {
      const timestamp = new Date();
      const storageRef = ref(
        storage,
        `forms/${studentId}/${timestamp.getTime()}_${file.name}`
      );
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      const newVersion: FormVersion = {
        versionNumber: 1,
        fileUrl: downloadURL,
        uploadedAt: timestamp,
        uploadedBy: studentId,
        reviews: [],
        status: 'pending',
      };

      const docRef = await addDoc(collection(db, 'forms'), {
        studentId,
        studentName,
        title,
        fileName: file.name,
        formType: formType as FormType,
        uploadDate: Timestamp.fromDate(timestamp),
        lastUpdated: Timestamp.fromDate(timestamp),
        currentVersion: 0,
        versions: [
          {
            ...newVersion,
            uploadedAt: Timestamp.fromDate(timestamp),
          },
        ],
        reviewers: [],
        createdAt: Timestamp.fromDate(timestamp),
        updatedAt: Timestamp.fromDate(timestamp),
        status: 'pending',
      });

      return docRef.id;
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    }
  },

  // Subscribe to forms with realtime updates
  subscribeToProjectForms(
    projectId: string,
    callback: (forms: FormSubmission[]) => void
  ) {
    const formsRef = collection(db, 'forms');
    const q = query(
      formsRef,
      where('projectContext.projectId', '==', projectId),
      orderBy('updatedAt', 'desc')
    );

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
          projectContext: {
            ...data.projectContext,
            assignedAt: data.projectContext.assignedAt.toDate(),
          },
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

  // Subscribe to forms assigned to a specific student within a project
  subscribeToStudentProjectForms(
    projectId: string,
    studentId: string,
    callback: (forms: FormSubmission[]) => void
  ) {
    const formsRef = collection(db, 'forms');
    const q = query(
      formsRef,
      where('projectContext.projectId', '==', projectId),
      where('projectContext.responsibleStudentId', '==', studentId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const forms = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        uploadDate: doc.data().uploadDate.toDate(),
        lastUpdated: doc.data().lastUpdated.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
        projectContext: {
          ...doc.data().projectContext,
          assignedAt: doc.data().projectContext.assignedAt.toDate(),
        },
        versions: doc.data().versions.map((version: any) => ({
          ...version,
          uploadedAt: version.uploadedAt.toDate(),
          reviews: version.reviews.map((review: any) => ({
            ...review,
            timestamp: review.timestamp.toDate(),
          })),
        })),
      })) as FormSubmission[];

      callback(forms);
    });
  },

  // Submit a new form
  async submitProjectForm(
    projectContext: ProjectContext,
    title: string,
    file: File,
    formType: FormType,
    isRequired: boolean,
    dueDate?: Date
  ): Promise<string> {
    try {
      const timestamp = new Date();

      // 1. Upload file to storage
      const storageRef = ref(
        storage,
        `projects/${projectContext.projectId}/forms/${timestamp.getTime()}_${file.name}`
      );
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // 2. Create new version
      const newVersion: FormVersion = {
        versionNumber: 1,
        fileUrl: downloadURL,
        uploadedAt: timestamp,
        uploadedBy: projectContext.responsibleStudentId,
        reviews: [],
        status: 'pending',
      };

      // 3. Create form document
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
            ...newVersion,
            uploadedAt: Timestamp.fromDate(timestamp),
          },
        ],
        reviewers: [],
        createdAt: Timestamp.fromDate(timestamp),
        updatedAt: Timestamp.fromDate(timestamp),
        status: 'pending',
        isRequired,
        ...(dueDate && { dueDate: Timestamp.fromDate(dueDate) }),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    }
  },

  // Upload a new version of a form
  async uploadNewVersion(
    formId: string,
    file: File,
    uploaderId: string
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
        `projects/${form.projectContext.projectId}/forms/${timestamp.getTime()}_v${newVersionNumber}_${file.name}`
      );
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // 2. Create new version object
      const newVersion: FormVersion = {
        versionNumber: newVersionNumber,
        fileUrl: downloadURL,
        uploadedAt: timestamp,
        uploadedBy: uploaderId,
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

  // Get form requirements for a project
  async getProjectFormRequirements(
    projectId: string
  ): Promise<FormRequirement[]> {
    const projectRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);

    if (!projectDoc.exists()) {
      throw new Error('Project not found');
    }

    const data = projectDoc.data();
    return (data.formRequirements || []) as FormRequirement[];
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
