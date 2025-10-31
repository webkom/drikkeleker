"use client";

import { useState } from "react";
import { lilita } from "@/lib/fonts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QuestionManager from "./QuestionManager";
import PlayersList from "./PlayersList";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check } from "lucide-react";

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
  const [copied, setCopied] = useState(false);

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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center text-center h-full w-full px-4 py-12">
      <h1
        className={`${lilita.className} text-5xl leading-tight text-white mb-8`}
      >
        Game Lobby
      </h1>

      <div className="w-full max-w-4xl space-y-6">
        <Card className="bg-white/95">
          <CardHeader>
            <CardTitle className="text-2xl">Room Code</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center gap-4">
            <div className="text-6xl font-mono font-bold text-violet-600 tracking-widest">
              {room.roomCode}
            </div>
            <Button
              onClick={handleCopyCode}
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-lg"
            >
              {copied ? (
                <Check className="text-green-500" />
              ) : (
                <Copy className="text-gray-600" />
              )}
            </Button>
          </CardContent>
        </Card>

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

        {isHost && (
          <QuestionManager
            questions={room.questions || []}
            onAddQuestion={onAddQuestion}
            onUpdateQuestion={onUpdateQuestion}
          />
        )}

        {!isHost && (
          <Card className="bg-white/95">
            <CardHeader>
              <CardTitle>Questions ({room.questions?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Waiting for host to add questions...
              </p>
            </CardContent>
          </Card>
        )}

        {isHost && (
          <Card className="bg-white/95">
            <CardContent className="pt-6">
              <Button
                onClick={handleStartGame}
                disabled={!canStartGame}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-4 h-16 text-xl rounded-xl"
              >
                Start Game
              </Button>
              <AnimatePresence>
                {showWarning && !canStartGame && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 text-sm rounded"
                  >
                    {room.players.length < 2
                      ? "You need at least 2 players to start."
                      : "You need to add at least 1 question to start."}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        )}

        {!isHost && (
          <Card className="bg-white/95">
            <CardContent className="pt-6">
              <p className="text-gray-600 text-lg">
                Waiting for the host to start the game...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
