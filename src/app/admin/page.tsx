"use client";

import { useEffect, useState, useCallback } from "react";
import type { WavelengthCard } from "@/types/wavelength";
import { lilita } from "@/lib/fonts";
import type { Suggestion } from "@/lib/firebaseSuggestions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  LogIn,
  ChevronUp,
  ChevronDown,
  Check,
  X,
  Loader2,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import Link from "next/link";

type Tab =
  | "questions"
  | "never-have-i"
  | "songs"
  | "alias"
  | "wavelength"
  | "suggestions"
  | "frontpage"
  | "beat-for-beat";
type NhiCategory = "mild" | "hot" | "spicy" | "abakus";
type GameGroup = "songs" | "games";

interface NeverHaveIData {
  mild: string[];
  hot: string[];
  spicy: string[];
  abakus: string[];
}

interface SongsData {
  [key: string]: { title: string; lyrics: string };
}

interface AliasData {
  words: string[];
}

interface BeatSong {
  id: string;
  title: string;
  phrase: string;
  spotifyTrackId?: string;
}

interface GameEntry {
  id: string;
  label: string;
  href: string;
  icon: string;
  color: string;
  group: GameGroup;
  order: number;
  enabled: boolean;
  tag?: string;
  wide?: boolean;
}

type SaveStatus = {
  state: "idle" | "saving" | "success" | "error";
  message?: string;
};

const CATEGORY_LABELS: Record<NhiCategory, string> = {
  mild: "🟢 Mild",
  hot: "🟠 Hot",
  spicy: "🔴 Spicy",
  abakus: "🟣 Abakus",
};

const TABS: { key: Tab; label: string }[] = [
  { key: "questions", label: "100 Spørsmål" },
  { key: "never-have-i", label: "Never Have I" },
  { key: "songs", label: "Sanger" },
  { key: "alias", label: "Alias" },
  { key: "beat-for-beat", label: "Beat for Beat" },
  { key: "wavelength", label: "Bølgelengde" },
  { key: "suggestions", label: "Forslag" },
  { key: "frontpage", label: "Forside" },
];

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

const GROUP_LABELS: Record<GameGroup, string> = {
  songs: "Sanger",
  games: "Leker",
};

type LucideIconComponent = React.ComponentType<{ size?: number }>;

const getAdminIcon = (name: string): React.ReactNode => {
  const Icon = (LucideIcons as Record<string, unknown>)[name] as
    | LucideIconComponent
    | undefined;
  return Icon ? <Icon size={16} /> : null;
};

const STATUS_LABELS: Record<SaveStatus["state"], string> = {
  idle: "",
  saving: "Lagrer...",
  success: "Lagret!",
  error: "Feil ved lagring",
};

const renderStatus = (status: SaveStatus) => {
  if (status.state === "idle") return null;
  const message = status.message ?? STATUS_LABELS[status.state];
  const iconClass = "shrink-0";

  return (
    <span className="text-sm text-green-600 flex items-center gap-1">
      {status.state === "saving" && (
        <Loader2 size={14} className={`${iconClass} animate-spin`} />
      )}
      {status.state === "success" && <Check size={14} className={iconClass} />}
      {status.state === "error" && (
        <X size={14} className={`text-red-500 ${iconClass}`} />
      )}
      <span className={status.state === "error" ? "text-red-500" : undefined}>
        {message}
      </span>
    </span>
  );
};

const hasChanges = <T,>(current: T, original: T) =>
  JSON.stringify(current) !== JSON.stringify(original);

