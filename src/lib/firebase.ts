import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  type Auth,
  type User,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const requiredConfigKeys = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

const requiredConfigValues: Record<
  (typeof requiredConfigKeys)[number],
  string | undefined
> = {
  NEXT_PUBLIC_FIREBASE_API_KEY: firebaseConfig.apiKey,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
  NEXT_PUBLIC_FIREBASE_APP_ID: firebaseConfig.appId,
};

const getMissingConfigKeys = () =>
  requiredConfigKeys.filter((key) => !requiredConfigValues[key]);

export const assertFirebaseConfig = () => {
  const missingKeys = getMissingConfigKeys();

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing Firebase config: ${missingKeys.join(", ")}. Add these env vars to the frontend deployment.`,
    );
  }
};

export const getFirebaseApp = (): FirebaseApp => {
  assertFirebaseConfig();
  return getApps()[0] ?? initializeApp(firebaseConfig);
};

export const getFirebaseDb = (): Firestore => getFirestore(getFirebaseApp());

export const getFirebaseAuth = (): Auth => getAuth(getFirebaseApp());

export const ensureFirebaseUser = async (): Promise<User> => {
  const auth = getFirebaseAuth();

  if (auth.currentUser) {
    return auth.currentUser;
  }

  const credential = await signInAnonymously(auth);
  return credential.user;
};
