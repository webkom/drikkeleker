"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { lilita } from "@/lib/fonts";

interface GameOverPanelProps {
  teams: { A: string; B: string };
  scores: { A: number; B: number };
}

export default function GameOverPanel({ teams, scores }: GameOverPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const winnerRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    if (!panelRef.current) return;
    const tl = gsap.timeline();
    tl.fromTo(
      panelRef.current,
      { opacity: 0, scale: 0.85, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.6)" },
    );
    if (titleRef.current) {
      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
        "-=0.2",
      );
    }
    if (winnerRef.current) {
      tl.fromTo(
        winnerRef.current,
        { opacity: 0, scale: 0.6 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" },
        "-=0.15",
      );
    }
    return () => {
      tl.kill();
    };
  }, []);

  const a = scores.A;
  const b = scores.B;
  const tied = a === b;
  const winner = a > b ? "A" : "B";

  return (
    <div
      ref={panelRef}
      className="bg-white/90 rounded-2xl shadow p-8 text-center flex flex-col gap-3 w-full"
    >
      <h2 ref={titleRef} className={`${lilita.className} text-4xl`}>
        Spillet er ferdig!
      </h2>
      <p ref={winnerRef} className="text-lg">
        {tied ? (
          <>Uavgjort på {a} poeng – alle drikker!</>
        ) : (
          <>
            Gratulerer til <span className="font-bold">{teams[winner]}</span>!!!
          </>
        )}
      </p>
    </div>
  );
}
