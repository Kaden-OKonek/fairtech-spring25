export type FormStatus = 'pending' | 'approved' | 'rejected' | 'needs_revision';

export interface FormSubmission {
  id: string;
  studentId: string;
  studentName: string;
  fileName: string;
  fileUrl: string;
  uploadDate: Date;
  lastUpdated: Date;
  status: FormStatus;
  comments?: string;
}
