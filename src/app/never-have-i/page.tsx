"use client";

import { lilita } from "@/lib/fonts";
import BeerContainer from "@/components/beer/beer-container";
import { useEffect, useState } from "react";
import BackButton from "@/components/shared/back-button";
import Footer from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Flame, Users } from "lucide-react";
import CustomSwiper from "@/components/shared/custom-swiper";
import type { Color } from "@/lib/colors";

const mild = [
  "Planlagt fylla-meldinger edru",
  "Tapt et veddemål",
  "Brukket et ben",
  "Vært på TV",
  "Vært på en Tinderdate",
  "Tatt en tatovering",
  "Løyet til politiet",
  "Brukt et fake-leg",
  "Brukt noen andres tannbørste",
  "Sovnet i offentligheten",
  "Ledd så mye at jeg tisset på meg",
  "Gått gjennom en annens persons meldinger",
  "Løpt et maraton",
  "Faket at jeg var syk for å slippe skolen",
  "Slettet et innlegg fordi det fikk for få likes/kommentarer",
  "Kastet mat eller drikke på noen",
  "Sett en hel serie på en dag",
  "Strøket på en prøve",
  "Jukset på en prøve",
  "Tatt alkohol fra foreldrene mine",
  "Tatt mat fra et kjøleskap som ikke var mitt",
  "Tisset i bassenget",
  "Vært innlagt på sykehuset",
  "Klippet mitt eget hår",
  "Sovnet på nach",
  "Fastet",
  "Blokkert noen",
  "Haiket",
  "Tatt opp en haiker",
  "Besvimt",
  "Sovnet på fest",
  "Vært i en slåsskamp",
  "Stalket noen på sosiale medier",
  "Stalket noen på Snap-map",
  "Fått sparken",
  "Vært en del av et rykte som ikke var sant",
  "Grått på en fest",
  "Grått på jobb",
  "Dratt på jobb med hangover",
  "Brukt over 5k på byen",
  "Brukt over 10k på byen",
  "Googlet meg selv",
  "Fått fartsbot",
  "Sovnet på vors",
  "Blacket ut",
];

const hot = [
  "Stjålet noe",
  "Kysset flere på en kveld",
  "Kysset noen offentlig",
  "Brukt noen for penger",
  "Hatt et ons",
  "Ghostet noen",
  "Havnet på legevakten på grunn av fylla",
  "Løyet om alderen min",
  "Sendt nudes",
  "Fått nudes",
  "Kysset noen i regnet",
  "Gitt noen dårlig råd med vilje",
  "Blitt pumpet",
  "Flørtet med en som har kjæreste",
  "Flørtet med en 20+ år eldre",
  "Løyet om sivilstatus",
  "Sextet",
  "Gått inn på noen som hadde sex",
  "Vært i samme rom som noen som hadde sex",
  "Vært vitne til noe kriminelt",
  "Vært i en politibil",
  "Blitt ghostet",
  "Kysset en fremmed",
  "Fått/gitt et sugemerke",
  "Datet flere personer samtidig",
  "Fantasert om å gå tilbake til en eks",
  "Blitt forelsket i en venn",
  "Danset på et bord",
  "Datet noen bare fordi jeg kjedet meg",
  "Flørtet for å få gratis drikke",
  "Blitt nektet inngang på et utested",
  "Blitt kastet ut av et utested",
  "Mistet telefonen min på byen",
  "Vært forelsket i to personer samtidig",
  "Hatt en situationship",
  "Grått over noen jeg aldri datet",
  "Fått noen til å tro jeg var interessert uten å være det",
  "Sjekket eksens nye kjæreste på sosiale medier",
  "Slettet bilder for å late som noe aldri skjedde",
  "Vært forelsket",
  "Brukt en datingapp",
  "Fått eller gitt en bodyshot",
  "Kysset eksen min",
  "Hatt et crush på noen jeg ikke burde",
  "Kysset noen av samme kjønn",
  'Løyet i "Jeg har aldri"',
  "Hatt rebound",
  "Gått tilbake til eksen",
];

