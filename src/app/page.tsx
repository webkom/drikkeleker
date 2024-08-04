import BeerContainer from "@/components/beer/beer-container";
import { lilita } from "@/lib/fonts";
import {
  ArrowDown,
  Beer,
  Dice6,
  HeartCrack,
  MessageCircleQuestion,
  MicVocal,
  Timer,
} from "lucide-react";
import NavButton from "@/components/ui/nav-button";

export default function Home() {
  return (
    <main className="flex flex-col items-center overflow-hidden">
      <div className="mt-12 p-8 flex flex-col items-center space-y-4 text-center text-lego-muted">
        <h1 className={`${lilita.className} text-6xl leading-snug`}>
          Drikkeleker 🍻
        </h1>
        <span>Dykk ned for å se Abakus sine sanger og drikkeleker!</span>
        <br />
        <ArrowDown className="animate-bounce" size={48} />
      </div>
      <BeerContainer>
        <h4 className={`${lilita.className} text-gray-800`}>Sanger</h4>
        <NavButton icon={<Beer />} color="red" label="Lambo" href="/song/lambo" />
        <NavButton
          icon={<MicVocal />}
          color="blue"
          label="Lay All Your Love on Me"
          href="/lambo"
        />
        <NavButton
          icon={<HeartCrack />}
          color="green"
          label="Forever Alone"
          href="/lambo"
        />
        <h4 className={`${lilita.className} pt-6 text-gray-800`}>Leker</h4>
        <NavButton
          icon={<MessageCircleQuestion />}
          color="fuchsia"
          label="100 spørsmål"
          href="/lambo"
        />
        <NavButton
          icon={<Dice6 />}
          color="teal"
          label="Terningleken"
          href="/dice"
        />
        <NavButton
          icon={<Timer />}
          color="orange"
          label="6 minutes"
          href="/dice"
        />
      </BeerContainer>
    </main>
  );
}
