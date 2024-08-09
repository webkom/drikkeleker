type SongDetailsProps = {
  title: string;
  artist: string;
}

const SongDetails = ({title, artist}: SongDetailsProps) => {
  return (
    <div className="text-center">
      <p>{title}</p>
      <p>{artist}</p>
      <img src="https://www.udiscovermusic.com/wp-content/uploads/2018/07/Elton-John-Honky-Chateau-Album-Cover-web-optimised-820.jpg"/>
    </div>
  );
}

export default SongDetails;
