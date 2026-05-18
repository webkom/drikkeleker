"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import type { Word } from "../_lib/types";

interface WordTileProps {
  word: Word;
  index: number;
  mode: "admin" | "audience";
  onClick?: () => void;
  disabled?: boolean;
  awarded?: boolean;
}

const tileBase =
  "inline-flex items-center justify-center rounded-xl px-4 py-3 text-lg md:text-2xl font-bold shadow select-none will-change-transform transform-gpu";

export default function WordTile({
  word,
  index,
  mode,
  onClick,
  disabled,
  awarded = false,
}: WordTileProps) {
  const ref = useRef<HTMLElement>(null);
  const number = index + 1;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const delay = index * 0.04;
    const tweens: gsap.core.Tween[] = [];

    if (word.revealed) {
      tweens.push(
        gsap.fromTo(
          el,
          { opacity: 0, rotateY: -90, scale: 0.6, force3D: true },
          {
            opacity: 1,
            rotateY: 0,
            scale: 1,
            duration: 0.45,
            delay,
            ease: "back.out(1.7)",
            force3D: true,
            clearProps: "transform,opacity",
          },
        ),
      );
      if (mode === "audience" && word.color === "red" && !awarded) {
        tweens.push(
          gsap.to(el, {
            x: 8,
            duration: 0.05,
            delay: delay + 0.45,
            repeat: 5,
            yoyo: true,
            ease: "none",
            clearProps: "transform",
          }),
        );
      }
    } else {
      tweens.push(
        gsap.fromTo(
          el,
          { opacity: 0, y: 16, force3D: true },
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
            delay,
            ease: "power2.out",
            force3D: true,
            clearProps: "transform,opacity",
          },
        ),
      );
    }

    return () => {
      tweens.forEach((t) => t.kill());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Audience side
  if (mode === "audience") {
    if (!word.revealed) {
      return (
        <span
          ref={ref as React.RefObject<HTMLSpanElement>}
          aria-label="Skjult ord"
          className={`${tileBase} bg-amber-300/70 text-transparent w-20 md:w-24 overflow-hidden whitespace-nowrap`}
        >
          &nbsp;
        </span>
      );
    }
    return (
      <span
        ref={ref as React.RefObject<HTMLSpanElement>}
        className={`${tileBase} ${
          word.color === "red"
            ? "bg-red-500 text-white"
            : "bg-gray-800 text-white"
        }`}
      >
        {word.text}
      </span>
    );
  }

  // ── Admin side
  if (!word.revealed) {
    const isClickable = !!onClick && !disabled;
    return (
      <button
        ref={ref as React.RefObject<HTMLButtonElement>}
        type="button"
        onClick={onClick}
        disabled={!isClickable}
        className={`${tileBase} bg-white text-gray-800 border-2 border-amber-400 min-w-[3.5rem] ${
          isClickable
            ? "hover:scale-105 hover:bg-amber-50 cursor-pointer"
            : "cursor-default opacity-90"
        }`}
      >
        {number}
      </button>
    );
  }

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`${tileBase} flex-col gap-0.5 ring-4 ring-offset-2 ring-amber-300 ${
        word.color === "red"
          ? "bg-red-500 text-white"
          : "bg-gray-800 text-white"
      }`}
    >
      <span className="text-xs opacity-75 leading-none">#{number}</span>
      <span className="leading-none">{word.text}</span>
    </div>
  );
}
