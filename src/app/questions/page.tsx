"use client";

import { lilita } from "@/lib/fonts";
import BeerContainer from "@/components/beer/beer-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import BackButton from "@/components/back-button";
import Footer from "@/components/footer";

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
  "Hvem hadde vunnet i ludo?",
  "Hvem drar på flest bedpresser?",
  "Hvem lever fremdeles i russetiden?",
  "Hvem passer best inn i Webkom (1)?",
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
  "Hvem er streit i ITGK?",
  "Hvem er mest kjærestemateriale?",
  "Hvem kunne dra hjem med en indeker?",
  "Hvem lukter best?",
  "Hvem har glemt navnet på et ONS?",
  "Hvem blir mest vellykket?",
  "SKÅL!",
  "Hvem spyr i kveld?",
  "Hvem er mest på baksiden?",
  "SKÅL og ta lambo!",
  "Hvem får kjæreste i første i fire?",
  "Hvem klarer ikke holde en hemmelighet?",
  "Hvem burde bli leder for Abakus?",
  "Hvem er mest kinky?",
  "Hvem koser seg med midtsidebilder?",
  "Hvem har mest game?",
  "SKÅL!",
  "Hvem kunne ligget med en foreleser?",
  "Hvem har finest myne?",
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
  "Hvem ville du omitt med på en øde øy?",
  "Hvem har hatt 69?",
  "SKÅL!",
  "Hvem hadde gjort alt for en date?",
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
  "Hvem er først i en skrekkfilm?",
  "Hvem har hatt trekant?",
  "Hvem er mest fornøyd med eget utseende?",
  "Hvem kommer raskest?",
  "Hvem hooker flest i kveld?",
  "SKÅL!",
  "Hvem er best i senga?",
  "Hvem skiller seg ut i mengden?",
  "Hvem avslutter festen sist?",
  "Hvem blir alltid spurt om leg?",
  "Hvem bunker mest?",
  "Hvem tar seg mest på puppene?",
  "Hvem kunne hatt sugarmama/sugardaddy?",
  "Hvem blacker ut mest?",
  "SKÅL ta bannski med deg",
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

const QuestionsPage = () => {
  const [currentCard, setCurrentCard] = useState(0);
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
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
  }, [currentCard]);

  return (
    <div className="overflow-hidden text-center">
      <BeerContainer>
        <div className="h-screen flex flex-col items-center">
          <BackButton href="/" className="absolute top-4 left-4" />
          <h1 className={`${lilita.className} text-5xl mt-16`}>100 Spørsmål</h1>
          <div className="relative w-96 mt-72">
            {cards.map((card, index) => (
              <Card
                key={card.id}
                className="absolute cursor-pointer left-0 right-0"
                style={{
                  ...card.style,
                  zIndex: -index + 5,
                }}
                onClick={() => setCurrentCard(card.id + 1)}
              >
                <CardHeader>
                  <CardTitle>Spørsmål {card.id + 1}</CardTitle>
                </CardHeader>
                <CardContent>{card.content}</CardContent>
              </Card>
            ))}
          </div>
        </div>
        <Footer />
      </BeerContainer>
    </div>
  );
};

export default QuestionsPage;
