"use client";

import { useState, useEffect } from "react";
import { lilita } from "@/lib/fonts";
import { Card, CardContent } from "@/components/ui/card";
import HostControls from "./HostControls";
import PlayerControls from "./PlayerControls";
import Leaderboard from "./Leaderboard";
import Timer from "@/components/Timer";
import PlayersList from "./PlayersList";

interface Room {
  roomCode: string;
  players: Array<{ name: string; score: number }>;
  questions?: Array<{ text: string; rangeMin: number; rangeMax: number }>;
  currentQuestionIndex?: number;
  phase?: number;
  answers?: Record<string, number>;
  correctAnswer?: number | null;
  roundStartedAt?: number;
  gameStarted: boolean;
}

interface GamePlayProps {
  room: Room;
  isHost: boolean;
  playerName: string;
  onStartPhase: (phase: number) => void;
  onSubmitGuess: (guess: number) => void;
  onSetCorrectAnswer: (answer: number) => void;
  onNextQuestion: () => void;
  error: string;
}

export default function GamePlay({
  room,
  isHost,
  playerName,
  onStartPhase,
  onSubmitGuess,
  onSetCorrectAnswer,
  onNextQuestion,
  error,
}: GamePlayProps) {
  const [timeLeft, setTimeLeft] = useState(30);

  const currentQuestion = room.questions?.[room.currentQuestionIndex || 0];
  const currentPhase = room.phase || 1;

  // Timer logic for phase 2 (guessing)
  useEffect(() => {
    if (currentPhase === 2 && room.roundStartedAt) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - room.roundStartedAt!;
        const remaining = Math.max(0, 30 - Math.floor(elapsed / 1000));
        setTimeLeft(remaining);

        if (remaining === 0) {
          clearInterval(interval);
          // Auto-advance to phase 3 when time runs out
          if (isHost) {
            onStartPhase(3);
          }
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [currentPhase, room.roundStartedAt, isHost, onStartPhase]);

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4">
        <Card className="bg-white/95 max-w-md w-full">
          <CardContent className="pt-6">
            <p className="text-xl text-gray-700">No questions available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const questionNumber = (room.currentQuestionIndex || 0) + 1;
  const totalQuestions = room.questions?.length || 0;
  const hasAnswered = room.answers?.[playerName] !== undefined;
  const allAnswered = room.players.every(
    (p) => room.answers?.[p.name] !== undefined,
  );

  return (
    <div className="flex flex-col items-center h-full px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center text-white">
          <h1 className={`${lilita.className} text-4xl mb-2`}>
            Question {questionNumber} / {totalQuestions}
          </h1>
          <p className="text-xl opacity-90">Room: {room.roomCode}</p>
        </div>

        {/* Question Display */}
        <Card className="bg-white/95">
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <p className="text-2xl font-bold text-gray-800 mb-2">
                {currentQuestion.text}
              </p>
              <p className="text-gray-600">
                Range: {currentQuestion.rangeMin} - {currentQuestion.rangeMax}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Phase 1: Present Question */}
        {currentPhase === 1 && (
          <Card className="bg-white/95">
            <CardContent className="pt-6">
              {isHost ? (
                <HostControls
                  phase={1}
                  onOpenGuessing={() => onStartPhase(2)}
                  onSetAnswer={() => {}}
                  onNextQuestion={() => {}}
                  correctAnswer={null}
                  setCorrectAnswer={() => {}}
                  questionRange={{
                    min: currentQuestion.rangeMin,
                    max: currentQuestion.rangeMax,
                  }}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-xl text-gray-700">
                    Waiting for host to open guessing...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Phase 2: Guessing */}
        {currentPhase === 2 && (
          <>
            <Card className="bg-white/95">
              <CardContent className="pt-6">
                <Timer timeLeft={timeLeft} maxTime={30} />
              </CardContent>
            </Card>

            <Card className="bg-white/95">
              <CardContent className="pt-6">
                {isHost ? (
                  <div className="space-y-4">
                    <p className="text-center text-xl font-semibold">
                      Players are submitting their guesses...
                    </p>
                    <PlayersList
                      players={room.players}
                      currentPlayerName={playerName}
                      answers={room.answers}
                      showAnswerStatus={true}
                    />
                    {allAnswered && (
                      <div className="text-center">
                        <p className="text-green-600 font-bold mb-2">
                          All players have answered!
                        </p>
                        <button
                          onClick={() => onStartPhase(3)}
                          className="bg-violet-500 hover:bg-violet-600 text-white px-6 py-2 rounded-lg"
                        >
                          Continue to Set Answer
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <PlayerControls
                    question={currentQuestion}
                    onSubmitGuess={onSubmitGuess}
                    hasAnswered={hasAnswered}
                    playerAnswer={room.answers?.[playerName]}
                  />
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Phase 3: Set Answer (Host only) */}
        {currentPhase === 3 && (
          <Card className="bg-white/95">
            <CardContent className="pt-6">
              {isHost ? (
                <HostControls
                  phase={3}
                  onOpenGuessing={() => {}}
                  onSetAnswer={onSetCorrectAnswer}
                  onNextQuestion={() => {}}
                  correctAnswer={null}
                  setCorrectAnswer={() => {}}
                  questionRange={{
                    min: currentQuestion.rangeMin,
                    max: currentQuestion.rangeMax,
                  }}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-xl text-gray-700">
                    Waiting for host to set the correct answer...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Phase 4: Show Results */}
        {currentPhase === 4 && (
          <Card className="bg-white/95">
            <CardContent className="pt-6">
              <Leaderboard
                players={room.players}
                correctAnswer={room.correctAnswer || 0}
                playerAnswers={room.answers || {}}
                currentPlayerName={playerName}
                isHost={isHost}
                onNextQuestion={onNextQuestion}
                isFinalQuestion={questionNumber >= totalQuestions}
              />
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="bg-red-100 border-2 border-red-400">
            <CardContent className="pt-6">
              <p className="text-red-700 text-center font-semibold">{error}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
