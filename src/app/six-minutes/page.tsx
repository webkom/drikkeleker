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

function shuffle(array: any[]) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}

const PlayingCard = ({currentSong, children}) => {
  return (
    <Card>
      <CardHeader className="text-center">
        <span className="text-lg">{(currentSong+1)}</span>
      </CardHeader>
      <CardContent className="flex flex-col w-full h-[400px]" >
        {children}
      </CardContent>
    </Card>
  );
}

export default function SixMinutes() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [shuffledSongs, setShuffledSongs] = useState(songs);

  useEffect(() => {
    shuffle(shuffledSongs);
    setShuffledSongs(shuffledSongs);
  }, [shuffledSongs]);

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
          <PlayingCard currentSong={currentSong}>
            <div className="my-auto w-full gap-5 flex flex-col items-center" >
              {isPlaying ? <CirclePause className="text-orange-500" size={125} onClick={() => setIsPlaying(false)} />  : <CirclePlay className="text-orange-500" size={125} onClick={() => setIsPlaying(true) } />}
              <ProgressBar value={currentPlayTime} maxValue={20} />
            </div>
          </PlayingCard>
          <PlayingCard currentSong={currentSong}>
            <SongDetails title={songs[currentSong].title} artist={songs[currentSong].artist} />
          </PlayingCard>
        </ReactCardFlip>
        <Button className="bg-orange-500" onClick={() => setIsFlipped(!isFlipped)} >Snu</Button>
        <Button className="bg-orange-500" onClick={nextSong} >Neste sang</Button>
      </BeerContainer>
    </main>
  );
}
