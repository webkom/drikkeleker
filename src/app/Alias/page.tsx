"use client";

import { useEffect, useState } from "react";
import { Check, Play, SkipForward } from "lucide-react";
import BeerContainer from "@/components/beer/beer-container";
import BackButton from "@/components/shared/back-button";
import Footer from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { lilita } from "@/lib/fonts";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTimer } from "react-timer-hook";

type AliasResponse = {
  words?: string[];
};

type Phase = "intro" | "playing" | "game-over";

const shuffleArray = <T,>(items: T[]): T[] => {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }
  return shuffled;
};

const getRandomDuration = () => {
  const minutes = Math.floor(Math.random() * 4) + 3; // 3, 4, 5, or 6 minutes
  return minutes * 60;
};

export default function AliasPage() {
  const [allWords, setAllWords] = useState<string[]>([]);
  const [activeDeck, setActiveDeck] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [skipCount, setSkipCount] = useState(0);
  const [penaltyCount, setPenaltyCount] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const endRound = () => setPhase("game-over");

  const { seconds, minutes, restart, isRunning } = useTimer({
    autoStart: false,
    expiryTimestamp: new Date(Date.now() + 5 * 60 * 1000),
    onExpire: endRound,
  });

  const secondsLeft = minutes * 60 + seconds;
  const isClosingSoon = phase === "playing" && isRunning && secondsLeft <= 30;

  useEffect(() => {
    let isActive = true;

    const loadWords = async () => {
      try {
        const response = await fetch("/api/admin/data?game=alias");
        const data: AliasResponse = await response.json();
        const cleanedWords = Array.isArray(data.words)
          ? data.words.map((w) => w.trim()).filter((w) => w.length > 0)
          : [];

        if (!isActive) return;

        setAllWords(cleanedWords);
        setError(
          cleanedWords.length === 0 ? "Ingen alias-ord er lagt inn ennå." : "",
        );
      } catch {
        if (!isActive) return;
        setError("Kunne ikke laste alias-ord.");
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadWords();

    return () => {
      isActive = false;
    };
  }, []);

  const startRound = () => {
    const duration = getRandomDuration();
    setActiveDeck(shuffleArray(allWords));
    setCurrentIndex(0);
    setCorrectCount(0);
    setSkipCount(0);
    setPenaltyCount(0);
    restart(new Date(Date.now() + duration * 1000));
    setPhase("playing");
  };

  const advanceWord = (result: "correct" | "skip") => {
    if (activeDeck.length === 0) return;

    const nextIndex = currentIndex + 1;

    if (result === "correct") {
      setCorrectCount((prev) => prev + 1);
      if (nextIndex >= activeDeck.length) {
        setActiveDeck(shuffleArray(allWords));
        setCurrentIndex(0);
      } else {
        setCurrentIndex(nextIndex);
      }
    } else {
      setSkipCount((prev) => prev + 1);
      setPenaltyCount((prev) => prev + 2);
      const penalties = shuffleArray([...allWords]).slice(0, 2);
      setActiveDeck((prev) => [...prev, ...penalties]);
      setCurrentIndex(nextIndex);
    }
  };

  const currentWord = activeDeck[currentIndex];
  const wordsRemaining =
    activeDeck.length > 0 ? activeDeck.length - currentIndex - 1 : 0;

  return (
    <main className="overflow-auto min-h-screen">
      <BackButton href="/#games" className="absolute top-4 left-4 z-10" />

      <AlertDialog open={phase === "game-over"}>
        <AlertDialogContent>
          <AlertDialogHeader className="text-center">
            <AlertDialogTitle className="text-center">
              🚨 Tiden er ute! 🚨
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-1 text-center">
                <p>Runden er over.</p>
                <p className="font-semibold text-gray-900">
                  {correctCount} riktige · {skipCount} stå over · {penaltyCount}{" "}
                  straffeord lagt til
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button className="w-full" onClick={startRound}>
              Start ny runde
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BeerContainer color="cyan">
        <div className="flex min-h-full flex-col items-center text-center">
          <h1 className={`${lilita.className} pt-10 text-5xl`}>Alias</h1>

          {phase === "intro" ? (
            <div className="mt-8 w-full max-w-xl">
              <div className="rounded-[2rem] border-4 border-white/70 bg-white/90 px-6 py-8 text-left shadow-[0_20px_60px_rgba(8,145,178,0.22)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-700">
                  Spilleregler
                </p>
                <h2 className="mt-3 text-3xl text-gray-950">
                  Forklar ordet uten å si det
                </h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Én spiller forklarer ord mens laget gjetter. Trykk{" "}
                  <span className="font-semibold text-gray-800">Riktig</span>{" "}
                  når laget tar det, eller{" "}
                  <span className="font-semibold text-gray-800">Stå over</span>{" "}
                  for å hoppe videre — men hvert stå-over legger til 2 ekstra
                  ord i bunken. En hemmelig nedtelling avslutter runden.
                </p>
                <div className="mt-6">
                  <Button
                    onClick={startRound}
                    disabled={loading || !!error || allWords.length === 0}
                    className="h-14 w-full bg-cyan-500 text-base hover:bg-cyan-500/90"
                  >
                    <Play className="mr-2" size={18} />
                    Start runde
                  </Button>
                  {loading && (
                    <p className="mt-3 text-sm text-gray-500">Laster ord...</p>
                  )}
                  {error && (
                    <p className="mt-3 text-sm text-red-500">{error}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-6 flex w-full max-w-xl flex-wrap justify-center gap-2">
                <StatPill label="Ord igjen" value={String(wordsRemaining)} />
                <StatPill label="Riktige" value={String(correctCount)} />
                <StatPill label="Stå over" value={String(skipCount)} />
                <StatPill label="Straff" value={`+${penaltyCount}`} />
              </div>

              {isClosingSoon && (
                <div className="mt-4 animate-pulse rounded-full border border-red-400 bg-red-500/20 px-6 py-2 text-sm font-semibold text-red-700">
                  Runden avsluttes snart!
                </div>
              )}

              <section className="mt-6 flex w-full max-w-xl flex-1 flex-col justify-center gap-4">
                <div className="overflow-hidden rounded-2xl shadow-[0_20px_60px_rgba(8,145,178,0.22)]">
                  <div className="bg-gradient-to-r from-cyan-400 to-cyan-600 px-4 py-3">
                    <p className="text-center text-sm font-medium text-white">
                      {activeDeck.length > 0
                        ? `Ord ${currentIndex + 1} av ${activeDeck.length}`
                        : "Alias"}
                    </p>
                  </div>
                  <div className="flex min-h-[200px] items-center justify-center bg-white px-6 py-12">
                    <p className="text-4xl leading-tight text-gray-900 sm:text-5xl">
                      {currentWord}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={() => advanceWord("skip")}
                    className="h-16 flex-1 bg-gradient-to-r from-red-400 to-red-600 text-base hover:opacity-90"
                    disabled={activeDeck.length === 0}
                  >
                    <SkipForward className="mr-2" size={20} />
                    Stå over (+2 ord)
                  </Button>
                  <Button
                    onClick={() => advanceWord("correct")}
                    className="h-16 flex-1 bg-gradient-to-r from-green-400 to-green-600 text-base hover:opacity-90"
                    disabled={activeDeck.length === 0}
                  >
                    <Check className="mr-2" size={20} />
                    Riktig
                  </Button>
                </div>
              </section>
            </>
          )}
        </div>
        <Footer />
      </BeerContainer>
    </main>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-white/70 bg-white/70 px-4 py-2 shadow-sm backdrop-blur">
      <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-700">
        {label}
      </p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}
