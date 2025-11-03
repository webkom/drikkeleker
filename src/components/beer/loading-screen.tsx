// src/components/beer/loading-screen.tsx
import React from "react";
import BeerContainer from "@/components/beer/beer-container";
import { lilita } from "@/lib/fonts";
import "./loading-container.css";
import type { Color } from "@/lib/colors";

type LoadingScreenProps = {
  color?: Color;
};

const LoadingScreen: React.FC<LoadingScreenProps> = ({ color = "amber" }) => (
  <main className="h-screen overflow-hidden">
    <BeerContainer color={color}>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="relative w-32 h-32 mb-8 loading-container">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="loading-bubble" />
          ))}
        </div>
        <p className={`${lilita.className} text-2xl animate-pulse`}>Kobler til rom...</p>
      </div>
    </BeerContainer>
  </main>
);

export default LoadingScreen;