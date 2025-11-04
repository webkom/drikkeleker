import BeerContainer from "@/components/beer/beer-container";
import {lilita} from "@/lib/fonts";
import {
    ArrowDown,
    Beer,
    Dice6,
    HeartCrack,
    MessageCircleQuestion,
    MicVocal,
    ScrollText,
    Timer,
    ListChecks
} from "lucide-react";
import NavButton from "@/components/ui/nav-button";
import FoamWave from "@/components/foamwave/foamwave";
import Footer from "@/components/shared/footer";

export default function Home() {
    return (
        <main className="md:flex md:flex-col overflow-x-hidden overflow-y-scroll snap-y snap-mandatory h-dvh">
            <div className="relative p-8 pb-0 flex flex-col items-center gap-8 text-center snap-start max-md:h-dvh">
                <h1 className={`${lilita.className} text-6xl mt-12 leading-snug`}>
                    Drikkeleker 🍻
                </h1>
                <div className="lg:hidden flex flex-col items-center gap-8 mt-auto">
                    <span>Dykk ned for å se Abakus sine sanger og drikkeleker!</span>
                    <ArrowDown className="animate-bounce" size={48}/>
                </div>
                <FoamWave/>
            </div>
            <div className="snap-start md:grow max-md:h-dvh" id="games">
                <BeerContainer className="max-md:h-dvh">
                    <h4 className={`${lilita.className} text-gray-800`}>Sanger</h4>
                    <NavButton
                        icon={<Beer/>}
                        color="red"
                        label="Lambo"
                        href="/song/lambo"
                    />
                    <NavButton
                        icon={<MicVocal/>}
                        color="blue"
                        label="Lay All Your Love on Me"
                        href="/song/lay-all-your-love-on-me"
                    />
                    <NavButton
                        icon={<HeartCrack/>}
                        color="green"
                        label="Forever Alone"
                        href="/song/forever-alone"
                    />
                    <h4 className={`${lilita.className} pt-6 text-gray-800`}>Leker</h4>
                    <NavButton
                        icon={<MessageCircleQuestion/>}
                        color="fuchsia"
                        label="100 Spørsmål"
                        href="/questions  "
                    />
                    {/*<NavButton
                        icon={<ListChecks/>}
                        color="rose"
                        label="Never Have I Ever"
                        href="/never-have-i  "
                    />*/}
                    <NavButton
                        icon={<Dice6/>}
                        color="teal"
                        label="Terningleken"
                        href="/dice"
                    />
                    <NavButton
                        icon={<Timer/>}
                        color="orange"
                        label="6 Minutes"
                        href="/six-minutes"
                    />
                    <NavButton
                        icon={<ScrollText/>}
                        color="violet"
                        label="Viljens Drikkelek"
                        href="/game-room/lobby"
                    />

                    <Footer/>
                </BeerContainer>
            </div>
        </main>
    );
}
