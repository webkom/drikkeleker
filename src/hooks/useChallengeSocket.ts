"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "@/context/SocketContext";

interface Challenge {
  _id: string;
  text: string;
}

export const useChallengeSocket = (roomCode: string) => {
  const { socket, isConnected } = useSocket();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState("");

  const listenersAdded = useRef(false);

  useEffect(() => {
    if (!socket) return;

    console.log("useChallengeSocket: Joining room", roomCode);
    socket.emit("join_room", { roomCode });

    const handleGameStarted = (data: { challenges: Challenge[] }) => {
      console.log("Socket event: game_started", data);
      setGameStarted(true);
      if (data.challenges) setChallenges(data.challenges);
    };

    const handleChallengeAdded = (data: { challenge: Challenge }) => {
      console.log("Socket event: challenge_added", data);
      setChallenges((prev) => [...prev, data.challenge]);
    };

    const handleChallengeAddedMidGame = (data: { challenge: Challenge }) => {
      console.log("Socket event: challenge_added_mid_game", data);
      setChallenges((prev) => [...prev, data.challenge]);
    };

    const handleError = (data: { message: string }) => {
      console.error("Socket error:", data.message);
      setError(data.message);
      setTimeout(() => setError(""), 4000);
    };

    if (!listenersAdded.current) {
      socket.on("game_started", handleGameStarted);
      socket.on("challenge_added", handleChallengeAdded);
      socket.on("challenge_added_mid_game", handleChallengeAddedMidGame);
      socket.on("error", handleError);

      listenersAdded.current = true;
    }

    return () => {
      console.log("useChallengeSocket: Cleaning up");
      socket.off("game_started", handleGameStarted);
      socket.off("challenge_added", handleChallengeAdded);
      socket.off("challenge_added_mid_game", handleChallengeAddedMidGame);
      socket.off("error", handleError);
      listenersAdded.current = false;
    };
  }, [socket, roomCode]);

  const addChallenge = useCallback(
    (text: string) => {
      if (socket) {
        socket.emit("add_challenge", { roomCode, challenge: text });
      }
    },
    [socket, roomCode],
  );

  const startGame = useCallback(() => {
    if (socket) {
      socket.emit("start_game", { roomCode });
    }
  }, [socket, roomCode]);

  return {
    challenges,
    gameStarted,
    addChallenge,
    startGame,
    isConnected,
    error,
  };
};
