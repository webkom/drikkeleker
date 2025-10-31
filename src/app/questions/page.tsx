"use client";

import { lilita } from "@/lib/fonts";
import BeerContainer from "@/components/beer/beer-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import BackButton from "@/components/back-button";
import Footer from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
  "Hvem skal ta en bånnski med deg?",
  "SKÅL!",
];

interface Card {
  id: number;
  content: string;
  style: {
    transform: string;
    transition: string;
  };
}

interface StoredCard {
  card: number;
  updatedAt: string;
}

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
  const [cards, setCards] = useState<Card[]>([]);
  const [prevDisabled, setPrevDisabled] = useState(false);
  const [nextDisabled, setNextDisabled] = useState(false);

  const setValidCurrentCard = (card: number) =>
    setCurrentCard(Math.min(Math.max(card, 0), questions.length - 1));

  useEffect(() => {
    setPrevDisabled(currentCard === 0);
    setNextDisabled(currentCard === questions.length - 1);

    const updatedCards: Card[] = questions.map((content, index) => {
      const relativeIndex = index - currentCard;
      const transform =
        relativeIndex < 0
          ? `translate(-100vw, ${relativeIndex * 10}px)`
          : `translate(0, ${relativeIndex * 10}px)`;

      const style = {
        transform: transform,
        transition: "transform 0.5s",
      };

      return { id: index, content, style };
    });

    setCards(
      updatedCards.slice(
        currentCard === 0 ? 0 : currentCard - 1,
        currentCard + 5,
      ),
    );
    localStorage.setItem(
      "current_card",
      JSON.stringify({
        card: currentCard,
        updatedAt: new Date(),
      }),
    );
  }, [currentCard]);

  return (
    <main className="overflow-hidden h-screen">
      <BackButton href="/#games" className="absolute top-4 left-4 z-10" />
      <BeerContainer color="fuchsia">
        <div className="flex flex-col items-center text-center h-full">
          <h1 className={`${lilita.className} text-5xl pt-12`}>100 Spørsmål</h1>
          <div className="w-full max-w-2xl flex flex-col grow justify-center">
            <div className="relative h-96">
              {cards.map((card, index) => (
                <Card
                  key={card.id}
                  className="absolute cursor-pointer left-0 right-0 flex flex-col justify-center h-full bottom-12"
                  style={{
                    ...card.style,
                    zIndex: -index + 5,
                  }}
                  onClick={() => setValidCurrentCard(card.id + 1)}
                >
                  <CardHeader>
                    <CardTitle>Spørsmål {card.id + 1}</CardTitle>
                  </CardHeader>
                  <CardContent>{card.content}</CardContent>
                </Card>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setValidCurrentCard(currentCard - 1)}
                className="bg-fuchsia-500 hover:bg-fuchsia-500/90 w-full group"
                disabled={prevDisabled}
              >
                <ArrowLeft
                  size={20}
                  className="mr-1 transition-transform group-hover:-translate-x-1"
                />
                Forrige spørsmål
              </Button>
              <Button
                onClick={() => setValidCurrentCard(currentCard + 1)}
                className="bg-fuchsia-500 hover:bg-fuchsia-500/90 w-full group"
                disabled={nextDisabled}
              >
                Neste spørsmål
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
