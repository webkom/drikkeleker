"use client";

import { useEffect, useState, useCallback } from "react";
import type { WavelengthCard } from "@/types/wavelength";
import { lilita } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  Save,
  LogIn,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

type Tab =
  | "questions"
  | "never-have-i"
  | "songs"
  | "alias"
  | "wavelength"
  | "suggestions";
type NhiCategory = "mild" | "hot" | "spicy" | "abakus";
type SongKey = "lambo" | "lay-all-your-love-on-me" | "forever-alone";

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

const CATEGORY_LABELS: Record<NhiCategory, string> = {
  mild: "🟢 Mild",
  hot: "🟠 Hot",
  spicy: "🔴 Spicy",
  abakus: "🟣 Abakus",
};

const SONG_LABELS: Record<SongKey, string> = {
  lambo: "Lambo",
  "lay-all-your-love-on-me": "Lay All Your Love On Me",
  "forever-alone": "Forever Alone",
};

interface Suggestion {
  id: string;
  text: string;
  name: string;
  submittedAt: string;
}

const TABS: { key: Tab; label: string }[] = [
  { key: "questions", label: "100 Spørsmål" },
  { key: "never-have-i", label: "Never Have I" },
  { key: "songs", label: "Sanger" },
  { key: "alias", label: "Alias" },
  { key: "wavelength", label: "Bølgelengde" },
  { key: "suggestions", label: "Forslag" },
];

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
  const [questionsStatus, setQuestionsStatus] = useState("");

  const [nhiData, setNhiData] = useState<NeverHaveIData>({
    mild: [],
    hot: [],
    spicy: [],
    abakus: [],
  });
  const [nhiCategory, setNhiCategory] = useState<NhiCategory>("mild");
  const [nhiStatus, setNhiStatus] = useState("");

  const [songsData, setSongsData] = useState<SongsData>({});
  const [activeSong, setActiveSong] = useState<SongKey>("lambo");
  const [songsStatus, setSongsStatus] = useState("");

  const [aliasData, setAliasData] = useState<AliasData>({ words: [] });
  const [aliasStatus, setAliasStatus] = useState("");

  const [wavelengthData, setWavelengthData] = useState<WavelengthCard[]>([]);
  const [wavelengthStatus, setWavelengthStatus] = useState("");

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionsStatus, setSuggestionsStatus] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_pw");
    if (stored) {
      setPassword(stored);
      setAuthenticated(true);
    }
  }, []);

  const loadData = useCallback(async () => {
    const [q, nhi, songs, alias, wavelength, sug] = await Promise.all([
      fetch("/api/admin/data?game=questions").then((r) => r.json()),
      fetch("/api/admin/data?game=never-have-i").then((r) => r.json()),
      fetch("/api/admin/data?game=songs").then((r) => r.json()),
      fetch("/api/admin/data?game=alias").then((r) => r.json()),
      fetch("/api/admin/data?game=wavelength").then((r) => r.json()),
      fetch("/api/admin/data?game=suggestions").then((r) => r.json()),
    ]);
    if (Array.isArray(q)) setQuestions(q);
    if (nhi && typeof nhi === "object" && !Array.isArray(nhi)) setNhiData(nhi);
    if (songs && typeof songs === "object" && !Array.isArray(songs))
      setSongsData(songs);
    if (alias?.words && Array.isArray(alias.words)) setAliasData(alias);
    setWavelengthData(normalizeWavelengthCards(wavelength));
    if (Array.isArray(sug)) setSuggestions(sug);
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
    setStatus: (s: string) => void,
  ) => {
    setStatus("Lagrer...");
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, game, data }),
      });
      setStatus(res.ok ? "✓ Lagret!" : "Feil ved lagring");
    } catch {
      setStatus("Feil ved lagring");
    }
    setTimeout(() => setStatus(""), 3000);
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
                {questionsStatus && (
                  <span className="text-sm text-green-600">
                    {questionsStatus}
                  </span>
                )}
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={() =>
                    save("questions", questions, setQuestionsStatus)
                  }
                >
                  <Save size={14} /> Lagre
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
                {nhiStatus && (
                  <span className="text-sm text-green-600">{nhiStatus}</span>
                )}
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={() => save("never-have-i", nhiData, setNhiStatus)}
                >
                  <Save size={14} /> Lagre alle
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
              <h2 className="text-xl font-bold">Sanger</h2>
              <div className="flex gap-2 items-center">
                {songsStatus && (
                  <span className="text-sm text-green-600">{songsStatus}</span>
                )}
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={() => save("songs", songsData, setSongsStatus)}
                >
                  <Save size={14} /> Lagre alle
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              {(Object.keys(SONG_LABELS) as SongKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveSong(key)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${activeSong === key ? "bg-amber-400 text-white shadow" : "bg-white text-gray-600 hover:bg-amber-50"}`}
                >
                  {SONG_LABELS[key]}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-xl p-4 flex flex-col gap-3">
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
            </div>
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
                {aliasStatus && (
                  <span className="text-sm text-green-600">{aliasStatus}</span>
                )}
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={() => save("alias", aliasData, setAliasStatus)}
                >
                  <Save size={14} /> Lagre
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Legg til ord som spillerne skal beskrive uten å si selve ordet.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="self-start gap-1"
              onClick={() => setAliasData({ words: [...aliasData.words, ""] })}
            >
              <Plus size={14} /> Legg til ord
            </Button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {aliasData.words.map((word, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-xs text-gray-400 w-6 text-right">
                    {i + 1}
                  </span>
                  <Input
                    value={word}
                    onChange={(e) => {
                      const next = [...aliasData.words];
                      next[i] = e.target.value;
                      setAliasData({ words: next });
                    }}
                    className="flex-1 bg-white"
                  />
                  <button
                    onClick={() =>
                      setAliasData({
                        words: aliasData.words.filter((_, j) => j !== i),
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

        {/* ── Forslag ── */}
        {tab === "suggestions" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Forslag ({suggestions.length})
              </h2>
              <div className="flex gap-2 items-center">
                {suggestionsStatus && (
                  <span className="text-sm text-green-600">
                    {suggestionsStatus}
                  </span>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-1"
                  disabled={suggestions.length === 0}
                  onClick={() =>
                    save("suggestions", [], setSuggestionsStatus).then(() =>
                      setSuggestions([]),
                    )
                  }
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
                      onClick={() => {
                        const updated = suggestions.filter(
                          (x) => x.id !== s.id,
                        );
                        save("suggestions", updated, setSuggestionsStatus).then(
                          () => setSuggestions(updated),
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

        {/* ── Bølgelengde ── */}
        {tab === "wavelength" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Bølgelengde ({wavelengthData.length} kort)
              </h2>
              <div className="flex gap-2 items-center">
                {wavelengthStatus && (
                  <span className="text-sm text-green-600">
                    {wavelengthStatus}
                  </span>
                )}
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={() =>
                    save("wavelength", wavelengthData, setWavelengthStatus)
                  }
                >
                  <Save size={14} /> Lagre
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
      </div>
    </div>
  );
}
