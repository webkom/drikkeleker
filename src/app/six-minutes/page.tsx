"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactCardFlip from "react-card-flip";
import songs from "./songs.json";
import BeerContainer from "@/components/beer/beer-container";
import { Button } from "@/components/ui/button";
import ProgressBar from "./ProgressBar";
import SongDetails from "./SongDetails";
import BackButton from "@/components/back-button";
import { useTimer } from "react-timer-hook";
import { DRIKKELEK_URL } from "@/types/constants";
import PlayButton from "@/app/six-minutes/PlayButton";
import Footer from "@/components/footer";
import { lilita } from "@/lib/fonts";
import CardFace from "@/app/six-minutes/CardFace";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SixMinutes = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    shuffle(songs);
  }, []);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const [currentSong, setCurrentSong] = useState(0);
  const [currentPlayTime, setCurrentPlayTime] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [animationClass, setAnimationClass] = useState("");

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
    shuffle(songs);
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
      setIsPlaying(false);
      setIsFlipped(false);
      setCurrentSong((current) => (current + 1) % songs.length);
      setAnimationClass("animate-slide-in");
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
      <BackButton href="/" className="absolute top-4 left-4 z-10" />
      <BeerContainer color="orange">
        <div className="text-center pt-12 flex flex-col h-full">
          <h1 className={`${lilita.className} text-5xl`}>6 Minutes</h1>
          <div className="grow flex flex-col justify-center gap-2">
            <ReactCardFlip
              containerClassName={`items-center transition-transform ${animationClass}`}
              isFlipped={isFlipped}
            >
              <CardFace
                songNumber={currentSong + 1}
                onFlip={() => setIsFlipped(true)}
              >
                <div className="my-auto w-full gap-5 flex flex-col items-center justify-between">
                  <PlayButton
                    isPlaying={isPlaying}
                    onClick={() => setIsPlaying(!isPlaying)}
                  />
                </div>
                <ProgressBar value={currentPlayTime} maxValue={20} />
              </CardFace>
              <CardFace
                songNumber={currentSong + 1}
                onFlip={() => setIsFlipped(false)}
              >
                <SongDetails currentSong={currentSong} />
              </CardFace>
            </ReactCardFlip>
            <Button
              className="bg-orange-500 hover:bg-orange-500/90 group"
              onClick={nextSong}
            >
              Neste sang
              <ArrowRight
                size={20}
                className="ml-1 transition-transform group-hover:translate-x-1"
              />
            </Button>
          </div>
        </div>
        <Footer />
      </BeerContainer>
    </main>
  );
};

export default SixMinutes;

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
