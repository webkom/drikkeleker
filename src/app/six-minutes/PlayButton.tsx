import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

interface PlayButtonProps {
  onClick: () => void;
  isPlaying: boolean;
}

const PlayButton = ({ onClick, isPlaying }: PlayButtonProps) => {
  const handleClick = () => {
    onClick();
  };

  return (
    <button
      className="bg-white p-6 rounded-full active:scale-90 transition-transform shadow-md"
      onClick={handleClick}
    >
      {isPlaying ? (
        <Pause fill="rgb(254 215 170)" className="text-orange-200" size={72} />
      ) : (
        <Play fill="rgb(254 215 170)" className="text-orange-200" size={72} />
      )}
    </button>
  );
};

export default PlayButton;
