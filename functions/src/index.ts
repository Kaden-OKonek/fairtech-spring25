import * as functions from 'firebase-functions';
import { CallableRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const checkUserStatus = functions.https.onCall(
	async (request: CallableRequest) => {
		const { data, auth } = request;

		if (!auth) {
			throw new functions.https.HttpsError(
				'unauthenticated',
				'User must be authenticated to check status.'
			);
		}

		try {
			const userId = data.userId;

			// Verify that the userId from the request matches the authenticated user
			if (userId !== auth.uid) {
				throw new functions.https.HttpsError(
					'permission-denied',
					'User can only check their own status.'
				);
			}

			const user = await admin.auth().getUser(userId);

			const isActive = user.emailVerified;

			return { isActive };
		} catch (error) {
			console.error('Error checking user status:', error);
			throw new functions.https.HttpsError(
				'internal',
				'An error occurred while checking user status'
			);
		}
	}
);
