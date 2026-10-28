import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const REQUIRED = {
  apiKey: "NEXT_PUBLIC_FIREBASE_API_KEY",
  authDomain: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  projectId: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  appId: "NEXT_PUBLIC_FIREBASE_APP_ID",
};

const missing = Object.entries(REQUIRED)
  .filter(([key]) => !config[key])
  .map(([, name]) => name);

/** False until real credentials are present in .env.local */
export const isFirebaseConfigured = missing.length === 0;

if (!isFirebaseConfigured && typeof window !== "undefined") {
  console.warn(`[Sea Go] Firebase is not configured. Missing: ${missing.join(", ")}`);
}

// Inert placeholders keep the app buildable and renderable without credentials.
const resolved = isFirebaseConfigured
  ? config
  : {
      apiKey: "missing-api-key",
      authDomain: "missing.firebaseapp.com",
      projectId: "missing-project",
      appId: "1:0:web:0",
    };

const app = getApps().length ? getApp() : initializeApp(resolved);

export const auth = getAuth(app);
export const db = getFirestore(app);
