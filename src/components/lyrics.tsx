import { lilita } from "@/lib/fonts";
import BeerContainer from "@/components/beer/beer-container";

interface LyricsProps {
  title: string;
  lyrics: string[][];
}

const Lyrics = ({ title, lyrics }: LyricsProps) => {
  return (
    <div className="w-full overflow-hidden">
      <BeerContainer>
        <div className="w-full h-full flex flex-col space-y-8 max-w-2xl text-center">
          <h1 className={`${lilita.className} text-5xl text-lego-muted`}>
            {title}
          </h1>
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
      </BeerContainer>
    </div>
  );
};

export default Lyrics;
