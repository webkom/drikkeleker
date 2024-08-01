"use client";
import { Canvas } from "@react-three/fiber";
import Dice from "./Dice";

export default function Home() {
  return (
    <main className="h-screen w-screen">
      <Canvas>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />

        <Dice/>
      </Canvas>
    </main>
  );
}
