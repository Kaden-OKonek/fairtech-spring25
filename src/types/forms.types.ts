// types/forms.types.ts

export type ReviewStatus =
  | 'pending'
  | 'in_review'
  | 'needs_revision'
  | 'approved'
  | 'rejected';

export type ReviewerRole = 'primary' | 'secondary' | 'final';

export type FormType =
  // Required per student
  | '1B'
  // Required project
  | '1'
  | '1A'
  | 'research_plan'
  | 'abstract'
  // Extras
  | '1C'
  | '2'
  | '3'
  | '4'
  | '5A'
  | '5B'
  | '6A'
  | '6B'
  | '7';

export interface ProjectContext {
  projectId: string;
  projectName: string;
  responsibleStudentId: string; // The student responsible for this form
  responsibleStudentName: string;
  assignedAt: Date;
}

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
  formType: FormType;
  projectContext: ProjectContext;
  uploadDate: Date;
  lastUpdated: Date;
  currentVersion: number;
  versions: FormVersion[];
  reviewers: ReviewerAssignment[];
  createdAt: Date;
  updatedAt: Date;
  status: ReviewStatus;
  comments?: string;
  isRequired: boolean;
}

export interface FormRequirement {
  formType: FormType;
  isRequired: boolean;
  description: string;
}

export interface ProjectFormConfig {
  projectId: string;
  requiredForms: FormRequirement[];
}
