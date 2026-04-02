"use client";

import { usePuzzle } from "@/context/PuzzleContext";
import { useState } from "react";

interface PuzzlePieceProps {
  id: string;
  className?: string;
  corner?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

const IMAGE_URL =
  "/images/7b1a278f5abe8e9da907fc9c29dfd432d60dc76e17b0fabab659d2a508bc65c4.png";

export const PuzzlePiece = ({ id, className, corner }: PuzzlePieceProps) => {
  const { markPieceAsFound, isPieceFound } = usePuzzle();
  const [showNotification, setShowNotification] = useState(false);

  const handleClick = () => {
    if (!isPieceFound(id)) {
      markPieceAsFound(id);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  if (isPieceFound(id)) {
    return null;
  }

  // Determine crop based on corner
  const getBackgroundPosition = () => {
    switch (corner) {
      case "top-left":
        return "0% 0%";
      case "top-right":
        return "100% 0%";
      case "bottom-left":
        return "0% 100%";
      case "bottom-right":
        return "100% 100%";
      default:
        return "0% 0%";
    }
  };

  return (
    <div
      className={`cursor-pointer group relative ${className}`}
      onClick={handleClick}
    >
      <div className="animate-pulse hover:animate-none transition-all duration-300">
        <div
          className="w-12 h-12 rounded-lg border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)] group-hover:shadow-[0_0_25px_rgba(250,204,21,0.8)] transition-shadow overflow-hidden"
          style={{
            backgroundImage: `url(${IMAGE_URL})`,
            backgroundSize: "200% 200%",
            backgroundPosition: getBackgroundPosition(),
          }}
        />
      </div>

      {/* Visual hint for being a puzzle piece */}
      <div className="absolute -top-1 -right-1 bg-yellow-400 text-[10px] font-bold px-1 rounded border border-black shadow-sm">
        ?
      </div>

      {showNotification && (
        <div className="fixed top-24 right-4 bg-yellow-400 text-black px-4 py-2 rounded-lg shadow-lg z-[101] animate-bounce border-2 border-black font-bold">
          Fant en brikke! 🧩
        </div>
      )}
    </div>
  );
};
