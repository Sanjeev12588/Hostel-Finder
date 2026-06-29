
import * as admin from 'firebase-admin';

export async function initAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  if (!projectId || !clientEmail || !privateKey || !storageBucket) {
    const missingVars = [
      !projectId && 'FIREBASE_PROJECT_ID',
      !clientEmail && 'FIREBASE_CLIENT_EMAIL',
      !privateKey && 'FIREBASE_PRIVATE_KEY',
      !storageBucket && 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    ]
      .filter(Boolean)
      .join(', ');

    const errorMessage = `Firebase Admin initialization failed. The following environment variables are missing: ${missingVars}. If running locally, add them to your .env file. If deploying, set them as secrets in your hosting provider's settings.`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        // Replace \\n with \n to correctly parse the private key
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
      storageBucket,
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
    throw new Error(
      'Could not initialize Firebase Admin SDK. Check server logs.'
    );
  }
}
