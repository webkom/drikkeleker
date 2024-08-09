"use client";

import {
  CirclePause,
  CirclePlay,
  Pause,
  Play,
  RefreshCcw,
  RotateCcw,
  SkipForward,
} from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";
import ReactCardFlip from "react-card-flip";
import songs from "./songs.json";
import BeerContainer from "@/components/beer/beer-container";
import { Button } from "@/components/ui/button";
import ProgressBar from "./ProgessBar";
import SongDetails from "./SongDetails";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import BackButton from "@/components/back-button";
import { useTimer } from "react-timer-hook";

const URL = "https://atlasimagesgallery.blob.core.windows.net/drikkelek";

type CardFaceProps = {
  songNumber: number;
  children: ReactNode[] | ReactNode;
};
const CardFace = ({ songNumber, children }: CardFaceProps) => {
  return (
    <Card>
      <CardHeader className="text-center">
        <span className="text-xl">{songNumber}</span>
      </CardHeader>
      <CardContent className="flex flex-col w-full h-[400px]">
        {children}
      </CardContent>
    </Card>
  );
};

export default function SixMinutes() {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    shuffle(songs);
  }, []);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const [currentSong, setCurrentSong] = useState(0);
  const [currentPlayTime, setCurrentPlayTime] = useState(0);

  const { start, isRunning } = useTimer({
    autoStart: false,
    expiryTimestamp: new Date(Date.now() + 20 * 1000),
    onExpire: () => console.warn("onExpire called"),
  });

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play();
      if (!isRunning) {
        start();
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, isRunning, start]);

  const onPlaying = () => {
    const ct = audioRef.current!.currentTime;
    setCurrentPlayTime(ct);
  };

  const nextSong = () => {
    setIsPlaying(false);
    setIsFlipped(false);
    setTimeout(
      () => setCurrentSong((current) => (current + 1) % songs.length),
      300,
    );
  };

  return (
    <main className="w-screen h-screen">
      <audio
        ref={audioRef}
        src={`${URL}/${songs[currentSong].filename}`}
        onTimeUpdate={onPlaying}
        onEnded={() => setIsPlaying(false)}
      />
      <BeerContainer>
        <BackButton href="/" />
        <ReactCardFlip isFlipped={isFlipped}>
          <CardFace songNumber={currentSong + 1}>
            <div className="my-auto w-full gap-5 flex flex-col items-center">
              {isPlaying ? (
                <CirclePause
                  className="text-orange-500"
                  size={125}
                  onClick={() => setIsPlaying(false)}
                />
              ) : (
                <CirclePlay
                  className="text-orange-500"
                  size={125}
                  onClick={() => setIsPlaying(true)}
                />
              )}
              <ProgressBar value={currentPlayTime} maxValue={20} />
            </div>
          </CardFace>
          <CardFace songNumber={currentSong + 1}>
            <SongDetails
              title={songs[currentSong].title}
              artist={songs[currentSong].artist}
            />
          </CardFace>
        </ReactCardFlip>
        <Button
          className="bg-orange-500 hover:bg-orange-500/90 flex gap-1"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <RotateCcw /> Snu
        </Button>
        <Button
          className="bg-orange-500 hover:bg-orange-500/90 flex gap-1"
          onClick={nextSong}
        >
          <SkipForward /> Neste sang
        </Button>
      </BeerContainer>
    </main>
  );
}

function shuffle(array: any[]) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
}
