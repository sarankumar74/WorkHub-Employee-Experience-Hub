import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
export const microsoftAuthProvider = new OAuthProvider('microsoft.com');

// Configure Google OAuth Scopes
googleAuthProvider.addScope('profile');
googleAuthProvider.addScope('email');

// Configure Microsoft Scopes
microsoftAuthProvider.addScope('User.Read');

/**
 * Sign in using Firebase Google OAuth popup
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleAuthProvider);
  return result.user;
}

/**
 * Sign in using Firebase Microsoft OAuth popup
 */
export async function signInWithMicrosoft(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, microsoftAuthProvider);
  return result.user;
}

/**
 * Sign out of Firebase Auth
 */
export async function firebaseSignOut(): Promise<void> {
  await signOut(auth);
}

/**
 * Validate Firestore connection
 */
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'ping'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline or checking connection:', error.message);
    }
    return false;
  }
}

/**
 * Sync employee record directly to Firestore from the client Web SDK
 */
export async function syncEmployeeToClientFirestore(employee: any): Promise<boolean> {
  try {
    if (!employee || !employee.id) return false;
    await setDoc(doc(db, 'employees', employee.id), employee, { merge: true });
    return true;
  } catch (err: any) {
    console.warn('Direct Firestore client sync note:', err?.message || err);
    return false;
  }
}
