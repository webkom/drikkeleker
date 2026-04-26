"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronDown, Send } from "lucide-react";
import { submitSuggestion } from "@/lib/firebaseSuggestions";

const SuggestionsForm = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setStatus("loading");
    try {
      await submitSuggestion(text, name);
      setStatus("success");
      setText("");
      setName("");
    } catch {
      setStatus("error");
    }
    setTimeout(() => setStatus((s) => (s === "error" ? "idle" : s)), 4000);
  };

  return (
    <div className="border-t border-amber-200 pt-3 mt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm text-amber-700/70 hover:text-amber-800 transition-colors"
      >
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
        Savner du en drikkelek? Send inn forslag her!
      </button>

      {open && (
        <div className="mt-3">
          {status === "success" ? (
            <div className="flex items-center gap-2 text-green-700 text-sm">
              <CheckCircle size={14} className="shrink-0" />
              Takk for forslaget! 🍻
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Beskriv idéen din..."
                maxLength={500}
                rows={2}
                className="w-full rounded-lg border border-amber-200 bg-white/70 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Navn (valgfritt)"
                  maxLength={50}
                  className="flex-1 rounded-lg border border-amber-200 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!text.trim() || status === "loading"}
                  className="gap-1.5 bg-amber-500 hover:bg-amber-600"
                >
                  <Send size={13} />
                  {status === "loading" ? "Sender..." : "Send"}
                </Button>
              </div>
              {status === "error" && (
                <p className="text-red-500 text-xs">
                  Noe gikk galt, prøv igjen.
                </p>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default SuggestionsForm;
