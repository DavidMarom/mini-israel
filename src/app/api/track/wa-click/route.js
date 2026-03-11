import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

export async function POST(request) {
  try {
    const { uid } = await request.json();
    if (!uid) return NextResponse.json({ ok: false });

    const client = await clientPromise;
    const db = client.db("main");
    await db.collection("users").updateOne(
      { uid },
      { $inc: { waClicks: 1 }, $set: { updatedAt: new Date() } }
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false });
  }
}
