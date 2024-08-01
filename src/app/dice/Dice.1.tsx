"use client";
import { useLoader, useThree, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Mesh, TextureLoader } from "three";

export const Dice = () => {
    const rollTimeSeconds = 1.5;

    const meshRef = useRef<Mesh>(null);

    const texture_1 = useLoader(TextureLoader, 'images/one.png');
    const texture_2 = useLoader(TextureLoader, 'images/two.png');
    const texture_3 = useLoader(TextureLoader, 'images/three.png');
    const texture_4 = useLoader(TextureLoader, 'images/four.png');
    const texture_5 = useLoader(TextureLoader, 'images/five.png');
    const texture_6 = useLoader(TextureLoader, 'images/six.png');

    const { clock } = useThree();
    const [startTime, setStartTime] = useState(0);
    const [rolledFace, setRolledFace] = useState(0);

    const getRotationXByFace = (face: number): number => {
        if (face == 3) {
            return Math.PI / 2;
        }
        if (face == 4) {
            return 3 / 2 * Math.PI;
        }
        if (face == 6) {
            return Math.PI;
        }
        return 0;
    };

    const getRotationYByFace = (face: number): number => {
        if (face == 1) {
            return 3 / 2 * Math.PI;
        }
        if (face == 2) {
            return Math.PI / 2;
        }

        return 0;
    };

    const fx = (t: number) => {
        const stopRotation = getRotationXByFace(rolledFace);
        return Math.max(-Math.pow(t - rollTimeSeconds, 5) + stopRotation, stopRotation);
    };
    const fy = (t: number) => {
        const stopRotation = getRotationYByFace(rolledFace);
        return Math.max(-Math.pow(t - rollTimeSeconds, 5) + stopRotation, stopRotation);
    };

    useFrame(({ clock }) => {
        if (!meshRef.current) return;

        meshRef.current.rotation.x = fx(clock.elapsedTime - startTime);
        meshRef.current.rotation.y = fy(clock.elapsedTime - startTime);
    });

    const rollDice = () => {
        // if (clock.elapsedTime - startTime < rollTimeSeconds) {
        //   return;
        // }
        setStartTime(clock.elapsedTime);
        setRolledFace(Math.floor(Math.random() * 6) + 1);
    };

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
    );
};
