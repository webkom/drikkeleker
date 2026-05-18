import {
  Timestamp,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  updateDoc,
  type DocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { ensureFirebaseUser, getFirebaseDb } from "@/lib/firebase";
import {
  defaultState,
  type GameState,
} from "@/app/beat-for-beat/_lib/types";

export interface BeatFirebaseRoom {
  roomCode: string;
  hostUid: string;
  state: GameState;
}

export interface BeatRoomResult {
  success: boolean;
  roomCode?: string;
  isHost?: boolean;
  room?: BeatFirebaseRoom;
  error?: string;
}

const ROOM_TTL_HOURS = 4;
const GAME_TYPE = "beat-for-beat";

const normalizeRoomCode = (roomCode: string) => roomCode.trim().toLowerCase();

const getRoomRef = (roomCode: string) =>
  doc(getFirebaseDb(), "rooms", normalizeRoomCode(roomCode));

const getExpiresAt = () =>
  Timestamp.fromMillis(Date.now() + ROOM_TTL_HOURS * 60 * 60 * 1000);

export const generateRoomCode = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const beatRoomFromSnapshot = (
  snapshot: DocumentSnapshot,
): BeatFirebaseRoom | null => {
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  if (data.gameType !== GAME_TYPE) return null;
  return {
    roomCode: data.roomCode ?? snapshot.id,
    hostUid: data.hostUid,
    state: (data.state as GameState) ?? defaultState(),
  };
};

export const createBeatRoom = async (): Promise<BeatRoomResult> => {
  const user = await ensureFirebaseUser();
  let attempt = 0;

  while (attempt < 5) {
    const code = generateRoomCode();
    try {
      await runTransaction(getFirebaseDb(), async (transaction) => {
        const ref = getRoomRef(code);
        const snapshot = await transaction.get(ref);
        if (snapshot.exists()) {
          throw new Error("collision");
        }
        transaction.set(ref, {
          roomCode: code,
          gameType: GAME_TYPE,
          hostUid: user.uid,
          state: defaultState(),
          expiresAt: getExpiresAt(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
      return { success: true, roomCode: code, isHost: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message === "collision") {
        attempt++;
        continue;
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : "Kunne ikke lage rom",
      };
    }
  }

  return { success: false, error: "Klarte ikke å generere romkode" };
};

export const getBeatRoom = async (
  roomCode: string,
): Promise<BeatRoomResult> => {
  const user = await ensureFirebaseUser();
  const room = beatRoomFromSnapshot(await getDoc(getRoomRef(roomCode)));
  if (!room) {
    return { success: false, error: "Fant ikke rommet" };
  }
  return {
    success: true,
    room,
    roomCode: room.roomCode,
    isHost: room.hostUid === user.uid,
  };
};

export const listenToBeatRoom = (
  roomCode: string,
  onRoom: (room: BeatFirebaseRoom | null) => void,
  onError: (error: Error) => void,
): Unsubscribe =>
  onSnapshot(
    getRoomRef(roomCode),
    (snapshot) => onRoom(beatRoomFromSnapshot(snapshot)),
    onError,
  );

export const applyBeatAction = async (
  roomCode: string,
  action: (state: GameState) => GameState,
  options: { requireHost?: boolean } = { requireHost: true },
): Promise<void> => {
  const user = await ensureFirebaseUser();

  await runTransaction(getFirebaseDb(), async (transaction) => {
    const ref = getRoomRef(roomCode);
    const snapshot = await transaction.get(ref);
    const room = beatRoomFromSnapshot(snapshot);
    if (!room) throw new Error("Fant ikke rommet");
    if (options.requireHost && room.hostUid !== user.uid) {
      throw new Error("Bare hosten kan endre spillet");
    }

    const nextState = action(room.state);
    transaction.update(ref, {
      state: nextState,
      expiresAt: getExpiresAt(),
      updatedAt: serverTimestamp(),
    });
  });
};

export const refreshBeatRoomTtl = async (roomCode: string) => {
  await updateDoc(getRoomRef(roomCode), {
    expiresAt: getExpiresAt(),
    updatedAt: serverTimestamp(),
  });
};
