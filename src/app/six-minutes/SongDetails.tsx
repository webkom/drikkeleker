import { DRIKKELEK_URL } from "@/types/constants";
import songs from "./songs.json";
import Image from "next/image";

type SongDetailsProps = {
  currentSong: number;
};

const SongDetails = ({ currentSong }: SongDetailsProps) => {
  return (
    <div className="m-auto text-center flex flex-col items-center justify-center">
      <h1 className="text-2xl">{songs[currentSong].title}</h1>
      <h2 className="text-xl">{songs[currentSong].artist}</h2>
      <Image
        src={`${DRIKKELEK_URL}/${songs[currentSong].filename.split(".")[0]}.jpg`}
        alt="Album cover"
        width={250}
        height={250}
      />
    </div>
  );
};

export default SongDetails;
