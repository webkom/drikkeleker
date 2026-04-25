"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Eye,
  Lock,
  Play,
  RefreshCw,
  Users,
  UserRound,
} from "lucide-react";
import BeerContainer from "@/components/beer/beer-container";
import BackButton from "@/components/shared/back-button";
import Footer from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import {
  calculateDifference,
  getDrinkResult,
  getRandomCard,
} from "@/lib/wavelength";
import { lilita } from "@/lib/fonts";
import type {
  WavelengthCard,
  WavelengthPhase,
  WavelengthRound,
} from "@/types/wavelength";

const MIN_TARGET_VALUE = 1;
const MAX_TARGET_VALUE = 20;
const DEFAULT_GUESS_VALUE = 10;

const getRandomTargetValue = () =>
  Math.floor(Math.random() * MAX_TARGET_VALUE) + MIN_TARGET_VALUE;

const normalizeWavelengthCards = (data: unknown): WavelengthCard[] => {
  if (!Array.isArray(data)) return [];

  return data.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];

    const card = item as Record<string, unknown>;
    const leftLabel =
      typeof card.leftLabel === "string"
        ? card.leftLabel.trim()
        : typeof card.left === "string"
          ? card.left.trim()
          : "";
    const rightLabel =
      typeof card.rightLabel === "string"
        ? card.rightLabel.trim()
        : typeof card.right === "string"
          ? card.right.trim()
          : "";
    if (!leftLabel || !rightLabel) {
      return [];
    }

    return [
      {
        id:
          typeof card.id === "string" && card.id.trim().length > 0
            ? card.id
            : `wavelength-${index + 1}`,
        leftLabel,
        rightLabel,
        word: typeof card.word === "string" ? card.word.trim() : undefined,
        category:
          typeof card.category === "string" && card.category.trim().length > 0
            ? card.category.trim()
            : undefined,
      },
    ];
  });
};

