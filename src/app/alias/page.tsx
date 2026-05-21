"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Beer,
  Info,
  Repeat,
  Timer,
  Upload,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import BeerContainer from "@/components/beer/beer-container";
import BackButton from "@/components/shared/back-button";
import Footer from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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

type Phase = "tutorial" | "setup" | "playing" | "game-over";

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

const TUTORIAL_STEPS = [
  {
    title: "Målet med leken",
    content:
      "Forklar ordet på skjermen uten å bruke selve ordet. Personen til høyre (eller din partner) skal gjette.",
    icon: <Info className="text-blue-500" size={48} />,
  },
  {
    title: "Hemmelig tid",
    content:
      "Det er en hemmelig timer på 3-6 minutter. Både den som forklarer, og den som gjetter når tiden er ute må CHUGGE!",
    icon: <Timer className="text-orange-500" size={48} />,
  },
  {
    title: "Swipe for å styre",
    content:
      "Swipe HØYRE når de gjetter riktig. Swipe VENSTRE for å stå over, men da legges det til 2 straffeord!",
    icon: <Repeat className="text-purple-500" size={48} />,
  },
  {
    title: "Klar til å starte?",
    content:
      "Swipe høyre på dette kortet for å gå til oppsett og velge ordliste.",
    icon: <Beer className="text-amber-500" size={48} />,
  },
];

