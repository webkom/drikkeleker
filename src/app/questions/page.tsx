"use client";

import { lilita } from "@/lib/fonts";
import BeerContainer from "@/components/beer/beer-container";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import BackButton from "@/components/shared/back-button";
import Footer from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import CustomSwiper from "@/components/shared/custom-swiper";
import type { Swiper as SwiperType } from "swiper";

const questions = [
  "Hvem blir påspandert mest på byen?",
  "Hvem bruker lengst tid på do?",
  "Hvem smasher mest?",
  "Hvem startet å drikke i yngst alder?",
  "Hvem fikk A i exphil?",
  "Hvem får flest prikker på Abakus.no?",
  "Hvem er minst glad i dyr?",
  "Hvem kunne tatt et tramp-stamp?",
  "Hvem har tilbrakt en natt på kontoret?",
  "SKÅL!",
  "Hvem trenger en shot?",
  "Hvem er dårligst til å chugge?",
  "Hvem hadde vunnet i ludøl?",
  "Hvem drar på flest bedpresser?",
  "Hvem lever fremdeles i russetiden?",
  "Hvem passer best inn i Webkom?",
  "Hvem avslutter festen først?",
  "Hvem havner oftest på legevakten?",
  "Hvem blir aldri ferdig med studiet?",
  "SKÅL!",
  "Hvem knuser flest hjerter?",
  "Hvem er morsomst?",
  "Hvem har høyest selvtillit?",
  "Hvem må ta av seg 2 klesplagg?",
  "Hvem koker mest?",
  "Hvem får du vakrest barn med?",
  "Hvem blir gjenkjent på polet?",
  "Hvem er mest inkluderende?",
  "Hvem stjeler fra Snack Overflow?",
  "SKÅL",
  "Hvem har den sykeste fyllahistorien #storytime?",
  "Hvem slipper aldri inn på Samf?",
  "Hvem er mest uskyldig?",
  "Hvem strøk i ITGK?",
  "Hvem er mest kjærestemateriale?",
  "Hvem kunne dratt hjem med en indøker?",
  "Hvem lukter best?",
  "Hvem har glemt navnet på et ONS?",
  "Hvem blir mest vellykket?",
  "SKÅL!",
  "Hvem spyr i kveld?",
  "Hvem er mest på baksida?",
  "Hvem skal ta en lambo?",
  "Hvem får kjæreste i år?",
  "Hvem klarer ikke å holde en hemmelighet?",
  "Hvem burde bli leder for Abakus?",
  "Hvem er mest kinky?",
  "Hvem koser seg med midtsidebilder?",
  "Hvem har mest game?",
  "SKÅL!",
  "Hvem kunne ligget med en foreleser?",
  "Hvem har finest øyne?",
  "Hvem blir kastet ut av Samf i kveld?",
  "Hvem er den beste vennen?",
  "Hvem passer inn på Dragvoll?",
  "Hvem kunne hatt seg med en BedRep?",
  "Hvem er et teknisk problem?",
  "Hvem har altfor mange verv?",
  "Hvem har du et lite øye til?",
  "SKÅL!",
  "Hvem blir fortest sjalu?",
  "Hvem har hatt flest kjønnssykdommer?",
  "Hvem ser mest på porno?",
  "Hvem bor på hyblene?",
  "Hvem har blitt pumpa?",
  "Hvem har flest bilder på kamerarullen?",
  "Hvem har finest rumpe?",
  "Hvem ville du vært med på en øde øy?",
  "Hvem har hatt 69?",
  "SKÅL!",
  "Hvem hadde gjort alt for en dalje?",
  "Hvem kjenner du minst?",
  "Hvem valgte studiet bare for pengene?",
  "Hvem melder seg til referansegruppe?",
  "Hvem er mamma på byen?",
  "Hvem har ligget med flest?",
  "Hvem ville du lest dagboken til?",
  "Hvem bor på LaBamba?",
  "Hvem sender mest nudes?",
  "SKÅL!",
  "Hvem har hooket flest nasjonaliteter?",
  "Hvem tar best lambo?",
  "Hvem spanderer mest?",
  "Hvem har shavet og er forberedt på alt?",
  "Hvem dør først i en skrekkfilm?",
  "Hvem har hatt trekant?",
  "Hvem er mest fornøyd med eget utseende?",
  "Hvem kommer raskest?",
  "Hvem hooker flest i kveld?",
  "SKÅL!",
  "Hvem er best i senga?",
  "Hvem skiller seg ut i mengden?",
  "Hvem avslutter festen sist?",
  "Hvem blir alltid spurt om leg?",
  "Hvem runker mest?",
  "Hvem tar seg mest på puppene?",
  "Hvem kunne hatt sugarmama/sugardaddy?",
  "Hvem blacker ut mest?",
  "Hvem skal ta en bå nnski med deg?",
  "SKÅL!",
];

