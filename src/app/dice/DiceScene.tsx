"use client";

import { useState, useRef } from "react";
import Dice from "./Dice";

const DICE_ROLL_COOLDOWN = 750; // milliseconds
const DICE_ROLL_DURATION = 700; // milliseconds

const getFaceRotation = (face: number): { x: number; y: number } => {
  switch (face) {
    case 1:
      return { x: 0, y: 270 }; // Right
    case 2:
      return { x: 0, y: 90 }; // Left
    case 3:
      return { x: 90, y: 0 }; // Top
    case 4:
      return { x: 270, y: 0 }; // Bottom
    case 5:
      return { x: 0, y: 0 }; // Front
    case 6:
      return { x: 180, y: 0 }; // Back
    default:
      return { x: 0, y: 0 };
  }
};

const DiceScene = () => {
  const [currentFace, setCurrentFace] = useState(5);
  const [isRolling, setIsRolling] = useState(false);
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const lastRollTime = useRef(0);
  const diceRef = useRef<HTMLDivElement>(null);

  const rollDice = () => {
    const now = Date.now();
    const timeSinceLastRoll = now - lastRollTime.current;

    if (timeSinceLastRoll < DICE_ROLL_COOLDOWN) {
      return;
    }

    lastRollTime.current = now;
    setIsRolling(true);

    const newFace = Math.floor(Math.random() * 6) + 1;
    setCurrentFace(newFace);

    const targetRotation = getFaceRotation(newFace);

    const extraSpinsX = (Math.floor(Math.random() * 3) + 2) * 360;
    const extraSpinsY = (Math.floor(Math.random() * 3) + 2) * 360;

    const currentNormalizedX = rotationX % 360;
    const currentNormalizedY = rotationY % 360;

    let deltaX = targetRotation.x - currentNormalizedX;
    let deltaY = targetRotation.y - currentNormalizedY;

    if (deltaX > 180) deltaX -= 360;
    if (deltaX < -180) deltaX += 360;
    if (deltaY > 180) deltaY -= 360;
    if (deltaY < -180) deltaY += 360;

    const newRotationX = rotationX + extraSpinsX + deltaX;
    const newRotationY = rotationY + extraSpinsY + deltaY;

    setRotationX(newRotationX);
    setRotationY(newRotationY);

    setTimeout(() => {
      setIsRolling(false);
    }, DICE_ROLL_DURATION);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
      }}
    >
      <Dice
        ref={diceRef}
        currentFace={currentFace}
        isRolling={isRolling}
        onClick={rollDice}
        rotationX={rotationX}
        rotationY={rotationY}
      />
    </div>
  );
};

export default DiceScene;
