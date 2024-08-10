import { DRIKKELEK_URL } from "@/types/constants";
import songs from "./songs.json";
import Image from "next/image";

type SongDetailsProps = {
  currentSong: number;
};

const SongDetails = ({ currentSong }: SongDetailsProps) => {
  return (
    <div className="m-auto text-center flex flex-col items-center justify-center gap-3">
      <Image
        src={`${DRIKKELEK_URL}/${songs[currentSong].filename.split(".")[0]}.jpg`}
        alt="Album cover"
        className="rounded-md"
        width={250}
        height={250}
      />
      <h1 className="text-3xl">{songs[currentSong].title}</h1>
      <h2 className="text-xl text-gray-500 font-normal">
        {songs[currentSong].artist}
      </h2>
    </div>
  );
};

export default SongDetails;
