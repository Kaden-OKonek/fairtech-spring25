export type SuperAdminContentType = 'users' | 'analytics' | 'settings';

export interface UserAnalytics {
  total: number;
  byRole: Record<string, number>;
  byStatus: {
    active: number;
    inactive: number;
    suspended: number;
  };
  registrationTrends: Record<string, number>;
}

export interface BulkEmailPayload {
  userIds: string[];
  subject: string;
  message: string;
}

export interface UserListFilters {
  role?: string;
  status?: string;
  searchTerm?: string;
}

export interface UserManagementAction {
  type: 'suspend' | 'activate' | 'resetPassword' | 'delete';
  userId: string;
  newPassword?: string;
}

export interface RegistrationTrend {
  date: string;
  count: number;
}

export interface RoleDistribution {
  role: string;
  count: number;
  percentage: number;
}

export interface UserStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}
