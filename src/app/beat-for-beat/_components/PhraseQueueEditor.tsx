"use client";

import { useState } from "react";
import { Plus, Trash2, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parsePhrase } from "../_lib/assignColors";
import {
  addPhrase,
  removePhrase,
  updatePhrasePoints,
} from "../_lib/gameActions";
import { MAX_WORDS, MIN_WORDS, type GameState } from "../_lib/types";

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
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const wordCount = parsePhrase(draft).length;
    if (wordCount < MIN_WORDS || wordCount > MAX_WORDS) {
      setError(
        `Frasen må ha mellom ${MIN_WORDS} og ${MAX_WORDS} ord (du har ${wordCount}).`,
      );
      return;
    }
    setError(null);
    await applyAction((s) => addPhrase(s, draft.trim()));
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
          Frase ({MIN_WORDS}–{MAX_WORDS} ord)
        </label>
        <div className="flex gap-2">
          <Input
            value={draft}
            placeholder="F.eks. Vi sitter her i venterommet"
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
              <span className="flex-1 text-sm">{p.text}</span>
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
