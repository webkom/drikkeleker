import { DRIKKELEK_URL } from "@/types/constants";
import songs from "./songs.json";

type SongDetailsProps = {
  currentSong: number;
};

const SongDetails = ({ currentSong }: SongDetailsProps) => {
  return (
    <div className="m-auto text-center flex flex-col items-center justify-center">
      <img
        src={`${DRIKKELEK_URL}/${
          songs[currentSong].filename.split(".")[0]
        }.jpg`}
        alt="Album cover"
        className="rounded-md"
        width={250}
        height={250}
      />
      <h1 className="sm:text-2xl text-xl mt-4">{songs[currentSong].title}</h1>
      <h2 className="sm:text-xl text-lg text-gray-500 font-normal">
        {songs[currentSong].artist}
      </h2>
    </div>
  );
};

export default SongDetails;
