const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin with service account
const serviceAccountPath = path.join(
  __dirname,
  '..',
  'service-account-key.json'
);
const serviceAccount = require(serviceAccountPath);

// Initialize the admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function createSuperAdmin(email) {
  try {
    console.log(`Starting super admin creation for ${email}...`);

    // Get user by email
    console.log('Fetching user...');
    const user = await admin.auth().getUserByEmail(email);
    console.log('Found user:', user.uid);

    // Set custom claims
    console.log('Setting custom claims...');
    await admin.auth().setCustomUserClaims(user.uid, {
      role: 'superAdmin',
      permissions: {
        manageUsers: true,
        manageRoles: true,
        manageFairs: true,
        manageAnnouncements: true,
        systemConfiguration: true,
      },
    });

    // Update user profile in Firestore
    console.log('Updating Firestore profile...');
    await admin.firestore().collection('users').doc(user.uid).set(
      {
        email: email,
        userType: 'superAdmin',
        registrationComplete: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    console.log('✅ Successfully promoted user to Super Admin');
    console.log('Details:');
    console.log('- Email:', email);
    console.log('- User ID:', user.uid);
    console.log('- Role: Super Admin');
    console.log('- Status: Complete');
  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
  } finally {
    // Exit the process
    process.exit();
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address as an argument');
  console.log('Usage: node createSuperAdmin.js <email>');
  process.exit(1);
}

// Run the function
createSuperAdmin(email);
