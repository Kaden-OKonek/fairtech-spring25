import * as functions from 'firebase-functions';
import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

admin.initializeApp();

interface SuperAdminActionData {
  userId?: string;
  userIds?: string[];
  newPassword?: string;
  action?: 'suspend' | 'activate';
  message?: string;
  subject?: string;
}

interface UserData {
  userType?: string;
  status?: 'active' | 'inactive' | 'suspended';
  registrationCompletedAt?: admin.firestore.Timestamp;
  updatedAt?: admin.firestore.Timestamp;
  updatedBy?: string;
}

// Helper function to verify super admin status
const verifySuperAdmin = async (
  auth: CallableRequest['auth'] | undefined
): Promise<boolean> => {
  if (!auth?.uid) return false;

  try {
    const user = await admin.auth().getUser(auth.uid);
    const userDoc = await admin
      .firestore()
      .collection('users')
      .doc(user.uid)
      .get();
    const userData = userDoc.data() as UserData | undefined;

    return Boolean(
      user.customClaims?.role === 'superAdmin' ||
        userData?.userType === 'superAdmin'
    );
  } catch (error) {
    console.error('Error verifying super admin:', error);
    return false;
  }
};

// User Management Functions
export const manageSuperAdmin = functions.https.onCall(
  async (request: CallableRequest<SuperAdminActionData>) => {
    const { data, auth } = request;
    const isSuperAdmin = await verifySuperAdmin(auth);

    if (!isSuperAdmin) {
      throw new HttpsError(
        'permission-denied',
        'Only super admins can perform this action'
      );
    }

    const { userId, action } = data;
    if (!userId || !action) {
      throw new HttpsError('invalid-argument', 'Missing required fields');
    }

    try {
      const userRef = admin.firestore().collection('users').doc(userId);

      switch (action) {
        case 'suspend':
          await admin.auth().updateUser(userId, { disabled: true });
          await userRef.update({
            status: 'suspended',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedBy: auth?.uid,
          });
          break;

        case 'activate':
          await admin.auth().updateUser(userId, { disabled: false });
          await userRef.update({
            status: 'active',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedBy: auth?.uid,
          });
          break;

        default:
          throw new HttpsError('invalid-argument', 'Invalid action specified');
      }

      return { success: true };
    } catch (error) {
      console.error('Error managing user:', error);
      throw new HttpsError('internal', 'Error managing user');
    }
  }
);

export const resetUserPassword = functions.https.onCall(
  async (request: CallableRequest<SuperAdminActionData>) => {
    const { data, auth } = request;
    const isSuperAdmin = await verifySuperAdmin(auth);

    if (!isSuperAdmin) {
      throw new HttpsError(
        'permission-denied',
        'Only super admins can reset passwords'
      );
    }

    const { userId, newPassword } = data;
    if (!userId || !newPassword) {
      throw new HttpsError('invalid-argument', 'Missing required fields');
    }

    try {
      await admin.auth().updateUser(userId, {
        password: newPassword,
      });

      await admin.firestore().collection('passwordResetLogs').add({
        userId,
        resetBy: auth?.uid,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      throw new HttpsError('internal', 'Error resetting password');
    }
  }
);

export const sendBulkEmail = functions.https.onCall(
  async (request: CallableRequest<SuperAdminActionData>) => {
    const { data, auth } = request;
    const isSuperAdmin = await verifySuperAdmin(auth);

    if (!isSuperAdmin) {
      throw new HttpsError(
        'permission-denied',
        'Only super admins can send bulk emails'
      );
    }

    const { userIds, subject, message } = data;
    if (!userIds || !Array.isArray(userIds) || !subject || !message) {
      throw new HttpsError('invalid-argument', 'Missing required fields');
    }

    try {
      // Get user emails
      const userSnapshots = await Promise.all(
        userIds.map((uid) => admin.auth().getUser(uid))
      );
      const emails = userSnapshots
        .map((user) => user.email)
        .filter(Boolean) as string[];

      // Here you would integrate with your email service (e.g., SendGrid)
      await admin.firestore().collection('emailLogs').add({
        recipients: emails,
        subject,
        message,
        sentBy: auth?.uid,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true, emailsSent: emails.length };
    } catch (error) {
      console.error('Error sending bulk email:', error);
      throw new HttpsError('internal', 'Error sending bulk email');
    }
  }
);

interface AnalyticsData {
  startDate?: string;
  endDate?: string;
}

interface Analytics {
  total: number;
  byRole: Record<string, number>;
  byStatus: {
    active: number;
    inactive: number;
    suspended: number;
  };
  registrationTrends: Record<string, number>;
}

// Analytics Functions
export const getUserAnalytics = functions.https.onCall(
  async (request: CallableRequest<AnalyticsData>) => {
    const { auth } = request;
    const isSuperAdmin = await verifySuperAdmin(auth);

    if (!isSuperAdmin) {
      throw new HttpsError(
        'permission-denied',
        'Only super admins can access analytics'
      );
    }

    try {
      const usersRef = admin.firestore().collection('users');
      const snapshot = await usersRef.get();

      const analytics: Analytics = {
        total: snapshot.size,
        byRole: {},
        byStatus: {
          active: 0,
          inactive: 0,
          suspended: 0,
        },
        registrationTrends: {},
      };

      snapshot.forEach((doc) => {
        const userData = doc.data() as UserData;

        // Count by role
        const role = userData.userType || 'unspecified';
        analytics.byRole[role] = (analytics.byRole[role] || 0) + 1;

        // Count by status
        const status = userData.status || 'inactive';
        analytics.byStatus[status] = (analytics.byStatus[status] || 0) + 1;

        // Registration trends (by month)
        if (userData.registrationCompletedAt) {
          const date = userData.registrationCompletedAt.toDate();
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          analytics.registrationTrends[monthKey] =
            (analytics.registrationTrends[monthKey] || 0) + 1;
        }
      });

      return analytics;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw new HttpsError('internal', 'Error fetching analytics');
    }
  }
);
