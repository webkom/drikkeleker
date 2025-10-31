"use client";

import { useState } from "react";
import { lilita } from "@/lib/fonts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Save, X, ChevronDown, ChevronUp } from "lucide-react";

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
    if (!newQuestion.text.trim())
      return setError("Question text cannot be empty.");
    const min = Number(newQuestion.rangeMin);
    const max = Number(newQuestion.rangeMax);
    if (
      isNaN(min) ||
      isNaN(max) ||
      newQuestion.rangeMin === "" ||
      newQuestion.rangeMax === ""
    )
      return setError("Min and max values must be numbers.");
    if (min >= max)
      return setError("The 'Min' value must be less than the 'Max' value.");

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
    if (!editQuestion.text.trim())
      return setError("Question text cannot be empty.");
    const min = Number(editQuestion.rangeMin);
    const max = Number(editQuestion.rangeMax);
    if (isNaN(min) || isNaN(max))
      return setError("Min and max values must be numbers.");
    if (min >= max)
      return setError("The 'Min' value must be less than the 'Max' value.");

    onUpdateQuestion(editIndex!, {
      text: editQuestion.text.trim(),
      rangeMin: min,
      rangeMax: max,
    });
    setEditIndex(null);
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
    setError("");
  };

  return (
    <Card className="bg-white/95 w-full">
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setShowQuestions(!showQuestions)}
      >
        <CardTitle className="flex items-center justify-between">
          <span className={`${lilita.className} text-2xl text-gray-800`}>
            Manage Questions ({questions.length})
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full"
          >
            {showQuestions ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </Button>
        </CardTitle>
      </CardHeader>

      {showQuestions && (
        <CardContent className="space-y-4">
          {questions.length > 0 && (
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-2">
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
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          className="flex-1 bg-green-500 hover:bg-green-600"
                        >
                          <Save className="w-4 h-4 mr-1" /> Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="flex-1"
                        >
                          <X className="w-4 h-4 mr-1" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1 text-left">
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

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <h4 className="font-semibold text-gray-700 text-left">
              Add New Question
            </h4>
            <Input
              type="text"
              placeholder="E.g., How many countries are in Europe?"
              value={newQuestion.text}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, text: e.target.value })
              }
            />
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min value"
                value={newQuestion.rangeMin}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, rangeMin: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Max value"
                value={newQuestion.rangeMax}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, rangeMax: e.target.value })
                }
              />
            </div>
            <Button
              onClick={handleAddQuestion}
              className="w-full bg-violet-500 hover:bg-violet-600 h-12 text-md"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Question
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
