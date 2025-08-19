"use client";

import {useState, useEffect, useRef} from "react";
import {Socket} from "socket.io-client";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {RoomState} from "./GameRoomClient";
import {Swords, PlusCircle, Hourglass, ArrowLeft, ArrowRight} from "lucide-react";

interface DisplayCard {
    id: number;
    content: string;
    style: {
        transform: string;
        transition: string;
        zIndex: number;
    };
}

interface RoomProps {
    initialRoomState: RoomState;
    isHost: boolean;
    socket: Socket;
}

export const Room = ({initialRoomState, isHost, socket}: RoomProps) => {
    const [challengeCount, setChallengeCount] = useState(initialRoomState.challengeCount);
    const [gameStarted, setGameStarted] = useState(initialRoomState.gameStarted);
    const newChallengeRef = useRef<HTMLInputElement>(null);


    const [allChallenges, setAllChallenges] = useState<string[]>([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [displayCards, setDisplayCards] = useState<DisplayCard[]>([]);

    useEffect(() => {
        socket.on('challenge-update', (data: { count: number }) => {
            setChallengeCount(data.count);
        });

        socket.on('game-started', (data: { challenges: string[] }) => {
            setAllChallenges(data.challenges);
            setCurrentCardIndex(0);
            setGameStarted(true);
        });

        return () => {
            socket.off('challenge-update');
            socket.off('game-started');
        };
    }, [socket]);


    useEffect(() => {
        if (allChallenges.length === 0) return;

        const updatedCards: DisplayCard[] = allChallenges.map((content, index) => {
            const relativeIndex = index - currentCardIndex;
            const transform = relativeIndex < 0
                ? `translate(-100vw, ${relativeIndex * 10}px)`
                : `translate(0, ${relativeIndex * 10}px)`;

            return {
                id: index,
                content,
                style: {
                    transform,
                    transition: "transform 0.5s",
                    zIndex: allChallenges.length - index,
                },
            };
        });

        setDisplayCards(
            updatedCards.slice(Math.max(0, currentCardIndex - 1), currentCardIndex + 5)
        );
    }, [currentCardIndex, allChallenges]);

    const handleAddChallenge = () => {
        const challengeText = newChallengeRef.current?.value;
        if (challengeText) {
            socket.emit('add-challenge', {challenge: challengeText});
            newChallengeRef.current.value = "";
        }
    };

    const handleStartGame = () => socket.emit('start-game');

    const setValidCurrentCard = (index: number) => {
        setCurrentCardIndex(Math.min(Math.max(index, 0), allChallenges.length - 1));
    };

    return (
        <div className="flex flex-col items-center text-center h-full">
            <div className="w-full max-w-2xl flex flex-col grow justify-center">
                {/* --- CARD STACK AREA --- */}
                <div className="relative h-96">
                    {gameStarted ? (

                        displayCards.map((card) => (
                            <Card
                                key={card.id}
                                className="absolute cursor-pointer left-0 right-0 flex flex-col justify-center h-full bottom-12"
                                style={card.style}
                                onClick={() => setValidCurrentCard(card.id + 1)}
                            >
                                <CardHeader>
                                    <CardTitle>Challenge {card.id + 1}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-2xl font-semibold">
                                    {card.content}
                                </CardContent>
                            </Card>
                        ))
                    ) : (

                        <Card className="absolute left-0 right-0 flex flex-col justify-center h-full bottom-12">
                            <CardContent className="flex flex-col items-center justify-center gap-4">
                                <Hourglass className="h-16 w-16 text-muted-foreground"/>
                                <p className="text-2xl font-semibold">
                                    Challenges in Pile: {challengeCount}
                                </p>
                                <p className="text-muted-foreground">
                                    {isHost ? "Add challenges and press Start when you're ready!" : "Waiting for the host to start the game..."}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
                {gameStarted ? (
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setValidCurrentCard(currentCardIndex - 1)}
                            className="bg-fuchsia-500 hover:bg-fuchsia-500/90 w-full group"
                            disabled={currentCardIndex === 0}
                        >
                            <ArrowLeft size={20} className="mr-1"/> Previous
                        </Button>
                        <Button
                            onClick={() => setValidCurrentCard(currentCardIndex + 1)}
                            className="bg-teal-500 hover:bg-teal-500/90 w-full group"
                            disabled={currentCardIndex === allChallenges.length - 1}
                        >
                            Next <ArrowRight size={20} className="ml-1"/>
                        </Button>
                    </div>
                ) : (
                    <Card className="w-full">
                        <CardContent className="p-4 space-y-4">
                            <div className="flex gap-2">
                                <Input ref={newChallengeRef} placeholder="Enter a new question..."/>
                                <Button onClick={handleAddChallenge} className="bg-fuchsia-500 hover:bg-fuchsia-600">
                                    <PlusCircle className="h-4 w-4"/>
                                </Button>
                            </div>
                            {isHost && (
                                <Button
                                    onClick={handleStartGame}
                                    disabled={challengeCount === 0}
                                    className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                                >
                                    <Swords className="mr-2 h-5 w-5"/>
                                    Start Game
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};
