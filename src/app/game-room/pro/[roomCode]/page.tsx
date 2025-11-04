"use client";

import { useState, useEffect, use } from "react";
import { lilita } from "@/lib/fonts";
import { useGameSocket } from "@/hooks/useGameSocket";
import GameRoom from "@/components/guessing-game/Gameroom";
import BeerContainer from "@/components/beer/beer-container";
import BackButton from "@/components/shared/back-button";
import Footer from "@/components/shared/footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LoadingScreen from "@/components/beer/loading-screen";

const MOCK_PLAYERS = [
  { name: "Alice", score: 450 },
  { name: "Bob", score: 320 },
  { name: "Charlie", score: 280 },
  { name: "Diana", score: 150 },
];

const MOCK_QUESTIONS = [
  {
    text: "Hvor mange planeter er det i solsystemet vårt?",
    rangeMin: 0,
    rangeMax: 20,
  },
  {
    text: "Hvilket år ble den første iPhone lansert?",
    rangeMin: 2000,
    rangeMax: 2010,
  },
  { text: "Hvor mange land er det i Europa?", rangeMin: 30, rangeMax: 60 },
];

const MOCK_ANSWERS = {
  Alice: 8,
  Bob: 9,
  Charlie: 7,
  Diana: 10,
};

export default function GameRoomPage({
  params,
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = use(params);

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

  const [inputName, setInputName] = useState("");
  const [hasJoinedAsPlayer, setHasJoinedAsPlayer] = useState(false);
  const [previewMode, setPreviewMode] = useState<string | null>(null);
  const [mockRoom, setMockRoom] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const mode =
        urlParams.get("mode") || sessionStorage.getItem("previewMode");

      if (mode && roomCode === "PREVIEW") {
        setPreviewMode(mode);

        const baseMockRoom = {
          roomCode: "PREVIEW",
          players: MOCK_PLAYERS,
          questions: MOCK_QUESTIONS,
          currentQuestionIndex: 0,
          phase: 1,
          answers: {},
          correctAnswer: null,
          roundStartedAt: Date.now(),
          gameStarted: false,
        };

        if (mode === "lobby-host" || mode === "lobby-player") {
          setMockRoom({ ...baseMockRoom, gameStarted: false });
        } else if (mode.startsWith("phase1")) {
          setMockRoom({ ...baseMockRoom, gameStarted: true, phase: 1 });
        } else if (mode.startsWith("phase2")) {
          const phase2Room = { ...baseMockRoom, gameStarted: true, phase: 2 };
          if (mode === "phase2-answered") {
            phase2Room.answers = { Deg: 8 };
          }
          setMockRoom(phase2Room);
        } else if (mode.startsWith("phase3")) {
          setMockRoom({
            ...baseMockRoom,
            gameStarted: true,
            phase: 3,
            answers: MOCK_ANSWERS,
          });
        } else if (mode.startsWith("phase4")) {
          setMockRoom({
            ...baseMockRoom,
            gameStarted: true,
            phase: 4,
            answers: MOCK_ANSWERS,
            correctAnswer: 8,
            players: [
              { name: "Alice", score: 1450 },
              { name: "Bob", score: 1120 },
              { name: "Charlie", score: 980 },
              { name: "Diana", score: 650 },
            ],
          });
        } else if (mode === "phase5") {
          setMockRoom({
            ...baseMockRoom,
            gameStarted: true,
            phase: 5,
            players: [
              { name: "Alice", score: 2450 },
              { name: "Bob", score: 1820 },
              { name: "Charlie", score: 1480 },
              { name: "Diana", score: 1150 },
            ],
          });
        }

        if (mode.includes("host")) {
          setHasJoinedAsPlayer(true);
        } else if (mode.includes("player")) {
          setHasJoinedAsPlayer(true);
        }
      }
    }
  }, [roomCode]);

  useEffect(() => {
    if (!previewMode) {
      const storedName = sessionStorage.getItem(`playerName_${roomCode}`);
      if (storedName && room) {
        setHasJoinedAsPlayer(true);
      }
    }
  }, [roomCode, room, previewMode]);

  useEffect(() => {
    if (!previewMode && isHost && room) {
      setHasJoinedAsPlayer(true);
    }
  }, [isHost, room, previewMode]);

  const handleJoinRoom = () => {
    if (inputName.trim()) {
      joinRoom(inputName.trim());
      setHasJoinedAsPlayer(true);
    }
  };

  if (previewMode && mockRoom) {
    const isHostPreview = previewMode.includes("host");
    const previewPlayerName = isHostPreview ? "Host" : "Deg";

    return (
      <main className="h-screen">
        <BackButton
          href="/game-room/lobby"
          className="absolute top-4 left-4 z-10"
        />
        <BeerContainer color="slate" className="overflow-y-auto">
          <div className="bg-yellow-500 text-slate-900 text-center py-2 px-4 font-bold text-sm sticky top-0 z-10 shine-container">
            FORHÅNDSVISNINGSMODUS:{" "}
            {previewMode.toUpperCase().replace(/-/g, " ")}
          </div>

          <GameRoom
            room={mockRoom}
            isHost={isHostPreview}
            playerName={previewPlayerName}
            onAddQuestion={() => {}}
            onUpdateQuestion={() => {}}
            onStartGame={() => {}}
            onStartPhase={() => {}}
            onSubmitGuess={() => {}}
            onSetCorrectAnswer={() => {}}
            onNextQuestion={() => {}}
            error=""
          />
          <Footer />
        </BeerContainer>
      </main>
    );
  }

  if (!isConnected) {
    return <LoadingScreen color="slate" />;
  }

  if (!room) {
    return <LoadingScreen color="slate" />;
  }

  if (isHost) {
    return (
      <main className="h-screen">
        <BackButton
          href="/game-room/lobby"
          className="absolute top-4 left-4 z-10"
        />
        <BeerContainer color="slate" className="overflow-y-auto">
          <GameRoom
            room={room}
            isHost={true}
            playerName="Host"
            onAddQuestion={addQuestion}
            onUpdateQuestion={updateQuestion}
            onStartGame={startGame}
            onStartPhase={startPhase}
            onSubmitGuess={submitGuess}
            onSetCorrectAnswer={setCorrectAnswer}
            onNextQuestion={nextQuestion}
            error={error}
          />
          <Footer />
        </BeerContainer>
      </main>
    );
  }

  if (!hasJoinedAsPlayer || !playerName) {
    return (
      <main className="h-screen">
        <BackButton
          href="/game-room/lobby"
          className="absolute top-4 left-4 z-10"
        />
        <BeerContainer color="slate">
          <div className="flex flex-col items-center justify-center h-full px-4">
            <h1
              className={`${lilita.className} text-5xl text-white mb-12 text-center leading-tight`}
            >
              Bli med i rom: {roomCode}
            </h1>
            <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full border-2 border-yellow-400">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-yellow-600 mb-2">
                  Klar til å spille?
                </h2>
              </div>
              <Input
                type="text"
                placeholder="Skriv inn navnet ditt"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
                className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg text-center h-16 font-semibold focus:border-yellow-400 focus:ring-4 focus:ring-yellow-200 mb-4"
                maxLength={20}
                autoFocus
              />
              <Button
                onClick={handleJoinRoom}
                disabled={!inputName.trim()}
                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white font-bold py-4 h-14 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-200 shine-container"
              >
                Bli med i spillet
              </Button>
              {error && (
                <div className="mt-4 p-4 bg-red-100 border-2 border-red-300 text-red-700 text-sm rounded-2xl font-semibold text-center">
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

  return (
    <main className="h-screen">
      <BackButton
        href="/game-room/lobby"
        className="absolute top-4 left-4 z-10"
      />
      <BeerContainer color="slate" className="overflow-y-auto">
        <GameRoom
          room={room}
          isHost={false}
          playerName={playerName}
          onAddQuestion={addQuestion}
          onUpdateQuestion={updateQuestion}
          onStartGame={startGame}
          onStartPhase={startPhase}
          onSubmitGuess={submitGuess}
          onSetCorrectAnswer={setCorrectAnswer}
          onNextQuestion={nextQuestion}
          error={error}
        />
        <Footer />
      </BeerContainer>
    </main>
  );
}
