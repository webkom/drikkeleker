import { readFileSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import Lyrics from "@/components/shared/lyrics";
import BackButton from "@/components/shared/back-button";
import Footer from "@/components/shared/footer";
import BeerContainer from "@/components/beer/beer-container";

interface SongData {
  title: string;
  lyrics: string;
}

function parseLine(line: string, key: string): ReactNode {
  const parts: ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let lastIndex = 0;
  let partIndex = 0;
  let match;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      parts.push(<b key={`${key}-${partIndex}`}>{match[1]}</b>);
    } else if (match[2] !== undefined) {
      parts.push(<i key={`${key}-${partIndex}`}>{match[2]}</i>);
    }
    lastIndex = regex.lastIndex;
    partIndex++;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  if (parts.length === 0) return line;
  if (parts.length === 1) return parts[0];
  return <>{parts}</>;
}

function parseLyrics(text: string): ReactNode[][] {
  return text
    .split(/\n\n+/)
    .filter((v) => v.trim())
    .map((verse, vi) =>
      verse
        .split("\n")
        .filter((l) => l.trim())
        .map((line, li) => parseLine(line, `${vi}-${li}`)),
    );
}

export default async function SongPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let songs: Record<string, SongData>;
  try {
    const raw = readFileSync(
      join(process.cwd(), "data", "songs.json"),
      "utf-8",
    );
    songs = JSON.parse(raw) as Record<string, SongData>;
  } catch {
    notFound();
  }

  const song = songs[slug];
  if (!song) notFound();

  const parsedLyrics = parseLyrics(song.lyrics);

  return (
    <main className="overflow-x-hidden">
      <BackButton className="absolute top-4 left-4 z-10" href="/#games" />
      <BeerContainer color="red" className="min-h-dvh">
        <Lyrics title={song.title} lyrics={parsedLyrics} />
        <Footer />
      </BeerContainer>
    </main>
  );
}
