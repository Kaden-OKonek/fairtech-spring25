import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import {
  UserAnalytics,
  BulkEmailPayload,
  UserManagementAction,
} from '../types/superAdmin.types';

export const superAdminService = {
  async getUserAnalytics(): Promise<UserAnalytics> {
    try {
      const getUserAnalyticsFunc = httpsCallable(functions, 'getUserAnalytics');
      const result = await getUserAnalyticsFunc();
      return result.data as UserAnalytics;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  async sendBulkEmail(
    payload: BulkEmailPayload
  ): Promise<{ success: boolean; emailsSent: number }> {
    try {
      const sendBulkEmailFunc = httpsCallable(functions, 'sendBulkEmail');
      const result = await sendBulkEmailFunc(payload);
      return result.data as { success: boolean; emailsSent: number };
    } catch (error) {
      console.error('Error sending bulk email:', error);
      throw error;
    }
  },

  async manageSuperAdmin(
    action: UserManagementAction
  ): Promise<{ success: boolean }> {
    try {
      const manageSuperAdminFunc = httpsCallable(functions, 'manageSuperAdmin');
      const result = await manageSuperAdminFunc({
        userId: action.userId,
        action: action.type,
        ...(action.newPassword && { newPassword: action.newPassword }),
      });
      return result.data as { success: boolean };
    } catch (error) {
      console.error('Error managing user:', error);
      throw error;
    }
  },

  async resetUserPassword(
    userId: string,
    newPassword: string
  ): Promise<{ success: boolean }> {
    try {
      const resetPasswordFunc = httpsCallable(functions, 'resetUserPassword');
      const result = await resetPasswordFunc({ userId, newPassword });
      return result.data as { success: boolean };
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },
};
