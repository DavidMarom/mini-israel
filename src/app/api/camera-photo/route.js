import { NextResponse } from "next/server";
import clientPromise from "../../../services/mongo";

const PHOTO_ID = "camera-widget-photo";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const doc = await db.collection("settings").findOne({ _id: PHOTO_ID });
    return NextResponse.json({ photo: doc?.photo ?? null }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/camera-photo", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { photo } = await request.json();
    if (typeof photo !== "string" || !photo.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid photo" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db("main");
    await db.collection("settings").updateOne(
      { _id: PHOTO_ID },
      { $set: { photo, updatedAt: new Date() } },
      { upsert: true }
    );
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/camera-photo", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
