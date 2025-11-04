

"use client";

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  startTime: number;
  duration: number;
}

export default function Timer({ startTime, duration }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return Math.max(0, duration - elapsed);
  });

  useEffect(() => {
    const tick = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimeLeft(Math.max(0, duration - elapsed));
    };

    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [startTime, duration]);

  const percentage = (timeLeft / duration) * 100;

  const getColorClass = () => {
    if (timeLeft > 15) return "bg-green-500";
    if (timeLeft > 5) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTextColorClass = () => {
    if (timeLeft > 15) return "text-green-600";
    if (timeLeft > 5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-3">
        <Clock className={`w-8 h-8 ${getTextColorClass()}`} />
        <p className={`text-4xl font-bold ${getTextColorClass()}`}>
          {timeLeft}s
        </p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className={`h-full ${getColorClass()} transition-all duration-300 ease-linear`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}