"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

interface BubbleTransitionProps {
  isAnimating: boolean;
  color?: string;
}

const random = (min: number, max: number) => Math.random() * (max - min) + min;

const createBubble = () => ({
  id: Math.random(),
  left: `${random(-10, 110)}%`,
  size: random(30, 150),
  duration: random(0.8, 1.5),
  delay: random(0, 1),
  xDrift: random(-150, 150),
});

const BubbleTransition = ({
  isAnimating,
  color = "bg-slate-400",
}: BubbleTransitionProps) => {
  const bubbles = useMemo(() => Array.from({ length: 150 }, createBubble), []);

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.4 } }}
          exit={{ opacity: 0, transition: { duration: 0.8, delay: 0.5 } }}
        >
          {bubbles.map((bubble) => (
            <motion.div
              key={bubble.id}
              className={`absolute rounded-full ${color}`}
              style={{
                left: bubble.left,
                width: bubble.size,
                height: bubble.size,
                bottom: -150,
              }}
              initial={{ y: 0 }}
              animate={{ y: "-120vh" }}
              transition={{
                duration: bubble.duration,
                delay: bubble.delay,
                ease: "linear",
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BubbleTransition;
