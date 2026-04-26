"use client";

import React, { useEffect, useState, use, useCallback } from "react";
import { lilita } from "@/lib/fonts";
import BeerContainer from "@/components/beer/beer-container";
import { Button } from "@/components/ui/button";
import CustomSwiper from "@/components/shared/custom-swiper";
import BackButton from "@/components/shared/back-button";
import Footer from "@/components/shared/footer";
import { ArrowRight, Play, ArrowLeft, Plus, Send } from "lucide-react";
import BubbleDigit from "@/components/beer/bubble-digit";
import QuestionInput from "@/components/shared/question-input";
import { Card } from "@/components/ui/card";
import LoadingScreen from "@/components/beer/loading-screen";
import { ensureFirebaseUser } from "@/lib/firebase";
import {
  addChallenge,
  listenToRoom,
  startChallengeGame,
} from "@/lib/firebaseRooms";

const suggestions = [
  "Peikeleik: Peik på personen som {{cursor}}",
  "Fuck/Marry/Kill: {{cursor}}",
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

export default function DefaultGamePage({
  params,
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const unwrappedParams = use(params);
  const roomCode = unwrappedParams.roomCode;

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState("");
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
    let unsubscribe: (() => void) | undefined;
    let isMounted = true;

    const init = async () => {
      try {
        const user = await ensureFirebaseUser();
        if (!isMounted) return;

        unsubscribe = listenToRoom(
          roomCode,
          (room) => {
            if (!room) {
              setError("Fant ikke rommet");
              setIsConnected(false);
              return;
            }

            setIsConnected(true);
            setIsHost(room.hostUid === user.uid);
            setGameStarted(room.gameStarted);
            setChallenges(room.challenges);
          },
          (listenError) => {
            setError(listenError.message);
            setIsConnected(false);
          },
        );
      } catch (initError) {
        setError(
          initError instanceof Error
            ? initError.message
            : "Kunne ikke koble til Firebase",
        );
        setIsConnected(false);
      }
    };

    init();

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [roomCode]);

  const handleAddChallenge = useCallback(() => {
    if (!newChallenge.trim()) {
      return;
    }

    addChallenge(roomCode, newChallenge.trim()).catch((addError) => {
      setError(
        addError instanceof Error
          ? addError.message
          : "Kunne ikke legge til utfordring",
      );
    });
    setNewChallenge("");
  }, [newChallenge, roomCode]);

  const handleStartGame = useCallback(() => {
    if (challenges.length === 0) return;
    startChallengeGame(roomCode).catch((startError) => {
      setError(
        startError instanceof Error
          ? startError.message
          : "Kunne ikke starte spillet",
      );
    });
  }, [challenges.length, roomCode]);

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

  if (!isConnected && error) {
    return (
      <main className="h-screen overflow-hidden">
        <BeerContainer color="violet">
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <div className="max-w-md rounded-2xl border border-red-300 bg-red-100 p-6 font-semibold text-red-700">
              {error}
            </div>
          </div>
        </BeerContainer>
      </main>
    );
  }

  if (!isConnected) {
    return <LoadingScreen color="violet" />;
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
              Kode: {roomCode.toUpperCase()}
            </h1>
            {!gameStarted && isHost ? (
              <Button
                onClick={handleStartGame}
                className="bg-green-500 hover:bg-green-600 w-full h-16 text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                disabled={challenges.length === 0}
              >
                <Play size={22} className="mr-2" />
                Start spillet
              </Button>
            ) : !gameStarted ? (
              <div className="bg-white/80 text-violet-900 rounded-xl p-4 font-semibold">
                Venter på at hosten starter spillet...
              </div>
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
                      {error && (
                        <div className="rounded-xl border border-red-300 bg-red-100 p-3 text-sm font-semibold text-red-700">
                          {error}
                        </div>
                      )}
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
}
