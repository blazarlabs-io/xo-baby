import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

async function updateUserRoles() {
  try {
    console.log('🔧 Starting user role updates...');

    // Update specific users with their roles
    const userUpdates = [
      {
        uid: 'WgO7wbsm9FXJdo52XOC2oZbZsWi2',
        role: 'parent',
        email: 'parent@example.com', // You can update this with actual email
        firstName: 'Parent',
        lastName: 'User',
      },
      {
        uid: 'U3AK5s2vBdTqm64TCs5oikGDLNs2',
        role: 'medical',
        email: 'doctor@example.com', // You can update this with actual email
        firstName: 'Doctor',
        lastName: 'User',
      },
    ];

    for (const userUpdate of userUpdates) {
      console.log(
        `🔍 Updating user ${userUpdate.uid} with role: ${userUpdate.role}`,
      );

      // Check if user exists
      const userDoc = await db.collection('users').doc(userUpdate.uid).get();

      if (userDoc.exists) {
        // Update existing user
        await db.collection('users').doc(userUpdate.uid).update({
          role: userUpdate.role,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(
          `✅ Updated existing user ${userUpdate.uid} with role: ${userUpdate.role}`,
        );
      } else {
        // Create new user
        await db.collection('users').doc(userUpdate.uid).set({
          uid: userUpdate.uid,
          email: userUpdate.email,
          firstName: userUpdate.firstName,
          lastName: userUpdate.lastName,
          role: userUpdate.role,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(
          `✅ Created new user ${userUpdate.uid} with role: ${userUpdate.role}`,
        );
      }
    }

    console.log('🎉 User role updates completed successfully!');

    // Verify the updates
    console.log('\n📋 Verifying updates...');
    for (const userUpdate of userUpdates) {
      const userDoc = await db.collection('users').doc(userUpdate.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        console.log(`✅ User ${userUpdate.uid}: role = ${userData?.role}`);
      } else {
        console.log(`❌ User ${userUpdate.uid}: not found`);
      }
    }
  } catch (error) {
    console.error('❌ Error updating user roles:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
updateUserRoles();




