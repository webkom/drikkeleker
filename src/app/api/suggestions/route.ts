import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const FILE = join(process.cwd(), "data", "suggestions.json");

function readSuggestions(): Suggestion[] {
  try {
    return JSON.parse(readFileSync(FILE, "utf-8"));
  } catch {
    return [];
  }
}

interface Suggestion {
  id: string;
  text: string;
  name: string;
  submittedAt: string;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { text, name } = body as { text: unknown; name: unknown };

  if (typeof text !== "string" || text.trim().length < 3) {
    return NextResponse.json({ error: "Invalid suggestion" }, { status: 400 });
  }

  const suggestions = readSuggestions();
  suggestions.push({
    id: Date.now().toString(),
    text: text.trim().slice(0, 500),
    name: typeof name === "string" ? name.trim().slice(0, 50) : "",
    submittedAt: new Date().toISOString(),
  });

  try {
    writeFileSync(FILE, JSON.stringify(suggestions, null, 2));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
