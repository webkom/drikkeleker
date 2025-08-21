"use client";

import {lilita} from "@/lib/fonts";
import BeerContainer from "@/components/beer/beer-container";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {useEffect, useState} from "react";
import BackButton from "@/components/back-button";
import Footer from "@/components/footer";
import {Button} from "@/components/ui/button";
import {ArrowRight, Plus, Users} from "lucide-react";
import {io, Socket} from "socket.io-client";

const Lobby = () => {
    const [roomCode, setRoomCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [socket, setSocket] = useState<Socket | null>(null);

    const generateRoomCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    useEffect(() => {
        const newSocket = io("http://localhost:3001");

        newSocket.on("connect", () => {
            console.log("Connected to Socket.IO server");
        });

        newSocket.on("room_created", (data) => {
            if (data.success) {
                window.location.href = `/game-room/${data.roomCode}`;
            } else {
                console.error("Failed to create room:", data.error);
                setError(data.error);
                setIsLoading(false);
            }
        });
        newSocket.on("room-joined", (data) => {
            if (data.success) {
                window.location.href = `/game-room/${data.roomCode}`;
            } else {
                console.error("Failed to join room:", data.error);
                setError(data.error);
                setIsLoading(false);
            }
        });

        setSocket(newSocket);

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, []);
    const handleInputCode = (e: { target: { value: any } }) => {
        const code = e.target.value;
        if (code.length === 6) {
            setRoomCode(code);
        } else {
            setRoomCode(code.slice(0, 6));
        }
    };

    const handleCreateRoom = () => {
        setIsLoading(true);
        setError("");

        if (!socket) {
            setError("Socket connection not established");
            setIsLoading(false);
            return;
        }

        const newRoomCode = generateRoomCode();
        socket.emit("create_room", {
            roomCode: newRoomCode,
        });
    };

    const handleJoinRoom = () => {
        if (!roomCode.trim() || roomCode.length !== 6) {
            setError("Enter a valid 6-digit room code");
            return;
        }

        setIsLoading(true);
        setError("");

        if (!socket) {
            setError("Socket connection not established");
            setIsLoading(false);
            return;
        }

        socket.emit("join_room", {
            roomCode: roomCode.trim(),
        });
        window.location.href = `/game-room/${roomCode}`;
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleJoinRoom();
        }
    };

    useEffect(() => {
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [socket]);

    return (
        <main className="overflow-hidden h-screen">
            <BackButton href="/#games" className="absolute top-4 left-4 z-10"/>
            <BeerContainer color="violet" className="h-screen w-screen">
                <div className="flex flex-col items-center text-center h-full">
                    <h1 className={`${lilita.className} text-5xl pt-12`}>Grupperom</h1>

                    <div className="w-full max-w-md flex flex-col grow justify-center gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-center gap-2">
                                    Lag nytt rom
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    onClick={handleCreateRoom}
                                    disabled={isLoading}
                                    className="bg-green-500 hover:bg-green-600 w-full h-16 text-lg"
                                >
                                    {isLoading ? "Oppretter..." : <Plus/>}
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-center gap-2">
                                    <Users size={24}/>
                                    Bli med
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <input
                                    type="number"
                                    placeholder="123456"
                                    value={roomCode}
                                    onChange={handleInputCode}
                                    maxLength={6}
                                    className="text-center text-2xl font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                    style={{
                                        WebkitAppearance: "none",
                                        appearance: "none",
                                        MozAppearance: "textfield",
                                        margin: 0,
                                    }}
                                />
                                <Button
                                    onClick={handleJoinRoom}
                                    disabled={isLoading || roomCode.length !== 6}
                                    className="bg-violet-500 hover:bg-violet-600 w-full h-16 text-lg"
                                >
                                    {isLoading ? "Finner rom..." : "Bli med i rom"}
                                    <ArrowRight
                                        size={20}
                                        className="ml-1 transition-transform group-hover:translate-x-1"
                                    />
                                </Button>
                            </CardContent>
                        </Card>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}
                    </div>
                </div>
                <Footer/>
            </BeerContainer>
        </main>
    );
};

export default Lobby;
