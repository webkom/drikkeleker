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

export type GameType = "challenges" | "guessing" | "alias";

export interface Player {
  uid: string;
  name: string;
  score: number;
}

export interface Question {
  text: string;
  rangeMin: number;
  rangeMax: number;
}

export interface Challenge {
  _id: string;
  text: string;
}

export interface FirebaseRoom {
  roomCode: string;
  gameType: GameType;
  hostUid: string;
  players: Player[];
  gameStarted: boolean;
  questions: Question[];
  currentQuestionIndex: number;
  phase: number;
  answers: Record<string, number>;
  correctAnswer: number | null;
  roundStartedAt: number | null;
  challenges: Challenge[];
}

export interface RoomResult {
  success: boolean;
  roomCode?: string;
  gameType?: GameType;
  isHost?: boolean;
  playerName?: string;
  room?: FirebaseRoom;
  error?: string;
}

const ROOM_TTL_HOURS = 2;

const getRoomRef = (roomCode: string) =>
  doc(getFirebaseDb(), "rooms", roomCode.trim().toLowerCase());

const normalizeRoomCode = (roomCode: string) => roomCode.trim().toLowerCase();

const getExpiresAt = () =>
  Timestamp.fromMillis(Date.now() + ROOM_TTL_HOURS * 60 * 60 * 1000);

