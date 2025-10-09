"use client";

import { forwardRef } from "react";
import styles from "./Dice.module.css";

type DiceProps = {
  currentFace: number;
  isRolling: boolean;
  onClick: () => void;
  rotationX: number;
  rotationY: number;
};

const Dice = forwardRef<HTMLDivElement, DiceProps>(
  ({ currentFace, isRolling, onClick, rotationX, rotationY }, ref) => {
    return (
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
            <img src="/images/six.png" alt="6" draggable="false" />
          </div>
          {/* Right  (1) */}
          <div className={`${styles.face} ${styles.right}`}>
            <img src="/images/one.png" alt="1" draggable="false" />
          </div>
          {/* Left (2) */}
          <div className={`${styles.face} ${styles.left}`}>
            <img src="/images/two.png" alt="2" draggable="false" />
          </div>
          {/* Top  (3) */}
          <div className={`${styles.face} ${styles.top}`}>
            <img src="/images/three.png" alt="3" draggable="false" />
          </div>
          {/* Bottom  (4) */}
          <div className={`${styles.face} ${styles.bottom}`}>
            <img src="/images/four.png" alt="4" draggable="false" />
          </div>
          {/* Front  (5) */}
          <div className={`${styles.face} ${styles.front}`}>
            <img src="/images/five.png" alt="5" draggable="false" />
          </div>
          {/* Back  (6) */}
        </div>
      </div>
    );
  },
);

Dice.displayName = "Dice";

export default Dice;