export default function AliasPage() {
  const [allWords, setAllWords] = useState<string[]>([]);
  const [customWords, setCustomWords] = useState("");
  const [customMode, setCustomMode] = useState<"standalone" | "combined">(
    "combined",
  );
  const [wordPool, setWordPool] = useState<string[]>([]);
  const [activeDeck, setActiveDeck] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [skipCount, setSkipCount] = useState(0);
  const [phase, setPhase] = useState<Phase>("setup");
  const [tutorialIndex, setTutorialIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(
    null,
  );
  const [isHandingOff, setIsHandingOff] = useState(false);
  const [wordsToGuessThisTurn, setWordsToGuessThisTurn] = useState(1);

  const endRound = useCallback(() => setPhase("game-over"), []);

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

  const startRound = useCallback(() => {
    const customList = customWords
      .split(/[,\n]/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    let finalWords: string[];
    if (customList.length > 0) {
      if (customMode === "combined") {
        const shuffledStandard = shuffleArray(allWords);
        const shuffledCustom = shuffleArray(customList);

        const biasedDeck: string[] = [];
        let sIdx = 0;
        let cIdx = 0;

        // Interleave: 4 standard words, then 1 custom word
        while (sIdx < shuffledStandard.length || cIdx < shuffledCustom.length) {
          for (let i = 0; i < 4 && sIdx < shuffledStandard.length; i++) {
            biasedDeck.push(shuffledStandard[sIdx++]);
          }
          if (cIdx < shuffledCustom.length) {
            biasedDeck.push(shuffledCustom[cIdx++]);
          } else if (sIdx >= shuffledStandard.length) {
            // Both are finished
            break;
          }
        }
        finalWords = biasedDeck;
      } else {
        finalWords = shuffleArray(customList);
      }
    } else {
      finalWords = shuffleArray(allWords);
    }

    if (finalWords.length === 0) {
      setError("Ingen ord å spille med!");
      return;
    }

    const duration = getRandomDuration();
    setWordPool(finalWords);
    setActiveDeck(finalWords);
    setCurrentIndex(0);
    setCorrectCount(0);
    setSkipCount(0);
    setWordsToGuessThisTurn(1);

    setExitDirection("right");

    setTimeout(() => {
      restart(new Date(Date.now() + duration * 1000));
      setPhase("playing");
      setExitDirection(null);
      setIsHandingOff(false);
    }, 300);
  }, [allWords, customWords, customMode, restart]);
  const advanceWord = (direction: "left" | "right") => {
    if (isHandingOff) return;

    const isCorrect = direction === "right";

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);

      const remainingForTurn = wordsToGuessThisTurn - 1;

      if (remainingForTurn <= 0) {
        setWordsToGuessThisTurn(1);
        setIsHandingOff(true);
        setExitDirection("right");

        setTimeout(() => {
          if (currentIndex + 1 >= activeDeck.length) {
            setActiveDeck((prev) => shuffleArray([...prev]));
            setCurrentIndex(0);
          } else {
            setCurrentIndex((prev) => prev + 1);
          }
          setExitDirection(null);

          setTimeout(() => setIsHandingOff(false), 500);
        }, 300);
      } else {
        setWordsToGuessThisTurn(remainingForTurn);
        setExitDirection("right");

        setTimeout(() => {
          if (currentIndex + 1 >= activeDeck.length) {
            setActiveDeck((prev) => shuffleArray([...prev]));
            setCurrentIndex(0);
          } else {
            setCurrentIndex((prev) => prev + 1);
          }
          setExitDirection(null);
        }, 300);
      }
    } else {
      setSkipCount((prev) => prev + 1);
      setWordsToGuessThisTurn((prev) => prev + 1);

      const sourcePool = wordPool.length > 0 ? wordPool : activeDeck;
      const penalties = shuffleArray(sourcePool).slice(0, 2);
      setActiveDeck((prev) => [...prev, ...penalties]);

      setExitDirection("left");

      setTimeout(() => {
        if (currentIndex + 1 >= activeDeck.length) {
          setActiveDeck((prev) => shuffleArray([...prev]));
          setCurrentIndex(0);
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
        setExitDirection(null);
      }, 300);
    }
  };

  const handleTutorialSwipe = (direction: "left" | "right") => {
    setExitDirection(direction);

    setTimeout(() => {
      if (direction === "right") {
        if (tutorialIndex < TUTORIAL_STEPS.length - 1) {
          setTutorialIndex((prev) => prev + 1);
        } else {
          setPhase("setup");
          setTutorialIndex(0);
        }
      } else if (direction === "left" && tutorialIndex > 0) {
        setTutorialIndex((prev) => prev - 1);
      }
      setExitDirection(null);
    }, 200);
  };

  const slideHeight = "clamp(240px, 42dvh, 400px)";
  const prefersReducedMotion = useReducedMotion();

  return (
    <main className="overflow-hidden h-dvh flex flex-col">
      <BackButton href="/#games" className="absolute top-4 left-4 z-50" />

      <AlertDialog open={phase === "game-over"}>
        <AlertDialogContent className="max-w-[90vw] rounded-3xl">
          <AlertDialogHeader className="text-center">
            <AlertDialogTitle
              className={`${lilita.className} text-4xl text-center text-red-600`}
            >
              BOMBA GIKK AV! 💣
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-center pt-4">
                <div className="bg-amber-100 rounded-2xl p-6 border-2 border-amber-300 animate-bounce">
                  <p className={`${lilita.className} text-2xl text-amber-900`}>
                    DU MÅ CHUGGE!
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                    <p className="text-green-600 text-xs uppercase font-bold">
                      Riktige
                    </p>
                    <p className="text-3xl font-bold text-green-700">
                      {correctCount}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                    <p className="text-red-600 text-xs uppercase font-bold">
                      Hoppet over
                    </p>
                    <p className="text-3xl font-bold text-red-700">
                      {skipCount}
                    </p>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-2">
            <Button
              className="w-full h-14 text-lg bg-cyan-600 hover:bg-cyan-700"
              onClick={startRound}
            >
              Start ny runde
            </Button>
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => setPhase("setup")}
            >
              Endre oppsett
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BeerContainer color="cyan" className="flex-1">
        <div className="flex flex-col h-full w-full max-w-2xl mx-auto px-4 pb-8">
          <h1
            className={`${lilita.className} pt-12 text-5xl text-center mb-4 shrink-0`}
          >
            Alias
          </h1>

          <div className="flex-1 relative flex flex-col items-center justify-center w-full">
            <AnimatePresence mode="wait">
              {phase === "tutorial" && (
                <motion.div
                  key="tutorial-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full flex flex-col items-center"
                >
                  <div
                    style={{ height: slideHeight }}
                    className="relative w-full"
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      <CardSwipeWrapper
                        key={`tutorial-${tutorialIndex}`}
                        word={TUTORIAL_STEPS[tutorialIndex].content}
                        onSwipe={handleTutorialSwipe}
                        exitDir={exitDirection}
                        index={tutorialIndex}
                        total={TUTORIAL_STEPS.length}
                        height={slideHeight}
                        title={TUTORIAL_STEPS[tutorialIndex].title}
                        icon={TUTORIAL_STEPS[tutorialIndex].icon}
                      />
                    </AnimatePresence>
                  </div>

                  <div className="mt-8 flex flex-col items-center gap-4">
                    <div className="flex gap-2">
                      {TUTORIAL_STEPS.map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 rounded-full transition-all duration-300 ${i === tutorialIndex ? "w-8 bg-cyan-600" : "w-2 bg-cyan-200"}`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-cyan-700 font-bold uppercase text-xs tracking-widest">
                      {tutorialIndex > 0 && (
                        <span className="flex items-center gap-1 opacity-50">
                          <ArrowLeft size={14} /> Forrige
                        </span>
                      )}
                      <span className="flex items-center gap-1 animate-pulse">
                        Swipe høyre for neste <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {phase === "setup" && (
                <motion.div
                  key="setup-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full flex flex-col gap-6"
                >
                  <div className="w-full bg-white/90 backdrop-blur rounded-[2rem] p-6 shadow-xl border-4 border-white/50">
                    <div className="flex items-center gap-2 mb-4">
                      <Upload size={20} className="text-cyan-600" />
                      <h2 className="text-xl font-bold text-gray-900">
                        Spill med egne ord?
                      </h2>
                    </div>

                    <div className="space-y-4">
                      <Textarea
                        placeholder="Skriv ord her (f.eks: øl, fest, abakus...)"
                        className="min-h-[120px] rounded-2xl border-2 border-cyan-100 focus:border-cyan-400 bg-white"
                        value={customWords}
                        onChange={(e) => setCustomWords(e.target.value)}
                      />
                      {customWords.trim() && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setCustomMode("combined")}
                            className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                              customMode === "combined"
                                ? "bg-cyan-600 text-white shadow"
                                : "bg-cyan-50 text-cyan-800 hover:bg-cyan-100"
                            }`}
                          >
                            I tillegg til standardord
                          </button>
                          <button
                            type="button"
                            onClick={() => setCustomMode("standalone")}
                            className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                              customMode === "standalone"
                                ? "bg-cyan-600 text-white shadow"
                                : "bg-cyan-50 text-cyan-800 hover:bg-cyan-100"
                            }`}
                          >
                            Kun egne ord
                          </button>
                        </div>
                      )}
                      <div className="flex items-start gap-2 bg-cyan-50 p-3 rounded-xl border border-cyan-100">
                        <Info
                          size={16}
                          className="text-cyan-600 shrink-0 mt-0.5"
                        />
                        <p className="text-[11px] text-cyan-800 leading-tight">
                          La boksen stå tom for å bruke standardordene. Separer
                          egne ord med komma eller linjeskift.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ height: "200px" }} className="relative w-full">
                    <AnimatePresence mode="popLayout">
                      <CardSwipeWrapper
                        key="setup-confirm"
                        word="Swipe høyre for å starte runden!"
                        onSwipe={(dir) => {
                          if (dir === "right") startRound();
                          else if (dir === "left") {
                            setExitDirection("left");
                            setTimeout(() => {
                              setPhase("tutorial");
                              setExitDirection(null);
                            }, 200);
                          }
                        }}
                        exitDir={exitDirection}
                        index={0}
                        total={1}
                        height="200px"
                        title="Klar til kamp?"
                        icon={<Beer className="text-amber-500" size={32} />}
                      />
                    </AnimatePresence>
                  </div>
                  <motion.div
                    initial={false}
                    animate={
                      prefersReducedMotion
                        ? {}
                        : { x: [0, -6, 0], opacity: [1, 0.85, 1] }
                    }
                    transition={{
                      repeat: Infinity,
                      duration: 1.6,
                      ease: "easeInOut",
                    }}
                    className="flex justify-center items-center gap-2 text-cyan-700/50 font-bold uppercase text-md tracking-widest"
                  >
                    <ArrowLeft size={12} />
                    <span>Swipe venstre for regler</span>
                  </motion.div>
                </motion.div>
              )}

              {phase === "playing" && activeDeck.length > 0 && (
                <motion.div
                  key="playing-view"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex flex-col"
                >
                  <div
                    style={{ height: slideHeight }}
                    className="relative w-full perspective-1000"
                  >
                    {/* {isClosingSoon && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -top-12 left-0 right-0 text-center z-10"
                      >
                        <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold animate-pulse shadow-lg border-2 border-white">
                          💣 BOMBA TICKER FORT!
                        </span>
                      </motion.div>
                    )} */}

                    <AnimatePresence mode="popLayout" initial={false}>
                      {isHandingOff ? (
                        <motion.div
                          key="handoff"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 1.1, opacity: 0 }}
                          className="absolute inset-0 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center p-8 gap-4"
                        >
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                          >
                            <Beer size={64} className="text-amber-500" />
                          </motion.div>
                          <h2
                            className={`${lilita.className} text-3xl text-cyan-600`}
                          >
                            RIKTIG!
                          </h2>
                          <p className="text-gray-600 font-bold uppercase text-sm tracking-widest">
                            Send telefonen videre!
                          </p>
                        </motion.div>
                      ) : (
                        <CardSwipeWrapper
                          key={`playing-${currentIndex}`}
                          word={activeDeck[currentIndex]}
                          onSwipe={advanceWord}
                          exitDir={exitDirection}
                          index={currentIndex}
                          total={activeDeck.length}
                          height={slideHeight}
                          title={`Ord ${currentIndex + 1}`}
                        />
                      )}
                    </AnimatePresence>

                    <div
                      className="absolute inset-0 -z-10 translate-y-2 scale-[0.98] opacity-50 bg-white/40 rounded-2xl border-4 border-white/20"
                      style={{ height: slideHeight }}
                    />
                    <div
                      className="absolute inset-0 -z-20 translate-y-4 scale-[0.96] opacity-30 bg-white/20 rounded-2xl border-4 border-white/10"
                      style={{ height: slideHeight }}
                    />
                  </div>

                  <div className="mt-4 flex gap-2 sm:mt-8">
                    <Button
                      onClick={() => advanceWord("left")}
                      className="bg-cyan-500 hover:bg-cyan-500/90 w-full group h-12 shadow-md"
                      disabled={isHandingOff}
                    >
                      <ArrowLeft
                        size={20}
                        className="mr-1 transition-transform group-hover:-translate-x-1"
                      />
                      Stå over
                    </Button>
                    <Button
                      onClick={() => advanceWord("right")}
                      className="bg-cyan-500 hover:bg-cyan-500/90 w-full group h-12 shadow-md"
                      disabled={isHandingOff}
                    >
                      Riktig
                      <ArrowRight
                        size={20}
                        className="ml-1 transition-transform group-hover:translate-x-1"
                      />
                    </Button>
                  </div>
                  <p className="text-center mt-4 text-[10px] text-cyan-800/40 font-bold uppercase tracking-widest">
                    Du kan også swipe kortet
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <Footer />
      </BeerContainer>
    </main>
  );
}

interface CardSwipeWrapperProps {
  word: string;
  onSwipe: (dir: "left" | "right") => void;
  exitDir: "left" | "right" | null;
  index: number;
  total: number;
  height: string;
  title: string;
  icon?: React.ReactNode;
}

function CardSwipeWrapper({
  word,
  onSwipe,
  exitDir,
  height,
  title,
  icon,
}: CardSwipeWrapperProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  const feedbackOpacity = useTransform(x, [-100, 0, 100], [0.15, 0, 0.15]);
  const feedbackColor = useTransform(
    x,
    [-50, 0, 50],
    ["#ef4444", "#ffffff", "#22c55e"],
  );

  return (
    <motion.div
      style={{ x, rotate, opacity, height }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) onSwipe("right");
        else if (info.offset.x < -100) onSwipe("left");
      }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing select-none w-full"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        x: exitDir === "right" ? 500 : exitDir === "left" ? -500 : 0,
      }}
      exit={{
        x: exitDir === "right" || x.get() > 0 ? 600 : -600,
        opacity: 0,
        transition: { duration: 0.3 },
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div
        style={{ opacity: feedbackOpacity, backgroundColor: feedbackColor }}
        className="absolute inset-0 pointer-events-none z-20 rounded-2xl"
      />

      <Card className="bg-transparent shadow-none border-none w-full h-full">
        <div className="w-full h-full bg-white overflow-hidden relative shadow-sm rounded-2xl border border-gray-100 flex flex-col">
          <div className="bg-cyan-500 px-4 py-3 z-10 w-full shrink-0">
            <p className="text-sm text-white font-medium text-center">
              {title}
            </p>
          </div>
          <CardContent className="p-8 h-full flex flex-col items-center justify-center text-gray-900 text-center flex-1 gap-4">
            {icon && <div className="shrink-0">{icon}</div>}
            <div className="w-full">
              <div
                className={`${lilita.className} ${icon ? "text-2xl sm:text-3xl" : "text-4xl sm:text-5xl"} leading-tight text-gray-900`}
              >
                {word}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}
