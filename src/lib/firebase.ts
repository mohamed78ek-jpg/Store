import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string | null;
    email: string | null;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: any[];
  }
}

export function handleFirestoreError(error: any, operation: FirestoreErrorInfo['operationType'], path: string | null = null) {
  if (error?.code === 'permission-denied') {
    const errorInfo: FirestoreErrorInfo = {
      error: error.message,
      operationType: operation,
      path: path,
      authInfo: {
        userId: auth.currentUser?.uid || null,
        email: auth.currentUser?.email || null,
        emailVerified: auth.currentUser?.emailVerified || false,
        isAnonymous: auth.currentUser?.isAnonymous || false,
        providerInfo: auth.currentUser?.providerData || []
      }
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
}

// Connectivity check
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

if (typeof window !== 'undefined') {
  testConnection();
}
