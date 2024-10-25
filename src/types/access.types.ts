export type UserType =
  | 'student'
  | 'teacher'
  | 'judge'
  | 'volunteer'
  | 'admin'
  | null;

export interface UserStatus {
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  userType: UserType;
  isRegistrationComplete: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface RouteAccess {
  requiredAuth: boolean;
  allowedRoles?: UserType[];
  registrationRequired?: boolean;
  emailVerificationRequired?: boolean;
  redirectPath?: string;
}

export interface AccessConfig {
  routes: {
    [path: string]: RouteAccess;
  };
}
