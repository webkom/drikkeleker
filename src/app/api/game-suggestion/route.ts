import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { text, name } = body as { text: unknown; name: unknown };

  if (typeof text !== "string" || text.trim().length < 3) {
    return NextResponse.json({ error: "Invalid suggestion" }, { status: 400 });
  }

  try {
    await getAdminDb()
      .collection("suggestions")
      .add({
        text: text.trim().slice(0, 500),
        name: typeof name === "string" ? name.trim().slice(0, 50) : "",
        submittedAt: FieldValue.serverTimestamp(),
      });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
