"use client";

import { useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  Minus,
  Pause,
  Play,
  Plus,
  Repeat,
  RotateCcw,
  SkipForward,
} from "lucide-react";
import BeerContainer from "@/components/beer/beer-container";
import BackButton from "@/components/shared/back-button";
import Footer from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { lilita } from "@/lib/fonts";
import { useBeatRoom } from "../_lib/useBeatRoom";
import {
  adjustPointValue,
  adjustScore,
  awardPoints,
  nextPhrase,
  passTurn,
  pauseTimer,
  resetGame,
  resetTimer,
  resumeTimer,
  revealWord,
  revealAllWords,
  toggleAudienceTimer,
} from "../_lib/gameActions";
import ScoreBoard from "./ScoreBoard";
import WordTile from "./WordTile";
import Timer from "./Timer";
import SetupForm from "./SetupForm";

interface AdminViewProps {
  roomCode: string;
}

export default function AdminView({ roomCode }: AdminViewProps) {
  const { state, isHost, loading, error, applyAction } = useBeatRoom(roomCode);
  const [confirmReset, setConfirmReset] = useState(false);

  if (loading) {
    return (
      <main className="overflow-x-hidden">
        <BackButton className="absolute top-4 left-4 z-10" href="/#games" />
        <BeerContainer color="amber" className="min-h-dvh">
          <div className="pt-24 flex items-center justify-center">
            <span className={`${lilita.className} text-3xl`}>Kobler til…</span>
          </div>
        </BeerContainer>
      </main>
    );
  }

  if (error || !state) {
    return (
      <main className="overflow-x-hidden">
        <BackButton className="absolute top-4 left-4 z-10" href="/#games" />
        <BeerContainer color="amber" className="min-h-dvh">
          <div className="pt-24 flex flex-col items-center justify-center gap-4">
            <h1 className={`${lilita.className} text-4xl`}>Ups!</h1>
            <p className="text-lg text-gray-700">
              {error ?? "Fant ikke rommet"}
            </p>
            <code className="rounded bg-white/70 px-3 py-1 text-sm">
              {roomCode}
            </code>
          </div>
        </BeerContainer>
      </main>
    );
  }

  if (!isHost) {
    return (
      <main className="overflow-x-hidden">
        <BackButton className="absolute top-4 left-4 z-10" href="/#games" />
        <BeerContainer color="amber" className="min-h-dvh">
          <div className="pt-24 flex flex-col items-center justify-center gap-4 max-w-md mx-auto text-center">
            <h1 className={`${lilita.className} text-4xl`}>
              Bare hosten kan styre
            </h1>
            <p className="text-gray-700">
              Du er ikke host i dette rommet. Åpne publikum-visningen
              istedenfor, eller lag et nytt rom.
            </p>
            <Button asChild>
              <a href={`/beat-for-beat/audience/${roomCode}`}>
                Åpne publikum-visning
              </a>
            </Button>
          </div>
        </BeerContainer>
      </main>
    );
  }

  return (
    <main className="overflow-x-hidden">
      <BackButton className="absolute top-4 left-4 z-10" href="/#games" />
      <BeerContainer color="amber" className="min-h-dvh">
        <div className="w-full max-w-3xl pt-16 flex flex-col gap-6 items-center pb-8">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs uppercase tracking-widest text-amber-900/70">
              Romkode
            </span>
            <code
              className={`${lilita.className} text-3xl tracking-[0.3em] bg-white/80 rounded-xl px-4 py-1`}
            >
              {roomCode}
            </code>
          </div>

          <ScoreBoard
            teams={state.teams}
            scores={state.scores}
            activeTeam={state.round?.activeTeam ?? null}
            onAdjust={(team, delta) =>
              applyAction((s) => adjustScore(s, team, delta))
            }
          />

          {(state.phase === "idle" || state.phase === "setup") && (
            <SetupForm state={state} applyAction={applyAction} />
          )}

          {state.phase === "playing" && state.round && (
            <GameControls
              state={state}
              applyAction={applyAction}
              onReset={() => setConfirmReset(true)}
            />
          )}

          {state.phase === "game-over" && (
            <GameOverPanel
              state={state}
              applyAction={applyAction}
              onReset={() => setConfirmReset(true)}
            />
          )}

          {confirmReset && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full flex flex-col gap-4">
                <h3 className={`${lilita.className} text-2xl`}>
                  Nullstille spillet?
                </h3>
                <p className="text-sm text-gray-600">
                  Alle fraser, poeng og lag-navn slettes.
                </p>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmReset(false)}
                  >
                    Avbryt
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      setConfirmReset(false);
                      await applyAction(() => resetGame());
                    }}
                  >
                    Nullstill
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </BeerContainer>
    </main>
  );
}

interface GameControlsProps {
  state: NonNullable<ReturnType<typeof useBeatRoom>["state"]>;
  applyAction: ReturnType<typeof useBeatRoom>["applyAction"];
  onReset: () => void;
}

