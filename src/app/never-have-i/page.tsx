"use client";

import {lilita} from "@/lib/fonts";
import BeerContainer from "@/components/beer/beer-container";
import {useEffect, useState} from "react";
import BackButton from "@/components/shared/back-button";
import Footer from "@/components/shared/footer";
import {Button} from "@/components/ui/button";
import {ArrowLeft, ArrowRight, Flame, Users} from "lucide-react";
import CustomSwiper from "@/components/shared/custom-swiper";
import type {Color} from "@/lib/colors";

const mild = [
    "Mild 1",
    "Mild 2",
    "Mild 3",
    "Mild 4",
    "Mild 5",
    "Mild 6",
    "Mild 7",
    "Mild 8",
];

const hot = [
    "Hot 1",
    "Hot 2",
    "Hot 3",
    "Hot 4",
    "Hot 5",
    "Hot 6",
];

const spicy = [
    "Spicy 1",
    "Spicy 2",
    "Spicy 3",
    "Spicy 4",
    "Spicy 5",
    "Spicy 6",
    "Spicy 7",
];

const AbakusMild = [
    "Abakus Mild 1",
    "Abakus Mild 2",
    "Abakus Mild 3",
    "Abakus Mild 4",
    "Abakus Mild 5",
];

const AbakusHot = [
    "Abakus Hot 1",
    "Abakus Hot 2",
    "Abakus Hot 3",
    "Abakus Hot 4",
];

const AbakusSpicy = [
    "Abakus Spicy 1",
    "Abakus Spicy 2",
    "Abakus Spicy 3",
    "Abakus Spicy 4",
    "Abakus Spicy 5",
];

type SpicyLevel = "mild" | "hot" | "spicy";

interface SpicyLevels {
    mild: boolean;
    hot: boolean;
    spicy: boolean;
}

interface Question {
    text: string;
    level: SpicyLevel;
    isAbakus: boolean;
}

interface StoredData {
    card: number;
    levels: SpicyLevels;
    AbakusMode: boolean;
    shuffledQuestions: Question[];
    configKey: string;
    updatedAt: string;
}

const defaultLevels: SpicyLevels = {
    mild: true,
    hot: false,
    spicy: false
};


const shuffleArray = <T, >(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};


const getConfigKey = (levels: SpicyLevels, AbakusMode: boolean): string => {
    return `${levels.mild ? 'M' : ''}${levels.hot ? 'H' : ''}${levels.spicy ? 'S' : ''}${AbakusMode ? 'A' : ''}`;
};

const getStoredData = (): {
    card: number;
    levels: SpicyLevels;
    AbakusMode: boolean;
    shuffledQuestions: Question[];
    configKey: string;
} => {
    if (typeof window === "undefined") {
        return {
            card: 0,
            levels: {...defaultLevels},
            AbakusMode: false,
            shuffledQuestions: [],
            configKey: '',
        };
    }

    try {
        const storedData = localStorage.getItem("never_have_i");
        if (!storedData) {
            return {
                card: 0,
                levels: {...defaultLevels},
                AbakusMode: false,
                shuffledQuestions: [],
                configKey: '',
            };
        }

        const parsed = JSON.parse(storedData);
        const {card, levels, AbakusMode, shuffledQuestions, configKey, updatedAt} = parsed;

        const storedTime = new Date(updatedAt).getTime();
        const now = new Date().getTime();
        const isRecent = now - storedTime < 30_000;

        if (isRecent && levels && shuffledQuestions && shuffledQuestions.length > 0) {
            return {
                card,
                levels,
                AbakusMode,
                shuffledQuestions,
                configKey: configKey || '',
            };
        }
    } catch {
    }

    return {
        card: 0,
        levels: {...defaultLevels},
        AbakusMode: false,
        shuffledQuestions: [],
        configKey: '',
    };
};

