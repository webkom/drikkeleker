import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { getGameData, saveGameData } from "@/lib/firebaseAdminData";

const DATA_DIR = join(process.cwd(), "data");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const ALLOWED_GAMES = [
  "questions",
  "never-have-i",
  "songs",
  "alias",
  "wavelength",
  "frontpage",
  "games",
  "beat-for-beat",
  "suggestions",
] as const;
type Game = (typeof ALLOWED_GAMES)[number];

async function readGame(game: Game) {
  // 1. Try Firestore first
  try {
    const data = await getGameData(game);
    if (data) return data;
  } catch (err) {
    console.error(`Firestore read error for ${game}:`, err);
  }

  // 2. Fallback to local JSON (migration path)
  try {
    const filePath = join(DATA_DIR, `${game}.json`);
    const localData = JSON.parse(readFileSync(filePath, "utf-8"));

    // Auto-migrate to Firestore if we successfully read local data
    console.log(`Migrating ${game} to Firestore...`);
    await saveGameData(game, localData);

    return localData;
  } catch (err: any) {
    console.error(`Local read error for ${game}:`, err);
    throw err;
  }
}

export async function GET(request: NextRequest) {
  const game = request.nextUrl.searchParams.get("game") as Game;
  if (!ALLOWED_GAMES.includes(game)) {
    return NextResponse.json(
      { error: `Unknown game: ${game}` },
      { status: 400 },
    );
  }
  try {
    const data = await readGame(game);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error(`Failed to read game ${game}:`, err);
    return NextResponse.json(
      { error: `Failed to read data: ${err.message}` },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, game, data } = body as {
      password: string;
      game: Game;
      data: unknown;
    };

    if (!ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "ADMIN_PASSWORD is not configured on server" },
        { status: 500 },
      );
    }

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!ALLOWED_GAMES.includes(game)) {
      return NextResponse.json(
        { error: `Unknown game: ${game}` },
        { status: 400 },
      );
    }

    if (data === null) {
      return NextResponse.json({ success: true });
    }

    // Save to Firestore instead of local filesystem
    await saveGameData(game, data);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Admin data POST error:", err);
    return NextResponse.json(
      { error: `Failed to save data: ${err.message}` },
      { status: 500 },
    );
  }
}
