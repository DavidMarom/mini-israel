import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

const SUBSCRIPTION_COST = 400;
const SUBSCRIPTION_DAYS = 7;

export async function POST(request) {
  try {
    const { uid } = await request.json();
    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("main");

    const now = new Date();
    const expiry = new Date(now.getTime() + SUBSCRIPTION_DAYS * 24 * 60 * 60 * 1000);

    const result = await db.collection("users").findOneAndUpdate(
      { uid, money: { $gte: SUBSCRIPTION_COST } },
      { $inc: { money: -SUBSCRIPTION_COST }, $set: { powerBoostExpiry: expiry, updatedAt: now } },
      { returnDocument: "after" }
    );

    if (!result) return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });

    return NextResponse.json({ ok: true, money: result.money, powerBoostExpiry: result.powerBoostExpiry });
  } catch (error) {
    console.error("Error in POST /api/powerplant/subscribe", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
