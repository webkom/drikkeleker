"use client";

import { useState } from "react";
import { lilita } from "@/lib/fonts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QuestionManager from "./QuestionManager";
import PlayersList from "./PlayersList";

interface Room {
  roomCode: string;
  players: Array<{ name: string; score: number }>;
  questions?: Array<{ text: string; rangeMin: number; rangeMax: number }>;
  gameStarted: boolean;
}

interface RoomLobbyProps {
  room: Room;
  isHost: boolean;
  playerName: string;
  onAddQuestion: (question: {
    text: string;
    rangeMin: number;
    rangeMax: number;
  }) => void;
  onUpdateQuestion: (
    index: number,
    question: { text: string; rangeMin: number; rangeMax: number },
  ) => void;
  onStartGame: () => void;
  error: string;
}

export default function RoomLobby({
  room,
  isHost,
  playerName,
  onAddQuestion,
  onUpdateQuestion,
  onStartGame,
  error,
}: RoomLobbyProps) {
  const [showWarning, setShowWarning] = useState(false);

  const canStartGame =
    room.players.length >= 2 && (room.questions?.length || 0) >= 1;

  const handleStartGame = () => {
    if (!canStartGame) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
      return;
    }
    onStartGame();
  };

  return (
    <div className="flex flex-col items-center text-center h-full px-4 py-12 overflow-y-auto">
      <div className="flex items-center justify-center gap-4 mb-8">
        <h1 className={`${lilita.className} text-5xl leading-tight text-white`}>
          Guessing Game
        </h1>
      </div>

      <div className="w-full max-w-4xl space-y-6">
        {/* Room Code Display */}
        <Card className="bg-white/95">
          <CardHeader>
            <CardTitle className="text-3xl">Room Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-mono font-bold text-violet-600">
              {room.roomCode}
            </div>
            <p className="text-gray-600 mt-2">
              Share this code with others to join!
            </p>
          </CardContent>
        </Card>

        {/* Players List */}
        <Card className="bg-white/95">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Players ({room.players.length})</span>
              {isHost && (
                <span className="text-sm text-violet-600 font-normal">
                  👑 You are the host
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PlayersList
              players={room.players}
              currentPlayerName={playerName}
            />
          </CardContent>
        </Card>

        {/* Question Manager - Only for Host */}
        {isHost && (
          <QuestionManager
            questions={room.questions || []}
            onAddQuestion={onAddQuestion}
            onUpdateQuestion={onUpdateQuestion}
          />
        )}

        {/* Questions Display - For Non-Host */}
        {!isHost && (
          <Card className="bg-white/95">
            <CardHeader>
              <CardTitle>Questions ({room.questions?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {!room.questions || room.questions.length === 0 ? (
                <p className="text-gray-600">
                  Waiting for host to add questions...
                </p>
              ) : (
                <div className="text-left space-y-2">
                  {room.questions.map((q, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">{q.text}</p>
                      <p className="text-sm text-gray-600">
                        Range: {q.rangeMin} - {q.rangeMax}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Start Game Button - Only for Host */}
        {isHost && (
          <Card className="bg-white/95">
            <CardContent className="pt-6">
              <Button
                onClick={handleStartGame}
                disabled={!canStartGame}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-4 text-xl rounded-xl"
              >
                Start Game
              </Button>
              {showWarning && !canStartGame && (
                <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
                  {room.players.length < 2
                    ? "Need at least 2 players to start"
                    : "Need at least 1 question to start"}
                </div>
              )}
              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Waiting Message - For Non-Host */}
        {!isHost && (
          <Card className="bg-white/95">
            <CardContent className="pt-6">
              <p className="text-gray-600 text-lg">
                Waiting for host to start the game...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
