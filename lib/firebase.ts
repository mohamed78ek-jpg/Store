import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut, 
  signInAnonymously,
  initializeAuth,
  browserLocalPersistence,
  browserPopupRedirectResolver
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
  persistentMultipleTabManager
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Auth with explicit persistence and resolver for better iframe support
export const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver,
});

// Initialize Firestore with long polling to avoid WebSocket issues in some restricted environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
}, firebaseConfig.firestoreDatabaseId);

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const loginAnonymously = async () => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error("Anonymous login failed:", error);
    throw error;
  }
};

export const logout = async () => {
  await signOut(auth);
};

// Check connection
export const checkFirebaseConnection = async () => {
  try {
    const testDoc = doc(db, 'siteConfig', 'global');
    await getDocFromServer(testDoc);
    return true;
  } catch (error: any) {
    if (error.code === 'unavailable' || (error.message && error.message.includes('the client is offline'))) {
      console.warn("Firestore is currently operating in offline mode. This might be due to network restrictions or a lack of internet connection.");
    } else {
      console.error("Firebase connection error:", error);
    }
    return false;
  }
};

// Only run test connection if not in production to avoid cluttering logs
if (process.env.NODE_ENV !== 'production') {
  checkFirebaseConnection();
}