const createEmptyRoom = (
  roomCode: string,
  gameType: GameType,
  hostUid: string,
) => ({
  roomCode,
  gameType,
  hostUid,
  players: [],
  gameStarted: false,
  expiresAt: getExpiresAt(),
  questions: [],
  currentQuestionIndex: 0,
  phase: 0,
  answers: {},
  correctAnswer: null,
  roundStartedAt: null,
  challenges: [],
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

export const roomFromSnapshot = (
  snapshot: DocumentSnapshot,
): FirebaseRoom | null => {
  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  return {
    roomCode: data.roomCode ?? snapshot.id,
    gameType: data.gameType,
    hostUid: data.hostUid,
    players: data.players ?? [],
    gameStarted: data.gameStarted ?? false,
    questions: data.questions ?? [],
    currentQuestionIndex: data.currentQuestionIndex ?? 0,
    phase: data.phase ?? 0,
    answers: data.answers ?? {},
    correctAnswer: data.correctAnswer ?? null,
    roundStartedAt: data.roundStartedAt ?? null,
    challenges: data.challenges ?? [],
  };
};

export const createRoom = async (
  roomCode: string,
  gameType: GameType,
): Promise<RoomResult> => {
  const user = await ensureFirebaseUser();
  const normalizedRoomCode = normalizeRoomCode(roomCode);

  if (!normalizedRoomCode) {
    return { success: false, error: "Room code is required" };
  }

  try {
    await runTransaction(getFirebaseDb(), async (transaction) => {
      const ref = getRoomRef(normalizedRoomCode);
      const snapshot = await transaction.get(ref);

      if (snapshot.exists()) {
        throw new Error("Rommet finnes allerede");
      }

      transaction.set(
        ref,
        createEmptyRoom(normalizedRoomCode, gameType, user.uid),
      );
    });

    return {
      success: true,
      roomCode: normalizedRoomCode,
      gameType,
      isHost: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Kunne ikke lage rom",
    };
  }
};

export const getRoom = async (roomCode: string): Promise<RoomResult> => {
  const user = await ensureFirebaseUser();
  const normalizedRoomCode = normalizeRoomCode(roomCode);
  const room = roomFromSnapshot(await getDoc(getRoomRef(normalizedRoomCode)));

  if (!room) {
    return { success: false, error: "Fant ikke rommet" };
  }

  return {
    success: true,
    room,
    roomCode: room.roomCode,
    gameType: room.gameType,
    isHost: room.hostUid === user.uid,
  };
};

export const joinRoom = async (
  roomCode: string,
  playerName?: string,
): Promise<RoomResult> => {
  const user = await ensureFirebaseUser();
  const normalizedRoomCode = normalizeRoomCode(roomCode);
  const normalizedName = playerName?.trim();

  try {
    const result = await runTransaction(
      getFirebaseDb(),
      async (transaction) => {
        const ref = getRoomRef(normalizedRoomCode);
        const snapshot = await transaction.get(ref);
        const room = roomFromSnapshot(snapshot);

        if (!room) {
          throw new Error("Fant ikke rommet");
        }

        if (room.gameType === "guessing" && normalizedName) {
          const nameExists = room.players.some(
            (player) =>
              player.name.toLowerCase() === normalizedName.toLowerCase(),
          );

          if (!nameExists) {
            transaction.update(ref, {
              players: [
                ...room.players,
                { uid: user.uid, name: normalizedName, score: 0 },
              ],
              updatedAt: serverTimestamp(),
            });
          }
        }

        return {
          room,
          isHost: room.hostUid === user.uid,
        };
      },
    );

    return {
      success: true,
      room: result.room,
      roomCode: result.room.roomCode,
      gameType: result.room.gameType,
      isHost: result.isHost,
      playerName: normalizedName,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Kunne ikke bli med",
    };
  }
};

export const listenToRoom = (
  roomCode: string,
  onRoom: (room: FirebaseRoom | null) => void,
  onError: (error: Error) => void,
): Unsubscribe => {
  return onSnapshot(
    getRoomRef(normalizeRoomCode(roomCode)),
    (snapshot) => onRoom(roomFromSnapshot(snapshot)),
    onError,
  );
};

export const addChallenge = async (roomCode: string, text: string) => {
  const normalizedRoomCode = normalizeRoomCode(roomCode);
  const challenge: Challenge = {
    _id: crypto.randomUUID(),
    text,
  };

  await runTransaction(getFirebaseDb(), async (transaction) => {
    const ref = getRoomRef(normalizedRoomCode);
    const snapshot = await transaction.get(ref);
    const room = roomFromSnapshot(snapshot);

    if (!room || room.gameType !== "challenges") {
      throw new Error("Fant ikke rommet");
    }

    transaction.update(ref, {
      challenges: [...room.challenges, challenge],
      updatedAt: serverTimestamp(),
    });
  });
};

export const startChallengeGame = async (roomCode: string) => {
  const user = await ensureFirebaseUser();
  const normalizedRoomCode = normalizeRoomCode(roomCode);

  await runTransaction(getFirebaseDb(), async (transaction) => {
    const ref = getRoomRef(normalizedRoomCode);
    const snapshot = await transaction.get(ref);
    const room = roomFromSnapshot(snapshot);

    if (!room || room.gameType !== "challenges") {
      throw new Error("Fant ikke rommet");
    }

    if (room.hostUid !== user.uid) {
      throw new Error("Bare hosten kan starte spillet");
    }

    if (room.challenges.length < 1) {
      throw new Error("Trenger minst 1 utfordring for å starte");
    }

    transaction.update(ref, {
      gameStarted: true,
      challenges: [...room.challenges].sort(() => Math.random() - 0.5),
      updatedAt: serverTimestamp(),
    });
  });
};

export const addQuestion = async (roomCode: string, question: Question) => {
  const user = await ensureFirebaseUser();

  await runTransaction(getFirebaseDb(), async (transaction) => {
    const ref = getRoomRef(roomCode);
    const snapshot = await transaction.get(ref);
    const room = roomFromSnapshot(snapshot);

    if (!room || room.gameType !== "guessing" || room.hostUid !== user.uid) {
      throw new Error("Bare hosten kan legge til spørsmål");
    }

    transaction.update(ref, {
      questions: [...room.questions, question],
      updatedAt: serverTimestamp(),
    });
  });
};

export const updateQuestion = async (
  roomCode: string,
  index: number,
  question: Question,
) => {
  const user = await ensureFirebaseUser();

  await runTransaction(getFirebaseDb(), async (transaction) => {
    const ref = getRoomRef(roomCode);
    const snapshot = await transaction.get(ref);
    const room = roomFromSnapshot(snapshot);

    if (!room || room.gameType !== "guessing" || room.hostUid !== user.uid) {
      throw new Error("Bare hosten kan endre spørsmål");
    }

    const questions = [...room.questions];
    if (!questions[index]) {
      throw new Error("Fant ikke spørsmålet");
    }
    questions[index] = question;

    transaction.update(ref, {
      questions,
      updatedAt: serverTimestamp(),
    });
  });
};

export const startGuessingGame = async (roomCode: string) => {
  const user = await ensureFirebaseUser();

  await runTransaction(getFirebaseDb(), async (transaction) => {
    const ref = getRoomRef(roomCode);
    const snapshot = await transaction.get(ref);
    const room = roomFromSnapshot(snapshot);

    if (!room || room.gameType !== "guessing" || room.hostUid !== user.uid) {
      throw new Error("Bare hosten kan starte spillet");
    }

    if (room.players.length < 2 || room.questions.length < 1) {
      throw new Error("Trenger minst 2 spillere og 1 spørsmål");
    }

    transaction.update(ref, {
      gameStarted: true,
      phase: 1,
      answers: {},
      correctAnswer: null,
      updatedAt: serverTimestamp(),
    });
  });
};

export const startPhase = async (roomCode: string, phase: number) => {
  const user = await ensureFirebaseUser();

  await runTransaction(getFirebaseDb(), async (transaction) => {
    const ref = getRoomRef(roomCode);
    const snapshot = await transaction.get(ref);
    const room = roomFromSnapshot(snapshot);

    if (!room || room.gameType !== "guessing" || room.hostUid !== user.uid) {
      throw new Error("Bare hosten kan endre fase");
    }

    transaction.update(ref, {
      phase,
      roundStartedAt: phase === 2 ? Date.now() : room.roundStartedAt,
      answers: phase === 2 ? {} : room.answers,
      updatedAt: serverTimestamp(),
    });
  });
};

export const submitGuess = async (
  roomCode: string,
  playerName: string,
  guess: number,
) => {
  await runTransaction(getFirebaseDb(), async (transaction) => {
    const ref = getRoomRef(roomCode);
    const snapshot = await transaction.get(ref);
    const room = roomFromSnapshot(snapshot);

    if (!room || room.gameType !== "guessing" || room.phase !== 2) {
      throw new Error("Kan ikke svare nå");
    }

    if (room.answers[playerName] !== undefined) {
      return;
    }

    const answers = { ...room.answers, [playerName]: guess };
    const allAnswered = room.players.every(
      (player) => answers[player.name] !== undefined,
    );

    transaction.update(ref, {
      answers,
      phase: allAnswered ? 3 : room.phase,
      updatedAt: serverTimestamp(),
    });
  });
};

export const setCorrectAnswer = async (
  roomCode: string,
  correctAnswer: number,
) => {
  const user = await ensureFirebaseUser();

  await runTransaction(getFirebaseDb(), async (transaction) => {
    const ref = getRoomRef(roomCode);
    const snapshot = await transaction.get(ref);
    const room = roomFromSnapshot(snapshot);

    if (!room || room.gameType !== "guessing" || room.hostUid !== user.uid) {
      throw new Error("Bare hosten kan sette fasit");
    }

    const currentQuestion = room.questions[room.currentQuestionIndex];
    if (!currentQuestion) {
      throw new Error("Fant ikke spørsmålet");
    }

    const maxPoints = 1000;
    const sigma = 0.2;
    const maxDistance = currentQuestion.rangeMax - currentQuestion.rangeMin;
    const players = room.players.map((player) => {
      const guess = room.answers[player.name];
      if (guess === undefined) return player;

      const distance = Math.abs(correctAnswer - guess);
      const normalizedDistance = distance / Math.max(1, maxDistance);
      const points =
        maxPoints * Math.exp(-(normalizedDistance ** 2) / (2 * sigma ** 2));

      return {
        ...player,
        score: player.score + Math.round(points),
      };
    });

    transaction.update(ref, {
      correctAnswer,
      players,
      phase: 4,
      updatedAt: serverTimestamp(),
    });
  });
};

export const nextQuestion = async (roomCode: string) => {
  const user = await ensureFirebaseUser();

  await runTransaction(getFirebaseDb(), async (transaction) => {
    const ref = getRoomRef(roomCode);
    const snapshot = await transaction.get(ref);
    const room = roomFromSnapshot(snapshot);

    if (!room || room.gameType !== "guessing" || room.hostUid !== user.uid) {
      throw new Error("Bare hosten kan gå videre");
    }

    const hasNextQuestion =
      room.currentQuestionIndex + 1 < room.questions.length;

    transaction.update(ref, {
      currentQuestionIndex: hasNextQuestion
        ? room.currentQuestionIndex + 1
        : room.currentQuestionIndex,
      phase: hasNextQuestion ? 1 : 5,
      answers: {},
      correctAnswer: null,
      updatedAt: serverTimestamp(),
    });
  });
};

export const refreshRoomTtl = async (roomCode: string) => {
  await updateDoc(getRoomRef(normalizeRoomCode(roomCode)), {
    expiresAt: getExpiresAt(),
    updatedAt: serverTimestamp(),
  });
};
