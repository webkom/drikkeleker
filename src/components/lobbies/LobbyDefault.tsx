"use client";

import { lilita } from "@/lib/fonts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import Popup from "@/components/lobbies/Popup";
import { motion } from "framer-motion";
import { useSocket } from "@/context/SocketContext";

interface LobbyDefaultProps {
    onStartProTransition: () => void;
}

const generateRoomCode = () => {
    let code = Math.floor(100000 + Math.random() * 900000).toString();
    // Make sure we don't accidentally generate the secret PRO code
    if (code === "676767") return generateRoomCode();
    return code;
};

const LobbyDefault = ({ onStartProTransition }: LobbyDefaultProps) => {
    const [roomCode, setRoomCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        const handleRoomCreated = (data: any) => {
            setIsLoading(false);
            if (data.success) {
                // When creating a default room, always go to the default page
                router.push(`/game-room/default/${data.roomCode}`);
            } else {
                setError(data.error || "Kunne ikke lage rom");
            }
        };

        const handleRoomJoined = (data: any) => {
            setIsLoading(false);
            if (data.success) {
                // ==================== THIS IS THE FIX ====================
                // The server tells us the gameType. We use it to navigate.
                // This makes the lobby smart enough to handle any room code.
                if (data.gameType === "guessing") {
                    // If the user entered a code for a PRO game, send them there.
                    router.push(`/game-room/pro/${data.roomCode}`);
                } else {
                    // Otherwise, it's a default "challenges" game.
                    router.push(`/game-room/default/${data.roomCode}`);
                }
                // =======================================================
            } else {
                setError(data.error || "Kunne ikke bli med i rom");
            }
        };

        socket.on("room_created", handleRoomCreated);
        socket.on("room_joined", handleRoomJoined);

        return () => {
            socket.off("room_created", handleRoomCreated);
            socket.off("room_joined", handleRoomJoined);
        };
    }, [socket, router]);

    const handleInputCode = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRoomCode(e.target.value.slice(0, 6));
        setError("");
    };

    const handleCreateRoom = () => {
        if (!socket) return;
        setIsLoading(true);
        setError("");
        // This correctly creates a "challenges" type room
        socket.emit("create_room", {
            roomCode: generateRoomCode(),
            gameType: "challenges"
        });
    };

    const handleJoinRoom = () => {
        if (!roomCode.trim() || roomCode.length !== 6) {
            return setError("Skriv inn en gyldig kode");
        }

        // Secret code to access PRO mode still works
        if (roomCode.trim() === "676767") {
            onStartProTransition();
            return;
        }

        if (!socket) return;
        setIsLoading(true);
        setError("");
        socket.emit("join_room", { roomCode: roomCode.trim() });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleJoinRoom();
    };

    return (
        <motion.div
            key="regular"
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center h-full"
        >
            <div className="flex items-center justify-center gap-4 pt-12">
                <h1 className={`${lilita.className} text-5xl leading-tight`}>
                    Viljens Drikkelek
                </h1>
                <Popup />
            </div>
            <div className="w-full max-w-md flex flex-col grow justify-center gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Plus size={24} /> Lag nytt rom
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={handleCreateRoom}
                            disabled={isLoading}
                            className="bg-green-500 hover:bg-green-600 w-full h-12 text-lg rounded-xl"
                        >
                            {isLoading ? "Oppretter..." : <ArrowRight size={24} />}
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Users size={24} /> Bli med
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-row items-center gap-3">
                        <Input
                            type="number"
                            placeholder="123456"
                            value={roomCode}
                            onChange={handleInputCode}
                            onKeyPress={handleKeyPress}
                            maxLength={6}
                            className="flex-grow text-center text-3xl font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-gray-300 rounded-xl px-4 py-6 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                        />
                        <Button
                            onClick={handleJoinRoom}
                            disabled={isLoading || roomCode.length !== 6}
                            className="bg-violet-500 hover:bg-violet-600 h-12 px-4 rounded-xl flex-shrink-0"
                        >
                            {isLoading ? "..." : <ArrowRight size={24} />}
                        </Button>
                    </CardContent>
                </Card>
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default LobbyDefault;
