"use client";

import { useState, useEffect } from "react";
import { lilita } from "@/lib/fonts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Plus,
    Edit2,
    Save,
    X,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    Users,
    Clock,
    Trophy,
    Medal,
    ArrowRight,
    Play,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Timer from "@/components/shared/Timer";

interface Player {
    name: string;
    score: number;
}

interface Question {
    text: string;
    rangeMin: number;
    rangeMax: number;
}

interface Room {
    roomCode: string;
    players: Player[];
    questions?: Question[];
    currentQuestionIndex?: number;
    phase?: number;
    answers?: Record<string, number>;
    correctAnswer?: number | null;
    roundStartedAt?: number;
    gameStarted: boolean;
}

interface GameRoomProps {
    room: Room;
    isHost: boolean;
    playerName: string;
    onAddQuestion: (question: Question) => void;
    onUpdateQuestion: (index: number, question: Question) => void;
    onStartGame: () => void;
    onStartPhase: (phase: number) => void;
    onSubmitGuess: (guess: number) => void;
    onSetCorrectAnswer: (answer: number) => void;
    onNextQuestion: () => void;
    error: string;
}

export default function GameRoom({
                                     room,
                                     isHost,
                                     playerName,
                                     onAddQuestion,
                                     onUpdateQuestion,
                                     onStartGame,
                                     onStartPhase,
                                     onSubmitGuess,
                                     onSetCorrectAnswer,
                                     onNextQuestion,
                                     error,
                                 }: GameRoomProps) {
    // Show lobby if game hasn't started
    if (!room.gameStarted) {
        return (
            <Lobby
                room={room}
                isHost={isHost}
                playerName={playerName}
                onAddQuestion={onAddQuestion}
                onUpdateQuestion={onUpdateQuestion}
                onStartGame={onStartGame}
                error={error}
            />
        );
    }

    // Show gameplay once game starts
    return (
        <GamePlay
            room={room}
            isHost={isHost}
            playerName={playerName}
            onStartPhase={onStartPhase}
            onSubmitGuess={onSubmitGuess}
            onSetCorrectAnswer={onSetCorrectAnswer}
            onNextQuestion={onNextQuestion}
            error={error}
        />
    );
}

// ============================================================================
// LOBBY COMPONENT
// ============================================================================

