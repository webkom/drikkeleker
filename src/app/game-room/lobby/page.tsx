"use client";

import { useState } from "react";
import BeerContainer from "@/components/beer/beer-container";
import BackButton from "@/components/shared/back-button";
import Footer from "@/components/shared/footer";
import { AnimatePresence } from "framer-motion";

import BubbleTransition from "@/components/beer/BubbleTransition";
import LobbyPro from "@/components/lobbies/LobbyPro";
import LobbyRegular from "@/components/lobbies/LobbyDefault";

type LobbyMode = "default" | "pro";

const LobbyPageController = () => {
  const [lobbyMode, setLobbyMode] = useState<LobbyMode>("default");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startTransitionToPro = () => {
    setIsTransitioning(true);

    setTimeout(() => {
      setLobbyMode("pro");

      setIsTransitioning(false);
    }, 1200);
  };

  return (
    <main className="overflow-hidden h-screen">
      <BackButton href="/#games" className="absolute top-4 left-4 z-10" />

      <BeerContainer
        color={lobbyMode === "default" ? "violet" : "slate"}
        className="h-screen w-screen"
      >
        <BubbleTransition isAnimating={isTransitioning} color="bg-white" />

        <AnimatePresence mode="wait" initial={false}>
          {lobbyMode === "default" ? (
            <LobbyRegular onStartProTransition={startTransitionToPro} />
          ) : (
            <LobbyPro />
          )}
        </AnimatePresence>

        <Footer />
      </BeerContainer>
    </main>
  );
};

export default LobbyPageController;
