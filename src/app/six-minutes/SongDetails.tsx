type SongDetailsProps = {
  title: string;
  artist: string;
}

const SongDetails = ({title, artist}: SongDetailsProps) => {
  return (
    <div className="text-center">
      <p>{title}</p>
      <p>{artist}</p>
    </div>
  );
}

export default SongDetails;
