import { createContext, useContext, useEffect, useState } from "react";
import _songs from "./songs.json";

export type Song = {
  filename: string;
  title: string;
  artist: string;
};
export type Songs = Song[];

const SongsContext = createContext({
  songs: [] as Songs,
  shuffle: () => {},
  isShuffling: false,
});

function _shuffle(arr: any[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const SongsProvider = ({
  initialShuffle = false,
  children,
}: {
  initialShuffle?: boolean;
  children: React.ReactNode;
}) => {
  const [songs, setSongs] = useState(_songs);
  const [isShuffling, setIsShuffling] = useState(initialShuffle);

  const wrappedShuffle = () => {
    setIsShuffling(true);
    setSongs(_shuffle(_songs));
    setIsShuffling(false);
  };

  useEffect(() => {
    if (initialShuffle) wrappedShuffle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SongsContext.Provider
      value={{
        songs,
        shuffle: wrappedShuffle,
        isShuffling,
      }}
    >
      {children}
    </SongsContext.Provider>
  );
};

export const useSongs = () => useContext(SongsContext);

export default SongsProvider;
