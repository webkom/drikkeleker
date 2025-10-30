"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Save, X } from "lucide-react";

interface Question {
  text: string;
  rangeMin: number;
  rangeMax: number;
}

interface QuestionManagerProps {
  questions: Question[];
  onAddQuestion: (question: Question) => void;
  onUpdateQuestion: (index: number, question: Question) => void;
}

export default function QuestionManager({
  questions,
  onAddQuestion,
  onUpdateQuestion,
}: QuestionManagerProps) {
  const [showQuestions, setShowQuestions] = useState(true);
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    rangeMin: "",
    rangeMax: "",
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editQuestion, setEditQuestion] = useState({
    text: "",
    rangeMin: "",
    rangeMax: "",
  });
  const [error, setError] = useState("");

  const handleAddQuestion = () => {
    setError("");

    if (!newQuestion.text.trim()) {
      setError("Question cannot be empty");
      return;
    }

    const min = Number(newQuestion.rangeMin);
    const max = Number(newQuestion.rangeMax);

    if (isNaN(min) || isNaN(max)) {
      setError("Min and max must be numbers");
      return;
    }

    if (min >= max) {
      setError("Min must be less than max");
      return;
    }

    onAddQuestion({
      text: newQuestion.text.trim(),
      rangeMin: min,
      rangeMax: max,
    });

    setNewQuestion({ text: "", rangeMin: "", rangeMax: "" });
  };

  const handleEditQuestion = (index: number) => {
    const q = questions[index];
    setEditIndex(index);
    setEditQuestion({
      text: q.text,
      rangeMin: q.rangeMin.toString(),
      rangeMax: q.rangeMax.toString(),
    });
  };

  const handleSaveEdit = () => {
    setError("");

    if (!editQuestion.text.trim()) {
      setError("Question cannot be empty");
      return;
    }

    const min = Number(editQuestion.rangeMin);
    const max = Number(editQuestion.rangeMax);

    if (isNaN(min) || isNaN(max)) {
      setError("Min and max must be numbers");
      return;
    }

    if (min >= max) {
      setError("Min must be less than max");
      return;
    }

    onUpdateQuestion(editIndex!, {
      text: editQuestion.text.trim(),
      rangeMin: min,
      rangeMax: max,
    });

    setEditIndex(null);
    setEditQuestion({ text: "", rangeMin: "", rangeMax: "" });
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
    setEditQuestion({ text: "", rangeMin: "", rangeMax: "" });
    setError("");
  };

  return (
    <Card className="bg-white/95">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Questions ({questions.length})</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQuestions(!showQuestions)}
          >
            {showQuestions ? "Hide" : "Show"}
          </Button>
        </CardTitle>
      </CardHeader>
      {showQuestions && (
        <CardContent className="space-y-4">
          {/* Questions List */}
          {questions.length > 0 && (
            <div className="space-y-2 mb-4">
              {questions.map((q, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  {editIndex === index ? (
                    <div className="space-y-2">
                      <Input
                        type="text"
                        value={editQuestion.text}
                        onChange={(e) =>
                          setEditQuestion({
                            ...editQuestion,
                            text: e.target.value,
                          })
                        }
                        placeholder="Question text"
                        className="w-full"
                      />
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={editQuestion.rangeMin}
                          onChange={(e) =>
                            setEditQuestion({
                              ...editQuestion,
                              rangeMin: e.target.value,
                            })
                          }
                          placeholder="Min"
                          className="w-1/2"
                        />
                        <Input
                          type="number"
                          value={editQuestion.rangeMax}
                          onChange={(e) =>
                            setEditQuestion({
                              ...editQuestion,
                              rangeMax: e.target.value,
                            })
                          }
                          placeholder="Max"
                          className="w-1/2"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          className="flex-1 bg-green-500 hover:bg-green-600"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="flex-1"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{q.text}</p>
                        <p className="text-sm text-gray-600">
                          Range: {q.rangeMin} - {q.rangeMax}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditQuestion(index)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add New Question */}
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <h4 className="font-semibold text-gray-700">Add New Question</h4>
            <Input
              type="text"
              placeholder="Question text"
              value={newQuestion.text}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, text: e.target.value })
              }
              className="w-full"
            />
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min value"
                value={newQuestion.rangeMin}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, rangeMin: e.target.value })
                }
                className="w-1/2"
              />
              <Input
                type="number"
                placeholder="Max value"
                value={newQuestion.rangeMax}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, rangeMax: e.target.value })
                }
                className="w-1/2"
              />
            </div>
            <Button
              onClick={handleAddQuestion}
              className="w-full bg-violet-500 hover:bg-violet-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
            {error && (
              <div className="p-2 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
                {error}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
