"use client";

import { lilita } from "@/lib/fonts";
import BeerContainer from "@/components/beer/beer-container";
import { useEffect, useState } from "react";
import BackButton from "@/components/shared/back-button";
import Footer from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Flame } from "lucide-react";
import CustomSwiper from "@/components/shared/custom-swiper";

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

type SpicyLevel = "mild" | "hot" | "spicy";

interface StoredData {
    card: number;
    level: SpicyLevel;
    updatedAt: string;
}

const getStoredData = (): { card: number; level: SpicyLevel } => {
    if (typeof window === "undefined") return { card: 0, level: "mild" };

    try {
        const storedData = localStorage.getItem("never_have_i");
        if (!storedData) return { card: 0, level: "mild" };

        const { card, level, updatedAt }: StoredData = JSON.parse(storedData);

        const storedTime = new Date(updatedAt).getTime();
        const now = new Date().getTime();
        const isRecent = now - storedTime < 30_000;

        if (isRecent) return { card, level };
    } catch {}

    return { card: 0, level: "mild" };
};

const NeverHaveI = () => {
    const stored = getStoredData();
    const [spicyLevel, setSpicyLevel] = useState<SpicyLevel>(stored.level);
    const [currentCard, setCurrentCard] = useState(stored.card);
    const [prevDisabled, setPrevDisabled] = useState(false);
    const [nextDisabled, setNextDisabled] = useState(false);

    const questions = {
        mild,
        hot,
        spicy,
    };

    const currentQuestions = questions[spicyLevel];

    const setValidCurrentCard = (card: number) =>
        setCurrentCard(Math.min(Math.max(card, 0), currentQuestions.length - 1));

    useEffect(() => {
        setPrevDisabled(currentCard === 0);
        setNextDisabled(currentCard === currentQuestions.length - 1);

        localStorage.setItem(
            "never_have_i",
            JSON.stringify({
                card: currentCard,
                level: spicyLevel,
                updatedAt: new Date(),
            })
        );
    }, [currentCard, currentQuestions.length, spicyLevel]);

    // Reset to first card when changing spicy level
    const handleSpicyLevelChange = (level: SpicyLevel) => {
        setSpicyLevel(level);
        setCurrentCard(0);
    };

    // Convert questions to slides format for CustomSwiper
    const slides = currentQuestions.map((question, index) => ({
        id: `${spicyLevel}-${index}`,
        title: `Spørsmål ${index + 1}`,
        content: question,
    }));

    const handleNavigate = (index: number) => {
        setValidCurrentCard(index);
    };

    const spicyOptions: { level: SpicyLevel; label: string; color: string; flames: number }[] = [
        { level: "mild", label: "Mild", color: "from-green-400 to-green-600", flames: 1 },
        { level: "hot", label: "Hot", color: "from-orange-400 to-orange-600", flames: 2 },
        { level: "spicy", label: "Spicy", color: "from-red-500 to-red-700", flames: 3 },
    ];

    return (
        <main className="overflow-hidden h-screen">
            <BackButton href="/#games" className="absolute top-4 left-4 z-10" />
            <BeerContainer color="rose">
                <div className="flex flex-col items-center text-center h-full">
                    <h1 className={`${lilita.className} text-5xl pt-12`}>
                        Never Have I Ever
                    </h1>

                    {/* Spicy Level Toggle */}
                    <div className="mt-8 flex gap-3 bg-white/10 backdrop-blur-sm p-2 rounded-2xl">
                        {spicyOptions.map((option) => (
                            <button
                                key={option.level}
                                onClick={() => handleSpicyLevelChange(option.level)}
                                className={`
                                    relative px-6 py-3 rounded-xl font-semibold text-white
                                    transition-all duration-300 transform
                                    ${spicyLevel === option.level
                                    ? `bg-gradient-to-br ${option.color} scale-110 shadow-lg`
                                    : "bg-white/20 hover:bg-white/30 scale-100"
                                }
                                `}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: option.flames }).map((_, i) => (
                                            <Flame
                                                key={i}
                                                size={16}
                                                className={`${
                                                    spicyLevel === option.level
                                                        ? "fill-white"
                                                        : "fill-white/50"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span>{option.label}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="w-full max-w-2xl flex flex-col grow mt-20">
                        <CustomSwiper
                            slides={slides}
                            effect="cards"
                            currentIndex={currentCard}
                            onNavigate={handleNavigate}
                        />
                        <div className="flex gap-2 mt-8">
                            <Button
                                onClick={() => setValidCurrentCard(currentCard - 1)}
                                className="bg-rose-500 hover:bg-rose-500/90 w-full group"
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
                                className="bg-rose-500 hover:bg-rose-500/90 w-full group"
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
