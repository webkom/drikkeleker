"use client";

import type { Word } from "../_lib/types";

interface WordTileProps {
  word: Word;
  index: number;
  mode: "admin" | "audience";
  onClick?: () => void;
  disabled?: boolean;
}

const tileBase =
  "inline-flex items-center justify-center rounded-xl px-4 py-3 text-lg md:text-2xl font-bold shadow transition-all select-none";

export default function WordTile({
  word,
  index,
  mode,
  onClick,
  disabled,
}: WordTileProps) {
  const number = index + 1;

  // ── Audience side
  if (mode === "audience") {
    if (!word.revealed) {
      return (
        <span
          className={`${tileBase} bg-amber-300/70 text-transparent`}
          style={{ minWidth: `${Math.max(2.5, 0.7 * word.text.length + 1)}rem` }}
        >
          {word.text}
        </span>
      );
    }
    return (
      <span
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

  // Admin: revealed — shows both number and word, with color
  return (
    <div
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
