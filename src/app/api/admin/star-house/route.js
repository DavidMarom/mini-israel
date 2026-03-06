import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const doc = await db.collection("config").findOne({ _id: "star_house" });
    return NextResponse.json({ starHouse: doc || null });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { uid, sponsor } = await req.json();
    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("main");

    const user = await db.collection("users").findOne({ uid });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await db.collection("config").updateOne(
      { _id: "star_house" },
      { $set: { uid, name: user.name || user.email, sponsor: sponsor || null, setAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ ok: true, name: user.name || user.email });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    await db.collection("config").deleteOne({ _id: "star_house" });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