const normalizeWavelengthCards = (data: unknown): WavelengthCard[] => {
  if (!Array.isArray(data)) return [];

  return data.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];

    const card = item as Record<string, unknown>;
    const leftLabel =
      typeof card.leftLabel === "string"
        ? card.leftLabel
        : typeof card.left === "string"
          ? card.left
          : "";
    const rightLabel =
      typeof card.rightLabel === "string"
        ? card.rightLabel
        : typeof card.right === "string"
          ? card.right
          : "";
    const word = typeof card.word === "string" ? card.word : "";

    return [
      {
        id:
          typeof card.id === "string" && card.id.length > 0
            ? card.id
            : `wavelength-${index + 1}`,
        leftLabel,
        rightLabel,
        word,
        category:
          typeof card.category === "string" && card.category.length > 0
            ? card.category
            : undefined,
      },
    ];
  });
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [tab, setTab] = useState<Tab>("questions");

  const [questions, setQuestions] = useState<string[]>([]);
  const [questionsSnapshot, setQuestionsSnapshot] = useState<string[]>([]);
  const [questionsStatus, setQuestionsStatus] = useState<SaveStatus>({
    state: "idle",
  });

  const [nhiData, setNhiData] = useState<NeverHaveIData>({
    mild: [],
    hot: [],
    spicy: [],
    abakus: [],
  });
  const [nhiCategory, setNhiCategory] = useState<NhiCategory>("mild");
  const [nhiSnapshot, setNhiSnapshot] = useState<NeverHaveIData>({
    mild: [],
    hot: [],
    spicy: [],
    abakus: [],
  });
  const [nhiStatus, setNhiStatus] = useState<SaveStatus>({ state: "idle" });

  const [songsData, setSongsData] = useState<SongsData>({});
  const [activeSong, setActiveSong] = useState<string>("lambo");
  const [songsSnapshot, setSongsSnapshot] = useState<SongsData>({});
  const [newSongTitle, setNewSongTitle] = useState<string | null>(null);
  const [songsStatus, setSongsStatus] = useState<SaveStatus>({
    state: "idle",
  });

  const [aliasData, setAliasData] = useState<AliasData>({ words: [] });
  const [aliasSnapshot, setAliasSnapshot] = useState<AliasData>({ words: [] });
  const [aliasInput, setAliasInput] = useState("");
  const [aliasStatus, setAliasStatus] = useState<SaveStatus>({
    state: "idle",
  });

  const [beatData, setBeatData] = useState<BeatSong[]>([]);
  const [beatSnapshot, setBeatSnapshot] = useState<BeatSong[]>([]);
  const [beatStatus, setBeatStatus] = useState<SaveStatus>({
    state: "idle",
  });

  const [wavelengthData, setWavelengthData] = useState<WavelengthCard[]>([]);
  const [wavelengthSnapshot, setWavelengthSnapshot] = useState<
    WavelengthCard[]
  >([]);
  const [wavelengthStatus, setWavelengthStatus] = useState<SaveStatus>({
    state: "idle",
  });

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionsStatus, setSuggestionsStatus] = useState<SaveStatus>({
    state: "idle",
  });

  const [gamesData, setGamesData] = useState<GameEntry[]>(DEFAULT_GAMES);
  const [gamesSnapshot, setGamesSnapshot] =
    useState<GameEntry[]>(DEFAULT_GAMES);
  const [gamesStatus, setGamesStatus] = useState<SaveStatus>({
    state: "idle",
  });

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_pw");
    if (stored) {
      setPassword(stored);
      setAuthenticated(true);
    }
  }, []);

  const loadData = useCallback(async () => {
    const [q, nhi, songs, alias, wavelength, sug, games, beat] =
      await Promise.all([
        fetch("/api/admin/data?game=questions").then((r) => r.json()),
        fetch("/api/admin/data?game=never-have-i").then((r) => r.json()),
        fetch("/api/admin/data?game=songs").then((r) => r.json()),
        fetch("/api/admin/data?game=alias").then((r) => r.json()),
        fetch("/api/admin/data?game=wavelength").then((r) => r.json()),
        fetch("/api/admin/suggestions").then((r) => r.json()),
        fetch("/api/admin/data?game=games").then((r) => r.json()),
        fetch("/api/admin/data?game=beat-for-beat").then((r) => r.json()),
      ]);
    if (Array.isArray(q)) {
      setQuestions(q);
      setQuestionsSnapshot(q);
    }
    if (nhi && typeof nhi === "object" && !Array.isArray(nhi)) {
      setNhiData(nhi);
      setNhiSnapshot(nhi);
    }
    if (songs && typeof songs === "object" && !Array.isArray(songs)) {
      setSongsData(songs);
      setSongsSnapshot(songs);
    }
    if (alias?.words && Array.isArray(alias.words)) {
      setAliasData(alias);
      setAliasSnapshot(alias);
      setAliasInput(alias.words.join("\n"));
    }
    if (Array.isArray(beat)) {
      setBeatData(beat);
      setBeatSnapshot(beat);
    }
    const normalizedWavelength = normalizeWavelengthCards(wavelength);
    setWavelengthData(normalizedWavelength);
    setWavelengthSnapshot(normalizedWavelength);
    setSuggestions(sug);
    if (Array.isArray(games)) {
      setGamesData(games);
      setGamesSnapshot(games);
    }
  }, []);

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, game: "questions", data: null }),
      });
      if (res.status === 401) {
        setAuthError("Feil passord");
        return;
      }
      sessionStorage.setItem("admin_pw", password);
      setAuthenticated(true);
      setAuthError("");
      await loadData();
    } catch {
      setAuthError("Noe gikk galt");
    }
  };

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated, loadData]);

  const save = async (
    game: string,
    data: unknown,
    setStatus: (s: SaveStatus) => void,
  ) => {
    setStatus({ state: "saving" });
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, game, data }),
      });
      setStatus({ state: res.ok ? "success" : "error" });
      setTimeout(() => setStatus({ state: "idle" }), 3000);
      return res.ok;
    } catch {
      setStatus({ state: "error" });
      setTimeout(() => setStatus({ state: "idle" }), 3000);
      return false;
    }
  };

  const isQuestionsDirty = hasChanges(questions, questionsSnapshot);
  const isNhiDirty = hasChanges(nhiData, nhiSnapshot);
  const isSongsDirty = hasChanges(songsData, songsSnapshot);
  const isAliasDirty =
    hasChanges(aliasData, aliasSnapshot) ||
    aliasInput !== aliasSnapshot.words.join("\n");
  const isBeatDirty = hasChanges(beatData, beatSnapshot);
  const isWavelengthDirty = hasChanges(wavelengthData, wavelengthSnapshot);
  const isGamesDirty = hasChanges(gamesData, gamesSnapshot);

  const getGroupGames = (group: GameGroup) =>
    gamesData
      .filter((game) => game.group === group)
      .sort((a, b) => a.order - b.order);

  const moveGame = (group: GameGroup, index: number, direction: -1 | 1) => {
    setGamesData((prev) => {
      const groupGames = prev
        .filter((game) => game.group === group)
        .sort((a, b) => a.order - b.order);
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= groupGames.length) return prev;

      const current = groupGames[index];
      const target = groupGames[targetIndex];

      return prev.map((game) => {
        if (game.id === current.id) {
          return { ...game, order: target.order };
        }
        if (game.id === target.id) {
          return { ...game, order: current.order };
        }
        return game;
      });
    });
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm flex flex-col gap-6">
          <h1 className={`${lilita.className} text-3xl text-center`}>Admin</h1>
          <div className="flex flex-col gap-3">
            <Input
              type="password"
              placeholder="Passord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <Button onClick={handleLogin} className="w-full gap-2">
              <LogIn size={16} /> Logg inn
            </Button>
          </div>
          <Link
            href="/"
            className="text-center text-sm text-gray-500 underline"
          >
            Tilbake til forsiden
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-3xl mx-auto p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className={`${lilita.className} text-4xl`}>Admin</h1>
          <Link href="/" className="text-sm text-gray-500 underline">
            Tilbake til forsiden
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-white rounded-xl p-1 shadow-sm">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 min-w-fit py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-amber-400 text-white shadow"
                  : "text-gray-600 hover:bg-amber-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── 100 Spørsmål ── */}
        {tab === "questions" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                100 Spørsmål ({questions.length})
              </h2>
              <div className="flex gap-2 items-center">
                {renderStatus(questionsStatus)}
                <Button
                  size="sm"
                  variant={isQuestionsDirty ? "default" : "outline"}
                  disabled={!isQuestionsDirty}
                  onClick={async () => {
                    const ok = await save(
                      "questions",
                      questions,
                      setQuestionsStatus,
                    );
                    if (ok) setQuestionsSnapshot(questions);
                  }}
                >
                  Lagre
                </Button>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="self-start gap-1"
              onClick={() => setQuestions([...questions, ""])}
            >
              <Plus size={14} /> Legg til spørsmål
            </Button>
            <div className="flex flex-col gap-2">
              {questions.map((q, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => {
                        if (i === 0) return;
                        const next = [...questions];
                        [next[i - 1], next[i]] = [next[i], next[i - 1]];
                        setQuestions(next);
                      }}
                      disabled={i === 0}
                      className="text-gray-400 hover:text-gray-700 disabled:opacity-20"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (i === questions.length - 1) return;
                        const next = [...questions];
                        [next[i], next[i + 1]] = [next[i + 1], next[i]];
                        setQuestions(next);
                      }}
                      disabled={i === questions.length - 1}
                      className="text-gray-400 hover:text-gray-700 disabled:opacity-20"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <span className="text-xs text-gray-400 w-6 text-right">
                    {i + 1}
                  </span>
                  <Input
                    value={q}
                    onChange={(e) => {
                      const next = [...questions];
                      next[i] = e.target.value;
                      setQuestions(next);
                    }}
                    className="flex-1 bg-white"
                  />
                  <button
                    onClick={() =>
                      setQuestions(questions.filter((_, j) => j !== i))
                    }
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Never Have I Ever ── */}
        {tab === "never-have-i" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Never Have I Ever</h2>
              <div className="flex gap-2 items-center">
                {renderStatus(nhiStatus)}
                <Button
                  size="sm"
                  variant={isNhiDirty ? "default" : "outline"}
                  disabled={!isNhiDirty}
                  onClick={async () => {
                    const ok = await save(
                      "never-have-i",
                      nhiData,
                      setNhiStatus,
                    );
                    if (ok) setNhiSnapshot(nhiData);
                  }}
                >
                  Lagre alle
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              {(Object.keys(CATEGORY_LABELS) as NhiCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setNhiCategory(cat)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${nhiCategory === cat ? "bg-amber-400 text-white shadow" : "bg-white text-gray-600 hover:bg-amber-50"}`}
                >
                  {CATEGORY_LABELS[cat]} ({nhiData[cat]?.length ?? 0})
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="self-start gap-1"
              onClick={() =>
                setNhiData({
                  ...nhiData,
                  [nhiCategory]: [...(nhiData[nhiCategory] || []), ""],
                })
              }
            >
              <Plus size={14} /> Legg til
            </Button>
            <div className="flex flex-col gap-2">
              {(nhiData[nhiCategory] || []).map((q, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-xs text-gray-400 w-6 text-right">
                    {i + 1}
                  </span>
                  <Input
                    value={q}
                    onChange={(e) => {
                      const updated = [...nhiData[nhiCategory]];
                      updated[i] = e.target.value;
                      setNhiData({ ...nhiData, [nhiCategory]: updated });
                    }}
                    className="flex-1 bg-white"
                  />
                  <button
                    onClick={() =>
                      setNhiData({
                        ...nhiData,
                        [nhiCategory]: nhiData[nhiCategory].filter(
                          (_, j) => j !== i,
                        ),
                      })
                    }
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Sanger ── */}
        {tab === "songs" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Sanger ({Object.keys(songsData).length})
              </h2>
              <div className="flex gap-2 items-center">
                {renderStatus(songsStatus)}
                <Button
                  size="sm"
                  variant={isSongsDirty ? "default" : "outline"}
                  disabled={!isSongsDirty}
                  onClick={async () => {
                    const [ok1, ok2] = await Promise.all([
                      save("songs", songsData, setSongsStatus),
                      save("games", gamesData, setGamesStatus),
                    ]);
                    if (ok1) setSongsSnapshot(songsData);
                    if (ok2) setGamesSnapshot(gamesData);
                  }}
                >
                  Lagre alle
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {Object.keys(songsData).map((key) => (
                <div key={key} className="flex items-center gap-0.5">
                  <button
                    onClick={() => setActiveSong(key)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${activeSong === key ? "bg-amber-400 text-white shadow" : "bg-white text-gray-600 hover:bg-amber-50"}`}
                  >
                    {songsData[key]?.title || key}
                  </button>
                  <button
                    onClick={() => {
                      const next = { ...songsData };
                      delete next[key];
                      setSongsData(next);
                      setGamesData((prev) => prev.filter((g) => g.id !== key));
                      if (activeSong === key) {
                        const remaining = Object.keys(next);
                        setActiveSong(remaining[0] ?? "");
                      }
                    }}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                    title="Slett sang"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {newSongTitle === null ? (
                <button
                  onClick={() => setNewSongTitle("")}
                  className="flex items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-medium bg-white text-gray-600 hover:bg-amber-50 border border-dashed border-gray-300 transition-colors"
                >
                  <Plus size={12} /> Ny sang
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <Input
                    autoFocus
                    placeholder="Sangnavn"
                    value={newSongTitle}
                    onChange={(e) => setNewSongTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setNewSongTitle(null);
                      if (e.key === "Enter" && newSongTitle.trim()) {
                        const title = newSongTitle.trim();
                        let slug = title
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                          .replace(/[^a-z0-9-]/g, "");
                        let counter = 1;
                        while (songsData[slug]) {
                          slug = `${slug}-${counter++}`;
                        }
                        setSongsData((prev) => ({
                          ...prev,
                          [slug]: { title, lyrics: "" },
                        }));
                        setGamesData((prev) => [
                          ...prev,
                          {
                            id: slug,
                            label: title,
                            href: `/song/${slug}`,
                            icon: "MicVocal",
                            color: "amber",
                            group: "songs" as const,
                            order:
                              prev.filter((g) => g.group === "songs").length +
                              1,
                            enabled: true,
                          },
                        ]);
                        setActiveSong(slug);
                        setNewSongTitle(null);
                      }
                    }}
                    className="h-7 text-xs w-36 bg-white"
                  />
                  <button
                    onClick={() => {
                      if (!newSongTitle.trim()) {
                        setNewSongTitle(null);
                        return;
                      }
                      const title = newSongTitle.trim();
                      let slug = title
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, "");
                      let counter = 1;
                      while (songsData[slug]) {
                        slug = `${slug}-${counter++}`;
                      }
                      setSongsData((prev) => ({
                        ...prev,
                        [slug]: { title, lyrics: "" },
                      }));
                      setGamesData((prev) => [
                        ...prev,
                        {
                          id: slug,
                          label: title,
                          href: `/song/${slug}`,
                          icon: "MicVocal",
                          color: "amber",
                          group: "songs" as const,
                          order:
                            prev.filter((g) => g.group === "songs").length + 1,
                          enabled: true,
                        },
                      ]);
                      setActiveSong(slug);
                      setNewSongTitle(null);
                    }}
                    className="text-green-500 hover:text-green-700"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => setNewSongTitle(null)}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
            {activeSong && songsData[activeSong] !== undefined && (
              <div className="bg-white rounded-xl p-4 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 font-medium">
                    Tittel
                  </label>
                  <Input
                    value={songsData[activeSong]?.title ?? ""}
                    onChange={(e) =>
                      setSongsData({
                        ...songsData,
                        [activeSong]: {
                          ...songsData[activeSong],
                          title: e.target.value,
                        },
                      })
                    }
                    className="bg-gray-50"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 font-medium">
                    Ikon (Lucide-navn)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 shrink-0">
                      {getAdminIcon(
                        gamesData.find((g) => g.id === activeSong)?.icon ?? "",
                      )}
                    </span>
                    <Input
                      value={
                        gamesData.find((g) => g.id === activeSong)?.icon ?? ""
                      }
                      onChange={(e) =>
                        setGamesData((prev) =>
                          prev.map((g) =>
                            g.id === activeSong
                              ? { ...g, icon: e.target.value }
                              : g,
                          ),
                        )
                      }
                      placeholder="f.eks. MicVocal, Guitar, Music"
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  <strong>Format:</strong>{" "}
                  <code className="bg-gray-100 px-1 rounded">**tekst**</code> =
                  fet skrift (sangtittel/gruppe),{" "}
                  <code className="bg-gray-100 px-1 rounded">*tekst*</code> =
                  kursiv (sceneanvisning). Tom linje = nytt vers.
                </p>
                <textarea
                  value={songsData[activeSong]?.lyrics ?? ""}
                  onChange={(e) =>
                    setSongsData({
                      ...songsData,
                      [activeSong]: {
                        ...songsData[activeSong],
                        lyrics: e.target.value,
                      },
                    })
                  }
                  className="w-full h-[500px] font-mono text-sm border rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-amber-400"
                  spellCheck={false}
                />
                <p className="text-xs text-gray-400">
                  URL:{" "}
                  <code className="bg-gray-100 px-1 rounded">
                    /song/{activeSong}
                  </code>
                </p>
              </div>
            )}
            {(!activeSong || songsData[activeSong] === undefined) &&
              Object.keys(songsData).length === 0 && (
                <p className="text-sm text-gray-500">
                  Ingen sanger enda. Klikk &quot;Ny sang&quot; for å legge til.
                </p>
              )}
          </div>
        )}

        {/* ── Alias ── */}
        {tab === "alias" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Alias ({aliasData.words.length} ord)
              </h2>
              <div className="flex gap-2 items-center">
                {renderStatus(aliasStatus)}
                <Button
                  size="sm"
                  variant={isAliasDirty ? "default" : "outline"}
                  disabled={!isAliasDirty}
                  onClick={async () => {
                    const words = aliasInput
                      .split("\n")
                      .map((w) => w.trim())
                      .filter((w) => w.length > 0);
                    const newData = { words };
                    const ok = await save("alias", newData, setAliasStatus);
                    if (ok) {
                      setAliasSnapshot(newData);
                      setAliasData(newData);
                      setAliasInput(words.join("\n"));
                    }
                  }}
                >
                  Lagre
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Legg til ord som spillerne skal beskrive. Skriv ett ord per linje.
            </p>
            <div className="flex flex-col gap-2">
              <Textarea
                value={aliasInput}
                onChange={(e) => setAliasInput(e.target.value)}
                placeholder="Skriv inn ord her..."
                className="min-h-[400px] bg-white font-medium leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* ── Forslag ── */}
        {tab === "suggestions" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Forslag ({suggestions.length})
              </h2>
              <div className="flex gap-2 items-center">
                {renderStatus(suggestionsStatus)}
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-1"
                  disabled={suggestions.length === 0}
                  onClick={async () => {
                    setSuggestionsStatus({
                      state: "saving",
                      message: "Sletter...",
                    });
                    await fetch("/api/admin/suggestions", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ password }),
                    });
                    setSuggestions([]);
                    setSuggestionsStatus({
                      state: "success",
                      message: "Slettet!",
                    });
                    setTimeout(
                      () => setSuggestionsStatus({ state: "idle" }),
                      3000,
                    );
                  }}
                >
                  <Trash2 size={14} /> Slett alle
                </Button>
              </div>
            </div>
            {suggestions.length === 0 ? (
              <p className="text-gray-500 text-sm">Ingen forslag enda.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {suggestions.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white rounded-xl p-4 shadow-sm flex gap-3 items-start"
                  >
                    <div className="flex-1 flex flex-col gap-1">
                      <p className="text-sm text-gray-800">{s.text}</p>
                      <p className="text-xs text-gray-400">
                        {s.name ? `${s.name} · ` : ""}
                        {new Date(s.submittedAt).toLocaleString("no-NO")}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        await fetch("/api/admin/suggestions", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ password, id: s.id }),
                        });
                        setSuggestions((prev) =>
                          prev.filter((x) => x.id !== s.id),
                        );
                      }}
                      className="text-red-400 hover:text-red-600 shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Beat for Beat ── */}
        {tab === "beat-for-beat" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Beat for Beat ({beatData.length} sanger)
              </h2>
              <div className="flex gap-2 items-center">
                {renderStatus(beatStatus)}
                <Button
                  size="sm"
                  variant={isBeatDirty ? "default" : "outline"}
                  disabled={!isBeatDirty}
                  onClick={async () => {
                    const ok = await save(
                      "beat-for-beat",
                      beatData,
                      setBeatStatus,
                    );
                    if (ok) setBeatSnapshot(beatData);
                  }}
                >
                  Lagre
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Legg til sanger, fraser og Spotify-track-ID (valgfritt).
            </p>
            <Button
              variant="outline"
              size="sm"
              className="self-start gap-1"
              onClick={() =>
                setBeatData([
                  ...beatData,
                  { id: `beat-${Date.now()}`, title: "", phrase: "" },
                ])
              }
            >
              <Plus size={14} /> Legg til sang
            </Button>
            <div className="flex flex-col gap-3">
              {beatData.map((song, i) => (
                <div
                  key={song.id}
                  className="flex gap-2 items-center bg-white rounded-xl p-3 shadow-sm"
                >
                  <span className="text-xs text-gray-400 w-6 text-right">
                    {i + 1}
                  </span>
                  <div className="grid flex-1 grid-cols-1 gap-2 md:grid-cols-2">
                    <Input
                      placeholder="Artist - Tittel"
                      value={song.title}
                      onChange={(e) => {
                        const next = [...beatData];
                        next[i] = { ...next[i], title: e.target.value };
                        setBeatData(next);
                      }}
                      className="bg-gray-50"
                    />
                    <Input
                      placeholder="Spotify Track ID (f.eks. 25sn3...)"
                      value={song.spotifyTrackId ?? ""}
                      onChange={(e) => {
                        const next = [...beatData];
                        next[i] = {
                          ...next[i],
                          spotifyTrackId: e.target.value,
                        };
                        setBeatData(next);
                      }}
                      className="bg-gray-50"
                    />
                    <Input
                      placeholder="Frase som skal gjettes"
                      value={song.phrase}
                      onChange={(e) => {
                        const next = [...beatData];
                        next[i] = { ...next[i], phrase: e.target.value };
                        setBeatData(next);
                      }}
                      className="bg-gray-50 md:col-span-2"
                    />
                  </div>
                  <button
                    onClick={() =>
                      setBeatData(beatData.filter((_, j) => j !== i))
                    }
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Bølgelengde ── */}
        {tab === "wavelength" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Bølgelengde ({wavelengthData.length} kort)
              </h2>
              <div className="flex gap-2 items-center">
                {renderStatus(wavelengthStatus)}
                <Button
                  size="sm"
                  variant={isWavelengthDirty ? "default" : "outline"}
                  disabled={!isWavelengthDirty}
                  onClick={async () => {
                    const ok = await save(
                      "wavelength",
                      wavelengthData,
                      setWavelengthStatus,
                    );
                    if (ok) setWavelengthSnapshot(wavelengthData);
                  }}
                >
                  Lagre
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Hvert kort trenger en venstre side, en høyre side og et ord eller
              scenario som skal plasseres på skalaen.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="self-start gap-1"
              onClick={() =>
                setWavelengthData([
                  ...wavelengthData,
                  {
                    id: `wavelength-${Date.now()}`,
                    leftLabel: "",
                    rightLabel: "",
                    word: "",
                    category: "",
                  },
                ])
              }
            >
              <Plus size={14} /> Legg til kort
            </Button>
            <div className="flex flex-col gap-3">
              {wavelengthData.map((card, i) => (
                <div
                  key={card.id}
                  className="flex gap-2 items-center bg-white rounded-xl p-3 shadow-sm"
                >
                  <span className="text-xs text-gray-400 w-6 text-right">
                    {i + 1}
                  </span>
                  <div className="grid flex-1 grid-cols-1 gap-2 md:grid-cols-[1fr_auto_1fr]">
                    <Input
                      placeholder="Venstre side (f.eks. Uskyldig)"
                      value={card.leftLabel}
                      onChange={(e) => {
                        const next = [...wavelengthData];
                        next[i] = { ...next[i], leftLabel: e.target.value };
                        setWavelengthData(next);
                      }}
                      className="bg-gray-50"
                    />
                    <span className="hidden md:flex items-center justify-center text-gray-400 font-bold">
                      ↔
                    </span>
                    <Input
                      placeholder="Høyre side (f.eks. Kriminelt)"
                      value={card.rightLabel}
                      onChange={(e) => {
                        const next = [...wavelengthData];
                        next[i] = { ...next[i], rightLabel: e.target.value };
                        setWavelengthData(next);
                      }}
                      className="bg-gray-50"
                    />
                    <Input
                      placeholder="Ord/scenario (f.eks. Stjele en trafikkjegle)"
                      value={card.word}
                      onChange={(e) => {
                        const next = [...wavelengthData];
                        next[i] = { ...next[i], word: e.target.value };
                        setWavelengthData(next);
                      }}
                      className="bg-gray-50 md:col-span-2"
                    />
                    <Input
                      placeholder="Kategori (valgfritt)"
                      value={card.category ?? ""}
                      onChange={(e) => {
                        const next = [...wavelengthData];
                        next[i] = { ...next[i], category: e.target.value };
                        setWavelengthData(next);
                      }}
                      className="bg-gray-50"
                    />
                  </div>
                  <button
                    onClick={() =>
                      setWavelengthData(
                        wavelengthData.filter((_, j) => j !== i),
                      )
                    }
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Forside ── */}
        {tab === "frontpage" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Forside</h2>
              <div className="flex gap-2 items-center">
                {renderStatus(gamesStatus)}
                <Button
                  size="sm"
                  variant={isGamesDirty ? "default" : "outline"}
                  disabled={!isGamesDirty}
                  onClick={async () => {
                    const ok = await save("games", gamesData, setGamesStatus);
                    if (ok) setGamesSnapshot(gamesData);
                  }}
                >
                  Lagre
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Velg hvilke spill som skal vises på forsiden, og sett rekkefølge
              innen hver gruppe.
            </p>
            <div className="flex flex-col gap-6">
              {(Object.keys(GROUP_LABELS) as GameGroup[]).map((group) => {
                const groupGames = getGroupGames(group);
                if (groupGames.length === 0) return null;

                return (
                  <div key={group} className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-gray-600">
                      {GROUP_LABELS[group]}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {groupGames.map((game, index) => (
                        <div
                          key={game.id}
                          className="flex flex-col gap-3 p-4 bg-white rounded-xl shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-gray-500">
                              {getAdminIcon(game.icon)}
                            </span>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {game.label}
                              </span>
                              <span className="text-xs text-gray-400">
                                {game.href}
                              </span>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                              <div className="flex flex-col gap-0.5">
                                <button
                                  onClick={() => moveGame(group, index, -1)}
                                  disabled={index === 0}
                                  className="text-gray-400 hover:text-gray-700 disabled:opacity-20"
                                >
                                  <ChevronUp size={14} />
                                </button>
                                <button
                                  onClick={() => moveGame(group, index, 1)}
                                  disabled={index === groupGames.length - 1}
                                  className="text-gray-400 hover:text-gray-700 disabled:opacity-20"
                                >
                                  <ChevronDown size={14} />
                                </button>
                              </div>
                              <Button
                                size="sm"
                                variant={game.enabled ? "default" : "outline"}
                                className="gap-1"
                                onClick={() =>
                                  setGamesData((prev) =>
                                    prev.map((entry) =>
                                      entry.id === game.id
                                        ? {
                                            ...entry,
                                            enabled: !entry.enabled,
                                          }
                                        : entry,
                                    ),
                                  )
                                }
                              >
                                {game.enabled ? (
                                  <Check size={14} />
                                ) : (
                                  <X size={14} />
                                )}
                                {game.enabled ? "På" : "Av"}
                              </Button>
                            </div>
                          </div>
                          <Input
                            placeholder="Tag (valgfritt)"
                            value={game.tag ?? ""}
                            onChange={(e) =>
                              setGamesData((prev) =>
                                prev.map((entry) =>
                                  entry.id === game.id
                                    ? { ...entry, tag: e.target.value }
                                    : entry,
                                ),
                              )
                            }
                            className="bg-gray-50"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
