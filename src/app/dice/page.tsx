"use client";

import { Canvas } from "@react-three/fiber";
import DiceScene from "./DiceScene";
import BeerContainer from "@/components/beer/beer-container";
import BackButton from "@/components/back-button";
import Footer from "@/components/footer";
import { lilita } from "@/lib/fonts";

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <BackButton className="absolute top-4 left-4 z-10" href="/#games" />
      <BeerContainer color="teal" className="h-screen w-screen">
        <h1 className={`${lilita.className} text-5xl text-center mt-12`}>
          Terningleken
        </h1>
        <Canvas>
          <DiceScene />
        </Canvas>
        <Footer />
      </BeerContainer>
    </main>
  );
}
