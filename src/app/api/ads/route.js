import { NextResponse } from "next/server";
import clientPromise from "../../../services/mongo";
import { ObjectId } from "mongodb";

const AD_COST = 100;
const AD_DURATION_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const now = new Date();
    const ads = await db
      .collection("ads")
      .find({ expiresAt: { $gt: now } })
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json({ ads }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/ads", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { uid, text } = body || {};

    if (!uid || !text?.trim()) {
      return NextResponse.json({ error: "Missing uid or text" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("main");

    const result = await db.collection("users").findOneAndUpdate(
      { uid, money: { $gte: AD_COST } },
      { $inc: { money: -AD_COST }, $set: { updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
    }

    const now = new Date();
    await db.collection("ads").insertOne({
      uid,
      text: text.trim(),
      createdAt: now,
      expiresAt: new Date(now.getTime() + AD_DURATION_MS),
    });

    return NextResponse.json({ ok: true, money: result.money }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/ads", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const client = await clientPromise;
    const db = client.db("main");
    await db.collection("ads").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/ads", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
