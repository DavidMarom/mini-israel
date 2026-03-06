import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const doc = await db.collection("config").findOne({ _id: "yad_sara_visible" });
    const visible = doc ? doc.visible !== false : true;
    return NextResponse.json({ visible });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { visible } = await req.json();
    const client = await clientPromise;
    const db = client.db("main");
    await db.collection("config").updateOne(
      { _id: "yad_sara_visible" },
      { $set: { visible: !!visible } },
      { upsert: true }
    );
    return NextResponse.json({ ok: true, visible: !!visible });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
