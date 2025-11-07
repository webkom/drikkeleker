"use client";

import { lilita } from "@/lib/fonts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus, Users, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import Popup from "@/components/lobbies/Popup";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "@/context/SocketContext";

interface LobbyDefaultProps {
  onStartProTransition: () => void;
}

const LobbyDefault = ({ onStartProTransition }: LobbyDefaultProps) => {
  const [roomCode, setRoomCode] = useState("");
  const [customRoomName, setCustomRoomName] = useState("");
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleRoomCreated = (data: any) => {
      setIsLoading(false);
      if (data.success) {
        router.push(`/game-room/default/${data.roomCode}`);
      } else {
        setError(data.error || "Kunne ikke lage rom");
      }
    };

    const handleRoomJoined = (data: any) => {
      setIsLoading(false);
      if (data.success) {
        if (data.gameType === "guessing") {
          router.push(`/game-room/pro/${data.roomCode}`);
        } else {
          router.push(`/game-room/default/${data.roomCode}`);
        }
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
    setRoomCode(e.target.value);
    setError("");
  };

  const handleInputCustomName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomRoomName(e.target.value);
    setError("");
  };

  const validateRoomName = (name: string) => {
    const normalized = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9æøå]/g, "");
    if (normalized.length < 3) {
      return "Romnavnet må være minst 3 tegn";
    }
    if (normalized.length > 20) {
      return "Romnavnet kan ikke være mer enn 20 tegn";
    }
    return null;
  };

  const handleShowCreateInput = () => {
    setShowCreateInput(true);
    setError("");
  };

  const handleBackToCreateButton = () => {
    setShowCreateInput(false);
    setCustomRoomName("");
    setError("");
  };

  const handleCreateRoom = () => {
    if (!socket) return;

    const validationError = validateRoomName(customRoomName);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");
    socket.emit("create_room", {
      roomCode: customRoomName.trim(),
      gameType: "challenges",
    });
  };

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      return setError("Skriv inn en romkode");
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

  const handleKeyPressJoin = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleJoinRoom();
  };

  const handleKeyPressCreate = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCreateRoom();
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
        <Card style={{ perspective: "1200px" }}>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Plus size={24} /> Lag nytt rom
            </CardTitle>
          </CardHeader>
          <CardContent className="min-h-[80px]">
            <AnimatePresence mode="wait">
              {!showCreateInput ? (
                <motion.div
                  key="create-button"
                  initial={{ opacity: 0, rotateY: -90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: 90 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <Button
                    onClick={handleShowCreateInput}
                    disabled={isLoading}
                    className="bg-green-500 hover:bg-green-600 w-full h-12 text-lg rounded-xl"
                  >
                    <ArrowRight size={24} />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="create-input"
                  initial={{ opacity: 0, rotateY: -90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: 90 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="flex flex-col gap-3"
                >
                  <Input
                    type="text"
                    placeholder="romkode"
                    value={customRoomName}
                    onChange={handleInputCustomName}
                    onKeyPress={handleKeyPressCreate}
                    className="text-center text-2xl border-gray-300 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleBackToCreateButton}
                      variant="outline"
                      className="flex-1 h-12 rounded-xl"
                    >
                      <ArrowLeft size={20} />
                    </Button>
                    <Button
                      onClick={handleCreateRoom}
                      disabled={isLoading || !customRoomName.trim()}
                      className="flex-1 bg-green-500 hover:bg-green-600 h-12 rounded-xl"
                    >
                      {isLoading ? "..." : <ArrowRight size={24} />}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
              type="text"
              placeholder="romkode"
              value={roomCode}
              onChange={handleInputCode}
              onKeyPress={handleKeyPressJoin}
              className="flex-grow text-center text-2xl border-gray-300 rounded-xl px-4 py-6 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 uppercase"
              autoCapitalize="off"
              autoCorrect="off"
            />
            <Button
              onClick={handleJoinRoom}
              disabled={isLoading || !roomCode.trim()}
              className="bg-violet-500 hover:bg-violet-600 h-12 px-4 rounded-xl flex-shrink-0"
            >
              {isLoading ? "..." : <ArrowRight size={24} />}
            </Button>
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
    </motion.div>
  );
};

export default LobbyDefault;