export default function WavelengthPage() {
  const [phase, setPhase] = useState<WavelengthPhase>("intro");
  const [cards, setCards] = useState<WavelengthCard[]>([]);
  const [round, setRound] = useState<WavelengthRound | null>(null);
  const [guessValue, setGuessValue] = useState(DEFAULT_GUESS_VALUE);
  const [secretVisible, setSecretVisible] = useState(false);
  const [usedCardIds, setUsedCardIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadCards = async () => {
      try {
        const response = await fetch("/api/admin/data?game=wavelength");
        const data = await response.json();
        const normalizedCards = normalizeWavelengthCards(data);

        if (!isActive) return;

        setCards(normalizedCards);
        setError(
          normalizedCards.length === 0
            ? "Ingen Bølgelengde-kort er lagt inn ennå."
            : "",
        );
      } catch {
        if (!isActive) return;
        setError("Kunne ikke laste Bølgelengde-kort.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadCards();

    return () => {
      isActive = false;
    };
  }, []);

  const startNewRound = () => {
    if (cards.length === 0) return;

    const card = getRandomCard(cards, usedCardIds);

    setRound({
      card,
      answer: getRandomTargetValue(),
      guess: null,
    });
    setGuessValue(DEFAULT_GUESS_VALUE);
    setSecretVisible(false);
    setUsedCardIds((previous) =>
      previous.length >= cards.length ? [card.id] : [...previous, card.id],
    );
    setPhase("secret-answer");
  };

  const confirmAnswer = () => {
    if (!round) return;

    setSecretVisible(false);
    setPhase("group-guess");
  };

  const confirmGuess = () => {
    if (!round) return;

    setRound({
      ...round,
      guess: guessValue,
    });
    setPhase("reveal");
  };

  const revealDifference =
    round?.answer == null || round.guess == null
      ? null
      : calculateDifference(round.answer, round.guess);

  return (
    <main className="overflow-auto min-h-screen">
      <BackButton href="/#games" className="absolute top-4 left-4 z-10" />
      <BeerContainer color="violet">
        <div className="flex min-h-full flex-col items-center pb-4 pt-8 text-center">
          <h1 className={`${lilita.className} text-5xl text-violet-950`}>
            Bølgelengde
          </h1>
          <p className="mt-3 max-w-xl text-sm text-gray-700 sm:text-base">
            Én spiller får et hemmelig tall på en skala fra 1 til 20 og gir et
            hint. Resten prøver å gjette tallet ut fra hintet.
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <PhasePill
              active={phase === "intro"}
              label="1. Start"
              color="bg-white/70 text-violet-700"
            />
            <PhasePill
              active={phase === "secret-answer"}
              label="2. Hemmelig tall"
              color="bg-white/70 text-fuchsia-700"
            />
            <PhasePill
              active={phase === "group-guess"}
              label="3. Gjett"
              color="bg-white/70 text-blue-700"
            />
            <PhasePill
              active={phase === "reveal"}
              label="4. Vis"
              color="bg-white/70 text-emerald-700"
            />
          </div>

          <section className="mt-8 flex w-full max-w-2xl flex-1 flex-col justify-center">
            {loading ? (
              <StateCard
                eyebrow="Laster"
                title="Henter kortstokken"
                description="Bølgelengde-kortene lastes inn nå."
              />
            ) : error ? (
              <StateCard
                eyebrow="Mangler data"
                title={error}
                description="Legg inn kort i adminpanelet og prøv igjen."
                action={
                  <Button
                    onClick={() => window.location.reload()}
                    className="h-14 w-full bg-violet-500 text-base hover:bg-violet-500/90"
                  >
                    <RefreshCw className="mr-2" size={18} />
                    Last siden på nytt
                  </Button>
                }
              />
            ) : phase === "intro" ? (
              <IntroView cardCount={cards.length} onStart={startNewRound} />
            ) : phase === "secret-answer" ? (
              <SecretAnswerView
                round={round}
                secretVisible={secretVisible}
                setSecretVisible={setSecretVisible}
                onConfirm={confirmAnswer}
              />
            ) : phase === "group-guess" ? (
              <GroupGuessView
                round={round}
                guessValue={guessValue}
                setGuessValue={setGuessValue}
                onConfirm={confirmGuess}
              />
            ) : (
              <RevealView
                round={round}
                difference={revealDifference}
                onNextRound={startNewRound}
              />
            )}
          </section>
        </div>
        <Footer />
      </BeerContainer>
    </main>
  );
}

function IntroView({
  cardCount,
  onStart,
}: {
  cardCount: number;
  onStart: () => void;
}) {
  return (
    <StateCard
      eyebrow="Spilleregler"
      title="Gi et hint som peker mot tallet"
      description="Clue-giveren ser et hemmelig tall fra 1 til 20 på en skala. Si et ord eller en frase som passer tallet. Gruppen ser bare skalaen og skal gjette nummeret."
      footer={
        <div className="grid gap-3 text-left text-sm text-gray-600 sm:grid-cols-3">
          <RuleTile
            icon={<UserRound size={18} />}
            title="Hemmelig"
            text="Gi telefonen til clue-giveren. Bare den personen skal se tallet."
          />
          <RuleTile
            icon={<Users size={18} />}
            title="Hint"
            text="Hvis skalaen er Berømt til Ukjent og tallet er lavt, kan hintet være Churchill."
          />
          <RuleTile
            icon={<Lock size={18} />}
            title="Drikk"
            text={`Dere har ${cardCount} skalaer før bunken begynner å blande seg igjen.`}
          />
        </div>
      }
      action={
        <Button
          onClick={onStart}
          className="h-14 w-full bg-violet-500 text-base hover:bg-violet-500/90"
        >
          <Play className="mr-2" size={18} />
          Start runde
        </Button>
      }
    />
  );
}

function SecretAnswerView({
  round,
  secretVisible,
  setSecretVisible,
  onConfirm,
}: {
  round: WavelengthRound | null;
  secretVisible: boolean;
  setSecretVisible: (visible: boolean) => void;
  onConfirm: () => void;
}) {
  if (!round || round.answer === null) return null;

  return (
    <StateCard
      eyebrow="Kun én spiller"
      title="Pass telefonen til clue-giveren"
      description="Ingen andre skal se tallet. Clue-giveren åpner kortet, finner et passende ord eller en frase, og sier hintet høyt."
      content={
        secretVisible ? (
          <div className="space-y-6 text-left">
            <Spectrum
              leftLabel={round.card.leftLabel}
              rightLabel={round.card.rightLabel}
              markers={[
                {
                  label: "Mål",
                  value: round.answer,
                  tone: "bg-fuchsia-500 ring-fuchsia-200",
                },
              ]}
            />

            <div className="rounded-[1.75rem] border border-fuchsia-200 bg-fuchsia-50 px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-700">
                Hemmelig tall
              </p>
              <p className="mt-3 text-6xl text-gray-900 sm:text-7xl">
                {round.answer}
              </p>
              <p className="mt-3 text-sm leading-6 text-fuchsia-800">
                Si et hint som får gruppen nærmest mulig dette tallet. Ikke si
                tallet, og ikke si hvor på skalaen det ligger.
              </p>
              {round.card.category && (
                <p className="mt-3 text-sm text-fuchsia-700">
                  Kategori: {round.card.category}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-violet-300 bg-white/70 px-6 py-10 text-center">
            <Eye className="mx-auto text-violet-600" size={28} />
            <p className="mt-4 text-lg font-semibold text-gray-900">
              Hold skjermen skjult for resten.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Tallet blir først synlig når clue-giveren trykker på knappen
              under.
            </p>
          </div>
        )
      }
      action={
        secretVisible ? (
          <Button
            onClick={onConfirm}
            className="h-14 w-full bg-fuchsia-500 text-base hover:bg-fuchsia-500/90"
          >
            <Lock className="mr-2" size={18} />
            Hintet er gitt
          </Button>
        ) : (
          <Button
            onClick={() => setSecretVisible(true)}
            className="h-14 w-full bg-violet-500 text-base hover:bg-violet-500/90"
          >
            <Eye className="mr-2" size={18} />
            Vis hemmelig tall
          </Button>
        )
      }
    />
  );
}

function GroupGuessView({
  round,
  guessValue,
  setGuessValue,
  onConfirm,
}: {
  round: WavelengthRound | null;
  guessValue: number;
  setGuessValue: (value: number) => void;
  onConfirm: () => void;
}) {
  if (!round) return null;

  return (
    <StateCard
      eyebrow="Hele gruppen"
      title="Hvilket tall peker hintet mot?"
      description="Gruppen ser skalaen, hører hintet og blir enige om et tall fra 1 til 20."
      content={
        <div className="space-y-6 text-left">
          <Spectrum
            leftLabel={round.card.leftLabel}
            rightLabel={round.card.rightLabel}
            markers={[
              {
                label: "Gjett",
                value: guessValue,
                tone: "bg-sky-500 ring-sky-200",
              },
            ]}
          />

          <div className="rounded-[1.75rem] border border-sky-200 bg-sky-50 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">
              Skalaen
            </p>
            <p className="mt-3 text-2xl text-gray-900 sm:text-3xl">
              {round.card.leftLabel} til {round.card.rightLabel}
            </p>
            <p className="mt-3 text-sm text-sky-800">
              1 er helt mot venstre. 20 er helt mot høyre. Gjett tallet
              clue-giveren fikk.
            </p>
          </div>

          <WavelengthSlider
            value={guessValue}
            onChange={setGuessValue}
            accent="from-sky-500 via-cyan-500 to-emerald-500"
            label="Gruppens gjetning"
            showValue
          />
        </div>
      }
      action={
        <Button
          onClick={onConfirm}
          className="h-14 w-full bg-sky-500 text-base hover:bg-sky-500/90"
        >
          <Lock className="mr-2" size={18} />
          Lås tallet
        </Button>
      }
    />
  );
}

function RevealView({
  round,
  difference,
  onNextRound,
}: {
  round: WavelengthRound | null;
  difference: number | null;
  onNextRound: () => void;
}) {
  if (
    !round ||
    round.answer === null ||
    round.guess === null ||
    difference === null
  ) {
    return null;
  }

  return (
    <StateCard
      eyebrow="Reveal"
      title="Så nærme var dere"
      description={getDrinkResult(difference)}
      content={
        <div className="space-y-6 text-left">
          <Spectrum
            leftLabel={round.card.leftLabel}
            rightLabel={round.card.rightLabel}
            markers={[
              {
                label: "Svar",
                value: round.answer,
                tone: "bg-fuchsia-500 ring-fuchsia-200",
              },
              {
                label: "Gjett",
                value: round.guess,
                tone: "bg-sky-500 ring-sky-200",
              },
            ]}
          />

          <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
              Skalaen
            </p>
            <p className="mt-3 text-2xl text-gray-900 sm:text-3xl">
              {round.card.leftLabel} til {round.card.rightLabel}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <RevealStat label="Hemmelig tall" value={round.answer} />
            <RevealStat label="Gjettet tall" value={round.guess} />
            <RevealStat label="Avstand" value={difference} />
          </div>
        </div>
      }
      action={
        <Button
          onClick={onNextRound}
          className="h-14 w-full bg-emerald-500 text-base hover:bg-emerald-500/90"
        >
          Neste runde
          <ArrowRight className="ml-2" size={18} />
        </Button>
      }
    />
  );
}

function StateCard({
  eyebrow,
  title,
  description,
  content,
  footer,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  content?: ReactNode;
  footer?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border-4 border-white/70 bg-white/88 px-6 py-7 shadow-[0_24px_80px_rgba(76,29,149,0.18)] backdrop-blur sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-violet-700">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl text-gray-950 sm:text-4xl">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">
        {description}
      </p>

      {content && <div className="mt-6">{content}</div>}
      {footer && <div className="mt-6">{footer}</div>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

function Spectrum({
  leftLabel,
  rightLabel,
  markers,
}: {
  leftLabel: string;
  rightLabel: string;
  markers: Array<{
    label: string;
    value: number;
    tone: string;
  }>;
}) {
  return (
    <div>
      <div className="mb-3 flex justify-between gap-4 text-sm font-semibold text-gray-700">
        <span>1 - {leftLabel}</span>
        <span>20 - {rightLabel}</span>
      </div>

      <div className="relative h-5 rounded-full bg-gradient-to-r from-violet-200 via-fuchsia-100 to-sky-100 shadow-inner">
        <div className="absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-white/70" />
        {markers.map((marker) => (
          <div
            key={marker.label}
            className="absolute top-1/2 -translate-y-1/2"
            style={{
              left: `${((marker.value - MIN_TARGET_VALUE) / (MAX_TARGET_VALUE - MIN_TARGET_VALUE)) * 100}%`,
            }}
          >
            <div
              className={`h-6 w-6 -translate-x-1/2 rounded-full ring-4 ${marker.tone}`}
            />
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
          1-20
        </span>
        {markers.map((marker) => (
          <span
            key={`${marker.label}-${marker.value}`}
            className="rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white"
          >
            {marker.label}: {marker.value}
          </span>
        ))}
      </div>
    </div>
  );
}

function WavelengthSlider({
  value,
  onChange,
  accent,
  label,
  showValue,
}: {
  value: number;
  onChange: (value: number) => void;
  accent: string;
  label: string;
  showValue: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        {showValue && (
          <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-semibold text-gray-900 shadow-sm">
            {value}
          </span>
        )}
      </div>

      <div
        className={`rounded-full bg-gradient-to-r ${accent} p-[2px] shadow-sm`}
      >
        <div className="rounded-full bg-white px-4 py-4">
          <input
            type="range"
            min={MIN_TARGET_VALUE}
            max={MAX_TARGET_VALUE}
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
            className="h-3 w-full cursor-pointer accent-violet-600"
          />
        </div>
      </div>

      <div className="flex justify-between text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
        <span>{MIN_TARGET_VALUE}</span>
        <span>10</span>
        <span>{MAX_TARGET_VALUE}</span>
      </div>
    </div>
  );
}

function RuleTile({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-gray-200 bg-gray-50 px-4 py-4">
      <div className="flex items-center gap-2 text-violet-700">
        {icon}
        <span className="font-semibold">{title}</span>
      </div>
      <p className="mt-3 leading-6 text-gray-600">{text}</p>
    </div>
  );
}

function RevealStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.5rem] border border-gray-200 bg-white px-4 py-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-3xl text-gray-950">{value}</p>
    </div>
  );
}

function PhasePill({
  label,
  active,
  color,
}: {
  label: string;
  active: boolean;
  color: string;
}) {
  return (
    <span
      className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition-all ${
        active
          ? `${color} border-white/80 shadow-md`
          : "border-white/50 bg-white/35 text-gray-500"
      }`}
    >
      {label}
    </span>
  );
}
