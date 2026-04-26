import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

export interface Suggestion {
  id: string;
  text: string;
  name: string;
  submittedAt: string;
}

const suggestionsRef = () => collection(getFirebaseDb(), "suggestions");

export const submitSuggestion = async (text: string, name: string) => {
  await addDoc(suggestionsRef(), {
    text: text.trim().slice(0, 500),
    name: name.trim().slice(0, 50),
    submittedAt: serverTimestamp(),
  });
};

export const getSuggestions = async (): Promise<Suggestion[]> => {
  const snap = await getDocs(
    query(suggestionsRef(), orderBy("submittedAt", "desc")),
  );
  return snap.docs.map((d) => ({
    id: d.id,
    text: d.data().text ?? "",
    name: d.data().name ?? "",
    submittedAt:
      d.data().submittedAt?.toDate?.()?.toISOString() ??
      new Date().toISOString(),
  }));
};

export const deleteSuggestion = async (id: string) => {
  await deleteDoc(doc(getFirebaseDb(), "suggestions", id));
};

export const clearSuggestions = async () => {
  const snap = await getDocs(suggestionsRef());
  const batch = writeBatch(getFirebaseDb());
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
};
