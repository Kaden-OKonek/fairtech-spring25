import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const checkUserStatus = functions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError(
			'unauthenticated',
			'User must be authenticated to check status.'
		);
	}

	const userId = data.userId;
	const user = await admin.auth().getUser(userId);

	return { isActive: user.emailVerified };
});
