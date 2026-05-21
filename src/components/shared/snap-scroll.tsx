"use client";

import { useEffect, useRef } from "react";

export default function SnapScroll() {
  const snapping = useRef(false);

  useEffect(() => {
    let settleTimer: ReturnType<typeof setTimeout>;

    const trySnap = () => {
      const gamesEl = document.getElementById("games");
      if (!gamesEl) return;

      const gamesTop = gamesEl.offsetTop;
      const y = window.scrollY;

      // Only snap inside the hero gap between the very top and the games
      // section; leave the rest of the page alone.
      if (y <= 0 || y >= gamesTop) return;

      // Snap to whichever edge is nearest, independent of scroll direction.
      const target = y < gamesTop / 2 ? 0 : gamesTop;
      if (target === y) return;

      snapping.current = true;
      window.scrollTo({ top: target, behavior: "smooth" });

      // `scrollend` is unreliable on iOS Safari, so release the lock on a timer
      // safely longer than the smooth scroll instead of listening for it.
      window.setTimeout(() => {
        snapping.current = false;
      }, 700);
    };

    const handleScroll = () => {
      if (snapping.current) return;
      // Debounce: only act once scrolling settles, so we never fight the
      // user's momentum scrolling (the cause of the jittery mobile loop).
      clearTimeout(settleTimer);
      settleTimer = setTimeout(trySnap, 140);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(settleTimer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return null;
}
