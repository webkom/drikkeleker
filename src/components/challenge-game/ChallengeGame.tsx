"use client";

import React, { useEffect, useState, use, useCallback } from "react";
import { Socket } from "socket.io-client";
import { lilita } from "@/lib/fonts";
import BeerContainer from "@/components/beer/beer-container";
import { Button } from "@/components/ui/button";
import CustomSwiper from "@/components/shared/custom-swiper";
import BackButton from "@/components/shared/back-button";
import Footer from "@/components/shared/footer";
import { ArrowRight, Play, ArrowLeft, Plus, Send } from "lucide-react";
import BubbleDigit from "@/components/beer/bubble-digit";
import "./ChallengeGame.css";
import QuestionInput from "@/components/shared/question-input";
import { Card } from "@/components/ui/card";

const suggestions = [
  "Peikeleik: Pek på personen som {{cursor}}",
  "Kiss/Marry/Kill: {{cursor}}",
  "Alle som har {{cursor}} må ta 5 slurker",
  "Hvis du har {{cursor}}, del ut 3 slurker",
  "Kategori: {{cursor}}",
  "Never have I ever {{cursor}}",
  "Redflag, dealbreaker eller okay: {{cursor}}",
  "Ny regel resten av runden: {{cursor}}",
];

interface Challenge {
  _id: string;
  text: string;
}

const getDigitContainerWidth = (num: number) => {
  const digitCount = String(num).length;
  return digitCount * 150;
};

