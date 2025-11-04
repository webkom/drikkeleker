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
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Timer from "@/components/shared/Timer";
import ShinyText from "@/components/shared/shiny-text";

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
      <div className="w-full max-w-4xl space-y-6">
        {/* Room Code Card */}
        <h1 className={`${lilita.className} text-5xl leading-tight`}>
          Viljens Drikkelek
          <ShinyText text={"PRO"} speed={3} className="bg-yellow-400" />
        </h1>
        <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-yellow-400">
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">Romkode</h2>
          <div className="flex items-center justify-center gap-4">
            <div className="text-6xl font-mono font-bold text-yellow-600 tracking-widest">
              {room.roomCode}
            </div>
          </div>
        </div>

        {/* Players Card */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Users size={28} />
              Spillere ({room.players.length})
            </h2>
            {isHost && (
              <span className="text-sm bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-bold shadow-md border-2 border-yellow-300">
                Host
              </span>
            )}
          </div>
          <PlayersList players={room.players} currentPlayerName={playerName} />
        </div>

        {isHost && (
          <QuestionManager
            questions={room.questions || []}
            onAddQuestion={onAddQuestion}
            onUpdateQuestion={onUpdateQuestion}
          />
        )}

        {isHost && (
          <div className="space-y-3">
            {showWarning && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-100 border-2 border-red-300 text-red-700 p-4 rounded-2xl font-semibold"
              >
                Trenger minst 2 spillere og 1 spørsmål for å starte
              </motion.div>
            )}
            <Button
              onClick={handleStartGame}
              disabled={!canStartGame}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white font-bold py-6 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed shine-container"
            >
              <Play className="mr-2" size={24} />
              Start spillet
            </Button>
          </div>
        )}

        {!isHost && (
          <div className="bg-gray-100 border-2 border-gray-300 p-6 rounded-2xl">
            <p className="text-gray-800 text-lg font-semibold">
              Venter på at hosten starter spillet...
            </p>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-100 border-2 border-red-300 text-red-700 p-4 rounded-2xl font-semibold"
          >
            {error}
          </motion.div>
        )}
      </div>
    </div>
  );
}
function PlayersList({
  players,
  currentPlayerName,
}: {
  players: Player[];
  currentPlayerName: string;
}) {
  if (players.length === 0) {
    return (
      <div className="text-gray-600 bg-gray-50 p-6 rounded-2xl">
        <p className="text-lg">
          Ingen spillere ennå. Inviter venner til å bli med!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {players.map((player, idx) => {
        const isCurrentPlayer = player.name === currentPlayerName;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`flex items-center justify-between p-4 rounded-2xl border-2 ${
              isCurrentPlayer
                ? "bg-yellow-50 border-yellow-400 ring-2 ring-yellow-300"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  isCurrentPlayer ? "bg-yellow-500" : "bg-gray-400"
                }`}
              >
                {player.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-gray-800 text-lg">
                {player.name}
                {isCurrentPlayer && (
                  <span className="ml-2 text-sm text-yellow-600">(Deg)</span>
                )}
              </span>
            </div>
          </motion.div>
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
  onAddQuestion: (q: Question) => void;
  onUpdateQuestion: (idx: number, q: Question) => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    text: "",
    rangeMin: 0,
    rangeMax: 100,
  });

  const resetForm = () => {
    setFormData({ text: "", rangeMin: 0, rangeMax: 100 });
    setShowAddForm(false);
    setEditingIndex(null);
  };

  const handleSubmit = () => {
    if (!formData.text.trim()) return;
    if (editingIndex !== null) {
      onUpdateQuestion(editingIndex, formData);
    } else {
      onAddQuestion(formData);
    }
    resetForm();
  };

  const handleEdit = (idx: number) => {
    setFormData(questions[idx]);
    setEditingIndex(idx);
    setShowAddForm(true);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Spørsmål ({questions.length})
        </h2>
        {!showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 shine-container"
          >
            <Plus size={20} className="mr-2" />
            Legg til spørsmål
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 bg-gray-50 p-6 rounded-2xl border-2 border-gray-300"
          >
            <h3 className="font-bold text-lg text-gray-700 mb-4">
              {editingIndex !== null ? "Rediger spørsmål" : "Nytt spørsmål"}
            </h3>
            <div className="space-y-4">
              <Input
                placeholder="Spørsmålstekst..."
                value={formData.text}
                onChange={(e) =>
                  setFormData({ ...formData, text: e.target.value })
                }
                className="bg-white border-2 border-gray-300 rounded-xl text-lg p-3 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Min verdi
                  </label>
                  <Input
                    type="number"
                    value={formData.rangeMin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rangeMin: Number(e.target.value),
                      })
                    }
                    className="bg-white border-2 border-gray-300 rounded-xl text-lg p-3 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Maks verdi
                  </label>
                  <Input
                    type="number"
                    value={formData.rangeMax}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rangeMax: Number(e.target.value),
                      })
                    }
                    className="bg-white border-2 border-gray-300 rounded-xl text-lg p-3 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.text.trim()}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 shine-container"
                >
                  <Plus size={18} className="mr-2" />
                  {editingIndex !== null ? "Oppdater" : "Legg til"}
                </Button>
                <Button
                  onClick={resetForm}
                  className="bg-gray-400 hover:bg-gray-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <X size={18} className="mr-2" />
                  Avbryt
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {questions.length === 0 ? (
          <div className="text-gray-600 bg-gray-50 p-6 rounded-2xl text-center">
            <p className="text-lg">Ingen spørsmål ennå</p>
          </div>
        ) : (
          questions.map((q, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 mb-2 text-lg">
                    {idx + 1}. {q.text}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">
                    Område: {q.rangeMin} - {q.rangeMax}
                  </p>
                </div>
                <Button
                  onClick={() => handleEdit(idx)}
                  className="bg-gray-400 hover:bg-gray-500 text-white rounded-full h-10 w-10 p-0 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Edit2 size={16} />
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

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
  const currentQuestion = room.questions?.[room.currentQuestionIndex || 0];
  const phase = room.phase || 1;

  if (phase === 5) {
    return (
      <GameEnd
        players={room.players}
        currentPlayerName={playerName}
        isHost={isHost}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-white p-8 rounded-3xl shadow-2xl border-2 border-yellow-400">
          <p className="text-2xl font-bold text-gray-800">Laster spørsmål...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center h-full w-full px-4 py-8">
      <div className="w-full max-w-4xl mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-gray-700">
              Spørsmål {(room.currentQuestionIndex || 0) + 1} av{" "}
              {room.questions?.length || 0}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-yellow-500 h-3 rounded-full transition-all duration-500 shine-container"
              style={{
                width: `${
                  (((room.currentQuestionIndex || 0) + 1) /
                    (room.questions?.length || 1)) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {(isHost || phase !== 1) && (
        <div className="w-full max-w-4xl mb-6">
          <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-yellow-400">
            <h2 className={`${lilita.className} text-4xl text-yellow-600 mb-4`}>
              {currentQuestion.text}
            </h2>
            <p className="text-lg text-gray-700 font-semibold">
              Område: {currentQuestion.rangeMin} - {currentQuestion.rangeMax}
            </p>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl">
        {phase === 1 && (
          <QuestionIntro
            question={currentQuestion}
            isHost={isHost}
            onStartPhase={onStartPhase}
            players={room.players}
          />
        )}
        {phase === 2 &&
          (isHost ? (
            <HostGuessingView
              players={room.players}
              answers={room.answers || {}}
              roundStartedAt={room.roundStartedAt}
            />
          ) : (
            <GuessingPhase
              question={currentQuestion}
              playerName={playerName}
              onSubmitGuess={onSubmitGuess}
              hasAnswered={room.answers ? playerName in room.answers : false}
              answeredCount={
                room.answers ? Object.keys(room.answers).length : 0
              }
              totalPlayers={room.players.length}
              error={error}
              roundStartedAt={room.roundStartedAt}
            />
          ))}
        {phase === 3 && (
          <RevealPhase
            question={currentQuestion}
            players={room.players}
            playerAnswers={room.answers || {}}
            isHost={isHost}
            onSetCorrectAnswer={onSetCorrectAnswer}
          />
        )}
        {phase === 4 && (
          <Leaderboard
            players={room.players}
            correctAnswer={room.correctAnswer || 0}
            playerAnswers={room.answers || {}}
            currentPlayerName={playerName}
            isHost={isHost}
            onNextQuestion={onNextQuestion}
            isFinalQuestion={
              (room.currentQuestionIndex || 0) >=
              (room.questions?.length || 1) - 1
            }
          />
        )}
      </div>
    </div>
  );
}

function QuestionIntro({
  question,
  isHost,
  onStartPhase,
  players,
}: {
  question: Question;
  isHost: boolean;
  onStartPhase: (phase: number) => void;
  players: Player[];
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-gray-200">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
          <Users size={28} />
          Spillere
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {players.map((player, idx) => (
            <div
              key={idx}
              className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-300"
            >
              <p className="font-bold text-gray-800 truncate">{player.name}</p>
              <p className="text-sm text-gray-600">{player.score} poeng</p>
            </div>
          ))}
        </div>
      </div>

      {isHost ? (
        <Button
          onClick={() => onStartPhase(2)}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-6 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 shine-container"
        >
          <Play size={24} className="mr-2" />
          Start gjetterunden
        </Button>
      ) : (
        <div className="bg-gray-100 border-2 border-gray-300 p-6 rounded-2xl">
          <p className="text-gray-800 text-lg font-semibold">
            Hosten presenterer spørsmålet...
          </p>
        </div>
      )}
    </div>
  );
}

function HostGuessingView({
  players,
  answers,
  roundStartedAt,
}: {
  players: Player[];
  answers: Record<string, number>;
  roundStartedAt?: number;
}) {
  const answeredPlayers = Object.keys(answers);
  const totalPlayers = players.length;

  return (
    <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-yellow-400 space-y-6">
      {roundStartedAt && (
        <div className="flex justify-center">
          <Timer startTime={roundStartedAt} duration={30} />
        </div>
      )}

      <div className="text-center">
        <h3 className="text-3xl font-bold text-yellow-600 mb-2">
          Venter på spillere
        </h3>
        <p className="text-xl text-gray-700 font-semibold">
          {answeredPlayers.length} / {totalPlayers} har svart
        </p>
      </div>

      <div className="w-full bg-yellow-200 rounded-full h-4">
        <div
          className="bg-yellow-500 h-4 rounded-full transition-all duration-300 shine-container"
          style={{
            width: `${(answeredPlayers.length / totalPlayers) * 100}%`,
          }}
        />
      </div>

      <div className="space-y-3">
        {players.map((player, idx) => {
          const hasAnswered = answeredPlayers.includes(player.name);
          return (
            <div
              key={idx}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 ${
                hasAnswered
                  ? "bg-green-50 border-green-400"
                  : "bg-gray-50 border-gray-300"
              }`}
            >
              <span className="font-bold text-gray-800">{player.name}</span>
              <span
                className={`text-sm font-semibold ${
                  hasAnswered ? "text-green-600" : "text-gray-500"
                }`}
              >
                {hasAnswered ? "Svart" : "Venter..."}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GuessingPhase({
  question,
  playerName,
  onSubmitGuess,
  hasAnswered,
  answeredCount,
  totalPlayers,
  error,
  roundStartedAt,
}: {
  question: Question;
  playerName: string;
  onSubmitGuess: (guess: number) => void;
  hasAnswered: boolean;
  answeredCount: number;
  totalPlayers: number;
  error: string;
  roundStartedAt?: number;
}) {
  const [guess, setGuess] = useState(
    Math.floor((question.rangeMin + question.rangeMax) / 2),
  );
  const [useSlider, setUseSlider] = useState(true);

  useEffect(() => {
    if (!roundStartedAt || hasAnswered) {
      return;
    }

    const timerId = setInterval(() => {
      const elapsed = Date.now() - roundStartedAt;
      if (elapsed >= 30000) {
        if (!hasAnswered) {
          console.log(
            `Time is up! Auto-submitting guess for ${playerName}: ${guess}`,
          );
          onSubmitGuess(guess);
        }
        clearInterval(timerId);
      }
    }, 250);

    return () => clearInterval(timerId);
  }, [roundStartedAt, hasAnswered, guess, onSubmitGuess, playerName]);

  const handleSubmit = () => {
    if (!hasAnswered) {
      onSubmitGuess(guess);
    }
  };

  const handleInputChange = (value: string) => {
    const num = Number(value);
    if (!isNaN(num)) {
      const clamped = Math.max(
        question.rangeMin,
        Math.min(question.rangeMax, num),
      );
      setGuess(clamped);
    }
  };

  const fillPercent =
    ((guess - question.rangeMin) / (question.rangeMax - question.rangeMin)) *
    100;

  if (hasAnswered) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-green-400">
        <div className="text-center space-y-6">
          <h3 className="text-3xl font-bold text-green-600">Svar mottatt</h3>
          <p className="text-xl text-gray-700">
            Din gjetning:{" "}
            <span className="font-bold text-green-600">{guess}</span>
          </p>
          <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-300">
            <p className="text-lg text-green-800 font-semibold">
              {answeredCount} / {totalPlayers} spillere har svart
            </p>
            <div className="w-full bg-green-200 rounded-full h-3 mt-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${(answeredCount / totalPlayers) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-yellow-400 space-y-6">
      {roundStartedAt && (
        <div className="flex justify-center">
          <Timer startTime={roundStartedAt} duration={30} />
        </div>
      )}

      <div className="flex justify-center">
        <div className="relative flex w-full max-w-xs items-center rounded-full bg-gray-100 p-1">
          <div
            className="absolute left-1 top-1 h-[calc(100%-0.5rem)] w-1/2 rounded-full bg-yellow-400 shadow-md transition-transform duration-300 ease-in-out"
            style={{
              transform: useSlider ? "translateX(0%)" : "translateX(100%)",
            }}
          />
          <button
            onClick={() => setUseSlider(true)}
            className={`relative z-10 w-1/2 rounded-full py-2 text-center font-semibold transition-colors duration-300 ${
              useSlider ? "text-white" : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            Slider
          </button>
          <button
            onClick={() => setUseSlider(false)}
            className={`relative z-10 w-1/2 rounded-full py-2 text-center font-semibold transition-colors duration-300 ${
              !useSlider ? "text-white" : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            Input
          </button>
        </div>
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
              className="w-full h-4 rounded-full appearance-none cursor-pointer
                                       [&::-webkit-slider-thumb]:appearance-none
                                       [&::-webkit-slider-thumb]:w-2
                                       [&::-webkit-slider-thumb]:h-6
                                       [&::-webkit-slider-thumb]:bg-yellow-500
                                       [&::-webkit-slider-thumb]:rounded-full
                                       [&::-webkit-slider-thumb]:-mt-1
                                       [&::-moz-range-thumb]:w-2
                                       [&::-moz-range-thumb]:h-6
                                       [&::-moz-range-thumb]:bg-yellow-500
                                       [&::-moz-range-thumb]:rounded-full
                                       [&::-moz-range-thumb]:border-none"
              style={{
                background: `linear-gradient(to right, #eab308 ${fillPercent}%, #e5e7eb ${fillPercent}%)`,
              }}
            />
          </div>
          <div className="text-center">
            <p className="text-5xl font-bold text-yellow-600">{guess}</p>
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
            className="text-center text-5xl py-8 font-bold border-4 border-yellow-300 rounded-2xl focus:border-yellow-500 focus:ring-4 focus:ring-yellow-200"
          />
        </div>
      )}

      <div className="flex justify-between text-sm text-gray-600 font-semibold">
        <span className="bg-gray-100 px-3 py-1 rounded-full">
          {question.rangeMin}
        </span>
        <span className="bg-gray-100 px-3 py-1 rounded-full">
          {question.rangeMax}
        </span>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={hasAnswered}
        className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white py-6 text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 shine-container"
      >
        Send inn gjetning
      </Button>

      {error && (
        <div className="p-4 bg-red-100 border-2 border-red-300 text-red-700 text-center rounded-2xl font-semibold">
          {error}
        </div>
      )}
    </div>
  );
}

function RevealPhase({
  question,
  players,
  playerAnswers,
  isHost,
  onSetCorrectAnswer,
}: {
  question: Question;
  players: Player[];
  playerAnswers: Record<string, number>;
  isHost: boolean;
  onSetCorrectAnswer: (answer: number) => void;
}) {
  const [answer, setAnswer] = useState<number>(
    Math.floor((question.rangeMin + question.rangeMax) / 2),
  );

  const handleSubmit = () => {
    onSetCorrectAnswer(answer);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-gray-200">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Alle gjetninger
        </h3>
        <div className="grid gap-3">
          {players.map((player, idx) => {
            const guess = playerAnswers[player.name];
            return (
              <div
                key={idx}
                className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border-2 border-gray-200"
              >
                <span className="font-bold text-gray-800">{player.name}</span>
                <span className="text-xl font-bold text-yellow-600">
                  {guess !== undefined ? guess : "Ingen gjetning"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {isHost ? (
        <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-yellow-400 space-y-6">
          <h3 className="text-2xl font-bold text-yellow-600">
            Sett riktig svar
          </h3>
          <Input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(Number(e.target.value))}
            min={question.rangeMin}
            max={question.rangeMax}
            className="text-center text-5xl py-8 font-bold border-4 border-yellow-300 rounded-2xl focus:border-yellow-500 focus:ring-4 focus:ring-yellow-200"
          />
          <Button
            onClick={handleSubmit}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-6 text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 shine-container"
          >
            Vis svar & beregn poeng
          </Button>
        </div>
      ) : (
        <div className="bg-gray-100 border-2 border-gray-300 p-6 rounded-2xl">
          <p className="text-gray-800 text-lg font-semibold">
            Venter på at hosten viser riktig svar...
          </p>
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
    if (index === 0) return <Trophy className="w-7 h-7 text-yellow-500" />;
    if (index === 1) return <Medal className="w-7 h-7 text-gray-400" />;
    if (index === 2) return <Medal className="w-7 h-7 text-orange-600" />;
    return (
      <span className="w-7 h-7 flex items-center justify-center font-bold text-gray-600 text-lg">
        {index + 1}
      </span>
    );
  };

  const getRankBgColor = (index: number) => {
    if (index === 0) return "bg-yellow-100 border-yellow-400";
    if (index === 1) return "bg-gray-100 border-gray-400";
    if (index === 2) return "bg-orange-100 border-orange-400";
    return "bg-gray-50 border-gray-200";
  };

  const getDistanceFromAnswer = (playerName: string) => {
    const guess = playerAnswers[playerName];
    if (guess === undefined) return null;
    return Math.abs(correctAnswer - guess);
  };

  return (
    <div className="space-y-6">
      <div className="text-center p-8 bg-white rounded-3xl border-2 border-yellow-400 shadow-2xl">
        <h3 className="text-2xl font-bold text-yellow-600 mb-3">Riktig svar</h3>
        <p className="text-6xl font-bold text-yellow-600">{correctAnswer}</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-3xl font-bold text-white text-center">
          {isFinalQuestion ? "Endelig stilling" : "Nåværende stilling"}
        </h3>
        <div className="space-y-3">
          {sortedPlayers.map((player, index) => {
            const isCurrentPlayer = player.name === currentPlayerName;
            const distance = getDistanceFromAnswer(player.name);
            const guess = playerAnswers[player.name];

            return (
              <motion.div
                key={player.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-5 rounded-2xl border-2 ${getRankBgColor(
                  index,
                )} ${isCurrentPlayer ? "ring-4 ring-yellow-400" : ""} shadow-lg`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(index)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-xl text-gray-800">
                      {player.name}
                      {isCurrentPlayer && (
                        <span className="ml-2 text-sm text-yellow-600 font-bold">
                          (Deg)
                        </span>
                      )}
                    </p>
                    <div className="flex gap-4 text-sm text-gray-700 font-semibold">
                      <span>
                        Gjetning: {guess !== undefined ? guess : "N/A"}
                      </span>
                      {distance !== null && (
                        <span className="text-yellow-600">
                          Feil med: {distance}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-800">
                      {player.score}
                    </p>
                    <p className="text-xs text-gray-600 font-semibold">poeng</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {isHost && (
        <div className="pt-4">
          <Button
            onClick={onNextQuestion}
            className="w-full bg-yellow-500 hover:bg-yellow-600 py-6 text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 shine-container"
          >
            {isFinalQuestion ? (
              <>
                <Trophy className="w-6 h-6 mr-2" />
                Se sluttresultat
              </>
            ) : (
              <>
                <ArrowRight className="w-6 h-6 mr-2" />
                Neste spørsmål
              </>
            )}
          </Button>
        </div>
      )}

      {!isHost && (
        <div className="bg-gray-100 border-2 border-gray-300 p-6 rounded-2xl">
          <p className="text-gray-800 text-lg font-semibold">
            {isFinalQuestion
              ? "Venter på at hosten avslutter spillet..."
              : "Venter på at hosten går videre til neste spørsmål..."}
          </p>
        </div>
      )}
    </div>
  );
}

function GameEnd({
  players,
  currentPlayerName,
  isHost,
}: {
  players: Player[];
  currentPlayerName: string;
  isHost: boolean;
}) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 space-y-8">
      <div className="bg-yellow-100 rounded-3xl p-12 shadow-2xl border-2 border-yellow-400 text-center">
        <div className="text-7xl mb-6">🏆</div>
        <h1 className={`${lilita.className} text-5xl text-yellow-700 mb-4`}>
          Spillet er over!
        </h1>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {winner.name} vinner!
        </h2>
        <p className="text-2xl text-gray-700">
          Sluttpoeng:{" "}
          <span className="font-bold text-yellow-600">{winner.score}</span>{" "}
          poeng
        </p>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-3xl p-8 shadow-2xl border-2 border-gray-200">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Endelig stilling
        </h3>
        <div className="space-y-3">
          {sortedPlayers.map((player, idx) => {
            const isCurrentPlayer = player.name === currentPlayerName;
            const medals = ["🥇", "🥈", "🥉"];
            return (
              <div
                key={idx}
                className={`flex justify-between items-center p-5 rounded-2xl border-2 ${
                  isCurrentPlayer
                    ? "bg-yellow-50 border-yellow-400 ring-4 ring-yellow-300"
                    : "bg-gray-50 border-gray-200"
                } shadow-md`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">
                    {medals[idx] || `#${idx + 1}`}
                  </span>
                  <span className="font-bold text-xl text-gray-800">
                    {player.name}
                    {isCurrentPlayer && (
                      <span className="ml-2 text-sm text-yellow-600">
                        (Deg)
                      </span>
                    )}
                  </span>
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  {player.score}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
