import * as admin from 'firebase-admin';

// Initialize Firebase if not already done
if (!admin.apps.length) {
  // Validate required environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing Firebase environment variables');
    process.exit(1);
  }

  // Handle private key formatting
  privateKey = privateKey.replace(/^["']|["']$/g, '');
  privateKey = privateKey.replace(/\\n/g, '\n');
  privateKey = privateKey.trim();

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: projectId,
      clientEmail: clientEmail,
      privateKey: privateKey,
    }),
  });
}

const db = admin.firestore();
const kidId = 'srnxTIaPEgsmhwMCoWfs'; // The kid ID from your API logs

async function seedMeasurementData() {
  console.log('Seeding measurement data...');

  const now = new Date();
  const measurements = {
    weight: {
      collection: 'weightRecords',
      baseValue: 3.5,
      increment: 0.5,
      unit: 'kg',
    },
    height: {
      collection: 'heightRecords',
      baseValue: 50,
      increment: 2.5,
      unit: 'cm',
    },
    headCircumference: {
      collection: 'headCircumferenceRecords',
      baseValue: 35,
      increment: 1.2,
      unit: 'cm',
    },
  };

  for (const [type, config] of Object.entries(measurements)) {
    console.log(`Seeding ${type} data...`);

    for (let i = 8; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 15);
      const monthsAgo = 8 - i;

      const value =
        config.baseValue +
        monthsAgo * config.increment +
        (Math.random() - 0.5) * 0.3;
      const roundedValue = Math.round(value * 10) / 10;

      const data = {
        kidId,
        date: date.toISOString().split('T')[0], // YYYY-MM-DD format
        value: roundedValue,
      };

      try {
        await db.collection(config.collection).add(data);
        console.log(`Added ${type} record:`, data);
      } catch (error) {
        console.error(`Error adding ${type} record:`, error);
      }
    }
  }

  console.log('Seeding completed!');
}

// Run the seed function
seedMeasurementData()
  .then(() => {
    console.log('All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding data:', error);
    process.exit(1);
  });
