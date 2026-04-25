"use client";

import { useEffect, useState } from "react";
import { Check, RefreshCw, SkipForward } from "lucide-react";
import BeerContainer from "@/components/beer/beer-container";
import BackButton from "@/components/shared/back-button";
import Footer from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { lilita } from "@/lib/fonts";

type AliasResponse = {
  words?: string[];
};

const shuffleArray = <T,>(items: T[]): T[] => {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  return shuffled;
};

export default function AliasPage() {
  const [allWords, setAllWords] = useState<string[]>([]);
  const [deck, setDeck] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [skipCount, setSkipCount] = useState(0);
  const [completedDecks, setCompletedDecks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadWords = async () => {
      try {
        const response = await fetch("/api/admin/data?game=alias");
        const data: AliasResponse = await response.json();
        const cleanedWords = Array.isArray(data.words)
          ? data.words
              .map((word) => word.trim())
              .filter((word) => word.length > 0)
          : [];

        if (!isActive) return;

        setAllWords(cleanedWords);
        setDeck(shuffleArray(cleanedWords));
        setCurrentIndex(0);
        setError(
          cleanedWords.length === 0 ? "Ingen alias-ord er lagt inn ennå." : "",
        );
      } catch {
        if (!isActive) return;
        setError("Kunne ikke laste alias-ord.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadWords();

    return () => {
      isActive = false;
    };
  }, []);

  const reshuffleDeck = () => {
    if (allWords.length === 0) return;
    setDeck(shuffleArray(allWords));
    setCurrentIndex(0);
  };

  const advanceWord = (result: "correct" | "skip") => {
    if (deck.length === 0) return;

    if (result === "correct") {
      setCorrectCount((previous) => previous + 1);
    } else {
      setSkipCount((previous) => previous + 1);
    }

    const nextIndex = currentIndex + 1;

    if (nextIndex >= deck.length) {
      setDeck(shuffleArray(allWords));
      setCurrentIndex(0);
      setCompletedDecks((previous) => previous + 1);
      return;
    }

    setCurrentIndex(nextIndex);
  };

  const currentWord = deck[currentIndex];
  const wordsRemaining = deck.length > 0 ? deck.length - currentIndex - 1 : 0;

  return (
    <main className="overflow-auto min-h-screen">
      <BackButton href="/#games" className="absolute top-4 left-4 z-10" />
      <BeerContainer color="cyan">
        <div className="flex min-h-full flex-col items-center text-center">
          <h1 className={`${lilita.className} pt-10 text-5xl`}>Alias</h1>
          <p className="mt-3 max-w-md text-sm text-gray-700 sm:text-base">
            Forklar ordet uten å si selve ordet. Trykk Riktig når laget ditt tar
            det, eller Stå over om dere vil hoppe videre.
          </p>

          <div className="mt-6 flex w-full max-w-xl flex-wrap justify-center gap-2">
            <StatPill label="Ord igjen" value={String(wordsRemaining)} />
            <StatPill label="Riktige" value={String(correctCount)} />
            <StatPill label="Stå over" value={String(skipCount)} />
            <StatPill label="Bunker" value={String(completedDecks)} />
          </div>

          <section className="mt-8 flex w-full max-w-xl flex-1 flex-col justify-center gap-6">
            <div className="rounded-[2rem] border-4 border-white/70 bg-white/90 px-6 py-8 shadow-[0_20px_60px_rgba(8,145,178,0.22)] backdrop-blur">
              <div className="mx-auto flex max-w-sm flex-col items-center gap-4">
                <span className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-700">
                  {deck.length > 0
                    ? `Ord ${currentIndex + 1} av ${deck.length}`
                    : "Alias"}
                </span>

                <div className="min-h-40 flex items-center justify-center">
                  {loading ? (
                    <p className="text-lg font-semibold text-gray-500">
                      Laster ord...
                    </p>
                  ) : error ? (
                    <p className="text-lg font-semibold text-red-500">
                      {error}
                    </p>
                  ) : (
                    <p className="text-4xl leading-tight text-gray-900 sm:text-5xl">
                      {currentWord}
                    </p>
                  )}
                </div>

                <p className="max-w-sm text-sm text-gray-500">
                  Hold tempoet oppe. Denne siden holder bare ordene og flyten,
                  dere teller poeng og slurker selv.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() => advanceWord("skip")}
                className="h-16 flex-1 bg-red-500 text-base hover:bg-red-500/90"
                disabled={loading || !!error || deck.length === 0}
              >
                <SkipForward className="mr-2" size={20} />
                Stå over
              </Button>
              <Button
                onClick={() => advanceWord("correct")}
                className="h-16 flex-1 bg-green-500 text-base hover:bg-green-500/90"
                disabled={loading || !!error || deck.length === 0}
              >
                <Check className="mr-2" size={20} />
                Riktig
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={reshuffleDeck}
              className="h-14 border-white/70 bg-white/70 text-base text-cyan-900 hover:bg-white"
              disabled={loading || !!error || allWords.length === 0}
            >
              <RefreshCw className="mr-2" size={18} />
              Bland ordbunken på nytt
            </Button>
          </section>
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
