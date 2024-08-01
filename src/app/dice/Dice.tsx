"use client";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Mesh, TextureLoader } from "three";

const Dice = () => {
  const rollTimeSeconds = 1.5;

  const meshRef = useRef<Mesh>(null);

  const texture_1 = useLoader(TextureLoader, 'images/one.png')
  const texture_2 = useLoader(TextureLoader, 'images/two.png')
  const texture_3 = useLoader(TextureLoader, 'images/three.png')
  const texture_4 = useLoader(TextureLoader, 'images/four.png')
  const texture_5 = useLoader(TextureLoader, 'images/five.png')
  const texture_6 = useLoader(TextureLoader, 'images/six.png')

  const {clock} = useThree();
  const [startTime, setStartTime] = useState(0);
  const [rolledFace, setRolledFace] = useState(0);

  const getRotationXByFace = (face: number): number => {
    if (face == 3) {
      return Math.PI/2;
    }
    if (face == 4) {
      return 3/2 * Math.PI;
    }
    if (face == 6) {
      return Math.PI;
    }
    return 0;
  }

  const getRotationYByFace = (face: number): number => {
    if (face == 1) {
      return 3/2*Math.PI;
    }
    if (face == 2) {
      return Math.PI/2;
    }

    return 0;
  }


  const f = (t: number, stopRotation: number) => {
    return t >= rollTimeSeconds ? stopRotation : 4 * Math.pow(t - rollTimeSeconds, 2) + stopRotation;
  }

  useFrame(({clock}) => {
    if (!meshRef.current) return;

    const stopRotationX = getRotationXByFace(rolledFace);
    const stopRotationY = getRotationYByFace(rolledFace);

    meshRef.current.rotation.x = f(clock.elapsedTime - startTime, stopRotationX);
    meshRef.current.rotation.y = f(clock.elapsedTime - startTime, stopRotationY);
  });

  const epsilon = 0.6;
  const rollDice = () => {
    if (clock.elapsedTime - startTime < rollTimeSeconds - epsilon) {
      return;
    }
    setStartTime(clock.elapsedTime);
    setRolledFace(Math.floor(Math.random() * 6) + 1);
  }

  useEffect(() => {
    rollDice();
  }, []);

  return (
    <mesh
      ref={meshRef}
      scale={2}
      onClick={() => rollDice()}
    >
      <boxGeometry attach="geometry" args={[1, 1, 1]} />
      <meshStandardMaterial map={texture_1} attach="material-0" />
      <meshStandardMaterial map={texture_2} attach="material-1" />
      <meshStandardMaterial map={texture_3} attach="material-2" />
      <meshStandardMaterial map={texture_4} attach="material-3" />
      <meshStandardMaterial map={texture_5} attach="material-4" />
      <meshStandardMaterial map={texture_6} attach="material-5" />
    </mesh>
  )
}

export default Dice;
