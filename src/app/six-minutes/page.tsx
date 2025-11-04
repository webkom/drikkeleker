"use client";

import { useEffect, useRef, useState } from "react";
import BeerContainer from "@/components/beer/beer-container";
import { Button } from "@/components/ui/button";
import ProgressBar from "./ProgressBar";
import SongDetails from "./SongDetails";
import BackButton from "@/components/shared/back-button";
import { useTimer } from "react-timer-hook";
import { DRIKKELEK_URL } from "@/types/constants";
import PlayButton from "@/app/six-minutes/PlayButton";
import Footer from "@/components/shared/footer";
import { lilita } from "@/lib/fonts";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSongs } from "./SongsProvider";
import SkipButton from "./SkipButton";

const SixMinutes = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(0);
  const [currentPlayTime, setCurrentPlayTime] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [animationClass, setAnimationClass] = useState("");

  const { songs, shuffle } = useSongs();

  const endGame = () => {
    audioRef.current!.currentTime = 0;
    setIsGameOver(true);
  };

  const { start, restart, pause, isRunning } = useTimer({
    autoStart: false,
    expiryTimestamp: new Date(Date.now() + 6 * 60 * 1000),
    onExpire: endGame,
  });

  const restartGame = () => {
    restart(new Date(Date.now() + 6 * 60 * 1000));
    pause();
    setIsPlaying(false);
    setIsGameOver(false);
    shuffle();
    setCurrentSong(0);
  };

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
    const ct = Math.floor(audioRef.current!.currentTime);
    setCurrentPlayTime(ct);
  };

  const nextSong = () => {
    setAnimationClass("animate-slide-out");
    setTimeout(() => {
      setIsPlaying(true);
      setCurrentSong((current) => (current + 1) % songs.length);
      setAnimationClass("animate-slide-in");
    }, 200);
  };
  const prevSong = () => {
    if (currentSong === 0) {
      return;
    }
    setAnimationClass("animate-slide-out-reverse");
    setTimeout(() => {
      setIsPlaying(true);
      setCurrentSong((current) => current - 1);
      setAnimationClass("animate-slide-in-reverse");
    }, 200);
  };

  return (
    <main className="overflow-hidden h-screen">
      <audio
        ref={audioRef}
        src={
          isGameOver
            ? "https://www.myinstants.com/media/sounds/alarm_clock.mp3"
            : `${DRIKKELEK_URL}/${songs[currentSong].filename}`
        }
        onTimeUpdate={onPlaying}
        onEnded={() => setIsPlaying(false)}
      />
      <AlertDialog open={isGameOver}>
        <AlertDialogContent>
          <AlertDialogHeader className="text-center">
            <AlertDialogTitle className="text-center">
              🚨 Tiden har gått ut 🚨
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Den gruppen som har tur nå må chugge 🍻
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button className="w-full" onClick={restartGame}>
              Start på nytt
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <BackButton
        href="/#games"
        className="absolute top-4 left-4 z-10 animate-"
      />
      <BeerContainer color="orange">
        <div className="grow text-center pt-12 flex flex-col gap-2">
          <h1 className={`${lilita.className} text-5xl`}>6 Minutes</h1>
          <div className="grow flex flex-col justify-between pt-10 pb-10">
            <div className={animationClass}>
              <SongDetails currentSong={currentSong} />
            </div>
            <div className="flex flex-col gap-5">
              <ProgressBar value={currentPlayTime} maxValue={20} />
              <div className="flex justify-between">
                <SkipButton.Back
                  onClick={prevSong}
                  disabled={currentSong === 0}
                />
                <PlayButton
                  isPlaying={isPlaying}
                  onClick={() => setIsPlaying(!isPlaying)}
                />
                <SkipButton.Forward onClick={nextSong} />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </BeerContainer>
    </main>
  );
};

export default SixMinutes;
