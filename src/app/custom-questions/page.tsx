import BeerContainer from "@/components/beer/beer-container";
import BackButton from "@/components/back-button";
import Footer from "@/components/footer";
import { lilita } from "@/lib/fonts";
import GameRoomClient from "./GameRoomClient";

export default function GameRoomPage() {
  return (
    <main className="overflow-x-hidden h-screen flex flex-col">
      <BackButton className="absolute top-4 left-4 z-10" href="/#games" />
      <BeerContainer color="indigo" className="flex-grow flex flex-col">
        <h1 className={`${lilita.className} text-5xl text-center mt-12 mb-6`}>
          Grupperom
        </h1>
        <div className="w-full flex-grow container mx-auto px-4 pb-8">
          <GameRoomClient />
        </div>
        <Footer />
      </BeerContainer>
    </main>
  );
}
