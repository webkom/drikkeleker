"use client";

import { lilita } from "@/lib/fonts";
import BeerContainer from "@/components/beer/beer-container";
import { useEffect, useState } from "react";
import BackButton from "@/components/shared/back-button";
import Footer from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import CustomSwiper from "@/components/shared/custom-swiper";

interface StoredCard {
  card: number;
  updatedAt: string;
}

const questions = ["Test1", "Test2", "Test3", "Test4", "Test5", "Test6"];
const getStoredCard = (): number | undefined => {
  if (typeof window === "undefined") return;

  try {
    const storedData = localStorage.getItem("current_card");
    if (!storedData) return;

    const { card, updatedAt }: StoredCard = JSON.parse(storedData);

    const storedTime = new Date(updatedAt).getTime();
    const now = new Date().getTime();
    const isRecent = now - storedTime < 30_000;

    if (isRecent) return card;
  } catch {}
};

const QuestionsPage = () => {
  const [currentCard, setCurrentCard] = useState(getStoredCard() || 0);
  const [prevDisabled, setPrevDisabled] = useState(false);
  const [nextDisabled, setNextDisabled] = useState(false);

  const setValidCurrentCard = (card: number) =>
    setCurrentCard(Math.min(Math.max(card, 0), questions.length - 1));

  useEffect(() => {
    setPrevDisabled(currentCard === 0);
    setNextDisabled(currentCard === questions.length - 1);

    localStorage.setItem(
      "current_card",
      JSON.stringify({
        card: currentCard,
        updatedAt: new Date(),
      }),
    );
  }, [currentCard]);

  const slides = questions.map((question, index) => ({
    id: index,
    title: `Ord ${index + 1}`,
    content: question,
  }));

  const handleNavigate = (index: number) => {
    setValidCurrentCard(index);
  };

  return (
    <main className="overflow-hidden h-screen">
      <BackButton href="/#games" className="absolute top-4 left-4 z-10" />
      <BeerContainer color="cyan">
        <div className=" text-center flex-1">
          <h1 className={`${lilita.className} text-5xl pt-8`}>Alias</h1>
          <div className="w-full h-[70vh] max-w-2xl flex flex-col grow mt-12 justify-between">
            <CustomSwiper
              slides={slides}
              effect="cards"
              currentIndex={currentCard}
              onNavigate={handleNavigate}
              color={"cyan"}
            />
            <div className="flex gap-2 justify-between flex-1">
              <Button
                onClick={() => setValidCurrentCard(currentCard - 1)}
                className="bg-red-500 hover:bg-red-500/90 w-full h-full group  mb-10 flex-1"
              >
                <ArrowLeft
                  size={20}
                  className="mr-1 transition-transform group-hover:-translate-x-1"
                />
                Gi opp
              </Button>
              <Button
                onClick={() => setValidCurrentCard(currentCard + 1)}
                className="bg-green-500 hover:bg-green-500/90 w-full h-full group flex-1"
              >
                Riktig
                <ArrowRight
                  size={20}
                  className="ml-1 transition-transform group-hover:translate-x-1"
                />
              </Button>
            </div>
          </div>
        </div>
        <Footer className="absolute bottom-0 left-1/2 -translate-x-1/2" />
      </BeerContainer>
    </main>
  );
};

export default QuestionsPage;
