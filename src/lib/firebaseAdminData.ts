import { getAdminDb } from "./firebaseAdmin";

const COLLECTION_NAME = "game_data";

// Firestore documents must be maps, not arrays. Some games (games list,
// questions, wavelength, beat-for-beat) store a top-level array, so we wrap
// those under a reserved key and unwrap them transparently on read.
const ARRAY_KEY = "__array";

export async function getGameData(gameId: string) {
  const db = getAdminDb();
  const doc = await db.collection(COLLECTION_NAME).doc(gameId).get();

  if (!doc.exists) {
    return null;
  }

  const data = doc.data();
  if (data && Array.isArray(data[ARRAY_KEY])) {
    return data[ARRAY_KEY];
  }
  return data;
}

export async function saveGameData(gameId: string, data: any) {
  const db = getAdminDb();
  const payload = Array.isArray(data) ? { [ARRAY_KEY]: data } : data;
  await db.collection(COLLECTION_NAME).doc(gameId).set(payload);
}
