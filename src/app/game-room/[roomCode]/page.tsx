"use client";

import React, { useEffect, useState, use } from "react";
import { Socket } from "socket.io-client";
import { lilita } from "@/lib/fonts";
import BeerContainer from "@/components/beer/beer-container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomSwiper from "@/app/swipe/page";
import BackButton from "@/components/back-button";
import Footer from "@/components/footer";
import { ArrowRight, Play, ArrowLeft, ArrowUp } from "lucide-react";
import BubbleDigit from "@/components/beer/bubble-digit";

interface Challenge {
  _id: string;
  text: string;
}

const getDigitContainerWidth = (num: number) => {
  const digitCount = String(num).length;
  return digitCount * 150;
};

const RoomPage = ({ params }: { params: Promise<{ roomCode: string }> }) => {
  const unwrappedParams = use(params);
  const roomCode = unwrappedParams.roomCode;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [newChallenge, setNewChallenge] = useState("");
  const [oldNumber, setOldNumber] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

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
      const newSocket = io("http://localhost:3001");

      newSocket.on("connect", () => {
        console.log("Connected to server");
        setConnected(true);
        newSocket.emit("join_room", { roomCode });
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from server");
        setConnected(false);
      });

      newSocket.on("room_joined", (data) => {
        if (data.success) {
          console.log(
            "Successfully joined room with",
            data.challengeCount,
            "challenges",
          );
          setGameStarted(data.gameStarted || false);
        } else {
          alert("Failed to join room: " + data.error);
        }
      });

      newSocket.on("challenge_added", (data) => {
        console.log("Challenge added:", data);
        setChallenges((prev) => [...prev, data.challenge]);
      });

      newSocket.on("game_started", (data) => {
        console.log("Game started");
        setGameStarted(true);
        setChallenges(data.challenges);
        setCurrentCard(0);
      });

      setSocket(newSocket);
    };

    initSocket();

    return () => {
      socket?.disconnect();
    };
  }, [roomCode]);

  const handleAddChallenge = () => {
    if (!newChallenge.trim() || !socket) return;

    socket.emit("add_challenge", {
      roomCode,
      challenge: newChallenge.trim(),
    });

    setNewChallenge("");
  };

  const handleStartGame = () => {
    if (!socket || challenges.length === 0) return;
    socket.emit("start_game", { roomCode });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddChallenge();
    }
  };

  const setValidCurrentCard = (card: number) =>
    setCurrentCard(Math.min(Math.max(card, 0), challenges.length - 1));

  if (!connected) {
    return (
      <main className="overflow-hidden h-screen">
        <BeerContainer color="violet">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative w-32 h-32 mb-8">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-6 h-6 bg-white rounded-full opacity-70"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: `rotate(${i * 45}deg) translateY(-40px)`,
                    animation: `pulse 1.4s ease-in-out ${i * 0.175}s infinite`,
                  }}
                />
              ))}
            </div>
            <p className={`${lilita.className} text-2xl animate-pulse`}>
              Kobler til rom...
            </p>
          </div>
        </BeerContainer>
        <style jsx>{`
          @keyframes pulse {
            0%,
            100% {
              transform: rotate(var(--rotation)) translateY(-40px) scale(1);
              opacity: 0.7;
            }
            50% {
              transform: rotate(var(--rotation)) translateY(-40px) scale(1.5);
              opacity: 0.3;
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="overflow-hidden h-screen">
      <BackButton
        href="/game-room/lobby"
        className="absolute top-4 left-4 z-10"
      />
      <BeerContainer color="violet">
        <div className="flex flex-col items-center text-center h-full">
          <h1 className={`${lilita.className} text-5xl pt-12 text-center`}>
            Kode: {roomCode}
          </h1>
          <div className="w-full max-w-2xl flex flex-col grow justify-center gap-6">
            {!gameStarted ? (
              <div className="flex flex-col items-center text-center h-full">
                <div className="w-full max-w-2xl flex flex-col grow justify-center">
                  <div className="relative h-96 flex items-center justify-center">
                    <div
                      className="relative flex items-center justify-center"
                      style={{
                        minHeight: "200px",
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
                <div className="w-full space-y-4">
                  <div className="relative">
                    <input
                      value={newChallenge}
                      onChange={(e) => setNewChallenge(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Skriv inn en utfordring..."
                      className="w-full pl-6 pr-16 py-4 rounded-xl focus:outline-violet-300"
                    />
                    <Button
                      onClick={handleAddChallenge}
                      disabled={!newChallenge.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-violet-600 hover:bg-violet-700"
                    >
                      <ArrowUp size={20} />
                    </Button>
                  </div>

                  <Button
                    onClick={handleStartGame}
                    className="bg-green-500 hover:bg-green-600 w-full h-16 text-lg rounded-xl transition-all duration-300"
                    disabled={challenges.length === 0}
                  >
                    <Play size={20} className="mr-2" />
                    Start
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-sm">
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
                <div className="flex gap-2 max-w-2xl mx-auto">
                  <Button
                    onClick={() => setValidCurrentCard(currentCard - 1)}
                    className="bg-violet-500 hover:bg-violet-500/90 w-full group"
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
                    className="bg-violet-500 hover:bg-violet-500/90 w-full group"
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

export default RoomPage;
