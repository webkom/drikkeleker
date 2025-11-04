"use client";

import { useState, useEffect, use } from "react";
import { lilita } from "@/lib/fonts";
import { useGameSocket } from "@/hooks/useGameSocket";
import GameRoom from "@/components/guessing-game/GameRoom";
import BeerContainer from "@/components/beer/beer-container";
import BackButton from "@/components/shared/back-button";
import Footer from "@/components/shared/footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LoadingScreen from "@/components/beer/loading-screen";

export default function GameRoomPage({
                                         params,
                                     }: {
    params: Promise<{ roomCode: string }>;
}) {
    const { roomCode } = use(params);

    const {
        room,
        isHost,
        isConnected,
        error,
        playerName,
        joinRoom,
        addQuestion,
        updateQuestion,
        startGame,
        startPhase,
        submitGuess,
        setCorrectAnswer,
        nextQuestion,
    } = useGameSocket(roomCode);

    const [inputName, setInputName] = useState("");
    const [hasJoinedAsPlayer, setHasJoinedAsPlayer] = useState(false);

    // Check if we're a returning player
    useEffect(() => {
        const storedName = sessionStorage.getItem(`playerName_${roomCode}`);
        if (storedName && room) {
            setHasJoinedAsPlayer(true);
        }
    }, [roomCode, room]);

    // Host automatically bypasses join screen
    useEffect(() => {
        if (isHost && room) {
            setHasJoinedAsPlayer(true);
        }
    }, [isHost, room]);

    const handleJoinRoom = () => {
        if (inputName.trim()) {
            joinRoom(inputName.trim());
            setHasJoinedAsPlayer(true);
        }
    };

    // Loading states
    if (!isConnected) {
        return <LoadingScreen color="violet" />;
    }

    if (!room) {
        return <LoadingScreen color="violet" />;
    }

    // HOST VIEW - Goes straight to game room
    if (isHost) {
        return (
            <main className="h-screen">
                <BackButton
                    href="/game-room/lobby"
                    className="absolute top-4 left-4 z-10"
                />
                <BeerContainer color="violet" className="overflow-y-auto">
                    <GameRoom
                        room={room}
                        isHost={true}
                        playerName="Host"
                        onAddQuestion={addQuestion}
                        onUpdateQuestion={updateQuestion}
                        onStartGame={startGame}
                        onStartPhase={startPhase}
                        onSubmitGuess={submitGuess}
                        onSetCorrectAnswer={setCorrectAnswer}
                        onNextQuestion={nextQuestion}
                        error={error}
                    />
                    <Footer />
                </BeerContainer>
            </main>
        );
    }

    // PLAYER VIEW - Need name first
    if (!hasJoinedAsPlayer || !playerName) {
        return (
            <main className="h-screen">
                <BackButton
                    href="/game-room/lobby"
                    className="absolute top-4 left-4 z-10"
                />
                <BeerContainer color="violet">
                    <div className="flex flex-col items-center justify-center h-full px-4">
                        <h1
                            className={`${lilita.className} text-5xl text-white mb-8 text-center`}
                        >
                            Join Room: {roomCode}
                        </h1>
                        <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full">
                            <Input
                                type="text"
                                placeholder="Enter your name"
                                value={inputName}
                                onChange={(e) => setInputName(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
                                className="w-full p-3 border-gray-300 rounded-lg mb-4 text-lg text-center h-14"
                                maxLength={20}
                                autoFocus
                            />
                            <Button
                                onClick={handleJoinRoom}
                                disabled={!inputName.trim()}
                                className="w-full bg-violet-500 hover:bg-violet-600 disabled:bg-gray-400 text-white font-bold py-3 h-12 rounded-lg text-lg"
                            >
                                Join Game
                            </Button>
                            {error && (
                                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                    <Footer />
                </BeerContainer>
            </main>
        );
    }

    // PLAYER VIEW - After joining with name
    return (
        <main className="h-screen">
            <BackButton
                href="/game-room/lobby"
                className="absolute top-4 left-4 z-10"
            />
            <BeerContainer color="violet" className="overflow-y-auto">
                <GameRoom
                    room={room}
                    isHost={false}
                    playerName={playerName}
                    onAddQuestion={addQuestion}
                    onUpdateQuestion={updateQuestion}
                    onStartGame={startGame}
                    onStartPhase={startPhase}
                    onSubmitGuess={submitGuess}
                    onSetCorrectAnswer={setCorrectAnswer}
                    onNextQuestion={nextQuestion}
                    error={error}
                />
                <Footer />
            </BeerContainer>
        </main>
    );
}
