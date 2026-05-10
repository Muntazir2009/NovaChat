import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase, Database } from "firebase/database";

// Sanitize databaseURL: must be root (e.g. https://project.firebaseio.com)
function sanitizeDatabaseURL(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return undefined;
  }
}

const rawDatabaseURL = import.meta.env.VITE_FIREBASE_DATABASE_URL as string | undefined;
const databaseURL = sanitizeDatabaseURL(rawDatabaseURL);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  ...(databaseURL ? { databaseURL } : {}),
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// RTDB is optional — only available when databaseURL is configured
export const rtdb: Database | null = databaseURL ? getDatabase(app) : null;
