"use client";

import dyn from "next/dynamic";

const Canvas = dyn(
  () => import("@react-three/fiber").then((mod) => mod.Canvas),
  { ssr: false },
);

const DiceScene = dyn(() => import("./DiceScene"), { ssr: false });

export const dynamic = "force-dynamic";

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
