"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export const TOTAL_PIECES = 4;

interface PuzzleContextType {
  foundPieces: string[];
  markPieceAsFound: (id: string) => void;
  isPieceFound: (id: string) => boolean;
  resetPuzzle: () => void;
  allPiecesFound: boolean;
}

const PuzzleContext = createContext<PuzzleContextType>({
  foundPieces: [],
  markPieceAsFound: () => {},
  isPieceFound: () => false,
  resetPuzzle: () => {},
  allPiecesFound: false,
});

export const usePuzzle = () => useContext(PuzzleContext);

export function PuzzleProvider({ children }: { children: ReactNode }) {
  const [foundPieces, setFoundPieces] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("puzzle_pieces");
    if (saved) {
      try {
        setFoundPieces(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse puzzle_pieces from localStorage", e);
      }
    }
  }, []);

  // Save to localStorage whenever foundPieces changes
  useEffect(() => {
    localStorage.setItem("puzzle_pieces", JSON.stringify(foundPieces));
  }, [foundPieces]);

  const markPieceAsFound = (id: string) => {
    setFoundPieces((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  };

  const isPieceFound = (id: string) => foundPieces.includes(id);

  const resetPuzzle = () => {
    setFoundPieces([]);
    localStorage.removeItem("puzzle_pieces");
  };

  const allPiecesFound = foundPieces.length >= TOTAL_PIECES;

  return (
    <PuzzleContext.Provider
      value={{
        foundPieces,
        markPieceAsFound,
        isPieceFound,
        resetPuzzle,
        allPiecesFound,
      }}
    >
      {children}
    </PuzzleContext.Provider>
  );
}
