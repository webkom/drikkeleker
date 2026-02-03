"use client";

import { useChallengeSocket } from "@/hooks/useChallengeSocket";
import { GameView } from "./GameView";
import { ContributionView } from "./ContributionView";
import { LobbyView } from "./LobbyView";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";

export default function ChallengeGame({ roomCode }: { roomCode: string }) {
  const { challenges, gameStarted, addChallenge, isConnected } =
    useChallengeSocket(roomCode);

  const [viewMode, setViewMode] = useState<"playing" | "contributing">(
    "playing",
  );
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  if (!gameStarted) {
    return <LobbyView roomCode={roomCode} isConnected={isConnected} />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-600 to-indigo-900 flex flex-col items-center p-4">
      {/* Top Bar: Toggle Button */}
      <div className="w-full max-w-2xl flex justify-between items-center py-4 mb-4">
        <div className="text-white/80 font-bold">Rom: {roomCode}</div>
        <Button
          onClick={() =>
            setViewMode(viewMode === "playing" ? "contributing" : "playing")
          }
          variant="secondary"
          className="rounded-full px-6"
        >
          {viewMode === "playing" ? (
            <>
              Legg til ny <Plus className="ml-2" />
            </>
          ) : (
            <>
              Tilbake til spill <ArrowLeft className="ml-2" />
            </>
          )}
        </Button>
      </div>

      {viewMode === "playing" ? (
        <GameView
          challenges={challenges}
          currentIndex={currentCardIndex}
          onNavigate={setCurrentCardIndex}
        />
      ) : (
        <ContributionView
          onAddChallenge={addChallenge}
          totalCount={challenges.length}
          roomCode={roomCode}
        />
      )}
    </main>
  );
}
