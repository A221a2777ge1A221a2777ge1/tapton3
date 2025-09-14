import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, type Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, type Firestore, enableIndexedDbPersistence } from 'firebase/firestore';

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

function hasFirebaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );
}

export function getFirebaseApp(): FirebaseApp | null {
  if (appInstance) return appInstance;
  if (!hasFirebaseEnv()) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[firebase] Missing env config; skipping initialization');
    }
    return null;
  }
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  } as const;
  appInstance = getApps().length ? getApps()[0] : initializeApp(config);
  return appInstance;
}

export function getAuthOrNull(): Auth | null {
  if (authInstance) return authInstance;
  const app = getFirebaseApp();
  if (!app) return null;
  authInstance = getAuth(app);
  // Persist across reloads
  setPersistence(authInstance, browserLocalPersistence).catch(() => {});
  return authInstance;
}

export function getDbOrNull(): Firestore | null {
  if (dbInstance) return dbInstance;
  const app = getFirebaseApp();
  if (!app) return null;
  dbInstance = getFirestore(app);
  // Enable offline persistence best-effort
  void enableIndexedDbPersistence(dbInstance).catch(() => {});
  return dbInstance;
}

export async function ensureAnonymousAuth(): Promise<string | null> {
  const auth = getAuthOrNull();
  if (!auth) return null;
  if (auth.currentUser) return auth.currentUser.uid;
  await signInAnonymously(auth).catch(() => {});
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsub();
        resolve(user.uid);
      }
    });
  });
}

// Utility to prefer wallet address over anon UID when available
export function selectCanonicalUserId(params: { walletAddress?: string | null; anonUid?: string | null }): string | null {
  const wallet = params.walletAddress?.toLowerCase();
  return wallet || params.anonUid || null;
}