function Lobby({
                   room,
                   isHost,
                   playerName,
                   onAddQuestion,
                   onUpdateQuestion,
                   onStartGame,
                   error,
               }: {
    room: Room;
    isHost: boolean;
    playerName: string;
    onAddQuestion: (question: Question) => void;
    onUpdateQuestion: (index: number, question: Question) => void;
    onStartGame: () => void;
    error: string;
}) {
    const [showWarning, setShowWarning] = useState(false);
    const [copied, setCopied] = useState(false);

    const canStartGame =
        room.players.length >= 2 && (room.questions?.length || 0) >= 1;

    const handleStartGame = () => {
        if (!canStartGame) {
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 3000);
            return;
        }
        onStartGame();
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(room.roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col items-center text-center h-full w-full px-4 py-12">
            <h1
                className={`${lilita.className} text-5xl leading-tight text-white mb-8`}
            >
                Game Lobby
            </h1>

            <div className="w-full max-w-4xl space-y-6">
                {/* Room Code Card */}
                <Card className="bg-white/95">
                    <CardHeader>
                        <CardTitle className="text-2xl">Room Code</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center gap-4">
                        <div className="text-6xl font-mono font-bold text-violet-600 tracking-widest">
                            {room.roomCode}
                        </div>
                        <Button
                            onClick={handleCopyCode}
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 rounded-lg"
                        >
                            {copied ? (
                                <Check className="text-green-500" />
                            ) : (
                                <Copy className="text-gray-600" />
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Players Card */}
                <Card className="bg-white/95">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Players ({room.players.length})</span>
                            {isHost && (
                                <span className="text-sm text-violet-600 font-normal">
                  👑 Host
                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PlayersList players={room.players} currentPlayerName={playerName} />
                    </CardContent>
                </Card>

                {/* Question Manager - Only for Host */}
                {isHost && (
                    <QuestionManager
                        questions={room.questions || []}
                        onAddQuestion={onAddQuestion}
                        onUpdateQuestion={onUpdateQuestion}
                    />
                )}

                {/* Questions Display - For Non-Host */}
                {!isHost && (
                    <Card className="bg-white/95">
                        <CardHeader>
                            <CardTitle>Questions ({room.questions?.length || 0})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                Waiting for host to add questions...
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Start Game Button - Host */}
                {isHost && (
                    <Card className="bg-white/95">
                        <CardContent className="pt-6">
                            <Button
                                onClick={handleStartGame}
                                disabled={!canStartGame}
                                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-4 h-16 text-xl rounded-xl"
                            >
                                Start Game
                            </Button>
                            <AnimatePresence>
                                {showWarning && !canStartGame && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 text-sm rounded"
                                    >
                                        {room.players.length < 2
                                            ? "You need at least 2 players to start."
                                            : "You need to add at least 1 question to start."}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                )}

                {/* Waiting Message - Non-Host */}
                {!isHost && (
                    <Card className="bg-white/95">
                        <CardContent className="pt-6">
                            <p className="text-gray-600 text-lg">
                                Waiting for the host to start the game...
                            </p>
                        </CardContent>
                    </Card>
                )}

                {error && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// GAMEPLAY COMPONENT
// ============================================================================

function GamePlay({
                      room,
                      isHost,
                      playerName,
                      onStartPhase,
                      onSubmitGuess,
                      onSetCorrectAnswer,
                      onNextQuestion,
                      error,
                  }: {
    room: Room;
    isHost: boolean;
    playerName: string;
    onStartPhase: (phase: number) => void;
    onSubmitGuess: (guess: number) => void;
    onSetCorrectAnswer: (answer: number) => void;
    onNextQuestion: () => void;
    error: string;
}) {
    const [timeLeft, setTimeLeft] = useState(30);

    const currentQuestion = room.questions?.[room.currentQuestionIndex || 0];
    const currentPhase = room.phase || 1;

    // Timer logic
    useEffect(() => {
        if (currentPhase === 2 && room.roundStartedAt) {
            const interval = setInterval(() => {
                const elapsed = Date.now() - room.roundStartedAt!;
                const remaining = Math.max(0, 30 - Math.floor(elapsed / 1000));
                setTimeLeft(remaining);

                if (remaining === 0) {
                    clearInterval(interval);
                    if (isHost) {
                        onStartPhase(3);
                    }
                }
            }, 100);

            return () => clearInterval(interval);
        }
    }, [currentPhase, room.roundStartedAt, isHost, onStartPhase]);

    if (!currentQuestion) {
        return (
            <div className="flex flex-col items-center justify-center h-full px-4">
                <Card className="bg-white/95 max-w-md w-full">
                    <CardContent className="pt-6">
                        <p className="text-xl text-gray-700">No questions available</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const questionNumber = (room.currentQuestionIndex || 0) + 1;
    const totalQuestions = room.questions?.length || 0;
    const hasAnswered = room.answers?.[playerName] !== undefined;
    const allAnswered = room.players.every(
        (p) => room.answers?.[p.name] !== undefined
    );

    return (
        <div className="flex flex-col items-center h-full px-4 py-8 overflow-y-auto">
            <div className="w-full max-w-4xl space-y-6">
                {/* Header */}
                <div className="text-center text-white">
                    <h1 className={`${lilita.className} text-4xl mb-2`}>
                        Question {questionNumber} / {totalQuestions}
                    </h1>
                    <p className="text-xl opacity-90">Room: {room.roomCode}</p>
                </div>

                {/* Question Display */}
                <Card className="bg-white/95">
                    <CardContent className="pt-6">
                        <div className="text-center mb-4">
                            <p className="text-2xl font-bold text-gray-800 mb-2">
                                {currentQuestion.text}
                            </p>
                            <p className="text-gray-600">
                                Range: {currentQuestion.rangeMin} - {currentQuestion.rangeMax}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Phase 1: Present Question */}
                {currentPhase === 1 && (
                    <Card className="bg-white/95">
                        <CardContent className="pt-6">
                            {isHost ? (
                                <HostPhase1 onOpenGuessing={() => onStartPhase(2)} />
                            ) : (
                                <PlayerWaiting message="Waiting for host to open guessing..." />
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Phase 2: Guessing */}
                {currentPhase === 2 && (
                    <>
                        <Card className="bg-white/95">
                            <CardContent className="pt-6">
                                <Timer timeLeft={timeLeft} maxTime={30} />
                            </CardContent>
                        </Card>

                        <Card className="bg-white/95">
                            <CardContent className="pt-6">
                                {isHost ? (
                                    <HostPhase2
                                        players={room.players}
                                        playerName={playerName}
                                        answers={room.answers}
                                        allAnswered={allAnswered}
                                        onContinue={() => onStartPhase(3)}
                                    />
                                ) : (
                                    <PlayerGuessing
                                        question={currentQuestion}
                                        onSubmitGuess={onSubmitGuess}
                                        hasAnswered={hasAnswered}
                                        playerAnswer={room.answers?.[playerName]}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* Phase 3: Set Answer */}
                {currentPhase === 3 && (
                    <Card className="bg-white/95">
                        <CardContent className="pt-6">
                            {isHost ? (
                                <HostPhase3
                                    questionRange={{
                                        min: currentQuestion.rangeMin,
                                        max: currentQuestion.rangeMax,
                                    }}
                                    onSetAnswer={onSetCorrectAnswer}
                                />
                            ) : (
                                <PlayerWaiting message="Waiting for host to set the correct answer..." />
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Phase 4: Results */}
                {currentPhase === 4 && (
                    <Card className="bg-white/95">
                        <CardContent className="pt-6">
                            <Leaderboard
                                players={room.players}
                                correctAnswer={room.correctAnswer || 0}
                                playerAnswers={room.answers || {}}
                                currentPlayerName={playerName}
                                isHost={isHost}
                                onNextQuestion={onNextQuestion}
                                isFinalQuestion={questionNumber >= totalQuestions}
                            />
                        </CardContent>
                    </Card>
                )}

                {error && (
                    <Card className="bg-red-100 border-2 border-red-400">
                        <CardContent className="pt-6">
                            <p className="text-red-700 text-center font-semibold">{error}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function PlayersList({
                         players,
                         currentPlayerName,
                         answers,
                         showAnswerStatus = false,
                     }: {
    players: Player[];
    currentPlayerName: string;
    answers?: Record<string, number>;
    showAnswerStatus?: boolean;
}) {
    if (players.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No players yet. Waiting for players to join...</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {players.map((player, index) => {
                const isCurrentPlayer = player.name === currentPlayerName;
                const hasAnswered = answers?.[player.name] !== undefined;

                return (
                    <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                            isCurrentPlayer
                                ? "bg-violet-50 border-violet-300"
                                : "bg-gray-50 border-gray-200"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                    isCurrentPlayer
                                        ? "bg-violet-500 text-white"
                                        : "bg-gray-300 text-gray-700"
                                }`}
                            >
                                {player.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">
                                    {player.name}
                                    {isCurrentPlayer && (
                                        <span className="ml-2 text-xs text-violet-600">(You)</span>
                                    )}
                                </p>
                                <p className="text-sm text-gray-600">Score: {player.score}</p>
                            </div>
                        </div>
                        {showAnswerStatus && (
                            <div className="flex items-center gap-2">
                                {hasAnswered ? (
                                    <div className="flex items-center gap-1 text-green-600 font-semibold">
                                        <Check className="w-5 h-5" />
                                        <span className="text-sm">Submitted</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-orange-600">
                                        <Clock className="w-5 h-5" />
                                        <span className="text-sm">Waiting...</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function QuestionManager({
                             questions,
                             onAddQuestion,
                             onUpdateQuestion,
                         }: {
    questions: Question[];
    onAddQuestion: (question: Question) => void;
    onUpdateQuestion: (index: number, question: Question) => void;
}) {
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
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                        {showQuestions ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </Button>
                </CardTitle>
            </CardHeader>

            {showQuestions && (
                <CardContent className="space-y-4">
                    {questions.length > 0 && (
                        <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-2">
                            {questions.map((q, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-3">
                                    {editIndex === index ? (
                                        <div className="space-y-2">
                                            <Input
                                                type="text"
                                                value={editQuestion.text}
                                                onChange={(e) =>
                                                    setEditQuestion({ ...editQuestion, text: e.target.value })
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
                                                    onClick={() => setEditIndex(null)}
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

// Host Phase Components
function HostPhase1({ onOpenGuessing }: { onOpenGuessing: () => void }) {
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

function HostPhase2({
                        players,
                        playerName,
                        answers,
                        allAnswered,
                        onContinue,
                    }: {
    players: Player[];
    playerName: string;
    answers?: Record<string, number>;
    allAnswered: boolean;
    onContinue: () => void;
}) {
    return (
        <div className="space-y-4">
            <p className="text-center text-xl font-semibold">
                Players are submitting their guesses...
            </p>
            <PlayersList
                players={players}
                currentPlayerName={playerName}
                answers={answers}
                showAnswerStatus={true}
            />
            {allAnswered && (
                <div className="text-center">
                    <p className="text-green-600 font-bold mb-2">
                        All players have answered!
                    </p>
                    <Button
                        onClick={onContinue}
                        className="bg-violet-500 hover:bg-violet-600 text-white px-6 py-2 rounded-lg"
                    >
                        Continue to Set Answer
                    </Button>
                </div>
            )}
        </div>
    );
}

function HostPhase3({
                        questionRange,
                        onSetAnswer,
                    }: {
    questionRange: { min: number; max: number };
    onSetAnswer: (answer: number) => void;
}) {
    const [answerInput, setAnswerInput] = useState("");
    const [error, setError] = useState("");

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
                `Answer must be between ${questionRange.min} and ${questionRange.max}`
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

// Player Components
function PlayerWaiting({ message }: { message: string }) {
    return (
        <div className="text-center py-8">
            <p className="text-xl text-gray-700">{message}</p>
        </div>
    );
}

function PlayerGuessing({
                            question,
                            onSubmitGuess,
                            hasAnswered,
                            playerAnswer,
                        }: {
    question: Question;
    onSubmitGuess: (guess: number) => void;
    hasAnswered: boolean;
    playerAnswer?: number;
}) {
    const [useSlider, setUseSlider] = useState(true);
    const [guess, setGuess] = useState<number>(
        Math.floor((question.rangeMin + question.rangeMax) / 2)
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
                `Guess must be between ${question.rangeMin} and ${question.rangeMax}`
            );
            return;
        }

        onSubmitGuess(guess);
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
                question.rangeMax
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
                            onChange={(e) => setGuess(Number(e.target.value))}
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

function Leaderboard({
                         players,
                         correctAnswer,
                         playerAnswers,
                         currentPlayerName,
                         isHost,
                         onNextQuestion,
                         isFinalQuestion,
                     }: {
    players: Player[];
    correctAnswer: number;
    playerAnswers: Record<string, number>;
    currentPlayerName: string;
    isHost: boolean;
    onNextQuestion: () => void;
    isFinalQuestion: boolean;
}) {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    const getRankIcon = (index: number) => {
        if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
        if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
        if (index === 2) return <Medal className="w-6 h-6 text-orange-600" />;
        return (
            <span className="w-6 h-6 flex items-center justify-center font-bold text-gray-600">
        {index + 1}
      </span>
        );
    };

    const getRankBgColor = (index: number) => {
        if (index === 0)
            return "bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-400";
        if (index === 1)
            return "bg-gradient-to-r from-gray-100 to-gray-50 border-gray-400";
        if (index === 2)
            return "bg-gradient-to-r from-orange-100 to-orange-50 border-orange-400";
        return "bg-white border-gray-200";
    };

    const getDistanceFromAnswer = (playerName: string) => {
        const guess = playerAnswers[playerName];
        if (guess === undefined) return null;
        return Math.abs(correctAnswer - guess);
    };

    return (
        <div className="space-y-6">
            {/* Correct Answer */}
            <div className="text-center p-6 bg-gradient-to-r from-violet-100 to-purple-100 rounded-xl border-2 border-violet-400">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Correct Answer
                </h3>
                <p className="text-5xl font-bold text-violet-600">{correctAnswer}</p>
            </div>

            {/* Leaderboard */}
            <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-800 text-center mb-4">
                    {isFinalQuestion ? "Final Standings 🎉" : "Current Standings"}
                </h3>
                {sortedPlayers.map((player, index) => {
                    const isCurrentPlayer = player.name === currentPlayerName;
                    const distance = getDistanceFromAnswer(player.name);
                    const guess = playerAnswers[player.name];

                    return (
                        <div
                            key={player.name}
                            className={`flex items-center justify-between p-4 rounded-xl border-2 ${getRankBgColor(
                                index
                            )} ${isCurrentPlayer ? "ring-2 ring-violet-500" : ""}`}
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <div className="flex items-center justify-center w-10">
                                    {getRankIcon(index)}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-lg text-gray-800">
                                        {player.name}
                                        {isCurrentPlayer && (
                                            <span className="ml-2 text-sm text-violet-600">(You)</span>
                                        )}
                                    </p>
                                    <div className="flex gap-4 text-sm text-gray-600">
                                        <span>Guess: {guess !== undefined ? guess : "N/A"}</span>
                                        {distance !== null && (
                                            <span className="text-violet-600 font-semibold">
                        Off by: {distance}
                      </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-800">
                                        {player.score}
                                    </p>
                                    <p className="text-xs text-gray-600">points</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Next Question Button */}
            {isHost && (
                <div className="pt-4">
                    <Button
                        onClick={onNextQuestion}
                        className={`w-full py-4 text-lg font-bold rounded-xl ${
                            isFinalQuestion
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-violet-500 hover:bg-violet-600"
                        }`}
                    >
                        {isFinalQuestion ? (
                            <>
                                <Trophy className="w-5 h-5 mr-2" />
                                View Final Results
                            </>
                        ) : (
                            <>
                                <ArrowRight className="w-5 h-5 mr-2" />
                                Next Question
                            </>
                        )}
                    </Button>
                </div>
            )}

            {!isHost && (
                <div className="text-center p-4 bg-gray-100 rounded-lg">
                    <p className="text-gray-700">
                        {isFinalQuestion
                            ? "Waiting for host to end the game..."
                            : "Waiting for host to continue to the next question..."}
                    </p>
                </div>
            )}
        </div>
    );
}
