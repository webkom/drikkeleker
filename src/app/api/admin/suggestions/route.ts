import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const snap = await getAdminDb()
    .collection("suggestions")
    .orderBy("submittedAt", "desc")
    .get();

  const suggestions = snap.docs.map((d) => ({
    id: d.id,
    text: d.data().text ?? "",
    name: d.data().name ?? "",
    submittedAt:
      d.data().submittedAt?.toDate?.()?.toISOString() ??
      new Date().toISOString(),
  }));

  return NextResponse.json(suggestions);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { password, id } = body as { password: string; id?: string };
  if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) return unauthorized();

  const db = getAdminDb();

  if (id) {
    await db.collection("suggestions").doc(id).delete();
  } else {
    const snap = await db.collection("suggestions").get();
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  return NextResponse.json({ success: true });
}
