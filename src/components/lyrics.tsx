import { lilita } from "@/lib/fonts";

interface LyricsProps {
  title: string;
  lyrics: string[][];
}

const Lyrics = ({ title, lyrics }: LyricsProps) => {
  return (
    <div className="pt-12">
      <div className="flex flex-col space-y-8 max-w-2xl text-center">
        <h1 className={`${lilita.className} text-5xl`}>{title}</h1>
        {lyrics.map((verse, i) => (
          <div key={i} className="space-y-2">
            {verse.map((line, j) => (
              <p key={j} className="text-lg">
                {line}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lyrics;
