"use client";

import { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RoomState } from "./GameRoomClient";
import {
  Swords,
  CirclePlus,
  Hourglass,
  Scroll,
  ScrollText,
} from "lucide-react";

interface RoomProps {
  initialRoomState: RoomState;
  isHost: boolean;
  socket: Socket;
}

export const Room = ({ initialRoomState, isHost, socket }: RoomProps) => {
  const [challengeCount, setChallengeCount] = useState(
    initialRoomState.challengeCount,
  );
  const [gameStarted, setGameStarted] = useState(initialRoomState.gameStarted);
  const newChallengeRef = useRef<HTMLInputElement>(null);
  const [revealedChallenge, setRevealedChallenge] = useState<string | null>(
    null,
  );
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    socket.on("challenge-update", (data: { count: number }) => {
      setChallengeCount(data.count);
      setIsLoading(false);
    });

    socket.on("game-started", () => {
      setGameStarted(true);
      setIsGameOver(false);
      setRevealedChallenge(
        "The game has started! The host will reveal the first challenge.",
      );
      setIsLoading(false);
    });

    socket.on("new-challenge-revealed", (data: { text: string }) => {
      setRevealedChallenge(data.text);
      setIsLoading(false);
    });

    socket.on("game-over", () => {
      setIsGameOver(true);
      setRevealedChallenge("You've completed all the challenges!");
      setIsLoading(false);
    });

    return () => {
      socket.off("challenge-update");
      socket.off("game-started");
      socket.off("new-challenge-revealed");
      socket.off("game-over");
    };
  }, [socket]);

  const handleAddChallenge = () => {
    const challengeText = newChallengeRef.current?.value;
    if (challengeText) {
      setIsLoading(true);
      socket.emit("add-challenge", { challenge: challengeText });
      if (newChallengeRef.current) {
        newChallengeRef.current.value = "";
      }
    }
  };

  const handleStartGame = () => {
    setIsLoading(true);
    socket.emit("start-game");
  };

  const handleRevealNextChallenge = () => {
    setIsLoading(true);
    socket.emit("next-challenge");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleAddChallenge();
    }
  };

  return (
    <div className="flex flex-col items-center text-center h-full p-4">
      <div className="w-full max-w-2xl flex flex-col grow justify-center gap-6">
        <Card className="flex flex-col justify-center min-h-[300px] shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">
              {gameStarted ? "" : "Send inn utfordringer!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4 px-8 pb-8">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2">
                <Hourglass className="h-12 w-12 animate-spin text-teal-500" />
                <p className="text-lg">Laster...</p>
              </div>
            ) : gameStarted ? (
              <p className="text-2xl font-semibold">{revealedChallenge}</p>
            ) : (
              <>
                <div className="flex items-center justify-center mb-4">
                  {challengeCount === 0 ? (
                    <Scroll className="h-12 w-12 text-amber-500" />
                  ) : (
                    <ScrollText className="h-12 w-12 text-green-500" />
                  )}
                </div>
                <p className="text-xl font-medium">
                  Utfordringer:{" "}
                  <span className="font-bold">{challengeCount}</span>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {challengeCount === 0
                    ? "Legg til utfordringer først!"
                    : "Klar for å starte spillet!"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {gameStarted ? (
          isHost &&
          !isGameOver && (
            <Button
              onClick={handleRevealNextChallenge}
              className="w-full bg-teal-500 hover:bg-teal-600 text-lg py-6 shadow-md"
              disabled={isLoading}
            >
              <Swords className="mr-2 h-6 w-6" /> Vis neste utfordring
            </Button>
          )
        ) : (
          <Card className="w-full shadow-md">
            <CardContent className="p-6 space-y-5">
              <div className="flex gap-2">
                <Input
                  ref={newChallengeRef}
                  placeholder="Skriv inn spørsmål..."
                  className="text-lg py-6"
                  onKeyDown={handleKeyDown}
                />
                <Button
                  onClick={handleAddChallenge}
                  className="bg-fuchsia-500 hover:bg-fuchsia-600 px-4"
                  disabled={isLoading}
                >
                  <CirclePlus className="h-5 w-5" />
                </Button>
              </div>
              {isHost && (
                <Button
                  onClick={handleStartGame}
                  disabled={challengeCount === 0 || isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                >
                  {challengeCount === 0 ? (
                    "Add challenges first"
                  ) : (
                    <>
                      <Swords className="mr-2 h-5 w-5" /> Start Spill
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {isGameOver && (
          <Card className="w-full bg-amber-50 shadow-md">
            <CardContent className="p-6 text-center">
              <p className="text-xl font-semibold mb-4">Game Over!</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Start New Game
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
