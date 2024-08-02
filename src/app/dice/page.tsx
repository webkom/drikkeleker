"use client";

import { Canvas } from "@react-three/fiber";
import DiceScene from "./DiceScene";

export default function Home() {
  return (
    <main className="h-screen w-screen bg-gradient-to-b from-indigo-500 to-blue-500">
      <Canvas>
        <DiceScene />
      </Canvas>
    </main>
  );
}
