"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, ArrowRight } from "lucide-react";

interface HostControlsProps {
  phase: number;
  onOpenGuessing: () => void;
  onSetAnswer: (answer: number) => void;
  onNextQuestion: () => void;
  correctAnswer: number | null;
  setCorrectAnswer: (value: number | null) => void;
  questionRange: { min: number; max: number };
}

const HostControls = ({
  phase,
  onOpenGuessing,
  onSetAnswer,
  onNextQuestion,
  correctAnswer,
  setCorrectAnswer,
  questionRange,
}: HostControlsProps) => {
  const [answerInput, setAnswerInput] = useState("");
  const [error, setError] = useState("");

  // Phase 1: Present Question
  if (phase === 1) {
    return (
      <div className="text-center space-y-4">
        <p className="text-xl text-gray-700 mb-4">
          Ready to start the guessing phase?
        </p>
        <Button
          onClick={onOpenGuessing}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg rounded-xl"
        >
          <Play className="w-5 h-5 mr-2" />
          Open Guessing (30 seconds)
        </Button>
      </div>
    );
  }

  // Phase 3: Set Correct Answer
  if (phase === 3) {
    const handleSetAnswer = () => {
      setError("");

      if (!answerInput.trim()) {
        setError("Please enter an answer");
        return;
      }

      const answer = Number(answerInput);

      if (isNaN(answer)) {
        setError("Answer must be a number");
        return;
      }

      if (answer < questionRange.min || answer > questionRange.max) {
        setError(
          `Answer must be between ${questionRange.min} and ${questionRange.max}`,
        );
        return;
      }

      onSetAnswer(answer);
      setAnswerInput("");
    };

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-center text-gray-800">
          Set the Correct Answer
        </h3>
        <p className="text-center text-gray-600">
          Range: {questionRange.min} - {questionRange.max}
        </p>
        <Input
          type="number"
          placeholder={`Enter answer (${questionRange.min}-${questionRange.max})`}
          value={answerInput}
          onChange={(e) => setAnswerInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSetAnswer()}
          className="text-center text-2xl py-6"
          min={questionRange.min}
          max={questionRange.max}
        />
        <Button
          onClick={handleSetAnswer}
          className="w-full bg-violet-500 hover:bg-violet-600 text-white py-3 text-lg rounded-xl"
        >
          Set Answer & Calculate Scores
        </Button>
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 text-center rounded">
            {error}
          </div>
        )}
      </div>
    );
  }

  return null;
};
export default HostControls;
