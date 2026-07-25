import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut, 
  signInAnonymously,
  initializeAuth,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  deleteDoc, 
  updateDoc, 
  writeBatch, 
  query, 
  where, 
  orderBy, 
  getDocFromServer,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Auth } from 'firebase/auth';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, auth: Auth) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth with explicit persistence and resolver for better iframe support
let firebaseAuth;
try {
  // Try to initialize Auth with explicit settings first for correct popup/iframe support
  firebaseAuth = initializeAuth(app, {
    persistence: browserLocalPersistence,
    popupRedirectResolver: browserPopupRedirectResolver,
  });
} catch (e) {
  // If already initialized (or on HMR/re-renders), fall back to getting the existing Auth instance
  firebaseAuth = getAuth(app);
}
export const auth = firebaseAuth;

// Initialize Firestore cleanly using standard database ID
let firestoreDb;
try {
  firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
} catch (e) {
  firestoreDb = getFirestore(app);
}
export const db = firestoreDb;

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const loginWithGoogle = async () => {
  try {
    console.log("Attempting Google Sign-In with Popup...");
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google Sign-In Successful for user:", result.user.email);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      console.log("User closed the login popup or cancelled the request.");
    } else {
      console.error("Firebase Login Error Details:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error) {
    console.error("Firebase Email Login Error:", error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, pass: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error) {
    console.error("Firebase Email Register Error:", error);
    throw error;
  }
};

export const loginAnonymously = async () => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    // If anonymous sign-in is disabled in Firebase Console, handle gracefully
    console.warn("Anonymous login skipped or restricted in Firebase Console.");
    return null;
  }
};

export const logout = async () => {
  await signOut(auth);
};

// Check connection
export const checkFirebaseConnection = async () => {
  try {
    const testDoc = doc(db, 'siteConfig', 'global');
    await getDoc(testDoc);
    return true;
  } catch (error: any) {
    if (error?.code === 'unavailable' || (error?.message && error.message.includes('offline'))) {
      console.warn("Firestore operating in offline/cached mode.");
    } else {
      console.warn("Firebase connection notice:", error?.message || error);
    }
    return false;
  }
};
