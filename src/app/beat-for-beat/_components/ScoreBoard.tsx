"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Minus, Plus } from "lucide-react";
import { lilita } from "@/lib/fonts";
import type { TeamId } from "../_lib/types";

interface ScoreBoardProps {
  teams: { A: string; B: string };
  scores: { A: number; B: number };
  activeTeam?: TeamId | null;
  large?: boolean;
  onAdjust?: (team: TeamId, delta: number) => void;
}

export default function ScoreBoard({
  teams,
  scores,
  activeTeam,
  large = false,
  onAdjust,
}: ScoreBoardProps) {
  const sizeClasses = large ? "text-6xl md:text-7xl" : "text-3xl md:text-4xl";

  const cardRefs = useRef<Record<TeamId, HTMLDivElement | null>>({
    A: null,
    B: null,
  });
  const prevScores = useRef<Record<TeamId, number>>({
    A: scores.A,
    B: scores.B,
  });
  const numTweens = useRef<Record<TeamId, gsap.core.Tween | null>>({
    A: null,
    B: null,
  });
  const popTweens = useRef<Record<TeamId, gsap.core.Tween | null>>({
    A: null,
    B: null,
  });

  const [displayed, setDisplayed] = useState<Record<TeamId, number>>({
    A: scores.A,
    B: scores.B,
  });

  useLayoutEffect(() => {
    (["A", "B"] as const).forEach((id) => {
      const from = prevScores.current[id];
      const to = scores[id];
      if (from === to) return;

      numTweens.current[id]?.kill();
      const obj = { val: from };
      numTweens.current[id] = gsap.to(obj, {
        val: to,
        duration: 0.7,
        ease: "power2.out",
        onUpdate: () => {
          setDisplayed((cur) => ({ ...cur, [id]: Math.round(obj.val) }));
        },
        onComplete: () => {
          setDisplayed((cur) => ({ ...cur, [id]: to }));
        },
      });

      const cardEl = cardRefs.current[id];
      if (cardEl && to > from) {
        popTweens.current[id]?.kill();
        popTweens.current[id] = gsap.fromTo(
          cardEl,
          { scale: 1, force3D: true },
          {
            scale: 1.12,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: "power2.out",
            force3D: true,
            clearProps: "transform",
          },
        );
      }
      prevScores.current[id] = to;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scores.A, scores.B]);

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {(["A", "B"] as const).map((id) => {
        const isActive = activeTeam === id;
        return (
          <div
            key={id}
            ref={(el) => {
              cardRefs.current[id] = el;
            }}
            className={`flex flex-col items-center justify-center rounded-2xl p-4 transition-colors transition-shadow transform-gpu ${
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
            <span
              className={`${lilita.className} ${sizeClasses} leading-none tabular-nums`}
            >
              {displayed[id]}
            </span>
            {onAdjust && (
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => onAdjust(id, -1)}
                  disabled={scores[id] <= 0}
                  aria-label={`Trekk fra ${teams[id]}`}
                  className="rounded-full bg-white/80 hover:bg-white disabled:opacity-30 disabled:hover:bg-white/80 shadow p-2 transition"
                >
                  <Minus size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => onAdjust(id, 1)}
                  aria-label={`Gi poeng til ${teams[id]}`}
                  className="rounded-full bg-white/80 hover:bg-white shadow p-2 transition"
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
