import BeerContainer from "@/components/beer/beer-container";
import { lilita } from "@/lib/fonts";
import SuggestionsForm from "@/components/shared/suggestions-form";
import {
  ArrowDown,
  Beer,
  Dice6,
  HeartCrack,
  ListChecks,
  MessageCircleQuestion,
  MicVocal,
  ScrollText,
  Timer,
} from "lucide-react";
import NavButton from "@/components/ui/nav-button";
import FoamWave from "@/components/foamwave/foamwave";
import Footer from "@/components/shared/footer";

export default function Home() {
  return (
    <main className="min-h-dvh overflow-x-hidden">
      <div className="relative flex flex-col items-center gap-6 p-8 pb-0 text-center min-h-dvh">
        <h1 className={`${lilita.className} text-6xl mt-12 leading-snug`}>
          Drikkeleker 🍻
        </h1>
        <a
          href="#games"
          className="mt-auto flex flex-col items-center gap-4 hover:opacity-70 transition-opacity cursor-pointer"
        >
          <span>Dykk ned for å se Abakus sine sanger og drikkeleker!</span>
          <ArrowDown className="animate-bounce" size={48} />
        </a>
        <FoamWave className="-mb-px w-screen overflow-hidden" />
      </div>
      <div id="games">
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
            href="/song/lay-all-your-love-on-me"
          />
          <NavButton
            icon={<HeartCrack />}
            color="green"
            label="Forever Alone"
            href="/song/forever-alone"
          />
          <h4 className={`${lilita.className} pt-6 text-gray-800`}>Leker</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            <NavButton
              icon={<MessageCircleQuestion />}
              color="fuchsia"
              label="100 Spørsmål"
              href="/questions"
            />
            <NavButton
              icon={<ListChecks />}
              color="rose"
              label="Never Have I Ever"
              href="/never-have-i"
            />
            {/* <NavButton
              icon={<Tags />}
              color="cyan"
              label="Alias"
              href="/alias"
            />
            <NavButton
              icon={<SlidersHorizontal />}
              color="violet"
              label="Bølgelengde"
              href="/wavelength"
            />*/}
            <NavButton
              icon={<Dice6 />}
              color="teal"
              label="Terningleken"
              href="/dice"
            />
            <NavButton
              icon={<Timer />}
              color="orange"
              label="6 Minutes"
              href="/six-minutes"
            />
            <div className="sm:col-span-2">
              <NavButton
                icon={<ScrollText />}
                color="violet"
                label="Viljens Drikkelek"
                href="/game-room/lobby"
              />
            </div>
          </div>
          <SuggestionsForm />
          <Footer />
        </BeerContainer>
      </div>
    </main>
  );
}
