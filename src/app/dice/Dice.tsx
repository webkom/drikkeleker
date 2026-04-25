"use client";

import { forwardRef } from "react";
import styles from "./Dice.module.css";
import Image from "next/image";

type DiceProps = {
  currentFace: number;
  isRolling: boolean;
  onClick: () => void;
  rotationX: number;
  rotationY: number;
};

const faces = ["one", "two", "three", "four", "five", "six"] as const;

const Dice = forwardRef<HTMLDivElement, DiceProps>(
  ({ currentFace, isRolling, onClick, rotationX, rotationY }, ref) => {
    return (
      <div className={styles.container}>
        <div className={styles.scene} onClick={onClick}>
          <div
            ref={ref}
            className={`${styles.cube} ${isRolling ? styles.rolling : ""}`}
            data-face={currentFace}
            style={{
              transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
            }}
          >
            <div className={`${styles.face} ${styles.back}`}>
              <Image
                src="/images/one.png"
                alt="1"
                draggable={false}
                width={200}
                height={200}
              />
            </div>
            <div className={`${styles.face} ${styles.right}`}>
              <Image
                src="/images/two.png"
                alt="2"
                draggable={false}
                width={200}
                height={200}
              />
            </div>
            <div className={`${styles.face} ${styles.left}`}>
              <Image
                src="/images/three.png"
                alt="3"
                draggable={false}
                width={200}
                height={200}
              />
            </div>
            <div className={`${styles.face} ${styles.top}`}>
              <Image
                src="/images/four.png"
                alt="4"
                draggable={false}
                width={200}
                height={200}
              />
            </div>
            <div className={`${styles.face} ${styles.bottom}`}>
              <Image
                src="/images/five.png"
                alt="5"
                draggable={false}
                width={200}
                height={200}
              />
            </div>
            <div className={`${styles.face} ${styles.front}`}>
              <Image
                src="/images/six.png"
                alt="6"
                draggable={false}
                width={200}
                height={200}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
);

Dice.displayName = "Dice";

export default Dice;
