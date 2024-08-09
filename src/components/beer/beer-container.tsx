"use client";
import styles from "./beer.module.css";
import { cn } from "@/lib/utils";

interface BeerProps {
  children?: React.ReactNode;
  className?: string;
}

const BeerContainer = ({ children, className }: BeerProps) => {
  return (
    <div className="bg-amber-200 relative py-18 flex flex-col items-center h-full">
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
      <div
        className={cn(
          "p-8 pb-0 w-full flex flex-col relative gap-4 max-w-2xl h-full",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default BeerContainer;
