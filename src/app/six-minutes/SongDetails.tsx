type SongDetailsProps = {
  title: string;
  artist: string;
};

const SongDetails = ({ title, artist }: SongDetailsProps) => {
  return (
    <div className="m-auto text-center">
      <h1 className="text-2xl">{title}</h1>
      <h2 className="text-xl">{artist}</h2>
    </div>
  );
};

export default SongDetails;
