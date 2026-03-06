import { NextResponse } from "next/server";
import clientPromise from "../../../services/mongo";

const DONATION_COINS = 100;
const DONATION_ILS = 2;

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const donations = await db.collection("donations")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    const totalCoins = donations.reduce((sum, d) => sum + (d.coins || 0), 0);
    const totalIls = donations.reduce((sum, d) => sum + (d.ils || 0), 0);
    return NextResponse.json({ donations, totalCoins, totalIls });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { uid, name } = await req.json();
    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("main");

    const user = await db.collection("users").findOne({ uid });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if ((user.money || 0) < DONATION_COINS) {
      return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
    }

    const newMoney = user.money - DONATION_COINS;
    await db.collection("users").updateOne(
      { uid },
      { $set: { money: newMoney, updatedAt: new Date() } }
    );

    await db.collection("donations").insertOne({
      uid,
      name: name || uid,
      coins: DONATION_COINS,
      ils: DONATION_ILS,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, money: newMoney, coins: DONATION_COINS, ils: DONATION_ILS });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
