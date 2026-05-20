import { getAdminDb } from "./firebaseAdmin";

const COLLECTION_NAME = "game_data";

export async function getGameData(gameId: string) {
  const db = getAdminDb();
  const doc = await db.collection(COLLECTION_NAME).doc(gameId).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data();
}

export async function saveGameData(gameId: string, data: any) {
  const db = getAdminDb();
  await db.collection(COLLECTION_NAME).doc(gameId).set(data);
}
