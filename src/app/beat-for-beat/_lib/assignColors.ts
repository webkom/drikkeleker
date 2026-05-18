import type { Word } from "./types";

export class PhraseTooShortError extends Error {
  constructor(message = "Phrase needs at least 2 words") {
    super(message);
    this.name = "PhraseTooShortError";
  }
}

export const parsePhrase = (raw: string): string[] =>
  raw.trim().split(/\s+/).filter(Boolean);

export const assignColors = (words: string[]): Word[] => {
  if (words.length < 2) throw new PhraseTooShortError();
  const idx = Array.from(words.keys());
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const red = new Set(idx.slice(0, 2));
  return words.map((text, i) => ({
    text,
    color: red.has(i) ? "red" : "black",
    revealed: false,
  }));
};
