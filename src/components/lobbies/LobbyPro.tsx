"use client";

import { useState, useEffect } from "react";
import { lilita } from "@/lib/fonts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Popup from "@/components/lobbies/Popup";
import ShinyText from "@/components/shared/shiny-text";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSocket } from "@/context/SocketContext";
import { Plus, Users, Loader2, ArrowRight, UserCog } from "lucide-react";

const generateRoomCode = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

const LobbyPro = () => {
    const [roomCode, setRoomCode] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [showNameInput, setShowNameInput] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        const handleRoomCreated = (data: any) => {
            setIsLoading(false);
            if (data.success) {
                // Redirect to PRO guessing game (not /default/)
                router.push(`/game-room/${data.roomCode}`);
            } else {
                setError(data.error || "Could not create room");
            }
        };

        const handleRoomExists = (data: any) => {
            setIsLoading(false);
            if (data.roomExists) {
                setShowNameInput(true);
            } else {
                setError("Room not found");
            }
        };

        const handleRoomJoined = (data: any) => {
            setIsLoading(false);
            if (data.success && data.playerName) {
                sessionStorage.setItem(`playerName_${roomCode}`, data.playerName);
                // Redirect to PRO guessing game (not /default/)
                router.push(`/game-room/${roomCode}`);
            } else if (!data.success) {
                setError(data.error || "Could not join room");
            }
        };

        socket.on("room_created", handleRoomCreated);
        socket.on("room_exists", handleRoomExists);
        socket.on("room_joined", handleRoomJoined);

        return () => {
            socket.off("room_created", handleRoomCreated);
            socket.off("room_exists", handleRoomExists);
            socket.off("room_joined", handleRoomJoined);
        };
    }, [socket, router, roomCode]);

    const handleInputCode = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRoomCode(e.target.value.slice(0, 6));
        setError("");
    };

    const handleCreateRoom = () => {
        if (!socket) return;
        setIsLoading(true);
        setError("");
        const newRoomCode = generateRoomCode();
        // Create a "guessing" game type for PRO
        socket.emit("create_room", { roomCode: newRoomCode, gameType: "guessing" });
    };

    const handleVerifyCode = () => {
        if (!roomCode.trim() || roomCode.length !== 6) {
            return setError("Enter a valid code");
        }
        if (!socket) return;

        setIsLoading(true);
        setError("");
        socket.emit("join_room", { roomCode: roomCode.trim() });
    };

    const handleJoinWithName = () => {
        if (!playerName.trim()) {
            return setError("Enter your name");
        }
        if (!socket) return;

        setIsLoading(true);
        setError("");
        socket.emit("join_room", {
            roomCode: roomCode.trim(),
            playerName: playerName.trim(),
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            if (showNameInput) {
                handleJoinWithName();
            } else {
                handleVerifyCode();
            }
        }
    };

    const handleBackToCode = () => {
        setShowNameInput(false);
        setPlayerName("");
        setError("");
    };

    return (
        <div className="flex flex-col items-center text-center h-full">
            <div className="flex items-center justify-center gap-4 pt-12">
                <h1 className={`${lilita.className} text-5xl leading-tight`}>
                    Viljens Drikkelek
                    <ShinyText text={"PRO"} speed={3} className="bg-yellow-400" />
                </h1>
                <Popup />
            </div>

            <div className="w-full max-w-md flex flex-col grow justify-center gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <UserCog size={24} /> Play as host
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={handleCreateRoom}
                            disabled={isLoading}
                            className="bg-yellow-500 hover:bg-yellow-600 w-full h-12 text-lg rounded-xl shine-container"
                        >
                            {isLoading ? "Creating..." : <ArrowRight size={24} />}
                        </Button>
                    </CardContent>
                </Card>

                <Card style={{ perspective: "1200px" }}>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Users size={24} /> Join as player
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="min-h-[80px]">
                        <AnimatePresence mode="wait">
                            {!showNameInput ? (
                                <motion.div
                                    key="code"
                                    initial={{ opacity: 0, rotateY: -90 }}
                                    animate={{ opacity: 1, rotateY: 0 }}
                                    exit={{ opacity: 0, rotateY: 90 }}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                    style={{ transformStyle: "preserve-3d" }}
                                    className="flex flex-row items-center gap-3"
                                >
                                    <Input
                                        type="number"
                                        placeholder="123456"
                                        value={roomCode}
                                        onChange={handleInputCode}
                                        onKeyPress={handleKeyPress}
                                        maxLength={6}
                                        className="flex-grow text-center text-3xl font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-gray-300 rounded-xl px-4 py-6 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                    />
                                    <Button
                                        onClick={handleVerifyCode}
                                        disabled={isLoading || roomCode.length !== 6}
                                        className="bg-yellow-500 hover:bg-yellow-600 h-12 px-4 rounded-xl flex-shrink-0 shine-container"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            <ArrowRight size={24} />
                                        )}
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="name"
                                    initial={{ opacity: 0, rotateY: -90 }}
                                    animate={{ opacity: 1, rotateY: 0 }}
                                    exit={{ opacity: 0, rotateY: 90 }}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                    style={{ transformStyle: "preserve-3d" }}
                                    className="flex flex-col gap-3"
                                >
                                    <Input
                                        type="text"
                                        placeholder="Your name"
                                        value={playerName}
                                        onChange={(e) => {
                                            setPlayerName(e.target.value);
                                            setError("");
                                        }}
                                        onKeyPress={handleKeyPress}
                                        className="text-center text-2xl border-gray-300 rounded-xl px-4 py-6 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleBackToCode}
                                            variant="outline"
                                            className="flex-1 h-12 rounded-xl"
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            onClick={handleJoinWithName}
                                            disabled={isLoading || !playerName.trim()}
                                            className="flex-1 bg-green-500 hover:bg-green-600 h-12 rounded-xl"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="animate-spin" />
                                            ) : (
                                                <ArrowRight size={24} />
                                            )}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 rounded-md p-3"
                    >
                        <p className="text-red-600 text-sm">{error}</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default LobbyPro;
