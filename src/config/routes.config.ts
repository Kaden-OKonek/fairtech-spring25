import { RouteConfigMap, UserState } from '../types/auth.types';

export const routeConfig: RouteConfigMap = {
  '/': {
    requiredState: UserState.UNAUTHENTICATED,
    fallbackRoute: '/user-type-selection',
    metadata: {
      title: 'Welcome',
      description: 'Landing page for all users',
    },
  },
  '/login': {
    requiredState: UserState.UNAUTHENTICATED,
    fallbackRoute: '/user-type-selection',
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
    fallbackRoute: '/student-dashboard',
    metadata: {
      title: 'Select User Type',
    },
  },
  '/judge-registration': {
    requiredState: UserState.INCOMPLETE,
    allowedRoles: ['judge'],
    fallbackRoute: '/judge-dashboard',
    metadata: {
      title: 'Judge Registration',
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
  '/teacher-registration': {
    requiredState: UserState.INCOMPLETE,
    allowedRoles: ['teacher'],
    fallbackRoute: '/teacher-dashboard',
    metadata: {
      title: 'Teacher Registration',
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
  '/judge-dashboard': {
    requiredState: UserState.COMPLETE,
    allowedRoles: ['judge'],
    fallbackRoute: '/login',
    metadata: {
      title: 'Judge Dashboard',
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
  '/teacher-dashboard': {
    requiredState: UserState.COMPLETE,
    allowedRoles: ['teacher'],
    fallbackRoute: '/login',
    metadata: {
      title: 'Teacher Dashboard',
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
  '/super-admin-dashboard': {
    requiredState: UserState.COMPLETE,
    allowedRoles: ['superAdmin'],
    fallbackRoute: '/login',
    metadata: {
      title: 'Super Admin Dashboard',
    },
  },
};
