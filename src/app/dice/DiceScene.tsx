"use client";

import { useEffect, useRef, useState } from "react";
import Dice from "./Dice";
import { Mesh } from "three";
import { useFrame, useThree } from "@react-three/fiber";

const DICE_ROLL_DURATION = 1.2;
const DICE_ROLL_COOLDOWN = 1.1;

const getDiceRotationX = (face: number): number => {
  switch (face) {
    case 3:
      return Math.PI / 2;
    case 4:
      return (3 / 2) * Math.PI;
    case 6:
      return Math.PI;
    default:
      return 0;
  }
};

const getDiceRotationY = (face: number): number => {
  switch (face) {
    case 1:
      return (3 / 2) * Math.PI;
    case 2:
      return Math.PI / 2;
    default:
      return 0;
  }
};

const interpolateRotation = (
  elapsedTime: number,
  duration: number,
  targetRotation: number,
) => {
  return elapsedTime >= duration
    ? targetRotation
    : 4 * Math.pow(elapsedTime - duration, 2) + targetRotation;
};

const DiceScene = () => {
  const diceMeshRef = useRef<Mesh>(null);

  const [rollStartTime, setRollStartTime] = useState(0);
  const [currentFace, setCurrentFace] = useState(3);

  useFrame(({ clock }) => {
    if (!diceMeshRef.current) return;

    const elapsedTimeSinceRoll = clock.elapsedTime - rollStartTime;

    const targetDiceRotationX = getDiceRotationX(currentFace);
    const targetDiceRotationY = getDiceRotationY(currentFace);

    diceMeshRef.current.rotation.x = interpolateRotation(
      elapsedTimeSinceRoll,
      DICE_ROLL_DURATION,
      targetDiceRotationX,
    );
    diceMeshRef.current.rotation.y = interpolateRotation(
      elapsedTimeSinceRoll,
      DICE_ROLL_DURATION,
      targetDiceRotationY,
    );
  });

  const { clock } = useThree();

  const rollDice = () => {
    const elapsedTimeSinceRoll = clock.elapsedTime - rollStartTime;

    if (elapsedTimeSinceRoll < DICE_ROLL_COOLDOWN) {
      return;
    }

    setRollStartTime(clock.elapsedTime);
    setCurrentFace(Math.floor(Math.random() * 6) + 1);
  };

  useEffect(() => {
    rollDice();
  }, []);

  return (
    <>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight
        position={[-3, 5, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />
      <pointLight position={[-3, 5, 10]} decay={0} intensity={Math.PI} />

      <Dice ref={diceMeshRef} onClick={rollDice} />
    </>
  );
};

export default DiceScene;
