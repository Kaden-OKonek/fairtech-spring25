export type ContentType = 'paperwork' | 'projects' | 'settings';

export interface FirebaseError extends Error {
  code?: string;
}
