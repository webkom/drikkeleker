"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";

interface Question {
  text: string;
  rangeMin: number;
  rangeMax: number;
}

interface PlayerControlsProps {
  question: Question;
  onSubmitGuess: (guess: number) => void;
  hasAnswered: boolean;
  playerAnswer?: number;
}

export default function PlayerControls({
  question,
  onSubmitGuess,
  hasAnswered,
  playerAnswer,
}: PlayerControlsProps) {
  const [useSlider, setUseSlider] = useState(true);
  const [guess, setGuess] = useState<number>(
    Math.floor((question.rangeMin + question.rangeMax) / 2),
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (playerAnswer !== undefined) {
      setGuess(playerAnswer);
    }
  }, [playerAnswer]);

  const handleSubmit = () => {
    if (hasAnswered) return;

    setError("");

    if (guess < question.rangeMin || guess > question.rangeMax) {
      setError(
        `Guess must be between ${question.rangeMin} and ${question.rangeMax}`,
      );
      return;
    }

    onSubmitGuess(guess);
  };

  const handleSliderChange = (value: number) => {
    setGuess(value);
  };

  const handleInputChange = (value: string) => {
    if (value === "") {
      setGuess(question.rangeMin);
      return;
    }

    const numValue = Number(value);
    if (!isNaN(numValue)) {
      const clamped = Math.min(
        Math.max(numValue, question.rangeMin),
        question.rangeMax,
      );
      setGuess(clamped);
    }
  };

  const fillPercent =
    ((guess - question.rangeMin) / (question.rangeMax - question.rangeMin)) *
    100;

  if (hasAnswered) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-green-600">Answer Submitted!</h3>
        <p className="text-xl text-gray-700">Your guess: {playerAnswer}</p>
        <p className="text-gray-600">Waiting for other players...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={useSlider}
            onChange={() => setUseSlider(true)}
            className="w-4 h-4"
          />
          <span className="text-gray-700">Slider</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={!useSlider}
            onChange={() => setUseSlider(false)}
            className="w-4 h-4"
          />
          <span className="text-gray-700">Text Input</span>
        </label>
      </div>

      {useSlider ? (
        <div className="space-y-4">
          <div className="relative">
            <input
              type="range"
              min={question.rangeMin}
              max={question.rangeMax}
              value={guess}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #8b5cf6 ${fillPercent}%, #e5e7eb ${fillPercent}%)`,
              }}
            />
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-violet-600">{guess}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            type="number"
            value={guess}
            onChange={(e) => handleInputChange(e.target.value)}
            min={question.rangeMin}
            max={question.rangeMax}
            className="text-center text-4xl py-8 font-bold"
          />
        </div>
      )}

      <div className="flex justify-between text-sm text-gray-600">
        <span>{question.rangeMin}</span>
        <span>{question.rangeMax}</span>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={hasAnswered}
        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-4 text-xl font-bold rounded-xl"
      >
        Submit Guess
      </Button>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 text-center rounded">
          {error}
        </div>
      )}
    </div>
  );
}
