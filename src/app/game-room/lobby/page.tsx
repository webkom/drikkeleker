"use client";

import { useState } from "react";
import BeerContainer from "@/components/beer/beer-container";
import BackButton from "@/components/back-button";
import Footer from "@/components/footer";
import { AnimatePresence } from "framer-motion";

// Import all the necessary components
import BubbleTransition from "@/components/beer/BubbleTransition";
import LobbyPro from "@/app/game-room/lobby/LobbyPro";
import LobbyRegular from "@/components/lobby/LobbyDefault";

type LobbyMode = "default" | "pro";

const LobbyPageController = () => {
  const [lobbyMode, setLobbyMode] = useState<LobbyMode>("default");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // This function is the key to the whole process
  const startTransitionToPro = () => {
    // 1. Start rendering the bubble animation immediately
    setIsTransitioning(true);

    // 2. Schedule the content swap to happen when the animation is at its peak
    //    The timeout duration is crucial. It should be less than the animation's total duration.
    //    800ms is a sweet spot: the screen is fully covered, but the animation hasn't finished.
    setTimeout(() => {
      setLobbyMode("pro"); // 3. The content swaps instantly, "in the background"

      // 4. After the swap, tell the bubble animation to start its exit phase.
      //    The AnimatePresence component will handle the exit animation automatically.
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
        {/* The BubbleTransition component lives here, ready to be activated */}
        <BubbleTransition isAnimating={isTransitioning} color="bg-white" />

        {/* AnimatePresence handles the component swapping */}
        <AnimatePresence mode="wait" initial={false}>
          {lobbyMode === "default" ? (
            // Pass the trigger function down to the regular lobby
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
