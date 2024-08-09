"use client";

import { CirclePause, CirclePlay, Pause, Play, SkipForward } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactCardFlip from "react-card-flip";
import songs from './songs.json';
import BeerContainer from "@/components/beer/beer-container";
import { Button } from "@/components/ui/button";
import ProgressBar from "./ProgessBar";
import SongDetails from "./SongDetails";

const URL = "https://atlasimagesgallery.blob.core.windows.net/drikkelek";

const Card = ({children}) => {
  return (
    <div className="flex flex-col items-center bg-white h-[500px]">
      {children}
    </div>
  )
}

export default function SixMinutes() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const [currentSong, setCurrentSong] = useState(0);
  const [currentPlayTime, setCurrentPlayTime] = useState(0);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play();
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
      <audio ref={audioRef} src={`${URL}/${songs[currentSong].filename}`} onTimeUpdate={onPlaying} />
      <BeerContainer>
        <ReactCardFlip isFlipped={isFlipped}>
          <Card>
            {(currentSong+1)}
            {isPlaying ? <CirclePause size={100} onClick={() => setIsPlaying(false)} />  : <CirclePlay size={100} onClick={() => setIsPlaying(true) } />}
            <ProgressBar value={currentPlayTime} maxValue={20} />
          </Card>
          <Card>
            {(currentSong+1)}
            <SongDetails title={songs[currentSong].title} artist={songs[currentSong].artist} />
          </Card>
        </ReactCardFlip>
        <Button onClick={() => setIsFlipped(!isFlipped)} >Snu</Button>
        <Button onClick={nextSong}><SkipForward/> Skip</Button>
      </BeerContainer>
    </main>
  );
}
