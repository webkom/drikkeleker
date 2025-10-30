"use client";

import { Clock } from "lucide-react";

interface TimerProps {
  timeLeft: number;
  maxTime: number;
}

export default function Timer({ timeLeft, maxTime }: TimerProps) {
  const percentage = (timeLeft / maxTime) * 100;

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
      <p className="text-center text-gray-600">
        {timeLeft > 0 ? "Time remaining to submit your guess" : "Time's up!"}
      </p>
    </div>
  );
}
