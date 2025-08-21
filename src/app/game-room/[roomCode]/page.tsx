"use client";

import { useEffect, useState, use } from "react";
import { Socket } from "socket.io-client";
import { lilita } from "@/lib/fonts";
import BeerContainer from "@/components/beer/beer-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BackButton from "@/components/back-button";
import Footer from "@/components/footer";
import { ArrowRight, Plus, Play, ArrowLeft } from "lucide-react";
import BubbleDigit from "@/components/beer/bubble-digit";

interface Challenge {
  _id: string;
  text: string;
  revealed: boolean;
  style: {
    transform: string;
    transition: string;
  };
}

interface Card {
  id: number;
  content: string;
  style: {
    transform: string;
    transition: string;
  };
}

interface StoredCard {
  card: number;
  updatedAt: string;
}

const getConsistentRandom = (
  id: string,
  min: number,
  max: number,
  offset: number = 0,
) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i) + offset;
    hash = hash & hash;
  }
  return (Math.abs(hash) % (max - min + 1)) + min;
};
const shuffle = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};
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
  const [cards, setCards] = useState<Card[]>([]);
  const [slicedChallenges, setSlicedChallenges] = useState<Challenge[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [nextDisabled, setNextDisabled] = useState(false);
  const [prevDisabled, setPrevDisabled] = useState(true);

  const [newChallenge, setNewChallenge] = useState("");
  const [displayCount, setDisplayCount] = useState(0);
  const [currentDigits, setCurrentDigits] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const [oldNumber, setOldNumber] = useState(0);

  useEffect(() => {
    if (challenges.length !== displayCount) {
      setOldNumber(displayCount); // Keep it as a number
      setDisplayCount(challenges.length);
      setIsAnimating(true);

      setTimeout(() => {
        setIsAnimating(false);
      }, 600);
    }
  }, [challenges.length]);
  useEffect(() => {
    const initSocket = async () => {
      const { io } = await import("socket.io-client");
      const newSocket = io("http://localhost:3001");
      setSocket(newSocket);

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
          setChallenges([]);
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
        setNextDisabled(false);
        setPrevDisabled(true);
      });

      newSocket.on("next_challenge", (data) => {
        console.log("Next challenge:", data);
        setCurrentCard(data.currentIndex);
      });
    };

    initSocket();

    return () => {
      socket?.disconnect();
    };
  }, [roomCode]);
  useEffect(() => {
    setPrevDisabled(currentCard === 0);
    setNextDisabled(currentCard === challenges.length - 1);

    const challengeList = shuffle(
      challenges.map((challenge: { text: string }) => challenge.text),
    );
    const updatedCards: Card[] = challengeList.map((challenge, index) => {
      const relativeIndex = index - currentCard;
      const transform =
        relativeIndex < 0
          ? `translate(-100vw, ${relativeIndex * 10}px)`
          : `translate(0, ${relativeIndex * 10}px)`;

      const style = {
        transform: transform,
        transition: "transform 0.5s",
      };

      return { id: index, content: challenge, style: style };
    });

    setCards(
      updatedCards.slice(
        currentCard === 0 ? 0 : currentCard - 1,
        currentCard + 5,
      ),
    );
  }, [currentCard, gameStarted]);
  useEffect(() => {
    setSlicedChallenges(challenges.slice(Math.max(0, challenges.length - 10)));
  }, [challenges]);

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
    for (const challenge of challenges) {
      console.log(challenge.text);
    }
    setGameStarted(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddChallenge();
    }
  };

  if (!connected) {
    return (
      <main className="overflow-hidden h-screen flex items-center justify-center">
        <p>Connecting to room...</p>
      </main>
    );
  }

  const setValidCurrentCard = (card: number) =>
    setCurrentCard(Math.min(Math.max(card, 0), challenges.length - 1));

  return (
    <main className="overflow-hidden h-screen">
      <BackButton
        href="/game-room/lobby"
        className="absolute top-4 left-4 z-10"
      />
      <BeerContainer color="violet">
        <div className="flex flex-col items-center text-center h-full">
          <h1 className={`${lilita.className} text-5xl pt-12`}>
            Kode: {roomCode}
          </h1>
          <div className="w-full max-w-2xl flex flex-col grow justify-center gap-6">
            {!gameStarted ? (
              <div className="flex flex-col items-center text-center h-full">
                <div className="w-full max-w-2xl flex flex-col grow justify-center">
                  <div className="relative h-96 flex items-center justify-center">
                    {/* {challenges.length ? (
                                            slicedChallenges.map((challenge, index) => {
                                                const randomX = getConsistentRandom(challenge._id, -10, 10, 0);
                                                const randomRotation = getConsistentRandom(challenge._id, -5, 5, 100);
                                                const stackHeight = -index * 5;
                                                const transform = `translate(${randomX}px, ${stackHeight}px) rotate(${randomRotation}deg)`;
                                                const relativeIndex = index - currentCard;
                                                // const transform =
                                                    relativeIndex < 0
                                                        ? `translate(-100vw, ${relativeIndex * 10}px)`
                                                        : `translate(0, ${-relativeIndex * 10}px)`;

                                                return (
                                                    <Card
                                                        key={challenge._id}
                                                        className="absolute cursor-pointer left-0 right-0 flex flex-col justify-center h-full bottom-12"
                                                        style={{
                                                            transform: transform,
                                                            transition: "transform 0.5s",
                                                            zIndex: index,
                                                            // animation: "dropIn 0.5s ease-out forwards",
                                                        }}
                                                    >
                                                        {slicedChallenges.length - 1 === index && (
                                                            <CardHeader>
                                                                {challenges.length}
                                                            </CardHeader>
                                                        )}
                                                    </Card>
                                                );
                                            })


                                        ) : (
                                            <div className="flex flex-col items-center text-center h-full">
                                                Ingen utfordringer enda! Skriv en :D
                                            </div>
                                        )
                                        */}
                    <div
                      className="relative flex items-center justify-center"
                      style={{
                        minHeight: "200px",
                        minWidth: `${getDigitContainerWidth(Math.max(displayCount, oldNumber))}px`,
                      }}
                    >
                      <div className="flex gap-12">
                        {String(displayCount)
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

                      {isAnimating && oldNumber !== displayCount && (
                        <div className="absolute flex gap-">
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

                <div className="ps-2 flex flex-col gap-2 w-full">
                  <div className="flex gap-2 items-center w-full">
                    <Input
                      value={newChallenge}
                      onChange={(e) => setNewChallenge(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Skriv inn en utfordring..."
                      className="flex-1 bg-fuchsia-100 text-lg pd"
                    />
                    <Button
                      onClick={handleAddChallenge}
                      disabled={!newChallenge.trim()}
                      className="bg-violet-500 hover:bg-violet-600"
                    >
                      <Plus size={20} />
                    </Button>
                  </div>

                  {challenges.length > 0 && (
                    <Button
                      onClick={handleStartGame}
                      className="bg-green-500 hover:bg-green-600 w-full h-16 text-lg"
                    >
                      <Play size={20} className="mr-2" />
                      Start
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center h-full">
                <div className="w-full max-w-2xl flex flex-col grow justify-center">
                  <div className="relative h-96">
                    {cards.map((card, index) => (
                      <Card
                        key={card.id}
                        className="absolute cursor-pointer left-0 right-0 flex flex-col justify-center h-full bottom-12"
                        style={{
                          ...card.style,
                          zIndex: -index + 5,
                        }}
                      >
                        <CardHeader>
                          <CardTitle>Utfordring {card.id + 1}</CardTitle>
                        </CardHeader>
                        <CardContent>{card.content}</CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setValidCurrentCard(currentCard - 1)}
                      className="bg-fuchsia-500 hover:bg-fuchsia-500/90 w-full group"
                      disabled={prevDisabled}
                    >
                      <ArrowLeft
                        size={20}
                        className="mr-1 transition-transform group-hover:-translate-x-1"
                      />
                      Forrige spørsmål {challenges.length}
                    </Button>
                    <Button
                      onClick={() => setValidCurrentCard(currentCard + 1)}
                      className="bg-fuchsia-500 hover:bg-fuchsia-500/90 w-full group"
                      disabled={nextDisabled}
                    >
                      Neste spørsmål
                      <ArrowRight
                        size={20}
                        className="ml-1 transition-transform group-hover:translate-x-1"
                      />
                    </Button>
                  </div>
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
