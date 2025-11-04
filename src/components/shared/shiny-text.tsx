"use client";

import React from "react";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 5,
  className = "",
}) => {
  const animationDuration = `${speed}s`;

  return (
    <div
      className={`relative inline-block text-transparent bg-clip-text ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(120deg, #b5b5b5a4 0%, #b5b5b5a4 100%)",
        WebkitBackgroundClip: "text",
      }}
    >
      {text}

      {!disabled && (
        <div
          className="absolute inset-0 animate-shine"
          style={{
            backgroundImage:
              "linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            animationDuration: animationDuration, // Apply the speed
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
};

export default ShinyText;
