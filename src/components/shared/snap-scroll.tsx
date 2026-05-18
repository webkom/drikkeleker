"use client";

import { useEffect, useRef } from "react";

export default function SnapScroll() {
  const snapping = useRef(false);
  const prevScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (snapping.current) return;

      const y = window.scrollY;
      const gamesEl = document.getElementById("games");
      if (!gamesEl) {
        prevScrollY.current = y;
        return;
      }
      const gamesTop = gamesEl.offsetTop;

      if (y > 0 && y < gamesTop) {
        const goingDown = y >= prevScrollY.current;
        snapping.current = true;
        window.scrollTo({ top: goingDown ? gamesTop : 0, behavior: "smooth" });
      }

      prevScrollY.current = y;
    };

    const handleScrollEnd = () => {
      snapping.current = false;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("scrollend", handleScrollEnd);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scrollend", handleScrollEnd);
    };
  }, []);

  return null;
}
