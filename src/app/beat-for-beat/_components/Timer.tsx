"use client";

import { useEffect, useRef, useState } from "react";
import { lilita } from "@/lib/fonts";

interface TimerProps {
  deadline: number | null;
  pausedRemainingMs: number | null;
  durationSec: number;
  onExpire?: () => void;
}

const formatMs = (ms: number) => {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const colorForProgress = (progress: number, expired: boolean) => {
  if (expired) return "#ef4444";
  if (progress < 0.25) return "#f87171";
  if (progress < 0.5) return "#fbbf24";
  return "#22c55e";
};

export default function Timer({
  deadline,
  pausedRemainingMs,
  durationSec,
  onExpire,
}: TimerProps) {
  const fullMs = durationSec * 1000;
  const computeRemaining = () => {
    if (deadline != null) return Math.max(0, deadline - Date.now());
    if (pausedRemainingMs != null) return pausedRemainingMs;
    return fullMs;
  };

  const [remainingMs, setRemainingMs] = useState(computeRemaining);
  const expiredFiredRef = useRef(false);

  useEffect(() => {
    expiredFiredRef.current = false;

    if (deadline == null) {
      setRemainingMs(pausedRemainingMs ?? fullMs);
      return;
    }

    let raf = 0;
    const tick = () => {
      const left = Math.max(0, deadline - Date.now());
      setRemainingMs(left);
      if (left > 0) {
        raf = requestAnimationFrame(tick);
      } else if (!expiredFiredRef.current) {
        expiredFiredRef.current = true;
        onExpire?.();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [deadline, pausedRemainingMs, fullMs, onExpire]);

  const progress = Math.min(1, Math.max(0, remainingMs / fullMs));
  const isPaused = deadline == null && pausedRemainingMs != null;
  const isExpired = remainingMs <= 0 && deadline != null;

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <span
        className={`${lilita.className} text-5xl md:text-6xl tabular-nums`}
        style={{
          color: isExpired ? "#dc2626" : isPaused ? "#6b7280" : undefined,
        }}
      >
        {formatMs(remainingMs)}
      </span>
      <div className="w-full h-3 rounded-full bg-white/60 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${progress * 100}%`,
            backgroundColor: colorForProgress(progress, isExpired),
          }}
        />
      </div>
      {isPaused && (
        <span className="text-xs uppercase tracking-wide text-gray-500">
          Pause
        </span>
      )}
    </div>
  );
}
