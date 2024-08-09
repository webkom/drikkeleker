"use client";

import { Canvas } from "@react-three/fiber";
import DiceScene from "./DiceScene";
import BeerContainer from "@/components/beer/beer-container";
import BackButton from "@/components/back-button";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <BackButton className="absolute top-4 left-4 z-10" href="/" />
      <BeerContainer className="h-screen w-screen">
        <Canvas>
          <DiceScene />
        </Canvas>
        <Footer />
      </BeerContainer>
    </main>
  );
}
