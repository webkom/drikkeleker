"use client";

import { usePuzzle, TOTAL_PIECES } from "@/context/PuzzleContext";
import { Puzzle as PuzzleIcon, CheckCircle } from "lucide-react";
import { useState } from "react";

export const PuzzleStatus = () => {
  const { foundPieces, allPiecesFound } = usePuzzle();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-full shadow-2xl transition-all duration-500 transform hover:scale-110 ${
          allPiecesFound
            ? "bg-green-500 text-white animate-pulse"
            : "bg-white text-yellow-500 border-2 border-yellow-400"
        }`}
      >
        {allPiecesFound ? (
          <CheckCircle className="h-8 w-8" />
        ) : (
          <div className="relative">
            <PuzzleIcon className="h-8 w-8" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {foundPieces.length}
            </span>
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white p-6 rounded-2xl shadow-2xl border-2 border-yellow-100 min-w-[250px] animate-in slide-in-from-bottom-4">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
            <PuzzleIcon className="text-yellow-500" />
            Puslespill-jakt
          </h3>
          <div className="space-y-3">
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden border">
              <div
                className="bg-yellow-400 h-full transition-all duration-1000 ease-out"
                style={{
                  width: `${(foundPieces.length / TOTAL_PIECES) * 100}%`,
                }}
              />
            </div>
            <p className="text-sm text-gray-600 font-medium text-center">
              {foundPieces.length} av {TOTAL_PIECES} brikker funnet
            </p>

            {allPiecesFound ? (
              <div className="bg-green-100 p-4 rounded-xl text-green-800 text-center animate-bounce mt-4">
                <p className="font-bold text-lg">Gratulerer! 🎉</p>
                <p className="text-sm mt-1">
                  Du har funnet alle brikkene! Du er en ekte Abakus-detektiv.
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic mt-4 text-center">
                Let rundt på siden for å finne flere brikker... 🔍
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
