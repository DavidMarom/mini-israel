import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

const TAGLINES_ID = "taglines";
const DEFAULTS = [
  "מיני ישראל מתחדשת כל הזמן! בכל יום פריטים חדשים ויכולות נוספות...",
  "אפשר לשלוח הודעות למשתמשים אחרים על ידי לחיצה על הבית שלהם",
];

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const doc = await db.collection("settings").findOne({ _id: TAGLINES_ID });
    return NextResponse.json({ taglines: doc?.taglines ?? DEFAULTS }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/admin/taglines", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { taglines } = await request.json();
    if (!Array.isArray(taglines)) {
      return NextResponse.json({ error: "Invalid taglines" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db("main");
    await db.collection("settings").updateOne(
      { _id: TAGLINES_ID },
      { $set: { taglines, updatedAt: new Date() } },
      { upsert: true }
    );
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/admin/taglines", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
