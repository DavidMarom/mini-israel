import { NextResponse } from "next/server";
import clientPromise from "../../../../services/mongo";

const SELL_PRICES = {
  flower: 7,
  falafel: 17,
  flag: 7,
  bike: 55,
  headphones: 35,
  pc: 85,
  shirt: 20,
};
const DEFAULT_SELL_PRICE = 5;

export function getSellPrice(itemId) {
  return SELL_PRICES[itemId] ?? DEFAULT_SELL_PRICE;
}

export async function POST(request) {
  try {
    const { uid, itemIndex } = await request.json();

    if (!uid || itemIndex === undefined || itemIndex === null) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("main");

    const user = await db.collection("users").findOne({ uid });
    if (!user || !user.inventory || !user.inventory[itemIndex]) {
      return NextResponse.json({ error: "Item not found" }, { status: 400 });
    }

    const item = user.inventory[itemIndex];
    const sellPrice = SELL_PRICES[item.id] ?? DEFAULT_SELL_PRICE;
    const newMoney = (user.money || 0) + sellPrice;

    await db.collection("users").updateOne(
      { uid },
      { $unset: { [`inventory.${itemIndex}`]: 1 } }
    );
    await db.collection("users").updateOne(
      { uid },
      { $pull: { inventory: null } }
    );
    await db.collection("users").updateOne(
      { uid },
      { $set: { money: newMoney, updatedAt: new Date() } }
    );

    const updated = await db.collection("users").findOne({ uid });
    return NextResponse.json({ ok: true, money: newMoney, inventory: updated.inventory || [], sellPrice });
  } catch (error) {
    console.error("Error in POST /api/items/sell", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
