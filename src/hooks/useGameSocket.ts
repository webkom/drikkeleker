"use client";

import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/context/SocketContext";

interface Player {
  name: string;
  score: number;
}

interface Question {
  text: string;
  rangeMin: number;
  rangeMax: number;
}

interface Room {
  roomCode: string;
  players: Player[];
  questions: Question[];
  host: string;
  gameStarted: boolean;
  currentQuestionIndex: number;
  phase: number;
  answers: Record<string, number>;
  correctAnswer: number | null;
  roundStartedAt: number | null;
}

export const useGameSocket = (roomCode: string) => {
  const { socket, isConnected } = useSocket();

  const [room, setRoom] = useState<Room | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState("");
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    if (!socket) return;

    console.log("useGameSocket: Attempting to join room", roomCode);
    const storedName = sessionStorage.getItem(`playerName_${roomCode}`);
    if (storedName) {
      setPlayerName(storedName);
      socket.emit("join_room", { roomCode, playerName: storedName });
    } else {
      socket.emit("join_room", { roomCode });
    }

    const handleRoomJoined = (data: any) => {
      console.log("Socket event: room_joined", data);
      if (data.success) {
        setRoom(data.room);
        setIsHost(data.isHost || false);
        if (data.playerName) setPlayerName(data.playerName);
      } else {
        setError(data.error || "Failed to join room");
      }
    };

    const handleRoomUpdated = (updatedRoom: Room) => {
      console.log("Socket event: room_updated", updatedRoom);
      setRoom(updatedRoom);
      if (socket.id === updatedRoom.host) {
        setIsHost(true);
      }
    };

    const handleError = (data: { message: string }) => {
      console.error("Socket error:", data.message);
      setError(data.message);
      setTimeout(() => setError(""), 4000);
    };

    socket.on("room_joined", handleRoomJoined);
    socket.on("room_updated", handleRoomUpdated);
    socket.on("error", handleError);

    return () => {
      console.log("useGameSocket: Cleaning up listeners");
      socket.off("room_joined", handleRoomJoined);
      socket.off("room_updated", handleRoomUpdated);
      socket.off("error", handleError);
    };
  }, [socket, roomCode]);

  const joinRoom = useCallback(
    (name: string) => {
      if (socket) {
        setPlayerName(name);
        sessionStorage.setItem(`playerName_${roomCode}`, name);
        socket.emit("join_room", { roomCode, playerName: name });
      }
    },
    [socket, roomCode],
  );

  const addQuestion = useCallback(
    (question: Omit<Question, "text"> & { text: string }) => {
      if (socket && isHost) socket.emit("add_question", { roomCode, question });
    },
    [socket, roomCode, isHost],
  );

  const updateQuestion = useCallback(
    (index: number, question: Omit<Question, "text"> & { text: string }) => {
      if (socket && isHost)
        socket.emit("update_question", { roomCode, index, question });
    },
    [socket, roomCode, isHost],
  );

  const startGame = useCallback(() => {
    if (socket && isHost) socket.emit("start_game", { roomCode });
  }, [socket, roomCode, isHost]);

  const startPhase = useCallback(
    (phase: number) => {
      if (socket && isHost) socket.emit("start_phase", { roomCode, phase });
    },
    [socket, roomCode, isHost],
  );

  const submitGuess = useCallback(
    (guess: number) => {
      if (socket && playerName)
        socket.emit("submit_guess", { roomCode, playerName, guess });
    },
    [socket, roomCode, playerName],
  );

  const setCorrectAnswer = useCallback(
    (answer: number) => {
      if (socket && isHost)
        socket.emit("set_answer", { roomCode, correctAnswer: answer });
    },
    [socket, roomCode, isHost],
  );

  const nextQuestion = useCallback(() => {
    if (socket && isHost) socket.emit("next_question", { roomCode });
  }, [socket, roomCode, isHost]);

  return {
    socket,
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
