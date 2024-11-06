export type StudentContentType = 'paperwork' | 'projects' | 'settings';

export interface FirebaseError extends Error {
  code?: string;
}
