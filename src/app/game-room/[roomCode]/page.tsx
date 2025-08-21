"use client";

import React, {useEffect, useState, use} from "react";
import {Socket} from "socket.io-client";
import {lilita} from "@/lib/fonts";
import BeerContainer from "@/components/beer/beer-container";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import CustomSwiper from "@/app/swipe-test/page";
import BackButton from "@/components/back-button";
import Footer from "@/components/footer";
import {ArrowRight, Plus, Play, ArrowLeft, ArrowUp} from "lucide-react";
import BubbleDigit from "@/components/beer/bubble-digit";
import {Swiper, SwiperSlide} from 'swiper/react';
import {EffectCreative} from "swiper/modules";
import 'swiper/css';
import 'swiper/css/effect-creative';


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
const RoomPage = ({params}: { params: Promise<{ roomCode: string }> }) => {
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

    const [showArrow, setShowArrow] = useState(false);
    const [oldNumber, setOldNumber] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);


    const basicSlides = Array(9).fill(0).map((_, i) => ({
        id: `basic-${i}`,
        content: `Slide ${i + 1}`
    }));
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
            const {io} = await import("socket.io-client");
            const newSocket = io("http://localhost:3001");
            setSocket(newSocket);

            newSocket.on("connect", () => {
                console.log("Connected to server");
                setConnected(true);
                newSocket.emit("join_room", {roomCode});
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

            return {id: index, content: challenge, style: style};
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

        setIsSubmitting(true);
        setTimeout(() => setIsSubmitting(false), 600);
    };


    const handleStartGame = () => {
        if (!socket || challenges.length === 0) return;

        socket.emit("start_game", {roomCode});
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
                                            className={`absolute right-2 top-1/2 -translate-y-1/2 bg-violet-600  hover:bg-violet-700`}
                                        >
                                            <ArrowUp size={20}/>
                                        </Button>
                                    </div>

                                        <Button
                                            onClick={handleStartGame}
                                            className="bg-green-500 hover:bg-green-600 w-full h-16 text-lg rounded-xl transition-all duration-300"
                                            disabled={challenges.length === 0}
                                        >
                                            <Play size={20} className="mr-2"/>
                                            Start
                                        </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-sm">
                                <CustomSwiper
                                    slides={challenges.map((challenge) => ({
                                        id: challenge._id,
                                        content: challenge.text,
                                    }))}
                                    onCardClick={(id) => setValidCurrentCard(Number(id) + 1)}
                                    onNavigate={setCurrentCard}
                                    currentIndex={currentCard}
                                    effect='cards'
                                    creativeEffectConfig={{
                                        prev: {
                                            translate: [0, 0, -800],
                                            rotate: [180, 0, 0],
                                        },
                                        next: {
                                            translate: [0, 0, -800],
                                            rotate: [-180, 0, 0],
                                        }
                                    }}
                                />
                                <div className="flex gap-2 max-w-2xl mx-auto">
                                    <Button
                                        onClick={() => setValidCurrentCard(currentCard - 1)}
                                        className="bg-fuchsia-500 hover:bg-fuchsia-500/90 w-full group"
                                        disabled={prevDisabled}
                                    >
                                        <ArrowLeft
                                            size={20}
                                            className="mr-1 transition-transform group-hover:-translate-x-1"
                                        />
                                        Forrige
                                    </Button>
                                    <Button
                                        onClick={() => setValidCurrentCard(currentCard + 1)}
                                        className="bg-fuchsia-500 hover:bg-fuchsia-500/90 w-full group"
                                        disabled={nextDisabled}
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
                <Footer/>
            </BeerContainer>
        </main>
    );
};
export default RoomPage;
