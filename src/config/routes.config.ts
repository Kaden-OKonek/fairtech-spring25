import { RouteConfigMap, UserState } from '../types/auth.types';

export const routeConfig: RouteConfigMap = {
  '/': {
    requiredState: UserState.UNAUTHENTICATED,
    fallbackRoute: '/user-type-selection', // Changed from '/dashboard' to '/user-type-selection'
    metadata: {
      title: 'Welcome',
      description: 'Landing page for all users',
    },
  },
  '/login': {
    requiredState: UserState.UNAUTHENTICATED,
    fallbackRoute: '/user-type-selection', // Changed from '/dashboard'
    metadata: {
      title: 'Login',
    },
  },
  '/verify-email': {
    requiredState: UserState.UNVERIFIED,
    fallbackRoute: '/user-type-selection',
    metadata: {
      title: 'Verify Email',
    },
  },
  '/user-type-selection': {
    requiredState: UserState.UNREGISTERED,
    fallbackRoute: '/student-dashboard', // Default to student dashboard
    metadata: {
      title: 'Select User Type',
    },
  },
  '/student-registration': {
    requiredState: UserState.INCOMPLETE,
    allowedRoles: ['student'],
    fallbackRoute: '/student-dashboard',
    metadata: {
      title: 'Complete Registration',
    },
  },
  '/volunteer-registration': {
    requiredState: UserState.INCOMPLETE,
    allowedRoles: ['volunteer'],
    fallbackRoute: '/volunteer-dashboard',
    metadata: {
      title: 'Volunteer Registration',
    },
  },
  '/student-dashboard': {
    requiredState: UserState.COMPLETE,
    allowedRoles: ['student'],
    fallbackRoute: '/login',
    metadata: {
      title: 'Student Dashboard',
    },
  },
  '/volunteer-dashboard': {
    requiredState: UserState.COMPLETE,
    allowedRoles: ['volunteer'],
    fallbackRoute: '/login',
    metadata: {
      title: 'Volunteer Dashboard',
    },
  },
  '/admin-dashboard': {
    requiredState: UserState.COMPLETE,
    allowedRoles: ['admin'],
    fallbackRoute: '/login',
    metadata: {
      title: 'Admin Dashboard',
    },
  },
};
