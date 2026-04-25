import { ReactNode, createElement, Fragment } from "react";

function parseInline(text: string): ReactNode {
  // Whole line is bold: **text**
  if (text.startsWith("**") && text.endsWith("**") && text.length > 4) {
    const inner = text.slice(2, -2);
    if (!inner.includes("**")) {
      return createElement("b", null, inner);
    }
  }

  // Whole line is italic: *text*
  if (
    text.startsWith("*") &&
    text.endsWith("*") &&
    !text.startsWith("**") &&
    text.length > 2
  ) {
    return createElement("i", null, text.slice(1, -1));
  }

  // Inline bold within text: e.g. **:/:** text **:/:**
  if (text.includes("**")) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    const nodes: ReactNode[] = parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return createElement("b", { key: i }, part.slice(2, -2));
      }
      return part;
    });
    return createElement(Fragment, null, ...nodes);
  }

  return text;
}

export function parseLyricsText(lyricsText: string): ReactNode[][] {
  const versesRaw = lyricsText.split(/\n\n+/);
  return versesRaw.map((verse) =>
    verse
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map(parseInline),
  );
}
