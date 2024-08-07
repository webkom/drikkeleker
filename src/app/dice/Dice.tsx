"use client";
import { useLoader } from "@react-three/fiber";
import { forwardRef, Ref } from "react";
import { Mesh, TextureLoader } from "three";

type DiceProps = {
  onClick?: () => void;
};

const Dice = forwardRef(({ onClick }: DiceProps, ref: Ref<Mesh>) => {
  const texture1 = useLoader(TextureLoader, "images/one.png");
  const texture2 = useLoader(TextureLoader, "images/two.png");
  const texture3 = useLoader(TextureLoader, "images/three.png");
  const texture4 = useLoader(TextureLoader, "images/four.png");
  const texture5 = useLoader(TextureLoader, "images/five.png");
  const texture6 = useLoader(TextureLoader, "images/six.png");

  return (
    <mesh ref={ref} scale={2} onClick={onClick}>
      <boxGeometry attach="geometry" args={[1, 1, 1]} />
      <meshStandardMaterial map={texture1} attach="material-0" />
      <meshStandardMaterial map={texture2} attach="material-1" />
      <meshStandardMaterial map={texture3} attach="material-2" />
      <meshStandardMaterial map={texture4} attach="material-3" />
      <meshStandardMaterial map={texture5} attach="material-4" />
      <meshStandardMaterial map={texture6} attach="material-5" />
    </mesh>
  );
});

Dice.displayName = "Dice";

export default Dice;
