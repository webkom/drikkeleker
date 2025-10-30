"use client";

import { Users, Check, Clock } from "lucide-react";

interface Player {
  name: string;
  score: number;
}

interface PlayersListProps {
  players: Player[];
  currentPlayerName: string;
  answers?: Record<string, number>;
  showAnswerStatus?: boolean;
}

export default function PlayersList({
  players,
  currentPlayerName,
  answers,
  showAnswerStatus = false,
}: PlayersListProps) {
  if (players.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No players yet. Waiting for players to join...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {players.map((player, index) => {
        const isCurrentPlayer = player.name === currentPlayerName;
        const hasAnswered = answers?.[player.name] !== undefined;

        return (
          <div
            key={index}
            className={`flex items-center justify-between p-3 rounded-lg border-2 ${
              isCurrentPlayer
                ? "bg-violet-50 border-violet-300"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  isCurrentPlayer
                    ? "bg-violet-500 text-white"
                    : "bg-gray-300 text-gray-700"
                }`}
              >
                {player.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {player.name}
                  {isCurrentPlayer && (
                    <span className="ml-2 text-xs text-violet-600">(You)</span>
                  )}
                </p>
                <p className="text-sm text-gray-600">Score: {player.score}</p>
              </div>
            </div>
            {showAnswerStatus && (
              <div className="flex items-center gap-2">
                {hasAnswered ? (
                  <div className="flex items-center gap-1 text-green-600 font-semibold">
                    <Check className="w-5 h-5" />
                    <span className="text-sm">Submitted</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-orange-600">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm">Waiting...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
