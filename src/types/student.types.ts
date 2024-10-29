export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  school: string;
  grade: number;
  status: 'active' | 'inactive';
  registrationDate: Date;
  formSubmissions?: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    needsRevision: number;
  };
}
