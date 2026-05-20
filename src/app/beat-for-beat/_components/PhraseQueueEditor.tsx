"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Database,
  Edit2,
  Keyboard,
  Minus,
  Music,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parsePhrase } from "../_lib/assignColors";
import {
  addPhrase,
  removePhrase,
  reorderPhrase,
  updatePhrasePoints,
  updatePhraseText,
} from "../_lib/gameActions";
import { parseSpotifyTrackId } from "../_lib/spotify";
import { type GameState, MAX_WORDS, MIN_WORDS } from "../_lib/types";
import {
  deleteCustomSong,
  getAllSongs,
  saveCustomSong,
  type SavedSong,
} from "../_lib/preloadedSongs";

interface Props {
  state: GameState;
  applyAction: (action: (state: GameState) => GameState) => Promise<void>;
  disabled?: boolean;
}

export default function PhraseQueueEditor({
  state,
  applyAction,
  disabled,
}: Props) {
  const [activeTab, setActiveTab] = useState<"manual" | "archive">("archive");

  // Manual Entry form states
  const [draft, setDraft] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Archive states
  const [archiveSongs, setArchiveSongs] = useState<SavedSong[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Queue inline editing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const handleSaveEdit = async (id: string) => {
    const trimmed = editBuffer.trim();
    const wordCount = parsePhrase(trimmed).length;
    if (wordCount < MIN_WORDS || wordCount > MAX_WORDS) {
      setEditError(
        `Frasen må ha mellom ${MIN_WORDS} og ${MAX_WORDS} ord (nå: ${wordCount}).`,
      );
      return;
    }
    setEditError(null);
    await applyAction((s) => updatePhraseText(s, id, trimmed));
    setEditingId(null);
  };

  // Load songs on mount and whenever archive changes
  useEffect(() => {
    setArchiveSongs(getAllSongs());
  }, []);

  const refreshSongs = () => {
    setArchiveSongs(getAllSongs());
  };

  const submitManual = async () => {
    const trimmedDraft = draft.trim();
    const wordCount = parsePhrase(trimmedDraft).length;
    if (wordCount < MIN_WORDS || wordCount > MAX_WORDS) {
      setError(
        `Frasen må ha mellom ${MIN_WORDS} og ${MAX_WORDS} ord (du har ${wordCount}).`,
      );
      return;
    }
    let trackId: string | undefined = undefined;
    if (spotifyUrl.trim()) {
      const parsed = parseSpotifyTrackId(spotifyUrl);
      if (!parsed) {
        setSpotifyError("Ugyldig Spotify-lenke. Lim inn en track-URL.");
        return;
      }
      trackId = parsed;
    }

    setError(null);
    setSpotifyError(null);

    const title =
      songTitle.trim() || trimmedDraft.split(" ").slice(0, 3).join(" ") + "...";
    saveCustomSong({
      title,
      phrase: trimmedDraft,
      spotifyTrackId: trackId,
    });
    refreshSongs();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);

    await applyAction((s) => addPhrase(s, trimmedDraft, undefined, trackId));
    setDraft("");
    setSongTitle("");
    setSpotifyUrl("");
  };

  const handleAddFromArchive = async (song: SavedSong) => {
    await applyAction((s) =>
      addPhrase(s, song.phrase, undefined, song.spotifyTrackId),
    );
  };

  const handleDeleteFromArchive = (id: string) => {
    deleteCustomSong(id);
    refreshSongs();
  };

  // Filter archived songs
  const filteredSongs = archiveSongs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.phrase.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Tab controls */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-full border border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("archive")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "archive"
              ? "bg-white shadow text-amber-800"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <Database size={16} /> Sangsarkiv ({archiveSongs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("manual")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "manual"
              ? "bg-white shadow text-amber-800"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <Keyboard size={16} /> Legg til manuelt
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "manual" ? (
        <div className="flex flex-col gap-3 bg-white/50 p-4 rounded-xl border border-gray-200">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
              Sangtittel & Artist (valgfritt)
            </label>
            <Input
              value={songTitle}
              placeholder="F.eks. «Mods - Tore Tang»"
              onChange={(e) => setSongTitle(e.target.value)}
              disabled={disabled}
              className="bg-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
              Frase ({MIN_WORDS}–{MAX_WORDS} ord, separert av mellomrom) *
            </label>
            <Input
              value={draft}
              placeholder="F.eks. «Tore Tang en gammel mann»"
              onChange={(e) => {
                setDraft(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && draft.trim()) submitManual();
              }}
              disabled={disabled}
              className="bg-white font-medium"
            />
            {error && <p className="text-red-500 text-sm mt-0.5">{error}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
              Spotify-lenke (valgfritt)
            </label>
            <Input
              value={spotifyUrl}
              placeholder="https://open.spotify.com/track/..."
              onChange={(e) => {
                setSpotifyUrl(e.target.value);
                if (spotifyError) setSpotifyError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && draft.trim()) submitManual();
              }}
              disabled={disabled}
              className="bg-white text-xs"
            />
            {spotifyError && (
              <p className="text-red-500 text-sm mt-0.5">{spotifyError}</p>
            )}
          </div>

          <Button
            onClick={submitManual}
            disabled={disabled || !draft.trim()}
            className="w-full gap-2 mt-1 bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Plus size={16} /> Legg til frase & lagre i arkiv
          </Button>

          {saveSuccess && (
            <p className="text-xs text-center text-green-600 font-semibold mt-1">
              ✓ Sang lagt til i spillekøen og lagret i sangsarkivet!
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 bg-white/50 p-4 rounded-xl border border-gray-200">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Søk etter tittel, artist eller strofe..."
              className="pl-9 bg-white"
            />
          </div>

          {/* Song selection list */}
          <div className="max-h-[260px] overflow-y-auto pr-1 flex flex-col gap-2 scrollbar-thin">
            {filteredSongs.length === 0 ? (
              <p className="text-xs text-gray-500 italic text-center py-6">
                Ingen sanger matcher søket.
              </p>
            ) : (
              filteredSongs.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-white border border-gray-100 hover:border-amber-200 transition-all hover:bg-amber-50/20 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-gray-900 truncate">
                        {song.title}
                      </span>
                      {song.spotifyTrackId && (
                        <span title="Spotify-støtte">
                          <Music
                            size={12}
                            className="text-green-600 shrink-0"
                          />
                        </span>
                      )}
                      {song.isCustom && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
                          Lagret
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 truncate italic mt-0.5">
                      «{song.phrase}»
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddFromArchive(song)}
                      disabled={disabled}
                      className="h-7 text-[10px] font-bold gap-1 px-2.5 border-amber-300 text-amber-900 bg-amber-50/50 hover:bg-amber-500 hover:text-white"
                    >
                      <Plus size={12} /> Velg
                    </Button>

                    {song.isCustom && (
                      <button
                        type="button"
                        onClick={() => handleDeleteFromArchive(song.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                        title="Slett fra arkivet"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Phrase queue (spill-kø) header */}
      <div className="flex items-center justify-between border-t border-gray-200/60 pt-3 mt-1">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold">
          Spillekø ({state.queue.length} frase{state.queue.length !== 1 && "r"})
        </h3>
        <p className="text-[10px] text-gray-400">
          Flytt med pilene eller rediger strofer
        </p>
      </div>

      {state.queue.length === 0 ? (
        <p className="text-xs text-gray-500 italic text-center py-4 bg-white/30 rounded-xl border border-dashed border-gray-200">
          Ingen fraser lagt til enda. Velg fra arkivet eller legg til manuelt!
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {state.queue.map((p, i) => (
            <li
              key={p.id}
              className={`flex items-center gap-2 rounded-xl p-3 shadow-sm border border-gray-100 group transition-all ${
                i === state.currentIndex && state.phase === "playing"
                  ? "bg-amber-100 ring-2 ring-amber-400 border-transparent"
                  : "bg-white/95"
              }`}
            >
              {/* Up/Down Reorder Chevrons */}
              <div className="flex flex-col gap-0.5 mr-0.5">
                <button
                  type="button"
                  disabled={disabled || i === 0}
                  onClick={() =>
                    applyAction((s) => reorderPhrase(s, p.id, "up"))
                  }
                  className="text-gray-400 hover:text-gray-700 disabled:opacity-20 p-0.5"
                  title="Flytt opp"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  type="button"
                  disabled={disabled || i === state.queue.length - 1}
                  onClick={() =>
                    applyAction((s) => reorderPhrase(s, p.id, "down"))
                  }
                  className="text-gray-400 hover:text-gray-700 disabled:opacity-20 p-0.5"
                  title="Flytt ned"
                >
                  <ChevronDown size={12} />
                </button>
              </div>

              <span className="text-xs text-gray-400 font-semibold shrink-0 w-4 text-center mr-1">
                {i + 1}
              </span>

              {/* Phrase text OR Inline input editor */}
              {editingId === p.id ? (
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Input
                      value={editBuffer}
                      onChange={(e) => {
                        setEditBuffer(e.target.value);
                        if (editError) setEditError(null);
                      }}
                      className="h-8 text-xs bg-white py-0.5 px-2 flex-1"
                      placeholder="F.eks. «Tore Tang en gammel mann»"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(p.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(p.id)}
                      className="p-1.5 text-green-700 hover:text-green-900 rounded bg-green-50 hover:bg-green-100 shrink-0"
                      title="Lagre endring"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1.5 text-red-600 hover:text-red-800 rounded bg-red-50 hover:bg-red-100 shrink-0"
                      title="Avbryt"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {editError && (
                    <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                      {editError}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex-1 min-w-0 flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-800 truncate">
                    {p.text}
                  </span>
                  {p.spotifyTrackId && (
                    <span title="Spotify-støtte">
                      <Music size={12} className="text-green-600 shrink-0" />
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(p.id);
                      setEditBuffer(p.text);
                      setEditError(null);
                    }}
                    disabled={disabled}
                    className="text-gray-400 hover:text-amber-700 p-0.5 ml-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                    title="Rediger frasetekst"
                  >
                    <Edit2 size={12} />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-0.5 shrink-0 ml-1">
                <button
                  type="button"
                  onClick={() =>
                    applyAction((s) => updatePhrasePoints(s, p.id, -1))
                  }
                  disabled={disabled || p.pointValue <= 1}
                  className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-30"
                  aria-label="Mindre poeng"
                >
                  <Minus size={13} />
                </button>
                <span className="text-xs font-bold w-5 text-center text-amber-900">
                  {p.pointValue}p
                </span>
                <button
                  type="button"
                  onClick={() =>
                    applyAction((s) => updatePhrasePoints(s, p.id, 1))
                  }
                  disabled={disabled}
                  className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-30"
                  aria-label="Mer poeng"
                >
                  <Plus size={13} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => applyAction((s) => removePhrase(s, p.id))}
                disabled={disabled}
                className="text-gray-400 hover:text-red-600 disabled:opacity-30 p-1 shrink-0 ml-1"
                aria-label="Fjern frase"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
