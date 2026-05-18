"use client";

import BeerContainer from "@/components/beer/beer-container";
import BackButton from "@/components/shared/back-button";
import Footer from "@/components/shared/footer";
import { lilita } from "@/lib/fonts";
import { useBeatRoom } from "../_lib/useBeatRoom";
import ScoreBoard from "./ScoreBoard";
import WordTile from "./WordTile";
import Timer from "./Timer";

interface AudienceViewProps {
  roomCode: string;
}

export default function AudienceView({ roomCode }: AudienceViewProps) {
  const { state, loading, error } = useBeatRoom(roomCode);

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

  return (
    <main className="overflow-x-hidden">
      <BackButton className="absolute top-4 left-4 z-10" href="/#games" />
      <BeerContainer color="amber" className="min-h-dvh">
        <div className="w-full max-w-3xl pt-16 flex flex-col gap-6 items-center">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs uppercase tracking-widest text-amber-900/70">
              Rom
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
            large
          />

          {state.phase === "idle" && (
            <div className="bg-white/80 rounded-2xl shadow p-8 text-center flex flex-col gap-2">
              <h2 className={`${lilita.className} text-3xl`}>
                Venter på admin…
              </h2>
              <p className="text-gray-600">
                Admin må legge til fraser og starte spillet.
              </p>
            </div>
          )}

          {state.phase === "playing" && state.round && (
            <>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className="rounded-full bg-amber-500 text-white text-sm font-semibold px-3 py-1 uppercase tracking-wide">
                  Verdt {state.round.pointValue} poeng
                </span>
                <span className="rounded-full bg-white/80 text-amber-900 text-sm font-semibold px-3 py-1">
                  {state.round.roundPhase === "guessing"
                    ? `${state.teams[state.round.activeTeam]} gjetter`
                    : state.round.roundPhase === "round-over"
                      ? "Runden er ferdig"
                      : `${state.teams[state.round.activeTeam]} velger ord`}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 justify-center bg-white/40 rounded-2xl p-6 min-h-[120px] items-center">
                {state.round.words.map((word, i) => (
                  <WordTile key={i} word={word} index={i} mode="audience" />
                ))}
              </div>

              {(state.round.roundPhase === "guessing" ||
                state.round.pausedRemainingMs != null) && (
                <div className="w-full max-w-sm">
                  <Timer
                    deadline={state.round.timerDeadline}
                    pausedRemainingMs={state.round.pausedRemainingMs}
                    durationSec={state.round.timerDurationSec}
                  />
                </div>
              )}
            </>
          )}

          {state.phase === "game-over" && (
            <div className="bg-white/90 rounded-2xl shadow p-8 text-center flex flex-col gap-3 w-full">
              <h2 className={`${lilita.className} text-4xl`}>
                Spillet er ferdig!
              </h2>
              {(() => {
                const a = state.scores.A;
                const b = state.scores.B;
                if (a === b) {
                  return (
                    <p className="text-lg">
                      Uavgjort på {a} poeng – alle drikker!
                    </p>
                  );
                }
                const winner = a > b ? "A" : "B";
                return (
                  <p className="text-lg">
                    <span className="font-bold">{state.teams[winner]}</span>{" "}
                    vant med {Math.max(a, b)} poeng
                  </p>
                );
              })()}
            </div>
          )}
        </div>
        <Footer />
      </BeerContainer>
    </main>
  );
}
