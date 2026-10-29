// Firebase Client Authentication Module for StarReview AI
// Configures Firebase Auth with Google Provider & Safe Fallback

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

let app = null;
let auth = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (err) {
    console.warn('[Firebase] Client initialization failed:', err);
  }
}

/**
 * Sign in with Google using Firebase Popup
 * @returns {Promise<{ user: any, idToken: string }>}
 */
export async function loginWithGoogle() {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase credentials are not configured in environment variables. Please check .env file.');
  }

  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  return {
    user: result.user,
    idToken
  };
}

/**
 * Sign out user from Firebase
 */
export async function logoutFirebase() {
  if (auth) {
    await signOut(auth);
  }
}

/**
 * Listen to auth state changes
 */
export function onFirebaseAuthStateChanged(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

/**
 * Get current ID token
 */
export async function getCurrentFirebaseToken() {
  if (!auth || !auth.currentUser) return null;
  return auth.currentUser.getIdToken();
}

export { auth, googleProvider };
