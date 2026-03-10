import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

const VIP_COST = 1500;

export async function POST(request) {
  try {
    const { uid } = await request.json();
    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("main");

    const user = await db.collection("users").findOne({ uid });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.isVIP) return NextResponse.json({ error: "Already VIP" }, { status: 400 });

    const result = await db.collection("users").findOneAndUpdate(
      { uid, money: { $gte: VIP_COST } },
      { $inc: { money: -VIP_COST }, $set: { isVIP: true, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });

    return NextResponse.json({ ok: true, money: result.money, isVIP: true });
  } catch (error) {
    console.error("Error in POST /api/upgrade/vip", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
