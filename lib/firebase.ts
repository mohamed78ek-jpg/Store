import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, onSnapshot, deleteDoc, updateDoc, writeBatch, query, where, orderBy, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

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
async function testConnection() {
  try {
    const testDoc = doc(db, '_connection_test', 'test');
    await getDocFromServer(testDoc);
  } catch (error: any) {
    if (error.message && error.message.includes('the client is offline')) {
      console.error("Firebase is offline. Check your configuration.");
    }
  }
}
testConnection();
