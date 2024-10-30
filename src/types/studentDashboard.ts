export type ContentType =
  | 'paperwork'
  | 'projects'
  | 'settings'
  | 'form-questionnaire'
  | 'my-documents';

export interface FirebaseError extends Error {
  code?: string;
}
