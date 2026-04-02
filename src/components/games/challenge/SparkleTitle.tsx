"use client";
import React from "react";
import { SparklesCore } from "@/components/ui/sparkles";
import { lilita } from "@/lib/fonts";

const SparkleTitle = () => {
  return (
    <div className="w-screen relative left-1/2 -translate-x-1/2 flex flex-col items-center justify-center">
      <h1
        className={`md:text-7xl text-5xl lg:text-9xl font-bold text-center text-white relative z-20  ${lilita.className}`}
      >
        Viljens Drikkelek
      </h1>

      <div className="w-full h-full absolute top-0 left-0">
        <div className="absolute top-0 w-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] blur-sm" />
        <div className="absolute top-0 w-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px" />

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] blur-sm" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px" />

        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={30.0}
          particleDensity={50}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />

        <div className="absolute inset-0 w-full h-full bg-transparent [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
      </div>
    </div>
  );
};

export default SparkleTitle;
