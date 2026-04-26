import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const getAdminApp = () => {
  if (getApps().length) return getApps()[0];

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not set");

  return initializeApp({ credential: cert(JSON.parse(raw)) });
};

export const getAdminDb = () => getFirestore(getAdminApp());
