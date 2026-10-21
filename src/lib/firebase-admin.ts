import { App } from 'firebase-admin/app';
import { Firestore } from 'firebase-admin/firestore';
import { Auth } from 'firebase-admin/auth';

let adminApp: App | null = null;
let adminAuthInstance: Auth | null = null;
let adminDbInstance: Firestore | null = null;

// Only initialize Firebase Admin in cloud environments where credentials exist
// (Prevents google-gax NO_ADC_FOUND errors on local developer machines)
const hasGcpCredentials = Boolean(
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  process.env.K_SERVICE ||
  process.env.FUNCTION_NAME ||
  process.env.GAE_ENV
);

if (hasGcpCredentials) {
  try {
    const { initializeApp, getApps } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');
    const { getAuth } = await import('firebase-admin/auth');
    const firebaseConfig = (await import('../../firebase-applet-config.json')).default;

    if (!getApps().length) {
      adminApp = initializeApp({
        projectId: firebaseConfig.projectId,
      });
    } else {
      adminApp = getApps()[0];
    }

    if (adminApp) {
      adminAuthInstance = getAuth(adminApp);
      adminDbInstance = getFirestore(firebaseConfig.firestoreDatabaseId);
    }
  } catch (_err) {
    adminApp = null;
    adminAuthInstance = null;
    adminDbInstance = null;
  }
}

export const adminAuth = adminAuthInstance;
export const adminDb = adminDbInstance;
