import BeerContainer from "@/components/beer/beer-container";
import { lilita } from "@/lib/fonts";
import { ArrowDown } from "lucide-react";
import NavButton from "@/components/ui/nav-button";

export default function Home() {
  return (
    <main className="flex flex-col items-center overflow-hidden">
      <div className="mt-12 p-8 flex flex-col items-center space-y-4 text-center">
        <h1 className={`${lilita.className} text-6xl leading-snug`}>
          Drikkeleker 🍻
        </h1>
        <span>Dykk ned for å se Abakus sine sanger og drikkeleker!</span>
        <br />
        <ArrowDown className="animate-bounce" size={48} />
      </div>
      <BeerContainer>
        <h4 className={lilita.className}>Sanger</h4>
        <NavButton label="Lambo" href="/lambo" />
        <NavButton label="Lambo" href="/lambo" />
        <h4 className={`${lilita.className} pt-6`}>Leker</h4>
        <NavButton label="Lambo" href="/lambo" />
        <NavButton label="Lambo" href="/lambo" />
      </BeerContainer>
    </main>
  );
}
