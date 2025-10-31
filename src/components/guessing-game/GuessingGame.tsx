"use client";

import { useState, useEffect } from "react";
import { useGameSocket } from "../../hooks/useGameSocket";
import RoomLobby from "./RoomLobby";
import GamePlay from "./GamePlay";
import BeerContainer from "@/components/beer/beer-container";
import BackButton from "@/components/shared/back-button";
import Footer from "@/components/shared/footer";
import { lilita } from "@/lib/fonts";

interface GuessingGameProps {
  roomCode: string;
}

// src/app/viljens-drikkeleker/[roomCode]/page.tsx
export default function GameRoomPage({
  params,
}: {
  params: { roomCode: string };
}) {
  const roomCode = params.roomCode;
  const {
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
  } = useGameSocket(roomCode);

  const [hasJoined, setHasJoined] = useState(false);
  and;
  const [inputName, setInputName] = useState("");

  // Check if player has already joined (from session storage)
  useEffect(() => {
    const storedName = sessionStorage.getItem(`playerName_${roomCode}`);
    if (storedName && room) {
      const playerExists = room.players?.some((p) => p.name === storedName);
      if (playerExists) {
        setHasJoined(true);
        setInputName(storedName);
      }
    }
  }, [roomCode, room]);
  // In src/components/guessing-game/GuessingGame.tsx
  // Add this useEffect after the existing session storage check (around line 47):

  useEffect(() => {
    if (isHost && room) {
      // Host is already "in" the room, skip the join form
      setHasJoined(true);
      // Optionally set a default name for the host
      setInputName("Host");
    }
  }, [isHost, room]);

  const handleJoinRoom = () => {
    if (inputName.trim()) {
      joinRoom(inputName.trim());
      sessionStorage.setItem(`playerName_${roomCode}`, inputName.trim());
      setHasJoined(true);
    }
  };

  if (!isConnected) {
    return (
      <main className="overflow-hidden h-screen">
        <BeerContainer color="violet" className="h-screen w-screen">
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-2xl">Connecting...</div>
          </div>
        </BeerContainer>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="overflow-hidden h-screen">
        <BeerContainer color="violet" className="h-screen w-screen">
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-center">
              <h2 className="text-3xl font-bold mb-4">Room not found</h2>
              <p className="text-xl">Loading room data...</p>
            </div>
          </div>
        </BeerContainer>
      </main>
    );
  }

  // If player hasn't joined yet, show join form
  if (!hasJoined) {
    return (
      <main className="overflow-hidden h-screen">
        <BackButton
          href="/game-room/lobby"
          className="absolute top-4 left-4 z-10"
        />
        <BeerContainer color="violet" className="h-screen w-screen">
          <div className="flex flex-col items-center justify-center h-full px-4">
            <h1 className={`${lilita.className} text-5xl text-white mb-8`}>
              Join Room {roomCode}
            </h1>
            <div className="bg-white rounded-xl p-6 shadow-lg max-w-md w-full">
              <input
                type="text"
                placeholder="Enter your name"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-lg"
                maxLength={20}
              />
              <button
                onClick={handleJoinRoom}
                disabled={!inputName.trim()}
                className="w-full bg-violet-500 hover:bg-violet-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg text-lg"
              >
                Join Game
              </button>
              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
            </div>
          </div>
          <Footer />
        </BeerContainer>
      </main>
    );
  }

  // Show lobby-pro or gameplay based on game state
  return (
    <main className="overflow-hidden h-screen">
      <BackButton
        href="/game-room/lobby"
        className="absolute top-4 left-4 z-10"
      />
      <BeerContainer color="violet" className="h-screen w-screen">
        {!room.gameStarted ? (
          <RoomLobby
            room={room}
            isHost={isHost}
            playerName={inputName}
            onAddQuestion={addQuestion}
            onUpdateQuestion={updateQuestion}
            onStartGame={startGame}
            error={error}
          />
        ) : (
          <GamePlay
            room={room}
            isHost={isHost}
            playerName={inputName}
            onStartPhase={startPhase}
            onSubmitGuess={submitGuess}
            onSetCorrectAnswer={setCorrectAnswer}
            onNextQuestion={nextQuestion}
            error={error}
          />
        )}
        <Footer />
      </BeerContainer>
    </main>
  );
}
