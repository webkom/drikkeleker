"use client";

import { useCallback, useEffect, useState } from "react";
import { ensureFirebaseUser } from "@/lib/firebase";
import {
  addQuestion as addFirebaseQuestion,
  joinRoom as joinFirebaseRoom,
  listenToRoom,
  nextQuestion as nextFirebaseQuestion,
  setCorrectAnswer as setFirebaseCorrectAnswer,
  startGuessingGame,
  startPhase as startFirebasePhase,
  submitGuess as submitFirebaseGuess,
  updateQuestion as updateFirebaseQuestion,
  type FirebaseRoom,
  type Question,
} from "@/lib/firebaseRooms";

export const useGameSocket = (roomCode: string) => {
  const [room, setRoom] = useState<FirebaseRoom | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [hostUid, setHostUid] = useState<string | null>(null);

  const setTemporaryError = useCallback((message: string) => {
    setError(message);
    window.setTimeout(() => setError(""), 4000);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const user = await ensureFirebaseUser();
        if (!isMounted) return;

        setHostUid(user.uid);
        setIsConnected(true);

        const storedName = sessionStorage.getItem(`playerName_${roomCode}`);
        if (storedName) {
          setPlayerName(storedName);
          await joinFirebaseRoom(roomCode, storedName);
        }
      } catch (initError) {
        if (!isMounted) return;
        setTemporaryError(
          initError instanceof Error
            ? initError.message
            : "Kunne ikke koble til Firebase",
        );
        setIsConnected(false);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [roomCode, setTemporaryError]);

  useEffect(() => {
    if (!isConnected || !hostUid) return;

    return listenToRoom(
      roomCode,
      (updatedRoom) => {
        setRoom(updatedRoom);
        setIsHost(updatedRoom?.hostUid === hostUid);
      },
      (listenError) => {
        setTemporaryError(listenError.message);
      },
    );
  }, [hostUid, isConnected, roomCode, setTemporaryError]);

  const runAction = useCallback(
    async (action: () => Promise<void>) => {
      try {
        await action();
      } catch (actionError) {
        setTemporaryError(
          actionError instanceof Error
            ? actionError.message
            : "Handlingen feilet",
        );
      }
    },
    [setTemporaryError],
  );

  const joinRoom = useCallback(
    async (name: string) => {
      const trimmedName = name.trim();
      if (!trimmedName) return;

      try {
        const result = await joinFirebaseRoom(roomCode, trimmedName);
        if (!result.success) {
          throw new Error(result.error);
        }

        setPlayerName(trimmedName);
        sessionStorage.setItem(`playerName_${roomCode}`, trimmedName);
      } catch (joinError) {
        setTemporaryError(
          joinError instanceof Error ? joinError.message : "Kunne ikke bli med",
        );
      }
    },
    [roomCode, setTemporaryError],
  );

  const addQuestion = useCallback(
    (question: Question) =>
      runAction(() => addFirebaseQuestion(roomCode, question)),
    [roomCode, runAction],
  );

  const updateQuestion = useCallback(
    (index: number, question: Question) =>
      runAction(() => updateFirebaseQuestion(roomCode, index, question)),
    [roomCode, runAction],
  );

  const startGame = useCallback(
    () => runAction(() => startGuessingGame(roomCode)),
    [roomCode, runAction],
  );

  const startPhase = useCallback(
    (phase: number) => runAction(() => startFirebasePhase(roomCode, phase)),
    [roomCode, runAction],
  );

  const submitGuess = useCallback(
    (guess: number) => {
      if (!playerName) return;
      return runAction(() => submitFirebaseGuess(roomCode, playerName, guess));
    },
    [playerName, roomCode, runAction],
  );

  const setCorrectAnswer = useCallback(
    (answer: number) =>
      runAction(() => setFirebaseCorrectAnswer(roomCode, answer)),
    [roomCode, runAction],
  );

  const nextQuestion = useCallback(
    () => runAction(() => nextFirebaseQuestion(roomCode)),
    [roomCode, runAction],
  );

  return {
    socket: null,
    room,
    isHost,
    isConnected,
    error,
    playerName,
    joinRoom,
    addQuestion,
    updateQuestion,
    startGame,
    startPhase,
    submitGuess,
    setCorrectAnswer,
    nextQuestion,
  };
};
