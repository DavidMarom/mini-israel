import { NextResponse } from "next/server";
import clientPromise from "../../../services/mongo";

const CANDLE_PRICE = 40;

export async function POST(req) {
  try {
    const { uid, name } = await req.json();
    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("main");

    const user = await db.collection("users").findOne({ uid });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const candleItem = { id: "candle", emoji: "🕯️", name: "נר ליום האשה" };

    const result = await db.collection("users").findOneAndUpdate(
      { uid, money: { $gte: CANDLE_PRICE } },
      {
        $inc: { money: -CANDLE_PRICE },
        $push: { inventory: candleItem },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
    }

    await db.collection("candles").insertOne({
      uid,
      name: name || uid,
      price: CANDLE_PRICE,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, money: result.money, inventory: result.inventory });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
