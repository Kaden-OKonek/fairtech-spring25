// User States enum to track where user is in the auth/verification/registration flow
export enum UserState {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  UNVERIFIED = 'UNVERIFIED', // Authenticated but email not verified
  UNREGISTERED = 'UNREGISTERED', // Verified but hasn't selected user type
  INCOMPLETE = 'INCOMPLETE', // Selected type but hasn't completed registration
  COMPLETE = 'COMPLETE', // Fully registered user
}

// Role type
export type UserRole =
  | 'student'
  | 'teacher'
  | 'judge'
  | 'volunteer'
  | 'admin'
  | 'superAdmin'
  | null;

// Base interface for all user profiles
export interface BaseProfile {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  registrationComplete: boolean;
  registrationCompletedAt?: Date;
  updatedAt: Date;
  createdAt: Date;
}

// Student-specific profile interface
export interface StudentProfile extends BaseProfile {
  userType: 'student';
  school: string;
  grade: number;
}

// Volunteer-specific profile interface
export interface VolunteerProfile extends BaseProfile {
  userType: 'volunteer';
}

// Teacher-specific profile interface
export interface TeacherProfile extends BaseProfile {
  userType: 'teacher';
  school: string;
  department: string;
}

// Judge-specific profile interface
export interface JudgeProfile extends BaseProfile {
  userType: 'judge';
  expertise: string;
}

// Admin-specific profile interface
export interface AdminProfile extends BaseProfile {
  userType: 'admin';
}

// Union type for all possible profile types
export type UserProfile =
  | StudentProfile
  | VolunteerProfile
  | TeacherProfile
  | JudgeProfile
  | AdminProfile;

// Auth status interface
export interface AuthStatus {
  state: UserState;
  role: UserRole;
  isLoading: boolean;
  error: string | null;
  user: {
    uid: string;
    email: string;
    emailVerified: boolean;
  } | null;
  metadata?: Partial<UserProfile>;
}

// Route configuration interface
export interface RouteConfig {
  requiredState: UserState;
  allowedRoles?: UserRole[];
  fallbackRoute: string;
  metadata?: {
    title: string;
    description?: string;
  };
}

// Route map type
export type RouteConfigMap = {
  [path: string]: RouteConfig;
};

// Auth context type for provider
export interface AuthContextType {
  authStatus: AuthStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  setUserRole: (role: UserRole) => Promise<void>;
  completeRegistration: (userData: Partial<UserProfile>) => Promise<void>;
  checkSuperAdmin: () => Promise<boolean>;
  refreshStatus: () => Promise<void>;
}

// Type guard functions
export const isStudentProfile = (
  profile: UserProfile
): profile is StudentProfile => {
  return profile.userType === 'student';
};

export const isVolunteerProfile = (
  profile: UserProfile
): profile is VolunteerProfile => {
  return profile.userType === 'volunteer';
};

export const isTeacherProfile = (
  profile: UserProfile
): profile is TeacherProfile => {
  return profile.userType === 'teacher';
};

export const isJudgeProfile = (
  profile: UserProfile
): profile is JudgeProfile => {
  return profile.userType === 'judge';
};

export const isAdminProfile = (
  profile: UserProfile
): profile is AdminProfile => {
  return profile.userType === 'admin';
};

// Response type for API calls
export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    user?: UserProfile;
    token?: string;
  };
}

// Form data types for registration
export interface BaseRegistrationFormData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface StudentRegistrationFormData extends BaseRegistrationFormData {
  school: string;
  grade: number;
}

export interface VolunteerRegistrationFormData
  extends BaseRegistrationFormData {
  // Add any additional volunteer-specific fields here if needed in the future
}
