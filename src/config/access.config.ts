import { AccessConfig } from '../types/access.types';

export const accessConfig: AccessConfig = {
  routes: {
    '/': {
      requiredAuth: false,
      emailVerificationRequired: false,
    },
    '/login': {
      requiredAuth: false,
      emailVerificationRequired: false,
    },
    '/verify-email': {
      requiredAuth: true,
      emailVerificationRequired: false,
    },
    '/user-type-selection': {
      requiredAuth: true,
      emailVerificationRequired: true,
    },
    '/student-registration': {
      requiredAuth: true,
      emailVerificationRequired: true,
      allowedRoles: ['student'],
      registrationRequired: false,
      redirectPath: '/student-dashboard',
    },
    '/student-dashboard': {
      requiredAuth: true,
      emailVerificationRequired: true,
      allowedRoles: ['student'],
      registrationRequired: true,
    },
    '/volunteer-dashboard': {
      requiredAuth: true,
      emailVerificationRequired: true,
      allowedRoles: ['volunteer'],
      registrationRequired: true,
    },
    '/admin-dashboard': {
      requiredAuth: true,
      emailVerificationRequired: true,
      allowedRoles: ['admin'],
      registrationRequired: true,
    },
  },
};
