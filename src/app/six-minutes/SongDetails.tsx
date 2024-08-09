type SongDetailsProps = {
  title: string;
  artist: string;
}

const SongDetails = ({title, artist}: SongDetailsProps) => {
  return (
    <div className="text-center">
      <h1 className="text-2xl">{title}</h1>
      <h2 className="text-xl">{artist}</h2>
      <img className="pt-2 mt-auto" src="https://www.udiscovermusic.com/wp-content/uploads/2018/07/Elton-John-Honky-Chateau-Album-Cover-web-optimised-820.jpg"/>
    </div>
  );
}

export default SongDetails;
