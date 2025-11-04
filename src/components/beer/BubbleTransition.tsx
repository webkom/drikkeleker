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
  left: `${random(-10, 110)}%`, // Start from a wider range for better edge coverage
  size: random(30, 150), // Slightly larger bubbles on average
  duration: random(0.8, 1.5), // Make the animation last a consistent, longer time
  delay: random(0, 1), // Stagger the start times more
  xDrift: random(-150, 150),
});

const BubbleTransition = ({
  isAnimating,
  color = "bg-slate-400",
}: BubbleTransitionProps) => {
  // Increase the number of bubbles for a dense, screen-filling effect
  const bubbles = useMemo(() => Array.from({ length: 150 }, createBubble), []);

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
          // Add a very subtle background fade-in to help obscure the content swap
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.4 } }}
          exit={{ opacity: 0, transition: { duration: 0.8, delay: 0.5 } }} // Fade out after the bubbles have cleared
        >
          {bubbles.map((bubble) => (
            <motion.div
              key={bubble.id}
              className={`absolute rounded-full ${color}`}
              style={{
                left: bubble.left,
                width: bubble.size,
                height: bubble.size,
                bottom: -150, // Start all bubbles completely off-screen
              }}
              // The "in" animation
              initial={{ y: 0 }}
              // The "out" animation
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
