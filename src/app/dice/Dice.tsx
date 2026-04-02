"use client";

import { forwardRef, useState } from "react";
import styles from "./Dice.module.css";
import Image from "next/image";

type DiceProps = {
  currentFace: number;
  isRolling: boolean;
  onClick: () => void;
  rotationX: number;
  rotationY: number;
};

const Dice = forwardRef<HTMLDivElement, DiceProps>(
  ({ currentFace, isRolling, onClick, rotationX, rotationY }, ref) => {
    const [featureFlag, setFeatureFlag] = useState(false);
    return (
      <div className={styles.container}>
        <div className={styles.scene} onClick={onClick}>
          {featureFlag ? (
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
                  src="/images/7b1a278f5abe8e9da907fc9c29dfd432d60dc76e17b0fabab659d2a508bc65c4.png"
                  alt="6"
                  draggable={false}
                  width={200}
                  height={200}
                />
              </div>
              {/* Right  (1) */}
              <div className={`${styles.face} ${styles.right}`}>
                <Image
                  src="/images/7b1a278f5abe8e9da907fc9c29dfd432d60dc76e17b0fabab659d2a508bc65c4.png"
                  alt="6"
                  draggable={false}
                  width={200}
                  height={200}
                />
              </div>
              {/* Left (2) */}
              <div className={`${styles.face} ${styles.left}`}>
                <Image
                  src="/images/7b1a278f5abe8e9da907fc9c29dfd432d60dc76e17b0fabab659d2a508bc65c4.png"
                  alt="6"
                  draggable={false}
                  width={200}
                  height={200}
                />
              </div>
              {/* Top  (3) */}
              <div className={`${styles.face} ${styles.top}`}>
                <Image
                  src="/images/7b1a278f5abe8e9da907fc9c29dfd432d60dc76e17b0fabab659d2a508bc65c4.png"
                  alt="6"
                  draggable={false}
                  width={200}
                  height={200}
                />
              </div>
              {/* Bottom  (4) */}
              <div className={`${styles.face} ${styles.bottom}`}>
                <Image
                  src="/images/7b1a278f5abe8e9da907fc9c29dfd432d60dc76e17b0fabab659d2a508bc65c4.png"
                  alt="6"
                  draggable={false}
                  width={200}
                  height={200}
                />
              </div>
              {/* Front  (5) */}
              <div className={`${styles.face} ${styles.front}`}>
                <Image
                  src="/images/7b1a278f5abe8e9da907fc9c29dfd432d60dc76e17b0fabab659d2a508bc65c4.png"
                  alt="6"
                  draggable={false}
                  width={200}
                  height={200}
                />
              </div>
              {/* Back  (6) */}
            </div>
          ) : (
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
                  alt="6"
                  draggable={false}
                  width={200}
                  height={200}
                />
              </div>
              {/* Right  (1) */}
              <div className={`${styles.face} ${styles.right}`}>
                <Image
                  src="/images/two.png"
                  alt="6"
                  draggable={false}
                  width={200}
                  height={200}
                />
              </div>
              {/* Left (2) */}
              <div className={`${styles.face} ${styles.left}`}>
                <Image
                  src="/images/three.png"
                  alt="6"
                  draggable={false}
                  width={200}
                  height={200}
                />
              </div>
              {/* Top  (3) */}
              <div className={`${styles.face} ${styles.top}`}>
                <Image
                  src="/images/four.png"
                  alt="6"
                  draggable={false}
                  width={200}
                  height={200}
                />
              </div>
              {/* Bottom  (4) */}
              <div className={`${styles.face} ${styles.bottom}`}>
                <Image
                  src="/images/five.png"
                  alt="6"
                  draggable={false}
                  width={200}
                  height={200}
                />
              </div>
              {/* Front  (5) */}
              <div className={`${styles.face} ${styles.front}`}>
                <Image
                  src="/images/six.png"
                  alt="6"
                  draggable={false}
                  width={200}
                  height={200}
                />
              </div>
              {/* Back  (6) */}
            </div>
          )}
        </div>
        <button
          className={styles.toggleEaster}
          onClick={() => setFeatureFlag(!featureFlag)}
        >
          {featureFlag ? "Terning" : "???"}
        </button>
      </div>
    );
  },
);

Dice.displayName = "Dice";

export default Dice;
