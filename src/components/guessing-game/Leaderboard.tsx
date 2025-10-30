"use client";

import { Button } from "@/components/ui/button";
import { Trophy, Medal, ArrowRight } from "lucide-react";

interface Player {
  name: string;
  score: number;
}

interface LeaderboardProps {
  players: Player[];
  correctAnswer: number;
  playerAnswers: Record<string, number>;
  currentPlayerName: string;
  isHost: boolean;
  onNextQuestion: () => void;
  isFinalQuestion: boolean;
}

export default function Leaderboard({
  players,
  correctAnswer,
  playerAnswers,
  currentPlayerName,
  isHost,
  onNextQuestion,
  isFinalQuestion,
}: LeaderboardProps) {
  // Sort players by score (descending)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-orange-600" />;
    return (
      <span className="w-6 h-6 flex items-center justify-center font-bold text-gray-600">
        {index + 1}
      </span>
    );
  };

  const getRankBgColor = (index: number) => {
    if (index === 0)
      return "bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-400";
    if (index === 1)
      return "bg-gradient-to-r from-gray-100 to-gray-50 border-gray-400";
    if (index === 2)
      return "bg-gradient-to-r from-orange-100 to-orange-50 border-orange-400";
    return "bg-white border-gray-200";
  };

  const getDistanceFromAnswer = (playerName: string) => {
    const guess = playerAnswers[playerName];
    if (guess === undefined) return null;
    return Math.abs(correctAnswer - guess);
  };

  return (
    <div className="space-y-6">
      {/* Correct Answer Display */}
      <div className="text-center p-6 bg-gradient-to-r from-violet-100 to-purple-100 rounded-xl border-2 border-violet-400">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Correct Answer
        </h3>
        <p className="text-5xl font-bold text-violet-600">{correctAnswer}</p>
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        <h3 className="text-2xl font-bold text-gray-800 text-center mb-4">
          {isFinalQuestion ? "Final Standings 🎉" : "Current Standings"}
        </h3>
        {sortedPlayers.map((player, index) => {
          const isCurrentPlayer = player.name === currentPlayerName;
          const distance = getDistanceFromAnswer(player.name);
          const guess = playerAnswers[player.name];

          return (
            <div
              key={player.name}
              className={`flex items-center justify-between p-4 rounded-xl border-2 ${getRankBgColor(
                index,
              )} ${isCurrentPlayer ? "ring-2 ring-violet-500" : ""}`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center justify-center w-10">
                  {getRankIcon(index)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg text-gray-800">
                    {player.name}
                    {isCurrentPlayer && (
                      <span className="ml-2 text-sm text-violet-600">
                        (You)
                      </span>
                    )}
                  </p>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Guess: {guess !== undefined ? guess : "N/A"}</span>
                    {distance !== null && (
                      <span className="text-violet-600 font-semibold">
                        Off by: {distance}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">
                    {player.score}
                  </p>
                  <p className="text-xs text-gray-600">points</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Next Question Button - Only for Host */}
      {isHost && (
        <div className="pt-4">
          <Button
            onClick={onNextQuestion}
            className={`w-full py-4 text-lg font-bold rounded-xl ${
              isFinalQuestion
                ? "bg-green-500 hover:bg-green-600"
                : "bg-violet-500 hover:bg-violet-600"
            }`}
          >
            {isFinalQuestion ? (
              <>
                <Trophy className="w-5 h-5 mr-2" />
                View Final Results
              </>
            ) : (
              <>
                <ArrowRight className="w-5 h-5 mr-2" />
                Next Question
              </>
            )}
          </Button>
        </div>
      )}

      {/* Waiting Message - For Non-Host */}
      {!isHost && (
        <div className="text-center p-4 bg-gray-100 rounded-lg">
          <p className="text-gray-700">
            {isFinalQuestion
              ? "Waiting for host to end the game..."
              : "Waiting for host to continue to the next question..."}
          </p>
        </div>
      )}
    </div>
  );
}