const NeverHaveI = () => {
    const [spicyLevels, setSpicyLevels] = useState<SpicyLevels>(defaultLevels);
    const [AbakusMode, setAbakusMode] = useState(false);
    const [currentCard, setCurrentCard] = useState(0);
    const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
    const [configKey, setConfigKey] = useState('');
    const [prevDisabled, setPrevDisabled] = useState(false);
    const [nextDisabled, setNextDisabled] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);


    useEffect(() => {
        setIsHydrated(true);
        const stored = getStoredData();
        setSpicyLevels(stored.levels);
        setAbakusMode(stored.AbakusMode);
        setCurrentCard(stored.card);
        setShuffledQuestions(stored.shuffledQuestions);
        setConfigKey(stored.configKey);
    }, []);



    const getCombinedQuestions = (): Question[] => {

        if (!spicyLevels) return [{text: "Laster...", level: "mild", isAbakus: false}];

        let combined: Question[] = [];

        if (spicyLevels.mild) {
            combined = [...combined, ...mild.map(text => ({text, level: "mild" as SpicyLevel, isAbakus: false}))];
            if (AbakusMode) combined = [...combined, ...AbakusMild.map(text => ({text, level: "mild" as SpicyLevel, isAbakus: true}))];
        }
        if (spicyLevels.hot) {
            combined = [...combined, ...hot.map(text => ({text, level: "hot" as SpicyLevel, isAbakus: false}))];
            if (AbakusMode) combined = [...combined, ...AbakusHot.map(text => ({text, level: "hot" as SpicyLevel, isAbakus: true}))];
        }
        if (spicyLevels.spicy) {
            combined = [...combined, ...spicy.map(text => ({text, level: "spicy" as SpicyLevel, isAbakus: false}))];
            if (AbakusMode) combined = [...combined, ...AbakusSpicy.map(text => ({text, level: "spicy" as SpicyLevel, isAbakus: true}))];
        }

        return combined.length > 0 ? combined : [{text: "Velg minst én kategori!", level: "mild", isAbakus: false}];
    };


    useEffect(() => {
        if (!isHydrated) return;

        const newConfigKey = getConfigKey(spicyLevels, AbakusMode);


        if (newConfigKey !== configKey || shuffledQuestions.length === 0) {
            const combined = getCombinedQuestions();
            const shuffled = shuffleArray(combined);
            setShuffledQuestions(shuffled);
            setConfigKey(newConfigKey);
            setCurrentCard(0);
        }
    }, [isHydrated, spicyLevels, AbakusMode, configKey]);


    const currentQuestions = isHydrated && shuffledQuestions.length > 0
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
                    AbakusMode: AbakusMode,
                    shuffledQuestions: shuffledQuestions,
                    configKey: configKey,
                    updatedAt: new Date(),
                })
            );
        }
    }, [currentCard, currentQuestions.length, spicyLevels, AbakusMode, shuffledQuestions, configKey, isHydrated]);

    const toggleSpicyLevel = (level: SpicyLevel) => {
        const newLevels = {...spicyLevels, [level]: !spicyLevels[level]};


        if (!newLevels.mild && !newLevels.hot && !newLevels.spicy) {
            return;
        }

        setSpicyLevels(newLevels);
    };

    const toggleAbakusMode = () => {
        setAbakusMode(!AbakusMode);
    };


    const slides = currentQuestions.map((question, index) => ({
        id: `question-${index}`,
        title: `Oppgave ${index + 1} av ${currentQuestions.length}`,
        content: question.text,
        color: question.level === "mild" ? "green" as Color : question.level === "hot" ? "orange" as Color : "rose" as Color,
    }));

    const handleNavigate = (index: number) => {
        setValidCurrentCard(index);
    };

    const spicyOptions: { level: SpicyLevel; label: string; color: string; flames: number }[] = [
        {level: "mild", label: "Mild", color: "from-green-400 to-green-600", flames: 1},
        {level: "hot", label: "Hot", color: "from-orange-400 to-orange-600", flames: 2},
        {level: "spicy", label: "Spicy", color: "from-red-500 to-red-700", flames: 3},
    ];

    const currentQuestion = currentQuestions[currentCard];
    const getColorScheme = (level: SpicyLevel) => {
        switch (level) {
            case "mild":
                return {
                    gradient: "from-green-400/20 to-green-600/20",
                    border: "border-green-500",
                    glow: "shadow-green-500/50",
                    header: "from-green-400 to-green-600"
                };
            case "hot":
                return {
                    gradient: "from-orange-400/20 to-orange-600/20",
                    border: "border-orange-500",
                    glow: "shadow-orange-500/50",
                    header: "from-orange-400 to-orange-600"
                };
            case "spicy":
                return {
                    gradient: "from-red-400/20 to-red-600/20",
                    border: "border-red-500",
                    glow: "shadow-red-500/50",
                    header: "from-red-500 to-red-700"
                };
        }
    };
    const colorScheme = currentQuestion ? getColorScheme(currentQuestion.level) : getColorScheme("mild");

    return (
        <main className="overflow-hidden h-screen">
            <BackButton href="/#games" className="absolute top-4 left-4 z-10"/>
            <BeerContainer color="rose">
                <div className="flex flex-col items-center text-center h-full">
                    <h1 className={`${lilita.className} text-5xl pt-12`}>
                        Never Have I Ever
                    </h1>

                    <div className="mt-8 flex gap-3 bg-white/10 backdrop-blur-sm p-2 rounded-2xl">
                        {spicyOptions.map((option) => {
                            const isActive = spicyLevels?.[option.level] || false;
                            return (
                                <button
                                    key={option.level}
                                    onClick={() => toggleSpicyLevel(option.level)}
                                    className={`
                                        relative px-6 py-3 rounded-xl font-semibold text-white
                                        transition-all duration-300 transform
                                        ${isActive
                                        ? `bg-gradient-to-br ${option.color} scale-105 shadow-lg ring-2 ring-white/50`
                                        : "bg-black/20 hover:bg-black/30 scale-100 border-2 border-white/30 hover:border-white/50 opacity-50 hover:opacity-70"
                                    }
                                    `}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-0.5">
                                            {Array.from({length: option.flames}).map((_, i) => (
                                                <Flame
                                                    key={i}
                                                    size={16}
                                                    className={`${
                                                        isActive
                                                            ? "fill-white"
                                                            : "fill-white/50"
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span>{option.label}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Abakus Mode Toggle */}
                    <div className="mt-4">
                        <button
                            onClick={toggleAbakusMode}
                            className={`
                                relative px-8 py-3 rounded-2xl font-semibold text-white
                                transition-all duration-300 transform
                                ${AbakusMode
                                ? "bg-gradient-to-br from-purple-500 to-pink-600 scale-105 shadow-lg ring-2 ring-white/50"
                                : "bg-black/20 hover:bg-black/30 scale-100 border-2 border-white/30 hover:border-white/50 opacity-50 hover:opacity-70"
                            }
                            `}
                        >
                            <div className="flex items-center gap-2">
                                <Users
                                    size={20}
                                    className={AbakusMode ? "fill-white" : "fill-white/50"}
                                />
                                <span>Abakus relatert</span>
                                    <span className="ml-1 text-xs bg-white/30 px-2 py-0.5 rounded-full">
                                        {AbakusMode ? "På" : "Av"}
                                    </span>
                            </div>
                        </button>
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
                <Footer/>
            </BeerContainer>
        </main>
    );
};

export default NeverHaveI;
