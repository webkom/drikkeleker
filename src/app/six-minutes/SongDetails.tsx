import { DRIKKELEK_URL } from "@/types/constants";
import { useSongs } from "./SongsProvider";

type SongDetailsProps = {
  currentSong: number;
};

const SongDetails = ({ currentSong }: SongDetailsProps) => {
  const { songs, isShuffling } = useSongs();

  if (isShuffling)
    return (
      <div className="m-auto text-center flex flex-col gap-5 items-center justify-center animate-pulse">
        <span
          className=" bg-orange-400 rounded-md"
          style={{ width: 300, height: 300 }}
        />
        <div className="w-full h-5 bg-orange-400 rounded-full max-w-[360px]"></div>
        <div className="w-full h-5 bg-orange-400 rounded-full max-w-[360px]"></div>
      </div>
    );

  return (
    <div className="m-auto text-center flex flex-col items-center justify-center">
      <img
        src={`${DRIKKELEK_URL}/${
          songs[currentSong].filename.split(".")[0]
        }.jpg`}
        alt="Album cover"
        className="rounded-md"
        width={300}
        height={300}
      />
      <h1 className="sm:text-2xl text-xl mt-4">{songs[currentSong].title}</h1>
      <h2 className="sm:text-xl text-lg text-gray-500 font-normal">
        {songs[currentSong].artist}
      </h2>
    </div>
  );
};

export default SongDetails;
