import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "abakus";

const ALLOWED_GAMES = [
  "questions",
  "never-have-i",
  "songs",
  "alias",
  "wavelength",
  "suggestions",
] as const;
type Game = (typeof ALLOWED_GAMES)[number];

function readGame(game: Game) {
  return JSON.parse(readFileSync(join(DATA_DIR, `${game}.json`), "utf-8"));
}

export async function GET(request: NextRequest) {
  const game = request.nextUrl.searchParams.get("game") as Game;
  if (!ALLOWED_GAMES.includes(game)) {
    return NextResponse.json({ error: "Unknown game" }, { status: 400 });
  }
  try {
    return NextResponse.json(readGame(game));
  } catch {
    return NextResponse.json({ error: "Failed to read data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password, game, data } = body as {
    password: string;
    game: Game;
    data: unknown;
  };

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!ALLOWED_GAMES.includes(game)) {
    return NextResponse.json({ error: "Unknown game" }, { status: 400 });
  }

  try {
    if (data === null) {
      return NextResponse.json({ success: true });
    }

    writeFileSync(
      join(DATA_DIR, `${game}.json`),
      JSON.stringify(data, null, 2),
    );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to write data" },
      { status: 500 },
    );
  }
}
