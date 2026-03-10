import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

const DAILY_BONUS = 50;
const VIP_BONUS = 100;

export async function POST(req) {
  try {
    const { uid, neighborhoodId } = await req.json();
    if (!uid || !neighborhoodId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("main");

    const today = new Date().toISOString().slice(0, 10);
    const existing = await db.collection("neighborhood_claims").findOne({ uid, date: today });
    if (existing) {
      return NextResponse.json({ error: "Already claimed today" }, { status: 400 });
    }

    const user = await db.collection("users").findOne({ uid });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const bonus = user.isVIP ? VIP_BONUS : DAILY_BONUS;
    const newMoney = (user.money || 0) + bonus;
    await db.collection("users").updateOne({ uid }, { $set: { money: newMoney } });
    await db.collection("neighborhood_claims").insertOne({
      uid,
      neighborhoodId,
      date: today,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, money: newMoney, bonus });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
