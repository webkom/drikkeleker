import BeerContainer from "@/components/beer/beer-container";
import { lilita } from "@/lib/fonts";
import SuggestionsForm from "@/components/shared/suggestions-form";
import SnapScroll from "@/components/shared/snap-scroll";
import * as LucideIcons from "lucide-react";
import { ArrowDown } from "lucide-react";
import NavButton from "@/components/ui/nav-button";
import FoamWave from "@/components/foamwave/foamwave";
import Footer from "@/components/shared/footer";
import type { Color } from "@/lib/colors";
import { readFileSync } from "fs";
import { join } from "path";

type GameGroup = "songs" | "games";

type GameEntry = {
  id: string;
  label: string;
  href: string;
  icon: string;
  color: Color;
  group: GameGroup;
  order: number;
  enabled: boolean;
  tag?: string;
  wide?: boolean;
};

const DEFAULT_GAMES: GameEntry[] = [
  {
    id: "lambo",
    label: "Lambo",
    href: "/song/lambo",
    icon: "Beer",
    color: "red",
    group: "songs",
    order: 1,
    enabled: true,
  },
  {
    id: "lay-all-your-love-on-me",
    label: "Lay All Your Love on Me",
    href: "/song/lay-all-your-love-on-me",
    icon: "MicVocal",
    color: "blue",
    group: "songs",
    order: 2,
    enabled: true,
  },
  {
    id: "forever-alone",
    label: "Forever Alone",
    href: "/song/forever-alone",
    icon: "HeartCrack",
    color: "green",
    group: "songs",
    order: 3,
    enabled: true,
  },
  {
    id: "questions",
    label: "100 Spørsmål",
    href: "/questions",
    icon: "MessageCircleQuestion",
    color: "fuchsia",
    group: "games",
    order: 1,
    enabled: true,
  },
  {
    id: "never-have-i",
    label: "Never Have I Ever",
    href: "/never-have-i",
    icon: "ListChecks",
    color: "rose",
    group: "games",
    order: 2,
    enabled: true,
  },
  {
    id: "alias",
    label: "Alias",
    href: "/alias",
    icon: "Tags",
    color: "cyan",
    group: "games",
    order: 3,
    enabled: false,
  },
  {
    id: "wavelength",
    label: "Bølgelengde",
    href: "/wavelength",
    icon: "SlidersHorizontal",
    color: "violet",
    group: "games",
    order: 4,
    enabled: false,
  },
  {
    id: "dice",
    label: "Terningleken",
    href: "/dice",
    icon: "Dice6",
    color: "teal",
    group: "games",
    order: 5,
    enabled: true,
  },
  {
    id: "six-minutes",
    label: "6 Minutes",
    href: "/six-minutes",
    icon: "Timer",
    color: "orange",
    group: "games",
    order: 6,
    enabled: true,
  },
  {
    id: "game-room",
    label: "Viljens Drikkelek",
    href: "/game-room/lobby",
    icon: "ScrollText",
    color: "violet",
    group: "games",
    order: 7,
    enabled: true,
    tag: "Oppe igjen!",
    wide: true,
  },
  {
    id: "beat-for-beat",
    label: "Beat for Beat",
    href: "/beat-for-beat",
    icon: "Swords",
    color: "amber",
    group: "games",
    order: 8,
    enabled: true,
    tag: "Nytt!",
  },
];

type LucideIconComponent = React.ComponentType<{ size?: number }>;

const getGameIcon = (name: string): React.ReactNode => {
  const Icon = (LucideIcons as Record<string, unknown>)[name] as
    | LucideIconComponent
    | undefined;
  return Icon ? <Icon /> : null;
};

const renderGameLabel = (title: string, tag: string) => (
  <span className="flex items-center gap-2">
    <span>{title}</span>
    {tag ? (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
        {tag}
      </span>
    ) : null}
  </span>
);

const loadGamesCatalog = (): GameEntry[] => {
  try {
    const raw = readFileSync(
      join(process.cwd(), "data", "games.json"),
      "utf-8",
    );
    const parsed = JSON.parse(raw) as GameEntry[];
    return Array.isArray(parsed) ? parsed : DEFAULT_GAMES;
  } catch {
    return DEFAULT_GAMES;
  }
};

export default function Home() {
  const gamesCatalog = loadGamesCatalog();
  const songs = gamesCatalog
    .filter((game) => game.group === "songs" && game.enabled)
    .sort((a, b) => a.order - b.order);
  const games = gamesCatalog
    .filter((game) => game.group === "games" && game.enabled)
    .sort((a, b) => a.order - b.order);
  const shouldSpanWide = games.length % 2 === 1;

  return (
    <main className="min-h-dvh overflow-x-hidden">
      <SnapScroll />
      <div className="relative flex flex-col items-center gap-6 p-8 pb-0 text-center min-h-dvh">
        <h1 className={`${lilita.className} text-6xl mt-12 leading-snug`}>
          Drikkeleker 🍻
        </h1>
        <a
          href="#games"
          className="mt-auto flex flex-col items-center gap-4 hover:opacity-70 transition-opacity cursor-pointer"
        >
          <span>Dykk ned for å se Abakus sine sanger og drikkeleker!</span>
          <ArrowDown className="animate-bounce" size={48} />
        </a>
        <FoamWave className="-mb-px w-screen overflow-hidden" />
      </div>
      <div id="games">
        <BeerContainer>
          <h4 className={`${lilita.className} text-gray-800`}>Sanger</h4>
          {songs.map((game) => (
            <NavButton
              key={game.id}
              icon={getGameIcon(game.icon)}
              color={game.color}
              label={renderGameLabel(game.label, game.tag ?? "")}
              href={game.href}
            />
          ))}
          <h4 className={`${lilita.className} pt-6 text-gray-800`}>Leker</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            {games.map((game, index) => {
              const isLast = index === games.length - 1;
              const shouldSpan = Boolean(game.wide && shouldSpanWide && isLast);

              return (
                <div
                  key={game.id}
                  className={shouldSpan ? "sm:col-span-2" : undefined}
                >
                  <NavButton
                    icon={getGameIcon(game.icon)}
                    color={game.color}
                    label={renderGameLabel(game.label, game.tag ?? "")}
                    href={game.href}
                  />
                </div>
              );
            })}
          </div>
          <SuggestionsForm />
          <Footer />
        </BeerContainer>
      </div>
    </main>
  );
}
