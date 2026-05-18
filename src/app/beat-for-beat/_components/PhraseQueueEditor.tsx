"use client";

import { useState } from "react";
import { Minus, Music, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parsePhrase } from "../_lib/assignColors";
import {
  addPhrase,
  removePhrase,
  updatePhrasePoints,
} from "../_lib/gameActions";
import { parseSpotifyTrackId } from "../_lib/spotify";
import { type GameState, MAX_WORDS, MIN_WORDS } from "../_lib/types";

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
  const [draft, setDraft] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);

  const submit = async () => {
    const wordCount = parsePhrase(draft).length;
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
    await applyAction((s) => addPhrase(s, draft.trim(), undefined, trackId));
    setDraft("");
    setSpotifyUrl("");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
          Frase ({MIN_WORDS}–{MAX_WORDS} ord, separert av mellomrom)
        </label>
        <div className="flex gap-2">
          <Input
            value={draft}
            placeholder="F.eks. «Never gonna give you up»"
            onChange={(e) => {
              setDraft(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draft.trim()) submit();
            }}
            disabled={disabled}
            className="flex-1 bg-white"
          />
          <Button
            onClick={submit}
            disabled={disabled || !draft.trim()}
            className="gap-1"
          >
            <Plus size={16} /> Legg til
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
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
            if (e.key === "Enter" && draft.trim()) submit();
          }}
          disabled={disabled}
          className="bg-white"
        />
        <p className="text-xs text-gray-500">
          Spilles av på publikum-skjermen når laget gjetter riktig. Kun de
          første 30 sekundene spilles av (med mindre publikum-skjermen er logget
          inn på Spotify Premium).
        </p>
        {spotifyError && <p className="text-red-500 text-sm">{spotifyError}</p>}
      </div>

      {state.queue.length === 0 ? (
        <p className="text-sm text-gray-500 italic">Ingen fraser enda.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {state.queue.map((p, i) => (
            <li
              key={p.id}
              className={`flex items-center gap-2 rounded-xl p-3 ${
                i === state.currentIndex && state.phase === "playing"
                  ? "bg-amber-100 ring-2 ring-amber-400"
                  : "bg-white/70"
              }`}
            >
              <span className="text-xs text-gray-400 w-6 text-right">
                {i + 1}
              </span>
              <span className="flex-1 text-sm flex items-center gap-1.5">
                {p.text}
                {p.spotifyTrackId && (
                  <Music
                    size={14}
                    className="text-green-600 shrink-0"
                    aria-label="Har Spotify-lenke"
                  />
                )}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() =>
                    applyAction((s) => updatePhrasePoints(s, p.id, -1))
                  }
                  disabled={disabled || p.pointValue <= 1}
                  className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-30"
                  aria-label="Mindre poeng"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-semibold w-6 text-center">
                  {p.pointValue}p
                </span>
                <button
                  onClick={() =>
                    applyAction((s) => updatePhrasePoints(s, p.id, 1))
                  }
                  disabled={disabled}
                  className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-30"
                  aria-label="Mer poeng"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                onClick={() => applyAction((s) => removePhrase(s, p.id))}
                disabled={disabled}
                className="text-red-400 hover:text-red-600 disabled:opacity-30"
                aria-label="Fjern frase"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
