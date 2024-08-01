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
import styles from "@/components/beer/beer.module.css";

export default function Home() {
  return (
    <main className="overflow-x-hidden overflow-y-scroll snap-y snap-mandatory h-dvh">
      <div className="p-8 flex flex-col items-center space-y-4 text-center snap-start h-dvh relative">
        <h1 className={`${lilita.className} text-6xl mt-12 leading-snug`}>Drikkeleker 🍻</h1>
        <span>Dykk ned for å se Abakus sine sanger og drikkeleker!</span>
        <br />
        <ArrowDown className="animate-bounce" size={48} />
        <div className={styles.foamWaveTop} />
      </div>
      <div className="snap-start h-dvh">
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
      </div>
    </main>
  );
}
