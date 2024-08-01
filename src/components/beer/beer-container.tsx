"use client";
import styles from "./beer.module.css";

interface BeerProps {
  children?: React.ReactNode;
}

const BeerContainer = ({ children }: BeerProps) => {
  return (
    <div className="w-full">
      <div className="bg-amber-200 w-full relative py-24 flex flex-col items-center h-dvh">
        <div className={[styles.bubble, styles.x1].join(" ")}></div>
        <div className={[styles.bubble, styles.x2].join(" ")}></div>
        <div className={[styles.bubble, styles.x3].join(" ")}></div>
        <div className={[styles.bubble, styles.x4].join(" ")}></div>
        <div className={[styles.bubble, styles.x5].join(" ")}></div>
        <div className={[styles.bubble, styles.x6].join(" ")}></div>
        <div className={[styles.bubble, styles.x7].join(" ")}></div>
        <div className={[styles.bubble, styles.x8].join(" ")}></div>
        <div className={[styles.bubble, styles.x9].join(" ")}></div>
        <div className={[styles.bubble, styles.x10].join(" ")}></div>
        <div className={[styles.bubble, styles.x11].join(" ")}></div>
        <div className={[styles.bubble, styles.x12].join(" ")}></div>
        <div className={[styles.bubble, styles.x13].join(" ")}></div>
        <div className={[styles.bubble, styles.x14].join(" ")}></div>
        <div className={[styles.bubble, styles.x15].join(" ")}></div>
        <div className={[styles.bubble, styles.x16].join(" ")}></div>
        <div className={[styles.bubble, styles.x17].join(" ")}></div>
        <div className={[styles.bubble, styles.x18].join(" ")}></div>
        <div className={[styles.bubble, styles.x19].join(" ")}></div>
        <div className={[styles.bubble, styles.x20].join(" ")}></div>
        <div className="p-8 w-full h-full flex flex-col relative space-y-4 max-w-2xl">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BeerContainer;
