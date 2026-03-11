import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const doc = await db.collection("config").findOne({ _id: "lottery_popup" });
    const enabled = doc ? doc.enabled !== false : true;
    return NextResponse.json({ enabled });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { enabled } = await req.json();
    const client = await clientPromise;
    const db = client.db("main");
    await db.collection("config").updateOne(
      { _id: "lottery_popup" },
      { $set: { enabled: !!enabled } },
      { upsert: true }
    );
    return NextResponse.json({ ok: true, enabled: !!enabled });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