function GameControls({ state, applyAction, onReset }: GameControlsProps) {
  const round = state.round!;
  const isPaused =
    round.timerDeadline == null && round.pausedRemainingMs != null;
  const inGuessing = round.roundPhase === "guessing" || isPaused;
  const inWaitingForReveal = round.roundPhase === "waiting-for-reveal";
  const inRoundOver = round.roundPhase === "round-over";

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="rounded-full bg-amber-500 text-white text-sm font-semibold px-3 py-1 uppercase tracking-wide">
          {state.teams[round.activeTeam]} sin tur
        </span>
        <span className="text-sm text-gray-700">
          Frase {state.currentIndex + 1} / {state.queue.length}
        </span>
        <Button variant="outline" size="sm" onClick={onReset}>
          Nullstill spill
        </Button>
      </div>

      <div
        style={{ perspective: "900px" }}
        className="flex flex-wrap gap-3 justify-center bg-white/40 rounded-2xl p-6"
      >
        {round.words.map((word, i) => (
          <WordTile
            key={`${round.phraseId}-${i}-${word.revealed}`}
            word={word}
            index={i}
            mode="admin"
            onClick={() => applyAction((s) => revealWord(s, i))}
            disabled={inRoundOver || inWaitingForReveal}
          />
        ))}
      </div>

      {inWaitingForReveal && (
        <div className="bg-white/90 border-2 border-amber-400 rounded-2xl p-6 flex flex-col gap-4 items-center animate-in fade-in zoom-in duration-300">
          <h3 className={`${lilita.className} text-2xl text-amber-900`}>
            {round.awardedThisRound ? "Riktig svar!" : "Alle ord er valgt!"}
          </h3>
          <p className="text-gray-700 text-center">
            Trykk på knappen under for å avsløre hele frasen og spille sangen.
          </p>
          <Button
            size="lg"
            onClick={() => applyAction(revealAllWords)}
            className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-white py-8 text-2xl h-auto"
          >
            <Eye size={28} /> AVSLØR SVAR
          </Button>
        </div>
      )}

      {inGuessing && (
        <div className="bg-white/80 rounded-2xl p-4 flex flex-col gap-3">
          <Timer
            deadline={round.timerDeadline}
            pausedRemainingMs={round.pausedRemainingMs}
            durationSec={round.timerDurationSec}
          />
          <button
            type="button"
            onClick={() => applyAction(toggleAudienceTimer)}
            className="self-center inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 underline-offset-2 hover:underline"
          >
            {state.showTimerToAudience ? (
              <>
                <Eye size={14} /> Publikum ser timeren
              </>
            ) : (
              <>
                <EyeOff size={14} /> Publikum ser ikke timeren
              </>
            )}
          </button>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              size="lg"
              onClick={() => applyAction(awardPoints)}
              className="gap-1 bg-green-600 hover:bg-green-700"
            >
              <Check size={18} /> Riktig (+{round.pointValue})
            </Button>
            {isPaused ? (
              <Button
                size="lg"
                variant="outline"
                onClick={() => applyAction(resumeTimer)}
                className="gap-1"
              >
                <Play size={18} /> Fortsett
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                onClick={() => applyAction(pauseTimer)}
                className="gap-1"
              >
                <Pause size={18} /> Pause
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              onClick={() => applyAction(resetTimer)}
              className="gap-1"
            >
              <RotateCcw size={18} /> Nullstill timer
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => applyAction(passTurn)}
              className="gap-1"
            >
              <Repeat size={18} /> Bytt lag
            </Button>
          </div>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => applyAction(revealAllWords)}
            className="w-full gap-2 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 cursor-pointer"
          >
            <Eye size={18} /> Avslør hele frasen & spill sang
          </Button>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 bg-white/60 rounded-xl py-2 px-4">
        <span className="text-sm text-gray-600">Poengverdi:</span>
        <button
          onClick={() => applyAction((s) => adjustPointValue(s, -1))}
          disabled={round.pointValue <= 1}
          className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
          aria-label="Mindre poeng"
        >
          <Minus size={16} />
        </button>
        <span className="text-lg font-bold w-6 text-center">
          {round.pointValue}
        </span>
        <button
          onClick={() => applyAction((s) => adjustPointValue(s, 1))}
          className="p-1 text-gray-600 hover:text-gray-900"
          aria-label="Mer poeng"
        >
          <Plus size={16} />
        </button>
      </div>

      {(inRoundOver || round.roundPhase === "awaiting-pick") && (
        <Button
          size="lg"
          onClick={() => applyAction(nextPhrase)}
          className="self-stretch gap-2"
        >
          <SkipForward size={20} />
          {state.currentIndex + 1 >= state.queue.length
            ? "Avslutt spillet"
            : "Neste frase"}
        </Button>
      )}
    </div>
  );
}

interface GameOverPanelProps {
  state: NonNullable<ReturnType<typeof useBeatRoom>["state"]>;
  applyAction: ReturnType<typeof useBeatRoom>["applyAction"];
  onReset: () => void;
}

function GameOverPanel({ state, onReset }: GameOverPanelProps) {
  const a = state.scores.A;
  const b = state.scores.B;
  const winnerLabel =
    a === b
      ? "Uavgjort!"
      : `Gratulerer til ${state.teams[a > b ? "A" : "B"]}!!!`;

  return (
    <div className="bg-white/90 rounded-2xl shadow p-8 text-center flex flex-col gap-4 w-full">
      <h2 className={`${lilita.className} text-4xl`}>Spillet er ferdig!</h2>
      <p className="text-lg">{winnerLabel}</p>
      <Button onClick={onReset}>Start nytt spill</Button>
    </div>
  );
}
