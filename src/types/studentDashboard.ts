export type ContentType =
  | 'paperwork'
  | 'projects'
  | 'settings'
  | 'form-questionnaire'
  | 'feedback'
  | 'my-documents';

export interface FirebaseError extends Error {
  code?: string;
}

export interface NewFeedbackCounter {
  forms: number;
  scoring: number;
  total: number;
}

export interface StudentDashboardProps {
  showFeedback?: boolean;
}
