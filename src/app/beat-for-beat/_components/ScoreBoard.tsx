"use client";

import { lilita } from "@/lib/fonts";
import type { TeamId } from "../_lib/types";

interface ScoreBoardProps {
  teams: { A: string; B: string };
  scores: { A: number; B: number };
  activeTeam?: TeamId | null;
  large?: boolean;
}

export default function ScoreBoard({
  teams,
  scores,
  activeTeam,
  large = false,
}: ScoreBoardProps) {
  const sizeClasses = large
    ? "text-6xl md:text-7xl"
    : "text-3xl md:text-4xl";

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {(["A", "B"] as const).map((id) => {
        const isActive = activeTeam === id;
        return (
          <div
            key={id}
            className={`flex flex-col items-center justify-center rounded-2xl p-4 transition-all ${
              isActive
                ? "bg-white shadow-lg ring-4 ring-amber-400 scale-[1.02]"
                : "bg-white/70 shadow"
            }`}
          >
            <span
              className={`text-sm md:text-base uppercase tracking-wide ${
                isActive ? "text-amber-700" : "text-gray-500"
              }`}
            >
              {teams[id]}
            </span>
            <span className={`${lilita.className} ${sizeClasses} leading-none`}>
              {scores[id]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
