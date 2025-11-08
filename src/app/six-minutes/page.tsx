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
import SixMinutesSwiper from "./SixMinutesSwiper";

const SixMinutes = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(0);
  const [currentPlayTime, setCurrentPlayTime] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  // Needed because a user needs to "click" something to consent to audio being played
  const [initialStart, setInitialStart] = useState(true);

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
      if (initialStart) setInitialStart(false);
      if (!isRunning) {
        start();
      }
    } else {
      audioRef.current.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, isRunning, start]);

  const onPlaying = () => {
    const ct = Math.floor(audioRef.current!.currentTime);
    setCurrentPlayTime(ct);
  };

  useEffect(() => {
    if (!initialStart) setIsPlaying(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong]);

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
      <BeerContainer color="orange" className="px-0">
        <div className="grow text-center pt-12 flex flex-col gap-2">
          <h1 className={`${lilita.className} text-5xl`}>6 Minutes</h1>
          <div className="grow flex flex-col justify-between">
            <div className="grow flex items-center">
              <SixMinutesSwiper
                songs={songs}
                currentIndex={currentSong}
                onNavigate={setCurrentSong}
              />
            </div>
            <div className="flex flex-col gap-5 p-8">
              <ProgressBar value={currentPlayTime} maxValue={20} />
              <div className="flex justify-between">
                <SkipButton.Back
                  onClick={() => {
                    if (currentSong <= 0) return;
                    setCurrentSong((current) => current - 1);
                  }}
                  disabled={currentSong === 0}
                />
                <PlayButton
                  isPlaying={isPlaying}
                  onClick={() => setIsPlaying(!isPlaying)}
                />
                <SkipButton.Forward
                  onClick={() =>
                    setCurrentSong((current) => (current + 1) % songs.length)
                  }
                />
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
