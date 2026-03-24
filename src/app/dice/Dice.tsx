"use client";

import { forwardRef, useState } from "react";
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
                <img
                  src="/images/7b1a278f5abe8e9da907fc9c29dfd432d60dc76e17b0fabab659d2a508bc65c4.png"
                  alt="6"
                  draggable="false"
                />
              </div>
              {/* Right  (1) */}
              <div className={`${styles.face} ${styles.right}`}>
                <img
                  src="/images/7b1a278f5abe8e9da907fc9c29dfd432d60dc76e17b0fabab659d2a508bc65c4.png"
                  alt="6"
                  draggable="false"
                />
              </div>
              {/* Left (2) */}
              <div className={`${styles.face} ${styles.left}`}>
                <img
                  src="/images/7b1a278f5abe8e9da907fc9c29dfd432d60dc76e17b0fabab659d2a508bc65c4.png"
                  alt="6"
                  draggable="false"
                />
              </div>
              {/* Top  (3) */}
              <div className={`${styles.face} ${styles.top}`}>
                <img
                  src="/images/7b1a278f5abe8e9da907fc9c29dfd432d60dc76e17b0fabab659d2a508bc65c4.png"
                  alt="6"
                  draggable="false"
                />
              </div>
              {/* Bottom  (4) */}
              <div className={`${styles.face} ${styles.bottom}`}>
                <img
                  src="/images/7b1a278f5abe8e9da907fc9c29dfd432d60dc76e17b0fabab659d2a508bc65c4.png"
                  alt="6"
                  draggable="false"
                />
              </div>
              {/* Front  (5) */}
              <div className={`${styles.face} ${styles.front}`}>
                <img
                  src="/images/7b1a278f5abe8e9da907fc9c29dfd432d60dc76e17b0fabab659d2a508bc65c4.png"
                  alt="6"
                  draggable="false"
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
                <img src="/images/one.png" alt="6" draggable="false" />
              </div>
              {/* Right  (1) */}
              <div className={`${styles.face} ${styles.right}`}>
                <img src="/images/two.png" alt="6" draggable="false" />
              </div>
              {/* Left (2) */}
              <div className={`${styles.face} ${styles.left}`}>
                <img src="/images/three.png" alt="6" draggable="false" />
              </div>
              {/* Top  (3) */}
              <div className={`${styles.face} ${styles.top}`}>
                <img src="/images/four.png" alt="6" draggable="false" />
              </div>
              {/* Bottom  (4) */}
              <div className={`${styles.face} ${styles.bottom}`}>
                <img src="/images/five.png" alt="6" draggable="false" />
              </div>
              {/* Front  (5) */}
              <div className={`${styles.face} ${styles.front}`}>
                <img src="/images/six.png" alt="6" draggable="false" />
              </div>
              {/* Back  (6) */}
            </div>
          )}
        </div>
        <button
          className={styles.toggleEaster}
          onClick={() => setFeatureFlag(!featureFlag)}
        >
          Vis {featureFlag ? "Terning" : "noe spennende"}
        </button>
      </div>
    );
  },
);

Dice.displayName = "Dice";

export default Dice;