const spicy = [
  "Nakenbadet",
  "Brukt noen andres undertøy",
  "Vært utro",
  "Sagt feil navn under sex",
  "Faket en orgasme",
  "Hatt 69",
  "Drukket over 60%",
  "Gitt noen en lapdance",
  "Fått en lapdance",
  "Hatt trekant",
  "Sugd på noen sine tær",
  "Hatt sex utenfor soverommet",
  "Hatt sex i dusjen",
  "Våknet og ikke husket hvordan jeg kom hjem",
  "Brukt håndjern eller bind for øynene",
  'Hatt en "friends with benefits"',
  "Gitt et kyss bare for å gjøre noen sjalu",
  "Hatt sex i bilen",
  "Prøvd rollespill",
  "Angret på et hookup umiddelbart etterpå",
  "Blitt med noen hjem bare fordi jeg var full",
  "Løyet om at jeg ikke husket noe, men egentlig gjorde det",
  "Løyet om hvor jeg var etter en kveld",
  "Sovet over hos noen og sneket meg ut om morgenen",
  "Fått beskjed om å være stillere",
  "Flørtet med en venns eks",
  "Snakket med eksen min mens jeg var med noen andre",
  "Flashet noen",
  "Kalt typen (eller flirt) feil navn",
  "Kjørt brannbil (pule med mensen)",
  "Rainbow kiss",
  "Knulla eksen",
];

const abakus = [
  "Tilbrakt en natt på kontoret",
  "Hatt et abacrush",
  "Kysset en abakule",
  "Kastet opp på Abakus-arrangement",
  "Sovnet på sofaen på kontoret",
  "Drukket på kontoret",
  "Spilt Mario Kart på kontoret",
  "Møtt opp bakfull på forelesning",
  "Gjemt meg for noen i Abakus",
  "Stjålet fra Snackoverflow",
  "Spist kake på kontoret",
  "Fullført listingsløp",
  "Kysset en i samme komite",
  "Kysset en fadder/kysset et fadderbarn",
  "Danset på bordet på LaBamba",
  "Blitt kastet ut fra LaBamba",
  "Vært på en bedpress bare for maten",
  "Kjøpt en planke på LaBamba",
  "Tatt av buksene på LaBamba",
  "Spilt Ludøl",
  "Hatt en greie for noen fra Indøk",
  "Stjålet fra kontoret til Thilde",
  "Vært i baris på Labamba",
  "Fått en dalje",
  "Tatt en lambo",
  "Vært på en galla",
  "Tatt av buksene på galla",
  "Glemt en innleveringsfrist",
  "Fått prikker",
  "Strøket på eksamen",
  "Blacket ut etter en kveld på LaBamba",
  "Konta en eksamen",
  "Crusha på en i samme komite",
  "Vært på AbaCava søndag",
];

type SpicyLevel = "mild" | "hot" | "spicy" | "abakus";

interface SpicyLevels {
  mild: boolean;
  hot: boolean;
  spicy: boolean;
  abakus: boolean;
}

interface Question {
  text: string;
  level: SpicyLevel;
}

interface StoredData {
  card: number;
  levels: SpicyLevels;
  shuffledQuestions: Question[];
  configKey: string;
  updatedAt: string;
}

