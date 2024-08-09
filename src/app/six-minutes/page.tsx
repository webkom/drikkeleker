"use client";

import { CirclePause, CirclePlay, Pause, Play, RefreshCcw, SkipForward } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactCardFlip from "react-card-flip";
import songs from './songs.json';
import BeerContainer from "@/components/beer/beer-container";
import { Button } from "@/components/ui/button";
import ProgressBar from "./ProgessBar";
import SongDetails from "./SongDetails";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import BackButton from "@/components/back-button";
import { useTimer } from "react-timer-hook";

const URL = "https://atlasimagesgallery.blob.core.windows.net/drikkelek";

export default function SixMinutes() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const [currentSong, setCurrentSong] = useState(0);
  const [currentPlayTime, setCurrentPlayTime] = useState(0);

  const { start, isRunning } = useTimer({ autoStart: false, expiryTimestamp: new Date(Date.now() + 20*1000)
, onExpire: () => console.warn('onExpire called')})

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play();
      if (!isRunning) {
        start();
      }
    }
    else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const onPlaying = () => {
    const ct = audioRef.current!.currentTime;
    setCurrentPlayTime(ct);
  }

  const nextSong = () => {
    setCurrentSong(current => (current + 1) % songs.length);
    setIsPlaying(false);
    setIsFlipped(false);
  }

  return (
    <main className="w-screen h-screen" >
      <audio ref={audioRef} src={`${URL}/${songs[currentSong].filename}`} onTimeUpdate={onPlaying} onEnded={() => setIsPlaying(false)}/>
      <BeerContainer>
        <BackButton href="/"/>
        <ReactCardFlip isFlipped={isFlipped}>
          <Card className="flex flex-col items-center h-100" >
            <CardHeader>
            {(currentSong+1)}
            </CardHeader>
            <div className="flex flex-col gap-5">
              {isPlaying ? <CirclePause className="text-orange-500" size={125} onClick={() => setIsPlaying(false)} />  : <CirclePlay className="text-orange-500" size={125} onClick={() => setIsPlaying(true) } />}
              <ProgressBar value={currentPlayTime} maxValue={20} />
            </div>
          </Card>
          <Card className="flex flex-col items-center" >
            {(currentSong+1)}
            <SongDetails title={songs[currentSong].title} artist={songs[currentSong].artist} />
          </Card>
        </ReactCardFlip>
        <Button className="bg-orange-500" onClick={() => setIsFlipped(!isFlipped)} >Snu</Button>
        <Button className="bg-orange-500" onClick={nextSong} >Neste sang</Button>
      </BeerContainer>
    </main>
  );
}
