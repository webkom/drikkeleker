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
import FoamWave from "@/components/foamwave/foamwave";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="lg:flex lg:flex-col overflow-x-hidden overflow-y-scroll snap-y snap-mandatory h-dvh">
      <div className="relative p-8 pb-0 flex flex-col items-center gap-4 text-center snap-start max-md:h-dvh">
        <h1 className={`${lilita.className} text-6xl mt-12 leading-snug`}>
          Drikkeleker 🍻
        </h1>
        <span>Dykk ned for å se Abakus sine sanger og drikkeleker!</span>
        <ArrowDown className="animate-bounce" size={48} />
        <FoamWave className="mt-auto" />
      </div>
      <div className="snap-start lg:grow max-md:h-dvh">
        <BeerContainer>
          <h4 className={`${lilita.className} text-gray-800`}>Sanger</h4>
          <NavButton
            icon={<Beer />}
            color="red"
            label="Lambo"
            href="/song/lambo"
          />
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
            href="/questions  "
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
          <Footer />
        </BeerContainer>
      </div>
    </main>
  );
}
