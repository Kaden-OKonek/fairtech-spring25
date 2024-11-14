// types/forms.types.ts

export type ReviewStatus =
  | 'pending'
  | 'in_review'
  | 'needs_revision'
  | 'approved'
  | 'rejected';
export type ReviewerRole = 'primary' | 'secondary' | 'final';

export interface ReviewerAssignment {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: ReviewerRole;
  assignedAt: Date;
  status: 'pending' | 'completed';
  completedAt?: Date;
}

export interface Review {
  reviewerId: string;
  reviewerName: string;
  reviewerEmail: string;
  timestamp: Date;
  status: ReviewStatus;
  comments: string;
  role: ReviewerRole;
}

export interface FormVersion {
  versionNumber: number;
  fileUrl: string;
  uploadedAt: Date;
  uploadedBy: string;
  reviews: Review[];
  status: ReviewStatus;
}

export interface FormSubmission {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  fileName: string;
  uploadDate: Date;
  lastUpdated: Date;
  currentVersion: number;
  versions: FormVersion[];
  reviewers: ReviewerAssignment[];
  createdAt: Date;
  updatedAt: Date;
  status: ReviewStatus;
  formType: string;
  comments?: string;
}