const ChallengeGame = ({ roomCode }: { roomCode: string }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [newChallenge, setNewChallenge] = useState("");
  const [oldNumber, setOldNumber] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAddingChallenges, setIsAddingChallenges] = useState(false);
  const [viewTransition, setViewTransition] = useState(false);

  const challengeCount = challenges.length;

  useEffect(() => {
    if (challengeCount !== oldNumber) {
      setIsAnimating(true);
      setOldNumber(challengeCount);
      setTimeout(() => setIsAnimating(false), 600);
    }
  }, [challengeCount, oldNumber]);

  useEffect(() => {
    const initSocket = async () => {
      const { io } = await import("socket.io-client");
      const newSocket = io(
        // "http://localhost:3001",
        "https://gw000w0kwoogkg0wo0os40wk.coolify.webkom.dev",
      );

      newSocket.on("connect", () => {
        setConnected(true);
        newSocket.emit("join_room", { roomCode });
      });

      newSocket.on("disconnect", () => {
        setConnected(false);
      });

      newSocket.on("room_joined", (data) => {
        setGameStarted(data.gameStarted || false);
      });

      newSocket.on("error", () => {});

      newSocket.on("challenge_added", (data) => {
        setChallenges((prev) => {
          if (prev.some((c) => c._id === data.challenge._id)) {
            return prev;
          }
          return [...prev, data.challenge];
        });
      });

      newSocket.on("challenge_added_mid_game", (data) => {
        setChallenges((prev) => {
          if (prev.some((c) => c._id === data.challenge._id)) {
            return prev;
          }
          return [...prev, data.challenge];
        });
      });

      newSocket.on("game_started", (data) => {
        setGameStarted(true);
        setChallenges(data.challenges);
        setCurrentCard(0);
      });

      setSocket(newSocket);
    };

    initSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [roomCode]);

  const handleAddChallenge = useCallback(() => {
    if (!newChallenge.trim() || !socket) {
      return;
    }

    socket.emit("add_challenge", {
      roomCode,
      challenge: newChallenge.trim(),
    });

    setNewChallenge("");
  }, [newChallenge, socket, roomCode]);

  const handleStartGame = useCallback(() => {
    if (!socket || challenges.length === 0) return;
    socket.emit("start_game", { roomCode });
  }, [socket, challenges.length, roomCode]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddChallenge();
    }
  };

  const toggleView = () => {
    setViewTransition(true);
    setTimeout(() => {
      setIsAddingChallenges(!isAddingChallenges);
      setViewTransition(false);
    }, 150);
  };

  const setValidCurrentCard = (card: number) =>
    setCurrentCard(Math.min(Math.max(card, 0), challenges.length - 1));

  if (!connected) {
    return (
      <main className="h-screen overflow-hidden">
        <BeerContainer color="violet">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative w-32 h-32 mb-8 loading-container">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="loading-bubble" />
              ))}
            </div>
            <p className={`${lilita.className} text-2xl animate-pulse`}>
              Kobler til rom...
            </p>
          </div>
        </BeerContainer>
      </main>
    );
  }

  return (
    <main className="h-screen overflow-y-auto overflow-x-hidden">
      <BackButton href="/game-room/lobby" className="fixed top-4 left-4 z-10" />
      <BeerContainer color="violet">
        <div className="flex flex-col items-center text-center flex-1 w-full">
          <div className="flex flex-col items-between pt-12 w-full gap-6 px-4">
            <h1
              className={`${lilita.className} text-5xl pt text-center room-code`}
            >
              Kode: {roomCode}
            </h1>
            {!gameStarted ? (
              <Button
                onClick={handleStartGame}
                className="bg-green-500 hover:bg-green-600 w-full h-16 text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                disabled={challenges.length === 0}
              >
                <Play size={22} className="mr-2" />
                Start spillet
              </Button>
            ) : (
              <Button
                onClick={toggleView}
                className="bg-violet-500 hover:bg-violet-600 w-full h-12 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
              >
                {isAddingChallenges ? (
                  <>
                    <ArrowLeft size={22} className="mr-2" />
                    Tilbake til spillet
                  </>
                ) : (
                  <>
                    Legg til spørsmål
                    <Plus size={22} className="ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
          <div className="w-full max-w-2xl flex flex-col flex-grow justify-center gap-6 px-4">
            {!gameStarted || isAddingChallenges ? (
              <div
                className={`flex flex-col items-center text-center transition-opacity duration-300 ${
                  viewTransition ? "opacity-0" : "opacity-100"
                }`}
              >
                <div className="w-full max-w-2xl flex flex-col">
                  <div className="challenge-counter relative h-64 sm:h-96 flex items-center justify-center">
                    <div
                      className="relative flex items-center justify-center"
                      style={{
                        minHeight: "150px",
                        minWidth: `${getDigitContainerWidth(Math.max(challengeCount, oldNumber))}px`,
                      }}
                    >
                      <div className="flex gap-12">
                        {String(challengeCount)
                          .split("")
                          .map((digit, index) => (
                            <BubbleDigit
                              key={`new-${index}`}
                              digit={digit}
                              isAnimating={isAnimating}
                              isOld={false}
                            />
                          ))}
                      </div>

                      {isAnimating && oldNumber !== challengeCount && (
                        <div className="absolute flex gap-12">
                          {String(oldNumber)
                            .split("")
                            .map((digit, index) => (
                              <BubbleDigit
                                key={`old-${index}`}
                                digit={digit}
                                isAnimating={isAnimating}
                                isOld={true}
                              />
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Card className="w-full backdrop-blur-sm border-violet-200 shadow-xl">
                  <div className="p-4">
                    <div className="flex flex-col gap-3">
                      <QuestionInput
                        value={newChallenge}
                        onChange={setNewChallenge}
                        suggestions={suggestions}
                        placeholder="Skriv din utfordring her..."
                      />
                      <Button
                        onClick={handleAddChallenge}
                        disabled={!newChallenge.trim()}
                        onKeyDown={handleKeyPress}
                        className="w-full bg-violet-500 hover:bg-violet-600 text-white rounded-xl h-12 font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send size={20} className="mr-2" />
                        Send inn utfordring
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <div
                className={`rounded-sm transition-opacity duration-300 ${
                  viewTransition ? "opacity-0" : "opacity-100"
                } ${gameStarted ? "game-started" : ""}`}
              >
                <CustomSwiper
                  slides={challenges.map((challenge, index) => ({
                    id: challenge._id,
                    title: `${index + 1} av ${challenges.length}`,
                    content: challenge.text,
                  }))}
                  onNavigate={setCurrentCard}
                  currentIndex={currentCard}
                  effect="cards"
                  creativeEffectConfig={{
                    prev: {
                      translate: [0, 0, -800],
                      rotate: [180, 0, 0],
                    },
                    next: {
                      translate: [0, 0, -800],
                      rotate: [-180, 0, 0],
                    },
                  }}
                />
                <div className="flex gap-2 max-w-2xl mx-auto mt-4">
                  <Button
                    onClick={() => setValidCurrentCard(currentCard - 1)}
                    className="bg-violet-500 hover:bg-violet-600 w-full group shadow-md hover:shadow-lg transition-all duration-200"
                    disabled={currentCard === 0}
                  >
                    <ArrowLeft
                      size={20}
                      className="mr-1 transition-transform group-hover:-translate-x-1"
                    />
                    Forrige
                  </Button>
                  <Button
                    onClick={() => setValidCurrentCard(currentCard + 1)}
                    className="bg-violet-500 hover:bg-violet-600 w-full group shadow-md hover:shadow-lg transition-all duration-200"
                    disabled={currentCard === challenges.length - 1}
                  >
                    Neste
                    <ArrowRight
                      size={20}
                      className="ml-1 transition-transform group-hover:translate-x-1"
                    />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </BeerContainer>
    </main>
  );
};
export default ChallengeGame;
