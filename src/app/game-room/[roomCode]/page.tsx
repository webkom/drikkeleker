"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useGameSocket } from "./hooks/useGameSocket";
import ChallengeGame from "@/app/game-room/[roomCode]/versions/viljens-drikkeleker/ChallengeGame";
import GuessingGame from "@/app/game-room/[roomCode]/versions/viljens-pro/GuessingGame";

export default function GameRoomPage() {
  const { roomCode } = useParams();
  const [loading, setLoading] = useState(true);
  const { room, isConnected } = useGameSocket(roomCode as string);

  useEffect(() => {
    if (room) {
      setLoading(false);
    }
  }, [room]);

  if (!isConnected || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-500 to-purple-600">
        <div className="text-white text-2xl">Connecting to room...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-500 to-pink-600">
        <div className="text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Room not found</h2>
          <p className="text-xl">The room code {roomCode} does not exist.</p>
        </div>
      </div>
    );
  }

  // Route to correct game based on game type
  if (room.gameType === "challenges") {
    return <ChallengeGame roomCode={roomCode as string} />;
  }

  if (room.gameType === "guessing") {
    return <GuessingGame roomCode={roomCode as string} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-white text-2xl">Unknown game type</div>
    </div>
  );
}