interface StoredCard {
  card: number;
  updatedAt: string;
}

const storageKey = "hundred_questions";
const legacyStorageKey = "current_card";

const clampCard = (card: number) =>
  Math.min(Math.max(card, 0), questions.length - 1);

const getStoredCard = (): number => {
  if (typeof window === "undefined") return 0;

  try {
    const storedData =
      localStorage.getItem(storageKey) ??
      localStorage.getItem(legacyStorageKey);
    if (!storedData) return 0;

    const { card, updatedAt }: StoredCard = JSON.parse(storedData);

    const storedTime = new Date(updatedAt).getTime();
    const now = new Date().getTime();
    const isRecent = now - storedTime < 30_000;

    if (isRecent && Number.isInteger(card)) return clampCard(card);
  } catch {}

  return 0;
};

const QuestionsPage = () => {
  const [currentCard, setCurrentCard] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    setIsHydrated(true);
    setCurrentCard(getStoredCard());
  }, []);

  const prevDisabled = currentCard === 0;
  const nextDisabled = currentCard >= questions.length - 1;

  const setValidCurrentCard = (card: number) => setCurrentCard(clampCard(card));

  useEffect(() => {
    if (!isHydrated) return;

    const timeoutId = window.setTimeout(() => {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          card: currentCard,
          updatedAt: new Date().toISOString(),
        }),
      );
    }, 150);

    return () => window.clearTimeout(timeoutId);
  }, [currentCard, isHydrated]);

  const visibleQuestionCount = 11;
  const visibleQuestionStart = Math.min(
    Math.max(currentCard - Math.floor(visibleQuestionCount / 2), 0),
    Math.max(questions.length - visibleQuestionCount, 0),
  );
  const visibleQuestions = questions.slice(
    visibleQuestionStart,
    visibleQuestionStart + visibleQuestionCount,
  );
  const visibleCurrentIndex = currentCard - visibleQuestionStart;

  const stackBackdropCount = 3;
  const slides = [
    ...visibleQuestions.map((question, index) => {
      const questionIndex = visibleQuestionStart + index;
      return {
        id: `${questionIndex}-${question}`,
        title: `Spørsmål ${questionIndex + 1} av ${questions.length}`,
        content: question,
      };
    }),
    ...Array.from({ length: stackBackdropCount }, (_, index) => ({
      id: `stack-backdrop-${index}`,
      content: "",
    })),
  ];

  const handleNavigate = (index: number) => {
    if (index >= visibleQuestions.length) {
      swiperRef.current?.slideTo(visibleQuestions.length - 1, 0);
      return;
    }
    setValidCurrentCard(visibleQuestionStart + index);
  };

  useLayoutEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    if (swiper.activeIndex !== visibleCurrentIndex) {
      swiper.slideTo(visibleCurrentIndex, 0);
    }
  }, [visibleQuestionStart, visibleCurrentIndex]);

  const goPrev = () => swiperRef.current?.slidePrev();
  const goNext = () => swiperRef.current?.slideNext();

  return (
    <main className="min-h-[100dvh] overflow-x-hidden overflow-y-auto">
      <BackButton href="/#games" className="absolute top-4 left-4 z-10" />
      <BeerContainer color="fuchsia" className="px-4 sm:px-8">
        <div className="flex flex-col items-center text-center h-full">
          <h1
            className={`${lilita.className} pt-10 text-4xl sm:pt-12 sm:text-5xl`}
          >
            100 Spørsmål
          </h1>
          <div className="mt-8 flex w-full max-w-2xl grow flex-col sm:mt-20">
            <CustomSwiper
              slides={slides}
              effect="cards"
              currentIndex={visibleCurrentIndex}
              onNavigate={handleNavigate}
              onSwiperReady={(swiper) => (swiperRef.current = swiper)}
              color="fuchsia"
              slideHeight="clamp(240px, 42dvh, 400px)"
            />
            <div className="mt-4 flex gap-2 sm:mt-8">
              <Button
                onClick={goPrev}
                className="bg-fuchsia-500 hover:bg-fuchsia-500/90 w-full group"
                disabled={prevDisabled}
              >
                <ArrowLeft
                  size={20}
                  className="mr-1 transition-transform group-hover:-translate-x-1"
                />
                Forrige
              </Button>
              <Button
                onClick={goNext}
                className="bg-fuchsia-500 hover:bg-fuchsia-500/90 w-full group"
                disabled={nextDisabled}
              >
                Neste
                <ArrowRight
                  size={20}
                  className="ml-1 transition-transform group-hover:translate-x-1"
                />
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </BeerContainer>
    </main>
  );
};

export default QuestionsPage;