const defaultLevels: SpicyLevels = {
  mild: true,
  hot: false,
  spicy: false,
  abakus: false,
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getConfigKey = (levels: SpicyLevels): string => {
  return `${levels.mild ? "M" : ""}${levels.hot ? "H" : ""}${levels.spicy ? "S" : ""}${levels.abakus ? "A" : ""}`;
};

const getStoredData = (): {
  card: number;
  levels: SpicyLevels;
  shuffledQuestions: Question[];
  configKey: string;
} => {
  if (typeof window === "undefined") {
    return {
      card: 0,
      levels: { ...defaultLevels },
      shuffledQuestions: [],
      configKey: "",
    };
  }

  try {
    const storedData = localStorage.getItem("never_have_i");
    if (!storedData) {
      return {
        card: 0,
        levels: { ...defaultLevels },
        shuffledQuestions: [],
        configKey: "",
      };
    }

    const parsed = JSON.parse(storedData);
    const { card, levels, shuffledQuestions, configKey, updatedAt } = parsed;

    const storedTime = new Date(updatedAt).getTime();
    const now = new Date().getTime();
    const isRecent = now - storedTime < 30_000;

    if (
      isRecent &&
      levels &&
      shuffledQuestions &&
      shuffledQuestions.length > 0
    ) {
      return {
        card,
        levels,
        shuffledQuestions,
        configKey: configKey || "",
      };
    }
  } catch {}

  return {
    card: 0,
    levels: { ...defaultLevels },
    shuffledQuestions: [],
    configKey: "",
  };
};

const NeverHaveI = () => {
  const [spicyLevels, setSpicyLevels] = useState<SpicyLevels>(defaultLevels);
  const [currentCard, setCurrentCard] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [configKey, setConfigKey] = useState("");
  const [prevDisabled, setPrevDisabled] = useState(false);
  const [nextDisabled, setNextDisabled] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    const stored = getStoredData();
    setSpicyLevels(stored.levels);
    setCurrentCard(stored.card);
    setShuffledQuestions(stored.shuffledQuestions);
    setConfigKey(stored.configKey);
  }, []);

  const getCombinedQuestions = (): Question[] => {
    if (!spicyLevels) return [{ text: "Laster...", level: "mild" }];

    let combined: Question[] = [];

    if (spicyLevels.mild) {
      combined = [
        ...combined,
        ...mild.map((text) => ({
          text,
          level: "mild" as SpicyLevel,
        })),
      ];
    }
    if (spicyLevels.hot) {
      combined = [
        ...combined,
        ...hot.map((text) => ({
          text,
          level: "hot" as SpicyLevel,
        })),
      ];
    }
    if (spicyLevels.spicy) {
      combined = [
        ...combined,
        ...spicy.map((text) => ({
          text,
          level: "spicy" as SpicyLevel,
        })),
      ];
    }
    if (spicyLevels.abakus) {
      combined = [
        ...combined,
        ...abakus.map((text) => ({
          text,
          level: "abakus" as SpicyLevel,
        })),
      ];
    }

    return combined.length > 0
      ? combined
      : [{ text: "Velg minst én kategori!", level: "mild" }];
  };

  useEffect(() => {
    if (!isHydrated) return;

    const newConfigKey = getConfigKey(spicyLevels);

    if (newConfigKey !== configKey || shuffledQuestions.length === 0) {
      const combined = getCombinedQuestions();
      const shuffled = shuffleArray(combined);
      setShuffledQuestions(shuffled);
      setConfigKey(newConfigKey);
      setCurrentCard(0);
    }
  }, [isHydrated, spicyLevels, configKey]);

  const currentQuestions =
    isHydrated && shuffledQuestions.length > 0
      ? shuffledQuestions
      : getCombinedQuestions();

  const setValidCurrentCard = (card: number) =>
    setCurrentCard(Math.min(Math.max(card, 0), currentQuestions.length - 1));

  useEffect(() => {
    setPrevDisabled(currentCard === 0);
    setNextDisabled(currentCard === currentQuestions.length - 1);

    if (spicyLevels && isHydrated) {
      localStorage.setItem(
        "never_have_i",
        JSON.stringify({
          card: currentCard,
          levels: spicyLevels,
          shuffledQuestions: shuffledQuestions,
          configKey: configKey,
          updatedAt: new Date(),
        }),
      );
    }
  }, [
    currentCard,
    currentQuestions.length,
    spicyLevels,
    shuffledQuestions,
    configKey,
    isHydrated,
  ]);

  const toggleSpicyLevel = (level: SpicyLevel) => {
    const newLevels = { ...spicyLevels, [level]: !spicyLevels[level] };

    if (
      !newLevels.mild &&
      !newLevels.hot &&
      !newLevels.spicy &&
      !newLevels.abakus
    ) {
      return;
    }

    setSpicyLevels(newLevels);
  };

  const slides = currentQuestions.map((question, index) => {
    const getGradient = (level: SpicyLevel): string => {
      switch (level) {
        case "mild":
          return "from-green-400 to-green-600";
        case "hot":
          return "from-orange-400 to-orange-600";
        case "spicy":
          return "from-red-500 to-red-700";
        case "abakus":
          return "from-purple-500 to-pink-600";
      }
    };

    return {
      id: `question-${index}`,
      title: `Oppgave ${index + 1} av ${currentQuestions.length}`,
      content: question.text,
      gradient: getGradient(question.level),
    };
  });

  const handleNavigate = (index: number) => {
    setValidCurrentCard(index);
  };

  const spicyOptions: {
    level: SpicyLevel;
    label: string;
    color: string;
    icon: JSX.Element;
  }[] = [
    {
      level: "mild",
      label: "",
      color: "from-green-400 to-green-600",
      icon: <Flame size={16} className="fill-current" />,
    },
    {
      level: "hot",
      label: "",
      color: "from-orange-400 to-orange-600",
      icon: (
        <>
          <Flame size={16} className="fill-current" />
          <Flame size={16} className="fill-current" />
        </>
      ),
    },
    {
      level: "spicy",
      label: "",
      color: "from-red-500 to-red-700",
      icon: (
        <>
          <Flame size={16} className="fill-current" />
          <Flame size={16} className="fill-current" />
          <Flame size={16} className="fill-current" />
        </>
      ),
    },
    {
      level: "abakus",
      label: "Abakus-relatert",
      color: "from-purple-500 to-pink-600",
      icon: <></>,
    },
  ];

  const currentQuestion = currentQuestions[currentCard];
  const getColorScheme = (level: SpicyLevel) => {
    switch (level) {
      case "mild":
        return {
          gradient: "from-green-400/20 to-green-600/20",
          border: "border-green-500",
          glow: "shadow-green-500/50",
          header: "from-green-400 to-green-600",
        };
      case "hot":
        return {
          gradient: "from-orange-400/20 to-orange-600/20",
          border: "border-orange-500",
          glow: "shadow-orange-500/50",
          header: "from-orange-400 to-orange-600",
        };
      case "spicy":
        return {
          gradient: "from-red-400/20 to-red-600/20",
          border: "border-red-500",
          glow: "shadow-red-500/50",
          header: "from-red-500 to-red-700",
        };
      case "abakus":
        return {
          gradient: "from-purple-400/20 to-pink-600/20",
          border: "border-purple-500",
          glow: "shadow-purple-500/50",
          header: "from-purple-500 to-pink-600",
        };
    }
  };
  const colorScheme = currentQuestion
    ? getColorScheme(currentQuestion.level)
    : getColorScheme("mild");

  return (
    <main className="overflow-auto h-screen">
      <BackButton href="/#games" className="absolute top-4 left-4 z-10" />
      <BeerContainer color="rose">
        <div className="flex flex-col items-center text-center h-full">
          <h1 className={`${lilita.className} text-5xl pt-12`}>
            Never Have I Ever
          </h1>

          <div className="mt-8 flex gap-3  backdrop-blur-sm p-2 rounded-2xl flex-wrap justify-center max-w-2xl">
            {spicyOptions.map((option) => {
              const isActive = spicyLevels?.[option.level] || false;
              return (
                <button
                  key={option.level}
                  onClick={() => toggleSpicyLevel(option.level)}
                  className={`relative px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 transform
                    ${
                      isActive
                        ? `bg-gradient-to-br ${option.color} scale-105 shadow-lg ring-2 ring-white/50`
                        : "bg-black/20 hover:bg-black/30 scale-100 border-2 border-white/30 hover:border-white/50 opacity-50 hover:opacity-70"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5">{option.icon}</div>
                    <span>{option.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="w-full max-w-2xl flex flex-col grow mt-20">
            <CustomSwiper
              slides={slides}
              effect="cards"
              currentIndex={currentCard}
              onNavigate={handleNavigate}
              slideHeight="400px"
            />
            <div className="flex gap-2 mt-8">
              <Button
                onClick={() => setValidCurrentCard(currentCard - 1)}
                className={`bg-gradient-to-r ${colorScheme.header} hover:opacity-90 w-full group transition-all`}
                disabled={prevDisabled}
              >
                <ArrowLeft
                  size={20}
                  className="mr-1 transition-transform group-hover:-translate-x-1"
                />
                Forrige
              </Button>
              <Button
                onClick={() => setValidCurrentCard(currentCard + 1)}
                className={`bg-gradient-to-r ${colorScheme.header} hover:opacity-90 w-full group transition-all`}
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

export default NeverHaveI;
